/**
 * Extract brand mentions from AI response text
 */
export interface BrandMention {
  brandName: string;
  position: number;
  contextSnippet: string;
  isRecommended: boolean;
}

export const extractBrandMentions = (
  responseText: string,
  brands: string[],
): BrandMention[] => {
  const mentions: BrandMention[] = [];

  for (const brand of brands) {
    const regex = new RegExp(brand, "gi");
    const matches = [...responseText.matchAll(regex)];

    if (matches.length > 0) {
      const firstMatch = matches[0];
      if (!firstMatch?.index) continue;

      // Extract context snippet (50 chars before and after)
      const startIdx = Math.max(0, firstMatch.index - 50);
      const endIdx = Math.min(
        responseText.length,
        firstMatch.index + brand.length + 50,
      );
      const contextSnippet = responseText.slice(startIdx, endIdx).trim();

      // Check if brand is recommended (appears in positive context)
      const isRecommended = checkIfRecommended(contextSnippet);

      mentions.push({
        brandName: brand,
        position: mentions.length + 1, // Position in order of appearance
        contextSnippet,
        isRecommended,
      });
    }
  }

  return mentions;
};

/**
 * Simple heuristic to check if brand is recommended
 * Looks for positive keywords near the brand mention
 */
const checkIfRecommended = (contextSnippet: string): boolean => {
  const positiveKeywords = [
    "best",
    "recommend",
    "top",
    "excellent",
    "great",
    "popular",
    "leading",
    "ideal",
    "perfect",
    "outstanding",
  ];

  const lowerContext = contextSnippet.toLowerCase();
  return positiveKeywords.some((keyword) => lowerContext.includes(keyword));
};

/**
 * Analyze sentiment of mention context
 * Simple rule-based approach for POC
 */
export const analyzeSentiment = (
  context: string,
): "positive" | "neutral" | "negative" => {
  const lowerContext = context.toLowerCase();

  const positiveKeywords = [
    "best",
    "great",
    "excellent",
    "recommend",
    "popular",
    "leading",
    "top",
    "ideal",
  ];
  const negativeKeywords = [
    "avoid",
    "poor",
    "limited",
    "expensive",
    "complicated",
    "worst",
    "lacking",
  ];

  const positiveCount = positiveKeywords.filter((kw) =>
    lowerContext.includes(kw),
  ).length;
  const negativeCount = negativeKeywords.filter((kw) =>
    lowerContext.includes(kw),
  ).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
};
