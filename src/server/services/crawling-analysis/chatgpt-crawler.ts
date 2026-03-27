/**
 * ChatGPT Web Crawler
 * Automates ChatGPT web interface for brand visibility analysis
 */

import type { Browser, Page, BrowserContext } from "playwright";
import {
  setupBrowser,
  createStealthContext,
  setupStealth,
  extractCitationsFromDOM,
  cleanupBrowser,
  cleanupPage,
  humanLikeType,
  randomDelay,
  withRetry,
  detectRateLimit,
  CrawlerAuthError,
  CrawlerRateLimitError,
  CrawlerTimeoutError,
  CrawlerParseError,
  type Citation,
} from "./crawler-utils";

// ============================================================================
// Types
// ============================================================================

export interface ChatGPTCrawlResponse {
  success: boolean;
  platform: "chatgpt";
  responseText: string;
  citations: Citation[];
  metadata: {
    executionTimeMs: number;
    attemptCount: number;
    rateLimited: boolean;
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

// ============================================================================
// Selectors (Update these if ChatGPT UI changes)
// ============================================================================

const SELECTORS = {
  // Authentication
  loginButton: 'button[data-testid="login-button"]',
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  continueButton: 'button[type="submit"]',

  // Chat Interface
  promptTextarea: 'textarea[data-id="root"]',
  sendButton: 'button[data-testid="send-button"]',
  responseContainer: ".markdown.prose",
  responseMessage: '[data-message-author-role="assistant"]',
  stopButton: 'button[aria-label="Stop generating"]',

  // Rate Limit & Errors
  errorMessage: ".error-message",
  rateLimitMessage: ".rate-limit-message",
} as const;

// ============================================================================
// Configuration
// ============================================================================

const CHATGPT_CONFIG = {
  baseUrl: "https://chat.openai.com",
  loginUrl: "https://chat.openai.com/auth/login",
  timeout: 60000,
  responseTimeout: 90000,
  maxRetries: 3,
} as const;

// ============================================================================
// Authentication
// ============================================================================

/**
 * Authenticate to ChatGPT
 * @param page - Playwright page
 * @param email - ChatGPT email
 * @param password - ChatGPT password
 */
async function authenticate(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  try {
    console.log("Navigating to ChatGPT login page...");
    await page.goto(CHATGPT_CONFIG.loginUrl, {
      waitUntil: "networkidle",
      timeout: CHATGPT_CONFIG.timeout,
    });

    // Wait for login page to load
    await randomDelay(2000, 3000);

    // Check if already logged in (redirect to chat)
    if (page.url().includes("/chat")) {
      console.log("Already authenticated");
      return;
    }

    // Click login button
    try {
      const loginBtn = await page.waitForSelector(SELECTORS.loginButton, {
        timeout: 10000,
        state: "visible",
      });
      if (loginBtn) {
        await loginBtn.click();
        await randomDelay(1000, 2000);
      }
    } catch {
      // Login button might not exist if already on login form
      console.log("Login button not found, assuming on login form");
    }

    // Enter email
    console.log("Entering email...");
    const emailInput = await page.waitForSelector(SELECTORS.emailInput, {
      timeout: 10000,
      state: "visible",
    });

    if (!emailInput) {
      throw new CrawlerAuthError("Email input not found");
    }

    await humanLikeType(page, SELECTORS.emailInput, email);
    await randomDelay(500, 1000);

    // Click continue
    const continueBtn = await page.waitForSelector(SELECTORS.continueButton, {
      timeout: 5000,
      state: "visible",
    });

    if (continueBtn) {
      await continueBtn.click();
      await randomDelay(2000, 3000);
    }

    // Enter password
    console.log("Entering password...");
    const passwordInput = await page.waitForSelector(SELECTORS.passwordInput, {
      timeout: 10000,
      state: "visible",
    });

    if (!passwordInput) {
      throw new CrawlerAuthError("Password input not found");
    }

    await humanLikeType(page, SELECTORS.passwordInput, password);
    await randomDelay(500, 1000);

    // Submit login
    const submitBtn = await page.waitForSelector(SELECTORS.continueButton, {
      timeout: 5000,
      state: "visible",
    });

    if (submitBtn) {
      await submitBtn.click();
    }

    // Wait for redirect to chat interface
    console.log("Waiting for authentication...");
    await page.waitForURL("**/chat**", {
      timeout: CHATGPT_CONFIG.timeout,
    });

    // Additional wait for UI to stabilize
    await randomDelay(3000, 5000);

    // Verify authentication success
    if (!page.url().includes("/chat")) {
      throw new CrawlerAuthError(
        "Authentication failed - did not redirect to chat",
      );
    }

    console.log("Authentication successful");
  } catch (error) {
    if (error instanceof CrawlerAuthError) {
      throw error;
    }
    throw new CrawlerAuthError(
      `ChatGPT authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ============================================================================
// Prompt Submission
// ============================================================================

/**
 * Submit a prompt to ChatGPT and wait for response
 * @param page - Playwright page
 * @param prompt - Prompt text
 * @returns Response text and citations
 */
async function submitPrompt(
  page: Page,
  prompt: string,
): Promise<{ responseText: string; citations: Citation[] }> {
  try {
    console.log("Submitting prompt:", prompt.substring(0, 50) + "...");

    // Wait for textarea to be available
    const textarea = await page.waitForSelector(SELECTORS.promptTextarea, {
      timeout: 10000,
      state: "visible",
    });

    if (!textarea) {
      throw new CrawlerParseError("Prompt textarea not found");
    }

    // Clear any existing text
    await textarea.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await randomDelay(300, 600);

    // Type prompt with human-like delays
    await humanLikeType(page, SELECTORS.promptTextarea, prompt);
    await randomDelay(500, 1000);

    // Click send button
    const sendBtn = await page.waitForSelector(SELECTORS.sendButton, {
      timeout: 5000,
      state: "visible",
    });

    if (!sendBtn) {
      throw new CrawlerParseError("Send button not found");
    }

    await sendBtn.click();
    console.log("Prompt submitted, waiting for response...");

    // Wait for response to start appearing
    await randomDelay(2000, 3000);

    // Wait for stop button to disappear (streaming complete)
    try {
      await page.waitForSelector(SELECTORS.stopButton, {
        timeout: 5000,
        state: "visible",
      });

      // Now wait for it to disappear (streaming complete)
      await page.waitForSelector(SELECTORS.stopButton, {
        timeout: CHATGPT_CONFIG.responseTimeout,
        state: "hidden",
      });
    } catch {
      // Stop button might not appear for short responses
      console.log("Stop button not detected, assuming short response");
    }

    // Additional wait for UI to stabilize
    await randomDelay(2000, 3000);

    // Check for rate limiting
    const rateLimitDelay = await detectRateLimit(page);
    if (rateLimitDelay) {
      throw new CrawlerRateLimitError(
        "Rate limited by ChatGPT",
        rateLimitDelay,
      );
    }

    // Extract response text
    console.log("Extracting response...");
    const responseText = await extractResponseFromDOM(page);

    // Extract citations
    console.log("Extracting citations...");
    const citations = await extractCitationsFromDOM(page);

    console.log(
      `Response extracted: ${responseText.length} chars, ${citations.length} citations`,
    );

    return {
      responseText,
      citations,
    };
  } catch (error) {
    if (
      error instanceof CrawlerRateLimitError ||
      error instanceof CrawlerParseError
    ) {
      throw error;
    }
    throw new CrawlerTimeoutError(
      `Failed to submit prompt: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extract response text from ChatGPT DOM
 * @param page - Playwright page
 * @returns Response text
 */
async function extractResponseFromDOM(page: Page): Promise<string> {
  try {
    // Find the last assistant message
    const messages = await page.$$(SELECTORS.responseMessage);

    if (messages.length === 0) {
      throw new CrawlerParseError("No response messages found");
    }

    // Get the last message (most recent response)
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage) {
      throw new CrawlerParseError("Could not get last message");
    }

    // Extract text content
    const text = await lastMessage.evaluate((el) => {
      // Remove any citation reference numbers like [1], [2]
      let content = el.textContent || "";

      // Clean up the text
      content = content.trim();

      return content;
    });

    if (!text || text.length === 0) {
      throw new CrawlerParseError("Extracted text is empty");
    }

    return text;
  } catch (error) {
    if (error instanceof CrawlerParseError) {
      throw error;
    }
    throw new CrawlerParseError(
      `Failed to extract response: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ============================================================================
// Main Crawler Function
// ============================================================================

/**
 * Crawl ChatGPT with a single prompt
 * @param prompt - Prompt text
 * @param email - ChatGPT email (from env)
 * @param password - ChatGPT password (from env)
 * @param headless - Run in headless mode
 * @returns Crawl response
 */
export async function crawlChatGPT(
  prompt: string,
  email: string,
  password: string,
  headless = false,
): Promise<ChatGPTCrawlResponse> {
  const startTime = Date.now();
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let attemptCount = 0;
  let rateLimited = false;

  try {
    // Setup browser
    console.log("Setting up browser...");
    browser = await setupBrowser(headless);
    context = await createStealthContext(browser);
    page = await context.newPage();

    // Apply stealth mode
    await setupStealth(page);

    // Authenticate with retry
    await withRetry(
      async () => {
        attemptCount++;
        if (page) {
          await authenticate(page, email, password);
        }
      },
      2,
      5000,
    ); // Only retry auth twice

    // Submit prompt and get response
    const result = await withRetry(async () => {
      attemptCount++;
      if (!page) throw new Error("Page not initialized");
      return await submitPrompt(page, prompt);
    }, CHATGPT_CONFIG.maxRetries);

    const executionTimeMs = Date.now() - startTime;

    return {
      success: true,
      platform: "chatgpt",
      responseText: result.responseText,
      citations: result.citations,
      metadata: {
        executionTimeMs,
        attemptCount,
        rateLimited,
      },
    };
  } catch (error) {
    const executionTimeMs = Date.now() - startTime;

    // Check if rate limited
    if (error instanceof CrawlerRateLimitError) {
      rateLimited = true;
    }

    // Determine if error is retryable
    const retryable = !(error instanceof CrawlerAuthError);

    return {
      success: false,
      platform: "chatgpt",
      responseText: "",
      citations: [],
      metadata: {
        executionTimeMs,
        attemptCount,
        rateLimited,
      },
      error: {
        code: error instanceof Error ? error.name : "UnknownError",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        retryable,
      },
    };
  } finally {
    // Cleanup
    console.log("Cleaning up browser resources...");
    if (page) await cleanupPage(page);
    if (context) await context.close().catch(console.error);
    if (browser) await cleanupBrowser(browser);
  }
}

// ============================================================================
// Batch Processing
// ============================================================================

/**
 * Process multiple prompts sequentially
 * @param prompts - Array of prompts
 * @param email - ChatGPT email
 * @param password - ChatGPT password
 * @param delayMs - Delay between prompts
 * @param headless - Run in headless mode
 * @returns Array of responses
 */
export async function crawlChatGPTBatch(
  prompts: string[],
  email: string,
  password: string,
  delayMs = 10000,
  headless = false,
): Promise<ChatGPTCrawlResponse[]> {
  const results: ChatGPTCrawlResponse[] = [];
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    // Setup browser once for all prompts
    console.log("Setting up browser for batch processing...");
    browser = await setupBrowser(headless);
    context = await createStealthContext(browser);
    page = await context.newPage();
    await setupStealth(page);

    // Authenticate once
    await authenticate(page, email, password);

    // Process each prompt
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      if (!prompt) continue;

      console.log(`Processing prompt ${i + 1}/${prompts.length}`);
      const startTime = Date.now();

      try {
        const result = await submitPrompt(page, prompt);
        const executionTimeMs = Date.now() - startTime;

        results.push({
          success: true,
          platform: "chatgpt",
          responseText: result.responseText,
          citations: result.citations,
          metadata: {
            executionTimeMs,
            attemptCount: 1,
            rateLimited: false,
          },
        });
      } catch (error) {
        const executionTimeMs = Date.now() - startTime;
        const rateLimited = error instanceof CrawlerRateLimitError;

        results.push({
          success: false,
          platform: "chatgpt",
          responseText: "",
          citations: [],
          metadata: {
            executionTimeMs,
            attemptCount: 1,
            rateLimited,
          },
          error: {
            code: error instanceof Error ? error.name : "UnknownError",
            message: error instanceof Error ? error.message : "Unknown error",
            retryable: true,
          },
        });
      }

      // Delay between prompts (except last one)
      if (i < prompts.length - 1) {
        console.log(`Waiting ${delayMs}ms before next prompt...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  } finally {
    // Cleanup
    console.log("Cleaning up batch processing resources...");
    if (page) await cleanupPage(page);
    if (context) await context.close().catch(console.error);
    if (browser) await cleanupBrowser(browser);
  }
}
