/**
 * Website Analyzer Service
 * Fetches a URL, extracts key content, and uses GPT-4 Turbo to identify
 * business metadata: product name, brand, category, and competitors.
 */

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// ============================================================================
// Types
// ============================================================================

export interface WebsiteAnalysisResult {
  productName: string;
  primaryBrand: string;
  category: string;
  competitors: string[]; // 5-8 competitor company names
}

// ============================================================================
// HTML Extraction Helpers
// ============================================================================

/**
 * Strip all HTML tags from a string, collapsing whitespace.
 */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract the <title> tag text.
 */
function extractTitle(html: string): string {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return match ? stripTags(match[1] ?? "") : "";
}

/**
 * Extract meta description content attribute.
 */
function extractMetaDescription(html: string): string {
  const match =
    /<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=\s*["']([^"']*)["'][^>]*>/i.exec(
      html,
    ) ??
    /<meta[^>]+content\s*=\s*["']([^"']*)["'][^>]+name\s*=\s*["']description["'][^>]*>/i.exec(
      html,
    );
  return match ? (match[1] ?? "").trim() : "";
}

/**
 * Extract the first `limit` headings (h1, h2, h3), stripping inner tags.
 */
function extractHeadings(html: string, limit = 8): string[] {
  const results: string[] = [];
  const headingRegex = /<h[123][^>]*>([\s\S]*?)<\/h[123]>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null && results.length < limit) {
    const text = stripTags(match[1] ?? "");
    if (text.length > 0) {
      results.push(text);
    }
  }

  return results;
}

/**
 * Extract the first `limit` <p> paragraphs whose stripped text is
 * between 30 and 500 characters.
 */
function extractParagraphs(html: string, limit = 5): string[] {
  const results: string[] = [];
  const paraRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = paraRegex.exec(html)) !== null && results.length < limit) {
    const text = stripTags(match[1] ?? "");
    if (text.length >= 30 && text.length <= 500) {
      results.push(text);
    }
  }

  return results;
}

// ============================================================================
// Core Service
// ============================================================================

/**
 * Analyze a website URL to extract business metadata using AI.
 */
export async function analyzeWebsiteForBusiness(
  url: string,
): Promise<WebsiteAnalysisResult> {
  // 1. Normalize URL
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  // 2. Fetch HTML with timeout and browser-like headers
  let html: string;
  try {
    const response = await fetch(normalizedUrl, {
      signal: AbortSignal.timeout(12000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText} for URL: ${normalizedUrl}`,
      );
    }

    html = await response.text();
  } catch (error) {
    throw new Error(
      `Failed to fetch website "${normalizedUrl}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  // 3. Extract key content from HTML using regex
  const title = extractTitle(html);
  const metaDescription = extractMetaDescription(html);
  const headings = extractHeadings(html, 8);
  const paragraphs = extractParagraphs(html, 5);

  // 4. Build a concise summary string (cap at 3000 chars)
  const parts: string[] = [];

  if (title) parts.push(`Page Title: ${title}`);
  if (metaDescription) parts.push(`Meta Description: ${metaDescription}`);
  if (headings.length > 0) {
    parts.push(`Headings:\n${headings.map((h) => `- ${h}`).join("\n")}`);
  }
  if (paragraphs.length > 0) {
    parts.push(`Paragraphs:\n${paragraphs.map((p) => `- ${p}`).join("\n")}`);
  }

  const rawSummary = parts.join("\n\n");
  const summary =
    rawSummary.length > 3000 ? rawSummary.slice(0, 3000) : rawSummary;

  if (summary.trim().length === 0) {
    throw new Error(
      `Could not extract any meaningful content from "${normalizedUrl}"`,
    );
  }

  // 5. Call GPT-4 Turbo with the extracted content
  let aiText: string;
  try {
    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      prompt: `You are a business analyst. Analyze the following website content and identify the business.

Website content from ${normalizedUrl}:
---
${summary}
---

Return ONLY valid JSON (no markdown, no code blocks, no explanation) with exactly these fields:
{
  "productName": "the main product or service name",
  "primaryBrand": "the company or brand name",
  "category": "the industry or product category (e.g. 'CRM Software', 'E-commerce Platform', 'Cloud Storage')",
  "competitors": ["CompanyA", "CompanyB", "CompanyC", "CompanyD", "CompanyE"]
}

Rules:
- competitors must be 5 to 8 real, well-known competitor company names (just the company name, no descriptions)
- Do not include the primary brand itself in competitors
- Return ONLY the raw JSON object, nothing else`,
    });
    aiText = text;
  } catch (error) {
    throw new Error(
      `AI analysis failed for "${normalizedUrl}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  // 6. Strip any accidental ```json ... ``` wrappers
  const cleaned = aiText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // 7. Parse and validate
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `AI returned invalid JSON for "${normalizedUrl}". Raw response: ${aiText.slice(0, 200)}`,
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).productName !== "string" ||
    typeof (parsed as Record<string, unknown>).primaryBrand !== "string" ||
    typeof (parsed as Record<string, unknown>).category !== "string" ||
    !Array.isArray((parsed as Record<string, unknown>).competitors)
  ) {
    throw new Error(
      `AI response is missing required fields for "${normalizedUrl}". Raw response: ${aiText.slice(0, 200)}`,
    );
  }

  const result = parsed as {
    productName: string;
    primaryBrand: string;
    category: string;
    competitors: unknown[];
  };

  // 8. Clamp competitors to max 8 string items
  const competitors = result.competitors
    .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    .slice(0, 8);

  if (competitors.length < 2) {
    throw new Error(
      `AI returned fewer than 2 valid competitors for "${normalizedUrl}". Got: ${JSON.stringify(result.competitors)}`,
    );
  }

  return {
    productName: result.productName.trim(),
    primaryBrand: result.primaryBrand.trim(),
    category: result.category.trim(),
    competitors,
  };
}
