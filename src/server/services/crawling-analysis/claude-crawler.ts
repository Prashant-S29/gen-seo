/**
 * Claude Web Crawler
 * Automates Claude web interface for brand visibility analysis
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

export interface ClaudeCrawlResponse {
  success: boolean;
  platform: "claude";
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
// Selectors (Update these if Claude UI changes)
// ============================================================================

const SELECTORS = {
  // Authentication
  loginButton: 'button:has-text("Log in")',
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  continueButton: 'button[type="submit"]',
  submitButton: 'button:has-text("Continue with email")',

  // Chat Interface
  promptTextarea: 'div[contenteditable="true"]',
  sendButton: 'button[aria-label="Send Message"]',
  responseContainer: ".font-claude-message",
  responseMessage: "[data-test-render-count]",
  newChatButton: 'button:has-text("New Chat")',

  // Rate Limit & Errors
  errorMessage: ".error",
  rateLimitMessage: "text=/rate limit|too many requests/i",
} as const;

// ============================================================================
// Configuration
// ============================================================================

const CLAUDE_CONFIG = {
  baseUrl: "https://claude.ai",
  loginUrl: "https://claude.ai/login",
  chatUrl: "https://claude.ai/new",
  timeout: 60000,
  responseTimeout: 120000, // Claude can take longer
  maxRetries: 3,
} as const;

// ============================================================================
// Authentication
// ============================================================================

/**
 * Authenticate to Claude
 * @param page - Playwright page
 * @param email - Claude email
 * @param password - Claude password
 */
async function authenticate(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  try {
    console.log("Navigating to Claude login page...");
    await page.goto(CLAUDE_CONFIG.loginUrl, {
      waitUntil: "networkidle",
      timeout: CLAUDE_CONFIG.timeout,
    });

    await randomDelay(2000, 3000);

    // Check if already logged in
    if (
      page.url().includes("/chat") ||
      page.url().includes(CLAUDE_CONFIG.baseUrl)
    ) {
      try {
        await page.waitForSelector(SELECTORS.newChatButton, { timeout: 5000 });
        console.log("Already authenticated to Claude");
        return;
      } catch {
        // Not logged in, continue with auth
      }
    }

    // Click "Continue with email" or similar button
    try {
      const continueWithEmailBtn = await page.waitForSelector(
        SELECTORS.submitButton,
        {
          timeout: 10000,
          state: "visible",
        },
      );
      if (continueWithEmailBtn) {
        await continueWithEmailBtn.click();
        await randomDelay(1500, 2500);
      }
    } catch {
      console.log("Continue with email button not found, proceeding...");
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

    // Click continue/next button
    try {
      const continueBtn = await page.waitForSelector(SELECTORS.continueButton, {
        timeout: 5000,
        state: "visible",
      });
      if (continueBtn) {
        await continueBtn.click();
        await randomDelay(2000, 3000);
      }
    } catch {
      // Might auto-proceed
      await randomDelay(1000, 2000);
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

    // Wait for redirect to chat
    console.log("Waiting for authentication...");
    await page.waitForURL("**claude.ai**", {
      timeout: CLAUDE_CONFIG.timeout,
    });

    await randomDelay(3000, 5000);

    // Verify we can see chat interface
    try {
      await page.waitForSelector(SELECTORS.newChatButton, { timeout: 10000 });
      console.log("Claude authentication successful");
    } catch {
      throw new CrawlerAuthError(
        "Authentication succeeded but chat interface not found",
      );
    }
  } catch (error) {
    if (error instanceof CrawlerAuthError) {
      throw error;
    }
    throw new CrawlerAuthError(
      `Claude authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ============================================================================
// Prompt Submission
// ============================================================================

/**
 * Start a new chat conversation
 * @param page - Playwright page
 */
async function startNewChat(page: Page): Promise<void> {
  try {
    // Click "New Chat" button if available
    const newChatBtn = await page.waitForSelector(SELECTORS.newChatButton, {
      timeout: 5000,
      state: "visible",
    });

    if (newChatBtn) {
      await newChatBtn.click();
      await randomDelay(2000, 3000);
    }
  } catch {
    // Already in new chat or button not needed
    console.log("New chat button not found or not needed");
  }
}

/**
 * Submit a prompt to Claude and wait for response
 * @param page - Playwright page
 * @param prompt - Prompt text
 * @returns Response text and citations
 */
async function submitPrompt(
  page: Page,
  prompt: string,
): Promise<{ responseText: string; citations: Citation[] }> {
  try {
    console.log(
      "Submitting prompt to Claude:",
      prompt.substring(0, 50) + "...",
    );

    // Wait for prompt input to be available
    const promptInput = await page.waitForSelector(SELECTORS.promptTextarea, {
      timeout: 10000,
      state: "visible",
    });

    if (!promptInput) {
      throw new CrawlerParseError("Prompt input not found");
    }

    // Click to focus
    await promptInput.click();
    await randomDelay(300, 600);

    // Clear any existing text
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await randomDelay(300, 500);

    // Type prompt with human-like delays
    await humanLikeType(page, SELECTORS.promptTextarea, prompt);
    await randomDelay(500, 1000);

    // Find and click send button
    const sendBtn = await page.waitForSelector(SELECTORS.sendButton, {
      timeout: 5000,
      state: "visible",
    });

    if (!sendBtn) {
      throw new CrawlerParseError("Send button not found");
    }

    await sendBtn.click();
    console.log("Prompt submitted to Claude, waiting for response...");

    // Wait for response to appear
    await randomDelay(3000, 5000);

    // Wait for response to complete (send button reappears when done)
    await page.waitForSelector(SELECTORS.sendButton, {
      timeout: CLAUDE_CONFIG.responseTimeout,
      state: "visible",
    });

    // Additional wait for UI stabilization
    await randomDelay(2000, 3000);

    // Check for rate limiting
    const rateLimitDelay = await detectRateLimit(page);
    if (rateLimitDelay) {
      throw new CrawlerRateLimitError("Rate limited by Claude", rateLimitDelay);
    }

    // Extract response text
    console.log("Extracting Claude response...");
    const responseText = await extractResponseFromDOM(page);

    // Extract citations
    console.log("Extracting citations from Claude...");
    const citations = await extractCitationsFromDOM(page);

    console.log(
      `Claude response extracted: ${responseText.length} chars, ${citations.length} citations`,
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
      `Failed to submit prompt to Claude: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extract response text from Claude DOM
 * @param page - Playwright page
 * @returns Response text
 */
async function extractResponseFromDOM(page: Page): Promise<string> {
  try {
    // Find all response messages
    const messages = await page.$$(SELECTORS.responseMessage);

    if (messages.length === 0) {
      throw new CrawlerParseError("No response messages found from Claude");
    }

    // Get the last message (most recent response)
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage) {
      throw new CrawlerParseError("Could not get last Claude message");
    }

    // Extract text content
    const text = await lastMessage.evaluate((el) => {
      // Get text content, preserving structure
      let content = el.textContent || "";

      // Clean up
      content = content.trim();

      return content;
    });

    if (!text || text.length === 0) {
      throw new CrawlerParseError("Extracted text from Claude is empty");
    }

    return text;
  } catch (error) {
    if (error instanceof CrawlerParseError) {
      throw error;
    }
    throw new CrawlerParseError(
      `Failed to extract Claude response: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ============================================================================
// Main Crawler Function
// ============================================================================

/**
 * Crawl Claude with a single prompt
 * @param prompt - Prompt text
 * @param email - Claude email (from env)
 * @param password - Claude password (from env)
 * @param headless - Run in headless mode
 * @returns Crawl response
 */
export async function crawlClaude(
  prompt: string,
  email: string,
  password: string,
  headless = false,
): Promise<ClaudeCrawlResponse> {
  const startTime = Date.now();
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let attemptCount = 0;
  let rateLimited = false;

  try {
    // Setup browser
    console.log("Setting up browser for Claude...");
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
    );

    // Start new chat
    if (page) {
      await startNewChat(page);
    }

    // Submit prompt and get response
    const result = await withRetry(async () => {
      attemptCount++;
      if (!page) throw new Error("Page not initialized");
      return await submitPrompt(page, prompt);
    }, CLAUDE_CONFIG.maxRetries);

    const executionTimeMs = Date.now() - startTime;

    return {
      success: true,
      platform: "claude",
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

    if (error instanceof CrawlerRateLimitError) {
      rateLimited = true;
    }

    const retryable = !(error instanceof CrawlerAuthError);

    return {
      success: false,
      platform: "claude",
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
    console.log("Cleaning up Claude browser resources...");
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
 * @param email - Claude email
 * @param password - Claude password
 * @param delayMs - Delay between prompts
 * @param headless - Run in headless mode
 * @returns Array of responses
 */
export async function crawlClaudeBatch(
  prompts: string[],
  email: string,
  password: string,
  delayMs = 15000, // Claude is more strict, longer delay
  headless = false,
): Promise<ClaudeCrawlResponse[]> {
  const results: ClaudeCrawlResponse[] = [];
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    console.log("Setting up browser for Claude batch processing...");
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

      console.log(`Processing Claude prompt ${i + 1}/${prompts.length}`);
      const startTime = Date.now();

      try {
        // Start new chat for each prompt
        await startNewChat(page);

        const result = await submitPrompt(page, prompt);
        const executionTimeMs = Date.now() - startTime;

        results.push({
          success: true,
          platform: "claude",
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
          platform: "claude",
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

      // Delay between prompts
      if (i < prompts.length - 1) {
        console.log(`Waiting ${delayMs}ms before next Claude prompt...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  } finally {
    console.log("Cleaning up Claude batch processing resources...");
    if (page) await cleanupPage(page);
    if (context) await context.close().catch(console.error);
    if (browser) await cleanupBrowser(browser);
  }
}
