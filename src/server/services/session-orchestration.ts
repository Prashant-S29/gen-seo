import { db } from "~/server/db";
import { getProviderById } from "~/lib/constants";
import { analysisSessions } from "~/server/db/schema/db.schema.analysis";
import { prompts, responses } from "~/server/db/schema/db.schema.prompts";
import { mentions, citations } from "~/server/db/schema/db.schema.mentions";
import { eq } from "drizzle-orm";
import { generatePrompts } from "./prompt-generation";
import { queryAI } from "./ai-query";
import {
  extractBrandMentions,
  analyzeSentiment,
  detectCitations,
  isBrandCited,
} from "./response-parsing";
import { ANALYSIS_CONFIG } from "~/lib/constants";
import { env } from "~/env";
// Crawler modules are dynamically imported inside processCrawlingMethod
// to prevent module-level initialization from crashing the tRPC server
// when crawling is not being used.

interface AnalysisConfig {
  sessionId: string;
  category: string;
  brands: string[];
  productName: string;
  selectedProviders: string[];
  promptCount: number;
  analysisMethod?: "api_only" | "crawling_only" | "both";
}

/**
 * Main orchestrator for analysis session
 * Handles the complete flow: generate prompts -> query AI -> parse -> store
 */
export const processAnalysisSession = async (
  config: AnalysisConfig,
): Promise<void> => {
  const method = config.analysisMethod || "api_only";

  try {
    // 1. Update session status to processing
    await db
      .update(analysisSessions)
      .set({ status: "processing" })
      .where(eq(analysisSessions.id, config.sessionId));

    // 2. Generate prompts
    const promptTemplates = generatePrompts(
      config.category,
      config.productName,
      config.promptCount,
    );

    // 3. Store prompts in database
    const promptRecords = await db
      .insert(prompts)
      .values(
        promptTemplates.map((template) => ({
          sessionId: config.sessionId,
          promptText: template.text,
          promptType: template.type,
        })),
      )
      .returning();

    console.log(
      `Generated ${promptRecords.length} prompts for session ${config.sessionId}`,
    );

    // 4. Route based on analysis method
    const promptTexts = promptRecords.map((p) => p.promptText);

    if (method === "api_only") {
      await processAPIMethod(config, promptRecords, promptTexts);
    } else if (method === "crawling_only") {
      await processCrawlingMethod(config, promptRecords, promptTexts);
    } else if (method === "both") {
      await processBothMethods(config, promptRecords, promptTexts);
    }

    // Mark session as completed
    await db
      .update(analysisSessions)
      .set({ status: "completed" })
      .where(eq(analysisSessions.id, config.sessionId));

    console.log(`Session ${config.sessionId} completed successfully`);
  } catch (error) {
    console.error("Session processing failed:", error);

    // Mark session as failed
    await db
      .update(analysisSessions)
      .set({ status: "failed" })
      .where(eq(analysisSessions.id, config.sessionId));

    throw error;
  }
};

// ============================================================================
// API Method Processing (existing logic)
// ============================================================================

async function processAPIMethod(
  config: AnalysisConfig,
  promptRecords: Array<{
    id: string;
    promptText: string;
    promptType: string | null;
  }>,
  promptTexts: string[],
): Promise<void> {
  // Only run API calls for providers that are actually API-enabled.
  // Crawling-only providers (e.g. claude-3.5-sonnet without an API key) must
  // be excluded here; they are handled separately by processCrawlingMethod.
  const apiEnabledProviders = config.selectedProviders.filter((id) => {
    const provider = getProviderById(id);
    return provider?.isEnabled === true;
  });

  if (apiEnabledProviders.length === 0) {
    console.log("No API-enabled providers selected, skipping API method.");
    return;
  }

  // Process ONE prompt at a time. All providers run in parallel for each
  // prompt, then the DB is updated immediately so the client sees live
  // progress on every poll instead of a 0 → 100% jump at the end.
  for (let promptIndex = 0; promptIndex < promptRecords.length; promptIndex++) {
    const promptRecord = promptRecords[promptIndex];
    const promptText = promptTexts[promptIndex];
    if (!promptRecord || !promptText) continue;

    console.log(
      `API: querying prompt ${promptIndex + 1}/${promptRecords.length} across ${apiEnabledProviders.length} provider(s)`,
    );

    // Fire all providers in parallel for this single prompt
    const settled = await Promise.allSettled(
      apiEnabledProviders.map((providerId) => queryAI(providerId, promptText)),
    );

    // Store each provider result
    for (let pIdx = 0; pIdx < settled.length; pIdx++) {
      const result = settled[pIdx];
      const providerId = apiEnabledProviders[pIdx];
      if (!result || !providerId) continue;

      if (result.status === "rejected") {
        console.error(
          `Provider ${providerId} failed for prompt ${promptIndex + 1}:`,
          result.reason,
        );
        continue;
      }

      const aiResponse = result.value;

      const responseRecord = await db
        .insert(responses)
        .values({
          promptId: promptRecord.id,
          platform: aiResponse.platform,
          model: aiResponse.model,
          responseText: aiResponse.responseText,
          analysisMethod: "api_only",
          executionTimeMs: new Date(aiResponse.executionTimeMs),
        })
        .returning();

      const storedResponse = responseRecord[0];
      if (!storedResponse) continue;

      const extractedCitations = detectCitations(aiResponse.responseText);

      if (extractedCitations.length > 0) {
        await db.insert(citations).values(
          extractedCitations.map((citation) => ({
            responseId: storedResponse.id,
            url: citation.url,
            domain: citation.domain,
            title: citation.title,
            citationType: citation.citationType,
          })),
        );
      }

      const brandMentions = extractBrandMentions(
        aiResponse.responseText,
        config.brands,
      );

      if (brandMentions.length > 0) {
        await db.insert(mentions).values(
          brandMentions.map((mention) => ({
            responseId: storedResponse.id,
            brandName: mention.brandName,
            position: mention.position,
            contextSnippet: mention.contextSnippet,
            sentiment: analyzeSentiment(mention.contextSnippet),
            isRecommended: mention.isRecommended,
            isCited: isBrandCited(extractedCitations, mention.brandName),
          })),
        );
      }
    }

    // ── Update progress once per prompt (after ALL providers for it finish) ──
    // This is what the client polls: one real tick per prompt, not a batch jump.
    await db
      .update(analysisSessions)
      .set({ completedPrompts: promptIndex + 1 })
      .where(eq(analysisSessions.id, config.sessionId));

    console.log(`API: prompt ${promptIndex + 1}/${promptRecords.length} done`);

    // Rate-limit delay between prompts (skip after the last one)
    if (promptIndex < promptRecords.length - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, ANALYSIS_CONFIG.rateLimit.delayBetweenRequests),
      );
    }
  }
}

// ============================================================================
// Crawling Method Processing
// ============================================================================

async function processCrawlingMethod(
  config: AnalysisConfig,
  promptRecords: Array<{
    id: string;
    promptText: string;
    promptType: string | null;
  }>,
  promptTexts: string[],
): Promise<void> {
  console.log("Starting crawling method...");

  const crawlerMapping: Record<string, "chatgpt" | "claude" | null> = {
    "gpt-4-turbo": "chatgpt",
    "claude-3.5-sonnet": "claude",
    "claude-3-opus": "claude",
    "gemini-flash-lite": null,
    sonar: null,
  };

  let completedCount = 0;
  const totalResponses = promptRecords.length * config.selectedProviders.length;
  const headless = env.CRAWLER_HEADLESS === "true";

  for (const providerId of config.selectedProviders) {
    const crawlerType = crawlerMapping[providerId];

    if (!crawlerType) {
      console.log(`No crawler available for ${providerId}, skipping`);
      completedCount += promptRecords.length;
      continue;
    }

    console.log(
      `Crawling ${crawlerType} for ${promptRecords.length} prompts...`,
    );

    let crawlResults;

    if (crawlerType === "chatgpt") {
      if (!env.CHATGPT_EMAIL || !env.CHATGPT_PASSWORD) {
        console.error("ChatGPT credentials not configured");
        completedCount += promptRecords.length;
        continue;
      }
      const { crawlChatGPTBatch } =
        await import("./crawling-analysis/chatgpt-crawler");
      crawlResults = await crawlChatGPTBatch(
        promptTexts,
        env.CHATGPT_EMAIL,
        env.CHATGPT_PASSWORD,
        10000,
        headless,
      );
    } else {
      if (!env.CLAUDE_EMAIL || !env.CLAUDE_PASSWORD) {
        console.error("Claude credentials not configured");
        completedCount += promptRecords.length;
        continue;
      }
      const { crawlClaudeBatch } =
        await import("./crawling-analysis/claude-crawler");
      crawlResults = await crawlClaudeBatch(
        promptTexts,
        env.CLAUDE_EMAIL,
        env.CLAUDE_PASSWORD,
        15000,
        headless,
      );
    }

    for (let i = 0; i < crawlResults.length; i++) {
      const crawlResult = crawlResults[i];
      const promptRecord = promptRecords[i];
      if (!crawlResult || !promptRecord) continue;

      if (crawlResult.success) {
        const responseRecord = await db
          .insert(responses)
          .values({
            promptId: promptRecord.id,
            platform: crawlResult.platform,
            model: crawlerType,
            responseText: crawlResult.responseText,
            analysisMethod: "crawling_only",
            executionTimeMs: new Date(crawlResult.metadata.executionTimeMs),
          })
          .returning();

        const storedResponse = responseRecord[0];
        if (!storedResponse) continue;

        if (crawlResult.citations.length > 0) {
          await db.insert(citations).values(
            crawlResult.citations.map((citation) => ({
              responseId: storedResponse.id,
              url: citation.url,
              domain: citation.domain,
              title: citation.title,
              citationType: citation.citationType,
            })),
          );
        }

        const brandMentions = extractBrandMentions(
          crawlResult.responseText,
          config.brands,
        );

        if (brandMentions.length > 0) {
          await db.insert(mentions).values(
            brandMentions.map((mention) => ({
              responseId: storedResponse.id,
              brandName: mention.brandName,
              position: mention.position,
              contextSnippet: mention.contextSnippet,
              sentiment: analyzeSentiment(mention.contextSnippet),
              isRecommended: mention.isRecommended,
              isCited: isBrandCited(crawlResult.citations, mention.brandName),
            })),
          );
        }
      }

      completedCount++;

      await db
        .update(analysisSessions)
        .set({ completedPrompts: completedCount })
        .where(eq(analysisSessions.id, config.sessionId));

      console.log(`Crawling: ${completedCount}/${totalResponses}`);
    }
  }
}

// ============================================================================
// Both Methods Processing
// ============================================================================

async function processBothMethods(
  config: AnalysisConfig,
  promptRecords: Array<{
    id: string;
    promptText: string;
    promptType: string | null;
  }>,
  promptTexts: string[],
): Promise<void> {
  console.log("Starting both API and crawling methods in parallel...");

  const results = await Promise.allSettled([
    processAPIMethod(config, promptRecords, promptTexts),
    processCrawlingMethod(config, promptRecords, promptTexts),
  ]);

  const apiResult = results[0];
  const crawlResult = results[1];

  if (apiResult.status === "rejected") {
    console.error("API method failed:", apiResult.reason);
  }

  if (crawlResult.status === "rejected") {
    console.error("Crawling method failed:", crawlResult.reason);
  }

  if (apiResult.status === "rejected" && crawlResult.status === "rejected") {
    throw new Error("Both API and crawling methods failed");
  }

  console.log("Both methods completed");
}
