import { db } from "~/server/db";
import { analysisSessions } from "~/server/db/schema/db.schema.analysis";
import { prompts, responses } from "~/server/db/schema/db.schema.prompts";
import { mentions, citations } from "~/server/db/schema/db.schema.mentions";
import { eq } from "drizzle-orm";
import { generatePrompts } from "./prompt-generation";
import { executePromptsAcrossProviders } from "./ai-query";
import {
  extractBrandMentions,
  analyzeSentiment,
  detectCitations,
  isBrandCited,
} from "./response-parsing";
import { ANALYSIS_CONFIG } from "~/lib/constants";

interface AnalysisConfig {
  sessionId: string;
  category: string;
  brands: string[];
  productName: string;
  selectedProviders: string[];
  promptCount: number;
}

/**
 * Main orchestrator for analysis session
 * Handles the complete flow: generate prompts -> query AI -> parse -> store
 */
export const processAnalysisSession = async (
  config: AnalysisConfig,
): Promise<void> => {
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

    // 4. Execute prompts across all selected providers in parallel
    const promptTexts = promptRecords.map((p) => p.promptText);
    const allProviderResults = await executePromptsAcrossProviders(
      config.selectedProviders,
      promptTexts,
      ANALYSIS_CONFIG.rateLimit.delayBetweenRequests,
    );

    console.log(
      `Received responses from ${Object.keys(allProviderResults).length} providers`,
    );

    // 5. Process responses from all providers
    let completedCount = 0;
    const totalResponses =
      promptRecords.length * config.selectedProviders.length;

    for (
      let promptIndex = 0;
      promptIndex < promptRecords.length;
      promptIndex++
    ) {
      const promptRecord = promptRecords[promptIndex];
      if (!promptRecord) continue;

      // Process each provider's response for this prompt
      for (const providerId of config.selectedProviders) {
        const providerResults = allProviderResults[providerId];
        if (!providerResults) continue;

        const aiResponse = providerResults[promptIndex];
        if (!aiResponse) continue;

        // Store AI response
        const responseRecord = await db
          .insert(responses)
          .values({
            promptId: promptRecord.id,
            platform: aiResponse.platform,
            model: aiResponse.model,
            responseText: aiResponse.responseText,
            executionTimeMs: new Date(aiResponse.executionTimeMs),
          })
          .returning();

        const storedResponse = responseRecord[0];
        if (!storedResponse) continue;

        // Extract citations FIRST
        const extractedCitations = detectCitations(aiResponse.responseText);

        // Store citations
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

          console.log(
            `Found ${extractedCitations.length} citations for response ${storedResponse.id}`,
          );
        }

        // Extract brand mentions
        const brandMentions = extractBrandMentions(
          aiResponse.responseText,
          config.brands,
        );

        // Store mentions
        if (brandMentions.length > 0) {
          await db.insert(mentions).values(
            brandMentions.map((mention) => ({
              responseId: storedResponse.id,
              brandName: mention.brandName,
              position: mention.position,
              contextSnippet: mention.contextSnippet,
              sentiment: analyzeSentiment(mention.contextSnippet),
              isRecommended: mention.isRecommended,
              isCited: isBrandCited(extractedCitations, mention.brandName), // Check if brand is cited
            })),
          );
        }

        completedCount++;

        // Update progress
        await db
          .update(analysisSessions)
          .set({
            completedPrompts: completedCount,
          })
          .where(eq(analysisSessions.id, config.sessionId));

        console.log(
          `Completed ${completedCount}/${totalResponses} (Prompt ${promptIndex + 1}/${promptRecords.length}, Provider: ${providerId})`,
        );
      }
    }

    // 6. Mark session as completed
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
