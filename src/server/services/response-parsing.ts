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

export interface Citation {
  url: string;
  domain: string;
  title?: string;
  citationType: "inline" | "footnote" | "markdown";
}

/**
 * Extract domain from URL
 */
const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
};

/**
 * Detect and extract citations from AI response
 * Supports: plain URLs, markdown links, footnote-style references
 */
export const detectCitations = (responseText: string): Citation[] => {
  const citations: Citation[] = [];
  const seenUrls = new Set<string>();

  // 1. Extract markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  let match;

  while ((match = markdownLinkRegex.exec(responseText)) !== null) {
    const title = match[1];
    const url = match[2];

    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      citations.push({
        url,
        domain: extractDomain(url),
        title,
        citationType: "markdown",
      });
    }
  }

  // 2. Extract plain URLs (http/https)
  const plainUrlRegex = /(?<!\[)\b(https?:\/\/[^\s\)\]]+)/g;

  while ((match = plainUrlRegex.exec(responseText)) !== null) {
    const url = match[1];

    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      citations.push({
        url,
        domain: extractDomain(url),
        citationType: "inline",
      });
    }
  }

  // 3. Extract footnote-style references [1], [2], etc.
  // Look for patterns like [1]: http://... or [1] http://...
  const footnoteRegex = /\[(\d+)\]:?\s*(https?:\/\/[^\s]+)/g;

  while ((match = footnoteRegex.exec(responseText)) !== null) {
    const url = match[2];

    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      citations.push({
        url,
        domain: extractDomain(url),
        citationType: "footnote",
      });
    }
  }

  return citations;
};

/**
 * Get top cited domains from multiple citations
 */
export const getTopCitedDomains = (
  citations: Citation[],
): Record<string, number> => {
  const domainCounts: Record<string, number> = {};

  citations.forEach((citation) => {
    domainCounts[citation.domain] = (domainCounts[citation.domain] || 0) + 1;
  });

  return domainCounts;
};

/**
 * Check if a specific brand is cited in any citation
 */
export const isBrandCited = (
  citations: Citation[],
  brandName: string,
): boolean => {
  const lowerBrand = brandName.toLowerCase();

  return citations.some((citation) => {
    const lowerUrl = citation.url.toLowerCase();
    const lowerDomain = citation.domain.toLowerCase();
    const lowerTitle = citation.title?.toLowerCase() || "";

    return (
      lowerUrl.includes(lowerBrand) ||
      lowerDomain.includes(lowerBrand) ||
      lowerTitle.includes(lowerBrand)
    );
  });
};
