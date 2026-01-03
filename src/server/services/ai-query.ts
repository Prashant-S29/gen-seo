import { google } from "@ai-sdk/google";
import { generateText } from "ai";

interface AIQueryResult {
  platform: string;
  model: string;
  responseText: string;
  executionTimeMs: number;
}

/**
 * Query Google Gemini API
 * POC uses Gemini (free), MVP will add OpenAI, Claude, Perplexity
 */
export const queryGemini = async (prompt: string): Promise<AIQueryResult> => {
  const startTime = Date.now();

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      prompt: prompt,
      temperature: 0.7,
      maxOutputTokens: 500,
    });

    const executionTimeMs = Date.now() - startTime;

    return {
      platform: "gemini",
      model: "gemini-2.5-flash-lite",
      responseText: text,
      executionTimeMs,
    };
  } catch (error) {
    console.error("Gemini query failed:", error);
    throw new Error(
      `Failed to query Gemini: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

/**
 * Execute multiple prompts sequentially with delay
 * Rate limiting: Wait 2 seconds between requests
 */
export const executeBatchPrompts = async (
  prompts: string[],
): Promise<AIQueryResult[]> => {
  const results: AIQueryResult[] = [];

  for (const prompt of prompts) {
    try {
      const result = await queryGemini(prompt);
      results.push(result);

      // Wait 2 seconds between requests to respect rate limits
      if (prompts.indexOf(prompt) < prompts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Failed to execute prompt: ${prompt}`, error);
      // Continue with other prompts even if one fails
    }
  }

  return results;
};
