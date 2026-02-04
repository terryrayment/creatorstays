-- Infrastructure Phase 1 Migration
-- Adds: Trust tiers, Readiness states, Offer audit fields, AuditLog, AnalyticsEvent

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Create TrustTier enum
CREATE TYPE "TrustTier" AS ENUM ('NEW', 'VERIFIED', 'PROVEN');

-- Create ReadinessState enum
CREATE TYPE "ReadinessState" AS ENUM ('INCOMPLETE', 'PENDING_OAUTH', 'READY');

-- ============================================================================
-- CREATOR PROFILE EXTENSIONS (Trust & Readiness)
-- ============================================================================

-- Add trust tier (default NEW for existing records)
ALTER TABLE "creator_profiles" 
ADD COLUMN "trustTier" "TrustTier" NOT NULL DEFAULT 'NEW';

-- Add readiness state (default INCOMPLETE for existing records)
ALTER TABLE "creator_profiles" 
ADD COLUMN "readinessState" "ReadinessState" NOT NULL DEFAULT 'INCOMPLETE';

-- Add readiness blockers (JSON array of strings)
ALTER TABLE "creator_profiles" 
ADD COLUMN "readinessBlockers" JSONB NOT NULL DEFAULT '[]';

-- Add computed profile completeness (0.0 to 1.0)
ALTER TABLE "creator_profiles" 
ADD COLUMN "profileCompleteness" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add lifecycle tracking fields
ALTER TABLE "creator_profiles" 
ADD COLUMN "firstOfferReceivedAt" TIMESTAMP(3);

ALTER TABLE "creator_profiles" 
ADD COLUMN "firstOfferRespondedAt" TIMESTAMP(3);

ALTER TABLE "creator_profiles" 
ADD COLUMN "firstCollabCompletedAt" TIMESTAMP(3);

-- ============================================================================
-- OFFER EXTENSIONS (Audit Trail)
-- ============================================================================

-- Add original terms snapshot (frozen at creation, immutable)
ALTER TABLE "offers" 
ADD COLUMN "originalTermsSnapshot" JSONB;

-- Add status history (array of status changes)
ALTER TABLE "offers" 
ADD COLUMN "statusHistory" JSONB NOT NULL DEFAULT '[]';

-- Add computed total value
ALTER TABLE "offers" 
ADD COLUMN "totalValueCents" INTEGER;

-- Add validation state
ALTER TABLE "offers" 
ADD COLUMN "isValid" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "offers" 
ADD COLUMN "validationErrors" JSONB NOT NULL DEFAULT '[]';

-- ============================================================================
-- NEW TABLES: Audit & Analytics
-- ============================================================================

-- Create AuditLog table
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes for AuditLog
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- Create AnalyticsEvent table
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL DEFAULT '{}',
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- Create indexes for AnalyticsEvent
CREATE INDEX "analytics_events_actorType_actorId_createdAt_idx" ON "analytics_events"("actorType", "actorId", "createdAt");
CREATE INDEX "analytics_events_eventType_createdAt_idx" ON "analytics_events"("eventType", "createdAt");
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");
