import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { responses } from "./db.schema.prompts";

export const sentimentEnum = pgEnum("sentiment", [
  "positive",
  "neutral",
  "negative",
]);

export const mentions = pgTable("mentions", {
  id: uuid("id").defaultRandom().primaryKey(),
  responseId: uuid("response_id")
    .references(() => responses.id, { onDelete: "cascade" })
    .notNull(),
  brandName: text("brand_name").notNull(),
  position: integer("position").notNull(),
  contextSnippet: text("context_snippet"),
  sentiment: sentimentEnum("sentiment").default("neutral"),
  isRecommended: boolean("is_recommended").default(false),
  isCited: boolean("is_cited").default(false),
});

export const citations = pgTable("citations", {
  id: uuid("id").defaultRandom().primaryKey(),
  responseId: uuid("response_id")
    .references(() => responses.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  title: text("title"),
  citationType: text("citation_type").notNull(), // 'inline', 'footnote', 'markdown'
});

// Define relations
export const mentionsRelations = relations(mentions, ({ one }) => ({
  response: one(responses, {
    fields: [mentions.responseId],
    references: [responses.id],
  }),
}));

export const citationsRelations = relations(citations, ({ one }) => ({
  response: one(responses, {
    fields: [citations.responseId],
    references: [responses.id],
  }),
}));

export type Mention = typeof mentions.$inferSelect;
export type NewMention = typeof mentions.$inferInsert;
export type Citation = typeof citations.$inferSelect;
export type NewCitation = typeof citations.$inferInsert;
