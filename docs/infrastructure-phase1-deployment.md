# Infrastructure Phase 1: Deployment Guide

## What This Migration Does

Adds the foundational infrastructure for creator trust, readiness tracking, and audit trails.

### New Fields on `CreatorProfile`

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `trustTier` | Enum | `NEW` | Creator credibility tier (NEW → VERIFIED → PROVEN) |
| `readinessState` | Enum | `INCOMPLETE` | Profile readiness (INCOMPLETE → PENDING_OAUTH → READY) |
| `readinessBlockers` | JSON | `[]` | Array of specific blockers preventing readiness |
| `profileCompleteness` | Float | `0` | 0.0-1.0 completeness score |
| `firstOfferReceivedAt` | DateTime? | null | Lifecycle tracking |
| `firstOfferRespondedAt` | DateTime? | null | Lifecycle tracking |
| `firstCollabCompletedAt` | DateTime? | null | Lifecycle tracking + PROVEN tier trigger |

### New Fields on `Offer`

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `originalTermsSnapshot` | JSON | null | Immutable snapshot of offer terms at creation |
| `statusHistory` | JSON | `[]` | Array of status changes with timestamps |
| `totalValueCents` | Int? | null | Computed total value (cash + stay) |
| `isValid` | Boolean | `true` | Whether offer passes validation rules |
| `validationErrors` | JSON | `[]` | Array of validation error strings |

### New Tables

| Table | Purpose |
|-------|---------|
| `audit_logs` | All sensitive actions (offer changes, admin actions, etc.) |
| `analytics_events` | Key funnel events for future analysis |

## Deployment Steps

### 1. Deploy Code First (No Breaking Changes)

```bash
cd ~/Documents/GitHub/creatorstays
git add -A
git commit -m "feat: Infrastructure Phase 1 - Trust, Readiness, Audit

- Add TrustTier enum (NEW, VERIFIED, PROVEN) to CreatorProfile
- Add ReadinessState enum (INCOMPLETE, PENDING_OAUTH, READY) to CreatorProfile
- Add offer audit trail (originalTermsSnapshot, statusHistory)
- Add AuditLog table for sensitive action tracking
- Add AnalyticsEvent table for funnel metrics
- Add lib/trust.ts, lib/readiness.ts, lib/offer-validation.ts, lib/audit.ts, lib/analytics.ts
- Add admin backfill endpoint"
git push
```

### 2. Run Migration

```bash
# Generate and run migration
npx prisma migrate deploy

# Or if you need to create the migration first:
npx prisma migrate dev --name infrastructure_phase1
```

### 3. Run Backfill

Option A - Via API (recommended for Vercel):
```bash
curl -X POST https://creatorstays.com/api/admin/backfill-infrastructure \
  -H "Cookie: [your-session-cookie]"
```

Option B - Via script (local/development):
```bash
npx ts-node scripts/backfill-infrastructure.ts
```

### 4. Verify

Check the backfill results:
```bash
curl https://creatorstays.com/api/admin/backfill-infrastructure \
  -H "Cookie: [your-session-cookie]"
```

Expected response:
```json
{
  "totalCreators": 47,
  "stats": {
    "trustTier": { "NEW": 30, "VERIFIED": 15, "PROVEN": 2 },
    "readinessState": { "INCOMPLETE": 20, "PENDING_OAUTH": 10, "READY": 17 }
  }
}
```

## Library Files Created

| File | Purpose |
|------|---------|
| `src/lib/trust.ts` | Trust tier computation and updates |
| `src/lib/readiness.ts` | Readiness state computation and blockers |
| `src/lib/offer-validation.ts` | Offer validation rules and audit trail |
| `src/lib/audit.ts` | Audit log helpers |
| `src/lib/analytics.ts` | Analytics event helpers |

## Usage Examples

### Update Creator Readiness (call after profile save)

```typescript
import { updateCreatorReadiness } from '@/lib/readiness'

// In your profile update API route:
await updateCreatorReadiness(creatorProfileId)
```

### Validate Offer Before Creation

```typescript
import { prepareOfferForCreation, validateOfferTerms } from '@/lib/offer-validation'

const validation = validateOfferTerms(offerTerms)
if (!validation.isValid) {
  return { error: validation.errors }
}

const prepared = prepareOfferForCreation(offerTerms)
// prepared.data contains: originalTermsSnapshot, totalValueCents, statusHistory, etc.
```

### Log Offer Status Change

```typescript
import { recordOfferStatusChange } from '@/lib/offer-validation'
import { logOfferEvent } from '@/lib/audit'

await recordOfferStatusChange(offerId, 'pending', 'accepted', 'creator')
await logOfferEvent('offer.status_changed', offerId, 'user', creatorProfileId, {
  fromStatus: 'pending',
  toStatus: 'accepted',
})
```

### Log Analytics Event

```typescript
import { logOfferSent, logOfferResponded } from '@/lib/analytics'

// When host sends offer:
await logOfferSent(hostProfileId, offerId, creatorProfileId, totalValueCents)

// When creator responds:
await logOfferResponded(creatorProfileId, offerId, 'accepted', hostProfileId)
```

## Rollback Plan

If something goes wrong:

1. The migration only adds columns/tables, doesn't modify existing data
2. All new fields have safe defaults
3. Existing code doesn't depend on new fields yet

To rollback:
```sql
-- Remove new columns from creator_profiles
ALTER TABLE "creator_profiles" DROP COLUMN IF EXISTS "trustTier";
ALTER TABLE "creator_profiles" DROP COLUMN IF EXISTS "readinessState";
ALTER TABLE "creator_profiles" DROP COLUMN IF EXISTS "readinessBlockers";
ALTER TABLE "creator_profiles" DROP COLUMN IF EXISTS "profileCompleteness";
ALTER TABLE "creator_profiles" DROP COLUMN IF EXISTS "firstOfferReceivedAt";
ALTER TABLE "creator_profiles" DROP COLUMN IF EXISTS "firstOfferRespondedAt";
ALTER TABLE "creator_profiles" DROP COLUMN IF EXISTS "firstCollabCompletedAt";

-- Remove new columns from offers
ALTER TABLE "offers" DROP COLUMN IF EXISTS "originalTermsSnapshot";
ALTER TABLE "offers" DROP COLUMN IF EXISTS "statusHistory";
ALTER TABLE "offers" DROP COLUMN IF EXISTS "totalValueCents";
ALTER TABLE "offers" DROP COLUMN IF EXISTS "isValid";
ALTER TABLE "offers" DROP COLUMN IF EXISTS "validationErrors";

-- Drop new tables
DROP TABLE IF EXISTS "audit_logs";
DROP TABLE IF EXISTS "analytics_events";

-- Drop enums
DROP TYPE IF EXISTS "TrustTier";
DROP TYPE IF EXISTS "ReadinessState";
```

## Next Steps (Day 3-4)

After this migration is stable:

1. Wire `updateCreatorReadiness()` into profile update endpoints
2. Wire `prepareOfferForCreation()` into offer creation endpoint
3. Wire `recordOfferStatusChange()` into offer status change endpoints
4. Add trust tier to search ranking
5. Add readiness blockers to creator dashboard UI
