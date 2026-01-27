-- AlterTable: Add enhanced calendar sync tracking fields
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "lastCalendarSyncAt" TIMESTAMP(3);
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "lastCalendarSyncStatus" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "lastCalendarSyncError" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "lastCalendarSyncDebug" JSONB;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "icalEtag" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "icalLastModified" TEXT;

-- Copy existing lastCalendarSync to lastCalendarSyncAt for backwards compatibility
UPDATE "properties" SET "lastCalendarSyncAt" = "lastCalendarSync" WHERE "lastCalendarSyncAt" IS NULL AND "lastCalendarSync" IS NOT NULL;
