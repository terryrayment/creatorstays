-- Add isPublic field to CreatorProfile for controlling public visibility
-- Default is false for beta (invite-only, not publicly discoverable)

ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
