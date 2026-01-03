import { db } from "~/server/db";
import { analysisSessions } from "~/server/db/schema/db.schema.analysis";
import { prompts, responses } from "~/server/db/schema/db.schema.prompts";
import { mentions } from "~/server/db/schema/db.schema.mentions";
import { eq } from "drizzle-orm";
import { generatePrompts } from "./prompt-generation";
import { executeBatchPrompts } from "./ai-query";
import { extractBrandMentions, analyzeSentiment } from "./response-parsing";

interface AnalysisConfig {
  sessionId: string;
  category: string;
  brands: string[];
  productName: string;
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
      5, // 5 prompts for POC
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

    // 4. Execute prompts with AI (sequential with rate limiting)
    const aiResponses = await executeBatchPrompts(
      promptRecords.map((p) => p.promptText),
    );

    console.log(`Received ${aiResponses.length} AI responses`);

    // 5. Process each response
    for (let i = 0; i < promptRecords.length; i++) {
      const promptRecord = promptRecords[i];
      const aiResponse = aiResponses[i];

      if (!promptRecord || !aiResponse) continue;

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
            isCited: false, // Will implement citation detection in later milestone
          })),
        );
      }

      // Update progress
      await db
        .update(analysisSessions)
        .set({
          completedPrompts: i + 1,
        })
        .where(eq(analysisSessions.id, config.sessionId));

      console.log(`Completed prompt ${i + 1}/${promptRecords.length}`);
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
