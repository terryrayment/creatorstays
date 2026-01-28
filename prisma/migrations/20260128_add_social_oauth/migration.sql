-- Add Instagram OAuth fields
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "instagramConnected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "instagramAccountId" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "instagramAccessToken" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "instagramLastSyncAt" TIMESTAMP(3);
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "instagramTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "instagramLastManualRefresh" TIMESTAMP(3);

-- Add TikTok OAuth fields
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktokConnected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktokOpenId" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktokAccessToken" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktokRefreshToken" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktokLastSyncAt" TIMESTAMP(3);
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktokTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktokLastManualRefresh" TIMESTAMP(3);

-- Note: instagramFollowers and tiktokFollowers columns already exist
-- If they don't exist in your DB, uncomment these:
-- ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "instagramFollowers" INTEGER;
-- ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "tiktokFollowers" INTEGER;
