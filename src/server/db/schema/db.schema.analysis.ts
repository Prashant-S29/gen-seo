import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./db.schema.user";
import { prompts } from "./db.schema.prompts";

export const sessionStatusEnum = pgEnum("session_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const analysisMethodEnum = pgEnum("analysis_method", [
  "api_only",
  "crawling_only",
  "both",
]);

export const analysisSessions = pgTable("analysis_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),

  productName: varchar("product_name", { length: 255 }).notNull(),
  primaryBrand: varchar("primary_brand", { length: 255 }).notNull(),
  brands: text("brands").array().notNull(),
  category: varchar("category", { length: 255 }).notNull(),

  selectedProviders: text("selected_providers").array().notNull().default([]),
  promptCount: integer("prompt_count").default(10).notNull(),

  analysisMethod: analysisMethodEnum("analysis_method")
    .default("api_only")
    .notNull(),

  status: sessionStatusEnum("status").default("pending").notNull(),
  totalPrompts: integer("total_prompts").default(0).notNull(),
  completedPrompts: integer("completed_prompts").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const analysisSessionsRelations = relations(
  analysisSessions,
  ({ one, many }) => ({
    user: one(user, {
      fields: [analysisSessions.userId],
      references: [user.id],
    }),
    prompts: many(prompts),
  }),
);

export type AnalysisSession = typeof analysisSessions.$inferSelect;
export type NewAnalysisSession = typeof analysisSessions.$inferInsert;
