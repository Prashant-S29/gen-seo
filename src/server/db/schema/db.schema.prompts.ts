import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { analysisSessions } from "./db.schema.analysis";
import { mentions, citations } from "./db.schema.mentions";

export const promptTypeEnum = pgEnum("prompt_type", [
  "recommendation",
  "comparison",
  "feature",
  "price",
  "use_case",
]);

export const prompts = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => analysisSessions.id, { onDelete: "cascade" })
    .notNull(),
  promptText: text("prompt_text").notNull(),
  promptType: promptTypeEnum("prompt_type").default("recommendation"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

export const responses = pgTable("responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  promptId: uuid("prompt_id")
    .references(() => prompts.id, { onDelete: "cascade" })
    .notNull(),
  platform: text("platform").notNull(),
  model: text("model").notNull(),
  responseText: text("response_text").notNull(),
  executionTimeMs: timestamp("execution_time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const promptsRelations = relations(prompts, ({ one, many }) => ({
  session: one(analysisSessions, {
    fields: [prompts.sessionId],
    references: [analysisSessions.id],
  }),
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  prompt: one(prompts, {
    fields: [responses.promptId],
    references: [prompts.id],
  }),
  mentions: many(mentions),
  citations: many(citations),
}));

export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;
export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
