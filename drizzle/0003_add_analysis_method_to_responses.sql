ALTER TABLE "analysis_sessions" ALTER COLUMN "analysis_method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "analysis_sessions" ALTER COLUMN "analysis_method" SET DEFAULT 'api_only'::text;--> statement-breakpoint
ALTER TABLE "responses" ALTER COLUMN "analysis_method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "responses" ALTER COLUMN "analysis_method" SET DEFAULT 'api_only'::text;--> statement-breakpoint
DROP TYPE "public"."analysis_method";--> statement-breakpoint
CREATE TYPE "public"."analysis_method" AS ENUM('api_only', 'web_search', 'hybrid');--> statement-breakpoint
ALTER TABLE "analysis_sessions" ALTER COLUMN "analysis_method" SET DEFAULT 'api_only'::"public"."analysis_method";--> statement-breakpoint
ALTER TABLE "analysis_sessions" ALTER COLUMN "analysis_method" SET DATA TYPE "public"."analysis_method" USING "analysis_method"::"public"."analysis_method";--> statement-breakpoint
ALTER TABLE "responses" ALTER COLUMN "analysis_method" SET DEFAULT 'api_only'::"public"."analysis_method";--> statement-breakpoint
ALTER TABLE "responses" ALTER COLUMN "analysis_method" SET DATA TYPE "public"."analysis_method" USING "analysis_method"::"public"."analysis_method";--> statement-breakpoint
ALTER TABLE "responses" ADD COLUMN "analysis_method" "analysis_method" DEFAULT 'api_only' NOT NULL;