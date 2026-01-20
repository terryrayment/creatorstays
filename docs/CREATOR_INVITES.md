# Creator Invite Management

## Overview

Creator access to CreatorStays is invite-only during private beta. This document explains how to create, manage, and revoke invite tokens.

## Master Beta Codes

Master beta codes are unlimited-use codes stored in environment variables. They're useful for marketing campaigns or team testing.

### Configuration

Set in your `.env` file:
```
MASTER_BETA_CODES=CREATOR2025,BETACREATOR,CREATORSTAYS
```

- Codes are comma-separated
- Case-insensitive (automatically uppercased)
- No database entry needed
- Unlimited uses

### Usage URLs

Users can access via:
- `/join/CREATOR2025` - Direct join page
- `/creators/signup?invite=CREATOR2025` - Signup with invite

## Invite Token Format

Recommended format: `cs_beta_` + random string
Example: `cs_beta_xyz123abc456`

## Creating Invites

### Via Prisma Studio

1. Run `npx prisma studio`
2. Navigate to `CreatorInvite` table
3. Click "Add record"
4. Fill in:
   - `token`: Your invite token (e.g., `cs_beta_influencerx_jan2026`)
   - `maxUses`: 1 for single-use, higher for batch invites
   - `expiresAt`: Optional expiration date
   - `createdBy`: Your email/name for audit
   - `note`: Optional description (e.g., "For @influencerx from Instagram")

### Via Script

Create a file `scripts/create-invite.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function createInvite({
  maxUses = 1,
  expiresInDays,
  createdBy,
  note,
}: {
  maxUses?: number
  expiresInDays?: number
  createdBy?: string
  note?: string
}) {
  const token = `cs_beta_${crypto.randomBytes(8).toString('hex')}`
  
  const invite = await prisma.creatorInvite.create({
    data: {
      token,
      maxUses,
      expiresAt: expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null,
      createdBy,
      note,
    }
  })

  console.log('Created invite:')
  console.log(`  Token: ${invite.token}`)
  console.log(`  URL: https://creatorstays.com/creators/signup?invite=${invite.token}`)
  console.log(`  Max uses: ${invite.maxUses}`)
  console.log(`  Expires: ${invite.expiresAt || 'Never'}`)
  
  return invite
}

// Example usage:
// createInvite({ maxUses: 1, createdBy: 'admin@example.com', note: 'For @travelcreator' })
```

Run with: `npx ts-node scripts/create-invite.ts`

## Invite Types

### Single-Use (Default)
- `maxUses: 1`
- For individual creator invitations
- Token becomes invalid after one signup

### Multi-Use
- `maxUses: 10` (or any number)
- For batch invitations or events
- Useful for: workshops, partnerships, launch events

### Time-Limited
- Set `expiresAt` to a future date
- Automatically expires regardless of usage
- Useful for: limited-time promotions

### Combined
- Can combine multi-use + time-limited
- Example: "10 uses, expires in 7 days"

## Revoking Invites

### Via Prisma Studio
1. Find the invite record
2. Set `revoked: true`
3. Optionally set `revokedAt` and `revokedBy`

### Via Script
```typescript
await prisma.creatorInvite.update({
  where: { token: 'cs_beta_xyz123' },
  data: {
    revoked: true,
    revokedAt: new Date(),
    revokedBy: 'admin@example.com'
  }
})
```

## Querying Invites

### All active invites
```typescript
const activeInvites = await prisma.creatorInvite.findMany({
  where: {
    revoked: false,
    OR: [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ]
  }
})
```

### Usage statistics
```typescript
const stats = await prisma.creatorInvite.aggregate({
  _sum: { uses: true },
  _count: { id: true }
})
```

### Creators who used invites
```typescript
const betaCreators = await prisma.creatorProfile.findMany({
  where: { isBeta: true },
  select: {
    displayName: true,
    handle: true,
    inviteTokenUsed: true,
    createdAt: true
  }
})
```

## Security Notes

1. **Never share invite tokens publicly** - They grant immediate signup access
2. **Use time limits for sensitive invites** - Set short expiration for high-profile invitations
3. **Audit regularly** - Check `createdBy` and usage patterns
4. **Revoke compromised tokens immediately** - If a token leaks, revoke it

## Invite URL Format

Full URL: `https://creatorstays.com/creators/signup?invite={token}`

Example email/DM template:
```
You've been invited to join CreatorStays beta! 🎉

Sign up here: https://creatorstays.com/creators/signup?invite=cs_beta_xyz123

This invite is just for you and will expire after first use.
```
