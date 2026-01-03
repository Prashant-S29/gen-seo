import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './db.schema.user';

export const sessionStatusEnum = pgEnum('session_status', [
  'pending',
  'processing',
  'completed',
  'failed'
]);

export const analysisMethodEnum = pgEnum('analysis_method', [
  'api_only',
  'crawling_only',
  'both'
]);

export const analysisSessions = pgTable('analysis_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Product information
  productName: varchar('product_name', { length: 255 }).notNull(),
  primaryBrand: varchar('primary_brand', { length: 255 }).notNull(),
  brands: text('brands').array().notNull(), // Array of competitor brands
  category: varchar('category', { length: 255 }).notNull(),
  
  // Analysis configuration (for later milestones)
  analysisMethod: analysisMethodEnum('analysis_method').default('api_only').notNull(),
  
  // Status tracking
  status: sessionStatusEnum('status').default('pending').notNull(),
  totalPrompts: integer('total_prompts').default(0).notNull(),
  completedPrompts: integer('completed_prompts').default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types
export type AnalysisSession = typeof analysisSessions.$inferSelect;
export type NewAnalysisSession = typeof analysisSessions.$inferInsert;