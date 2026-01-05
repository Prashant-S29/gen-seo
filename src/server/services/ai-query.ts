import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { perplexity } from "@ai-sdk/perplexity";
import { getProviderById, type LLMProvider } from "~/lib/constants";

export interface AIQueryResult {
  providerId: string;
  platform: string;
  model: string;
  responseText: string;
  executionTimeMs: number;
}

/**
 * Get the appropriate AI model based on provider config
 */
const getModel = (provider: LLMProvider) => {
  switch (provider.provider) {
    case "google":
      return google(provider.model);
    case "openai":
      return openai(provider.model);
    case "anthropic":
      return anthropic(provider.model);
    case "perplexity":
      return perplexity(provider.model);
    default:
      throw new Error(`Unsupported provider: ${provider.provider}`);
  }
};

/**
 * Query any AI provider based on provider ID
 */
export const queryAI = async (
  providerId: string,
  prompt: string,
): Promise<AIQueryResult> => {
  const provider = getProviderById(providerId);

  if (!provider) {
    throw new Error(`Provider not found: ${providerId}`);
  }

  if (!provider.isEnabled) {
    throw new Error(`Provider is disabled: ${provider.displayName}`);
  }

  const startTime = Date.now();

  try {
    const model = getModel(provider);

    const { text } = await generateText({
      model,
      prompt: `${prompt} also provide the respected sources for citations`,
      // prompt,
      temperature: provider.temperature,
      maxOutputTokens: provider.maxOutputTokens,
    });

    const executionTimeMs = Date.now() - startTime;

    return {
      providerId: provider.id,
      platform: provider.provider,
      model: provider.model,
      responseText: text,
      executionTimeMs,
    };
  } catch (error) {
    console.error(`Query failed for ${provider.displayName}:`, error);
    throw new Error(
      `Failed to query ${provider.displayName}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

/**
 * Execute multiple prompts for a single provider with rate limiting
 */
export const executePromptsForProvider = async (
  providerId: string,
  prompts: string[],
  delayMs: number = 2000,
): Promise<AIQueryResult[]> => {
  const results: AIQueryResult[] = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    if (!prompt) continue;

    try {
      const result = await queryAI(providerId, prompt);
      results.push(result);

      // Wait between requests (except after last one)
      if (i < prompts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Failed to execute prompt for ${providerId}:`, error);
      // Continue with other prompts even if one fails
    }
  }

  return results;
};

/**
 * Execute prompts across multiple providers in parallel
 */
export const executePromptsAcrossProviders = async (
  providerIds: string[],
  prompts: string[],
  delayMs: number = 2000,
): Promise<Record<string, AIQueryResult[]>> => {
  const results: Record<string, AIQueryResult[]> = {};

  // Execute all providers in parallel
  const providerPromises = providerIds.map(async (providerId) => {
    const providerResults = await executePromptsForProvider(
      providerId,
      prompts,
      delayMs,
    );
    return { providerId, results: providerResults };
  });

  const allResults = await Promise.allSettled(providerPromises);

  // Collect results
  allResults.forEach((result) => {
    if (result.status === "fulfilled") {
      results[result.value.providerId] = result.value.results;
    } else {
      console.error("Provider execution failed:", result.reason);
    }
  });

  return results;
};
