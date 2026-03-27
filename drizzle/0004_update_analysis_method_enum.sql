-- Drop existing enum constraint if it exists
ALTER TABLE "responses" ALTER COLUMN "analysis_method" DROP DEFAULT;
ALTER TABLE "analysis_sessions" ALTER COLUMN "analysis_method" DROP DEFAULT;

-- Drop the old enum type and recreate with new values
DROP TYPE IF EXISTS "analysis_method" CASCADE;
CREATE TYPE "analysis_method" AS ENUM('api_only', 'crawling_only', 'both');

-- Re-add the columns with the new enum type
ALTER TABLE "analysis_sessions"
  ALTER COLUMN "analysis_method" TYPE "analysis_method" USING 'api_only'::"analysis_method",
  ALTER COLUMN "analysis_method" SET DEFAULT 'api_only'::"analysis_method",
  ALTER COLUMN "analysis_method" SET NOT NULL;

ALTER TABLE "responses"
  ALTER COLUMN "analysis_method" TYPE "analysis_method" USING 'api_only'::"analysis_method",
  ALTER COLUMN "analysis_method" SET DEFAULT 'api_only'::"analysis_method",
  ALTER COLUMN "analysis_method" SET NOT NULL;
