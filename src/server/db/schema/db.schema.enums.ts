import { pgEnum } from "drizzle-orm/pg-core";

export const analysisMethodEnum = pgEnum("analysis_method", [
  "api_only",
  "crawling_only",
  "both",
]);
