# Creator Beta Readiness Review

**Date:** January 2025  
**Scope:** Creator Dashboard, Messaging, Offers, Payouts  
**Scale:** ~500 hosts × ~500 creators

---

## 1. CRITICAL ISSUES

### 1.1 Messaging Authorization - 50k Follower Rule NOT Enforced

**Current State:** The messages API (`/api/messages/route.ts`) enforces a monthly outreach limit of 3 for creators, but does NOT enforce the 50k follower requirement.

**Line 245-259 in `/src/app/api/messages/route.ts`:**
```typescript
// This is a NEW conversation
// If creator is initiating, check the monthly outreach limit
if (!isHost) {
  const outreachCount = await getCreatorOutreachCountThisMonth(creatorProfileId)
  
  if (outreachCount >= CREATOR_MONTHLY_OUTREACH_LIMIT) {
    // ... returns 429
  }
}
```

**Missing:** No check for verified follower count ≥50k before allowing creator-initiated messages.

**FIX REQUIRED:**
```typescript
// Add after line 245:
if (!isHost) {
  // Check verified follower threshold for creator-initiated messages
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorProfileId },
    select: { 
      totalFollowers: true,
      instagramFollowers: true, 
      tiktokFollowers: true,
      isVerified: true 
    }
  })
  
  const verifiedFollowers = Math.max(
    creator?.instagramFollowers || 0,
    creator?.tiktokFollowers || 0,
    creator?.totalFollowers || 0
  )
  
  const CREATOR_OUTREACH_MIN_FOLLOWERS = 50000
  
  if (verifiedFollowers < CREATOR_OUTREACH_MIN_FOLLOWERS) {
    return NextResponse.json({
      error: 'Follower threshold not met',
      code: 'FOLLOWER_THRESHOLD_NOT_MET',
      message: 'You need at least 50,000 verified followers to message hosts directly. Hosts can still message you.',
      requiredFollowers: CREATOR_OUTREACH_MIN_FOLLOWERS,
      currentFollowers: verifiedFollowers,
    }, { status: 403 })
  }
  
  // Then check monthly limit...
}
```

---

### 1.2 Offers API - No Host Verification

**Current State:** Any user with a `hostProfile` can send offers. No check for:
- `membershipPaid` - Did they actually pay the $199?
- `onboardingComplete` - Did they finish setup?

**Line 157-164 in `/src/app/api/offers/route.ts`:**
```typescript
const hostProfile = await prisma.hostProfile.findUnique({
  where: { userId: session.user.id },
  include: { user: true },
})

if (!hostProfile) {
  return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
}
// No check for membershipPaid or onboardingComplete!
```

**FIX REQUIRED:**
```typescript
if (!hostProfile) {
  return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
}

// Verify host has completed onboarding and payment
if (!hostProfile.membershipPaid) {
  return NextResponse.json({ 
    error: 'Payment required',
    code: 'MEMBERSHIP_NOT_PAID',
    message: 'Complete your membership payment to send offers to creators.'
  }, { status: 403 })
}

if (!hostProfile.onboardingComplete) {
  return NextResponse.json({ 
    error: 'Setup incomplete',
    code: 'ONBOARDING_INCOMPLETE', 
    message: 'Complete your profile setup before sending offers.'
  }, { status: 403 })
}
```

---

### 1.3 Earnings Panel Shows Fake Data

**Lines 262-275 in `/src/components/creators/creator-dashboard-profile.tsx`:**
```typescript
// Mock tax data
const mockTaxData = {
  ytdGross: 2450.00,
  platformFees: 367.50,
  netPaidOut: 1870.00,
  pendingBalance: 212.50,
  stripeConnected: false,
  // ...
}
```

**Problem:** Hardcoded fake earnings display. Users will think they have $2,450 in earnings.

**FIX REQUIRED:**
Option A: Hide the EarningsPanel entirely until first real payout:
```typescript
{collaborations.filter(c => c.status === 'completed').length > 0 && (
  <EarningsPanel realData={realEarningsData} />
)}
```

Option B: Show $0 with "No earnings yet" state:
```typescript
const realTaxData = {
  ytdGross: 0,
  platformFees: 0,
  netPaidOut: 0,
  pendingBalance: 0,
  stripeConnected: stripeStatus?.onboardingComplete || false,
}
```

---

## 2. LEFT PROFILE PANEL GREYED OUT - ANALYSIS

**Question:** Why is the left profile panel visually greyed out?

**Finding:** After searching for `opacity`, `grayscale`, `disabled`, and `pointer-events-none` in the creator dashboard, **there is no code that intentionally greys out the profile panel**.

**Possible causes:**
1. **CSS inheritance from parent** - Check if a parent element has `opacity: 0.5` or similar
2. **Conditional rendering** - The panel may be wrapped in a loading state
3. **Browser DevTools issue** - May be a one-off rendering bug

**The panel CSS at line 1161:**
```typescript
<div className="border-b border-black bg-black/[0.02] p-5 md:w-56 md:border-b-0 md:border-r">
```

The `bg-black/[0.02]` gives a very light grey background (2% black opacity), which is intentional design, not a "greyed out" state.

**If it IS appearing greyed out, check:**
1. Is `showOnboardingBanner` true? (adds fixed banner that might visually overlap)
2. Is there a modal open? (line 1000+ shows multiple modals with `bg-black/50` overlay)
3. Check browser's "Accessibility" or "Rendering" tools for issues

---

## 3. BACKEND AUTHORIZATION RULES - COMPLETE SPECIFICATION

### 3.1 Who Can Start Conversations

| Sender | Recipient | Allowed? | Conditions |
|--------|-----------|----------|------------|
| Host | Creator | YES | Host must have `membershipPaid=true` AND `onboardingComplete=true` |
| Creator | Host | CONDITIONAL | Creator must have `verifiedFollowers >= 50000` AND not exceed monthly limit (3) |

### 3.2 Who Can Send Messages (in existing conversation)

| Sender | Allowed? | Conditions |
|--------|----------|------------|
| Host | YES | Must be participant in conversation |
| Creator | YES | Must be participant in conversation |

### 3.3 Who Can Receive Offers

| Recipient | Conditions |
|-----------|------------|
| Creator | Must have `onboardingComplete=true` AND `isActive=true` |

### 3.4 Who Can Send Offers

| Sender | Conditions |
|--------|------------|
| Host | Must have `membershipPaid=true` AND `onboardingComplete=true` AND at least 1 property |

---

## 4. SCHEMA ADDITIONS RECOMMENDED

Add these fields to `CreatorProfile` in `prisma/schema.prisma`:

```prisma
model CreatorProfile {
  // ... existing fields ...
  
  // Messaging eligibility (computed, cached)
  canInitiateMessages    Boolean   @default(false)  // Set true when verifiedFollowers >= 50k
  verifiedFollowerCount  Int       @default(0)      // Highest verified count across platforms
  lastFollowerVerifiedAt DateTime?                  // When we last verified follower count
  
  // Offer eligibility  
  canReceiveOffers       Boolean   @default(true)   // Admin can disable
  offersPaused           Boolean   @default(false)  // Creator can pause
  
  // Payout eligibility
  payoutsEnabled         Boolean   @default(false)  // Only true when Stripe fully onboarded
  firstPayoutAt          DateTime?                  // Track first real payout
}
```

Add computed helper in `lib/creator-utils.ts`:
```typescript
export function getVerifiedFollowerCount(creator: CreatorProfile): number {
  return Math.max(
    creator.instagramFollowers || 0,
    creator.tiktokFollowers || 0,
    creator.totalFollowers || 0
  )
}

export function canCreatorInitiateMessages(creator: CreatorProfile): boolean {
  const THRESHOLD = 50000
  return getVerifiedFollowerCount(creator) >= THRESHOLD
}
```

---

## 5. HOST SPAM PREVENTION - MISSING

**Current State:** No limits on how many:
- Messages a host can send per day
- Offers a host can send per day  
- Unique creators a host can contact

**RISK:** A single host could spam all 500 creators in one day.

**FIX REQUIRED - Add to `/api/messages/route.ts`:**
```typescript
const HOST_DAILY_MESSAGE_LIMIT = 50
const HOST_DAILY_NEW_CONVERSATION_LIMIT = 20

async function getHostMessageCountToday(hostProfileId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return prisma.message.count({
    where: {
      senderId: hostProfileId,
      senderType: 'host',
      sentAt: { gte: today }
    }
  })
}

async function getHostNewConversationsToday(hostProfileId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Count conversations where host sent the first message today
  const conversations = await prisma.conversation.findMany({
    where: {
      hostProfileId,
      createdAt: { gte: today }
    },
    include: {
      messages: { orderBy: { sentAt: 'asc' }, take: 1 }
    }
  })
  
  return conversations.filter(c => 
    c.messages[0]?.senderType === 'host'
  ).length
}
```

**Add to `/api/offers/route.ts`:**
```typescript
const HOST_DAILY_OFFER_LIMIT = 25

async function getHostOfferCountToday(hostProfileId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return prisma.offer.count({
    where: {
      hostProfileId,
      createdAt: { gte: today }
    }
  })
}

// In POST handler:
const offerCountToday = await getHostOfferCountToday(hostProfile.id)
if (offerCountToday >= HOST_DAILY_OFFER_LIMIT) {
  return NextResponse.json({
    error: 'Daily offer limit reached',
    code: 'DAILY_OFFER_LIMIT',
    message: `You can send up to ${HOST_DAILY_OFFER_LIMIT} offers per day.`
  }, { status: 429 })
}
```

---

## 6. PAYOUT UI GATING

**Current State:** Earnings panel shows even without Stripe connected.

**FIX REQUIRED in `/src/components/creators/creator-dashboard-profile.tsx`:**

Replace the EarningsPanel section with:
```typescript
{/* Earnings Panel - Only show when Stripe is connected and has real data */}
{stripeStatus?.onboardingComplete ? (
  <EarningsPanel 
    data={realEarningsData} 
    stripeStatus={stripeStatus}
  />
) : (
  <Panel className="border-dashed border-black/20">
    <PanelHeader title="Earnings" />
    <PanelContent>
      <div className="text-center py-6">
        <p className="text-sm text-black/60 mb-3">
          Connect your bank account to receive payouts from collaborations.
        </p>
        <Button 
          size="sm" 
          onClick={handleStripeConnect}
          disabled={stripeConnecting}
        >
          {stripeConnecting ? 'Connecting...' : 'Set Up Payouts'}
        </Button>
      </div>
    </PanelContent>
  </Panel>
)}
```

---

## 7. TRUST ISSUES AT 500×500 SCALE

### 7.1 No Message Abuse Reporting
Creators cannot report harassing messages. Add:
- Report button on messages
- `/api/messages/[id]/report` endpoint
- Admin queue for reported messages

### 7.2 No Offer Abuse Reporting
Creators cannot report low-ball or spam offers. Add:
- Report button on offers
- `/api/offers/[id]/report` endpoint
- Track hosts with high decline rates

### 7.3 Self-Reported Follower Counts
Currently, followers can be self-reported via URL entry (not OAuth). Add:
- Visual badge: "Verified" vs "Self-reported"
- Weight verified counts higher in search ranking
- Show warning to hosts when sending offers to unverified creators

### 7.4 No Profile Quality Scoring
All creators appear equal. Add:
- `profileQualityScore` field (0-100)
- Compute based on: photos uploaded, bio length, OAuth connected, response rate
- Surface in host search UI

---

## 8. FILES TO MODIFY

| File | Changes |
|------|---------|
| `/src/app/api/messages/route.ts` | Add 50k follower check, add host daily limits |
| `/src/app/api/offers/route.ts` | Add host verification, add daily offer limit |
| `/src/components/creators/creator-dashboard-profile.tsx` | Fix mock earnings data, gate payout UI |
| `/prisma/schema.prisma` | Add `canInitiateMessages`, `verifiedFollowerCount`, `payoutsEnabled` |
| `/src/lib/creator-utils.ts` | Create helper functions for eligibility checks |

---

## 9. RECOMMENDED BOOLEAN FLAGS SUMMARY

### CreatorProfile
- `canInitiateMessages: Boolean` - Computed: verifiedFollowers >= 50k
- `canReceiveOffers: Boolean` - Admin toggle
- `payoutsEnabled: Boolean` - Stripe fully onboarded
- `isVerified: Boolean` - At least one OAuth connection

### HostProfile
- `canSendOffers: Boolean` - Computed: membershipPaid AND onboardingComplete
- `canMessage: Boolean` - Computed: same as canSendOffers
- `isFlagged: Boolean` - Admin flag for abuse

---

## 10. IMMEDIATE ACTION ITEMS (PRE-LAUNCH)

1. **[CRITICAL]** Add 50k follower check to `/api/messages/route.ts`
2. **[CRITICAL]** Add host membership check to `/api/offers/route.ts`
3. **[CRITICAL]** Replace mock earnings data with real $0 state
4. **[HIGH]** Add host daily limits (50 messages, 25 offers)
5. **[HIGH]** Gate earnings UI behind Stripe connection
6. **[MEDIUM]** Add "Verified" vs "Self-reported" badge
7. **[MEDIUM]** Add report buttons to messages/offers
8. **[LOW]** Add profile quality scoring

---

*Review complete. Ready for implementation.*
