/**
 * Crawler Utilities
 * Shared functions for browser automation across all platform crawlers
 */

import { type Browser, type Page, type BrowserContext } from "playwright";
import { chromium as playwrightExtra } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// ============================================================================
// Configuration
// ============================================================================

export const CRAWLER_CONFIG = {
  timeout: 60000, // 60 seconds
  navigationTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 5000, // 5 seconds
  viewport: { width: 1920, height: 1080 },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  stealthMode: true,
} as const;

// ============================================================================
// Custom Error Types
// ============================================================================

export class CrawlerAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CrawlerAuthError";
  }
}

export class CrawlerRateLimitError extends Error {
  retryAfter: number;

  constructor(message: string, retryAfter = 60000) {
    super(message);
    this.name = "CrawlerRateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class CrawlerTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CrawlerTimeoutError";
  }
}

export class CrawlerParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CrawlerParseError";
  }
}

// ============================================================================
// Browser Setup
// ============================================================================

/**
 * Setup and launch browser with stealth mode
 * @param headless - Run browser in headless mode
 * @returns Browser instance
 */
export async function setupBrowser(headless = false): Promise<Browser> {
  try {
    // Apply stealth plugin lazily (safe to call multiple times in playwright-extra)
    playwrightExtra.use(StealthPlugin());

    const browser = await playwrightExtra.launch({
      headless,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });

    return browser;
  } catch (error) {
    console.error("Failed to setup browser:", error);
    throw new Error(
      `Browser setup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Create a new browser context with stealth settings
 * @param browser - Browser instance
 * @returns Browser context
 */
export async function createStealthContext(
  browser: Browser,
): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: CRAWLER_CONFIG.viewport,
    userAgent: CRAWLER_CONFIG.userAgent,
    locale: "en-US",
    timezoneId: "America/New_York",
    permissions: ["geolocation"],
    geolocation: { latitude: 40.7128, longitude: -74.006 }, // New York
    colorScheme: "light",
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
  });

  return context;
}

/**
 * Apply stealth mode to a page
 * @param page - Playwright page
 */
export async function setupStealth(page: Page): Promise<void> {
  // Override navigator.webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });
  });

  // Override chrome detection
  await page.addInitScript(() => {
    // @ts-expect-error - Adding chrome object
    window.chrome = {
      runtime: {},
    };
  });

  // Override permissions
  await page.addInitScript(() => {
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: unknown) => {
      if ((parameters as { name: string }).name === "notifications") {
        return Promise.resolve({
          state: "denied",
        } as PermissionStatus);
      }
      return originalQuery(parameters as PermissionDescriptor);
    };
  });

  // Override plugins length
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });
  });

  // Override languages
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });
}

// ============================================================================
// Response Handling
// ============================================================================

/**
 * Wait for AI response to complete streaming
 * @param page - Playwright page
 * @param selector - Selector for response container
 * @param timeout - Maximum wait time in milliseconds
 * @returns Response element
 */
export async function waitForResponse(
  page: Page,
  selector: string,
  timeout = CRAWLER_CONFIG.timeout,
): Promise<void> {
  try {
    // Wait for response container to appear
    await page.waitForSelector(selector, { timeout, state: "visible" });

    // Wait for streaming to complete (wait for network to be idle)
    await page.waitForLoadState("networkidle", { timeout });

    // Additional wait for any animations
    await page.waitForTimeout(1000);
  } catch (error) {
    throw new CrawlerTimeoutError(
      `Timeout waiting for response: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extract text from a DOM element
 * @param page - Playwright page
 * @param selector - CSS selector for element
 * @returns Extracted text
 */
export async function extractResponseText(
  page: Page,
  selector: string,
): Promise<string> {
  try {
    const element = await page.waitForSelector(selector, { timeout: 5000 });

    if (!element) {
      throw new CrawlerParseError(`Element not found: ${selector}`);
    }

    const text = await element.innerText();

    if (!text || text.trim().length === 0) {
      throw new CrawlerParseError("Extracted text is empty");
    }

    return text.trim();
  } catch (error) {
    throw new CrawlerParseError(
      `Failed to extract text: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ============================================================================
// Citation Extraction
// ============================================================================

export interface Citation {
  url: string;
  domain: string;
  title?: string;
  citationType: "inline" | "footnote" | "markdown";
}

/**
 * Extract citations from DOM
 * @param page - Playwright page
 * @returns Array of citations
 */
export async function extractCitationsFromDOM(page: Page): Promise<Citation[]> {
  try {
    const citations = await page.evaluate(() => {
      const results: Citation[] = [];
      const seenUrls = new Set<string>();

      // Find all links in the page
      const links = document.querySelectorAll("a[href]");

      links.forEach((link) => {
        const href = link.getAttribute("href");
        const text = link.textContent?.trim() || "";

        if (!href || seenUrls.has(href)) return;

        // Only process http/https links
        if (href.startsWith("http://") || href.startsWith("https://")) {
          try {
            const url = new URL(href);
            const domain = url.hostname.replace("www.", "");

            seenUrls.add(href);

            // Determine citation type based on context
            let citationType: "inline" | "footnote" | "markdown" = "inline";

            // Check if it's a footnote reference (e.g., [1], [2])
            if (/^\[\d+\]$/.test(text)) {
              citationType = "footnote";
            }
            // Check if parent contains markdown-like structure
            else if (
              link.parentElement?.textContent?.includes("[") &&
              link.parentElement?.textContent?.includes("]")
            ) {
              citationType = "markdown";
            }

            results.push({
              url: href,
              domain,
              title: text || undefined,
              citationType,
            });
          } catch {
            // Invalid URL, skip
          }
        }
      });

      return results;
    });

    return citations;
  } catch (error) {
    console.error("Failed to extract citations:", error);
    return [];
  }
}

// ============================================================================
// Rate Limiting & Error Handling
// ============================================================================

/**
 * Handle rate limit errors
 * @param page - Playwright page
 * @returns Retry delay in milliseconds or null if not rate limited
 */
export async function detectRateLimit(page: Page): Promise<number | null> {
  try {
    // Check page content for rate limit indicators
    const content = await page.content();

    const rateLimitIndicators = [
      "too many requests",
      "rate limit",
      "slow down",
      "try again later",
      "please wait",
    ];

    const hasRateLimit = rateLimitIndicators.some((indicator) =>
      content.toLowerCase().includes(indicator),
    );

    if (hasRateLimit) {
      // Default retry after 60 seconds
      return 60000;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param initialDelay - Initial delay in milliseconds
 * @returns Function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = CRAWLER_CONFIG.retryAttempts,
  initialDelay: number = CRAWLER_CONFIG.retryDelay,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      // Don't retry authentication errors
      if (error instanceof CrawlerAuthError) {
        throw error;
      }

      // For rate limit errors, use the specified retry delay
      if (error instanceof CrawlerRateLimitError) {
        const delay = error.retryAfter;
        console.log(
          `Rate limited. Waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Last attempt, throw error
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Cleanup browser resources
 * @param browser - Browser instance to close
 */
export async function cleanupBrowser(browser: Browser | null): Promise<void> {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      console.error("Error closing browser:", error);
    }
  }
}

/**
 * Cleanup page resources
 * @param page - Page instance to close
 */
export async function cleanupPage(page: Page | null): Promise<void> {
  if (page) {
    try {
      await page.close();
    } catch (error) {
      console.error("Error closing page:", error);
    }
  }
}

// ============================================================================
// Human-like Interactions
// ============================================================================

/**
 * Type text with human-like delays
 * @param page - Playwright page
 * @param selector - Input selector
 * @param text - Text to type
 */
export async function humanLikeType(
  page: Page,
  selector: string,
  text: string,
): Promise<void> {
  const input = await page.waitForSelector(selector);

  if (!input) {
    throw new CrawlerParseError(`Input element not found: ${selector}`);
  }

  // Clear existing text
  await input.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");

  // Type with random delays between characters (50-150ms)
  for (const char of text) {
    await input.type(char, {
      delay: Math.floor(Math.random() * 100) + 50,
    });
  }
}

/**
 * Add random delay to mimic human behavior
 * @param min - Minimum delay in milliseconds
 * @param max - Maximum delay in milliseconds
 */
export async function randomDelay(min = 500, max = 2000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Scroll page naturally
 * @param page - Playwright page
 */
export async function naturalScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
