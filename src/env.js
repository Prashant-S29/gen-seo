import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    DATABASE_URL: z.url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    RESEND_API_KEY: z.string(),

    // Web Crawling Credentials (Optional)
    CHATGPT_EMAIL: z.string().optional(),
    CHATGPT_PASSWORD: z.string().optional(),
    CLAUDE_EMAIL: z.string().optional(),
    CLAUDE_PASSWORD: z.string().optional(),

    // Crawler Settings
    CRAWLER_HEADLESS: z.string().optional(),
    CRAWLER_TIMEOUT: z.string().optional(),
  },

  client: {},

  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    RESEND_API_KEY: process.env.RESEND_API_KEY,

    CHATGPT_EMAIL: process.env.CHATGPT_EMAIL,
    CHATGPT_PASSWORD: process.env.CHATGPT_PASSWORD,
    CLAUDE_EMAIL: process.env.CLAUDE_EMAIL,
    CLAUDE_PASSWORD: process.env.CLAUDE_PASSWORD,

    CRAWLER_HEADLESS: process.env.CRAWLER_HEADLESS,
    CRAWLER_TIMEOUT: process.env.CRAWLER_TIMEOUT,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
