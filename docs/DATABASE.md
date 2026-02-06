# Database Schema

## Overview

CreatorStays uses **PostgreSQL** (hosted on Neon) with **Prisma** ORM.

Schema file: `prisma/schema.prisma`

## Core Models

### User
The base authentication model (NextAuth).

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  lastLoginAt   DateTime?
  
  // Relations
  creatorProfile CreatorProfile?
  hostProfile    HostProfile?
  accounts       Account[]
  sessions       Session[]
}
```

### CreatorProfile
Extended profile for creators.

```prisma
model CreatorProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  // Basic Info
  handle          String   @unique
  displayName     String
  bio             String?
  location        String?
  avatarUrl       String?
  
  // Social Platforms - Instagram
  instagramHandle       String?
  instagramFollowers    Int?
  instagramConnected    Boolean  @default(false)
  instagramAccountId    String?
  instagramAccessToken  String?
  instagramLastSyncAt   DateTime?
  instagramTokenExpiresAt DateTime?
  
  // Social Platforms - TikTok
  tiktokHandle       String?
  tiktokFollowers    Int?
  tiktokConnected    Boolean  @default(false)
  tiktokOpenId       String?
  tiktokAccessToken  String?
  tiktokRefreshToken String?
  tiktokLastSyncAt   DateTime?
  
  // Social Platforms - YouTube
  youtubeHandle      String?
  youtubeSubscribers Int?
  
  // Aggregates
  totalFollowers Int @default(0)
  
  // Profile Settings
  niches            String[]
  deliverables      String[]
  dealTypes         String[]
  minimumFlatFee    Int?
  openToGiftedStays Boolean  @default(true)
  travelRadius      String?
  
  // Trust & Verification
  trustTier       TrustTier @default(UNVERIFIED)
  isVerified      Boolean   @default(false)
  readinessStat   Json?
  
  // Beta Tracking
  isBeta           Boolean  @default(false)
  inviteTokenUsed  String?
  
  // Onboarding
  onboardingComplete Boolean  @default(false)
  profileComplete    Int      @default(0)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### HostProfile
Extended profile for vacation rental hosts.

```prisma
model HostProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  // Basic Info
  companyName     String?
  displayName     String
  bio             String?
  location        String?
  avatarUrl       String?
  website         String?
  
  // Contact
  contactEmail    String?
  contactPhone    String?
  
  // Properties
  propertyCount   Int      @default(0)
  
  // Trust
  trustTier       TrustTier @default(UNVERIFIED)
  isVerified      Boolean   @default(false)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### CreatorInvite
Beta invite codes.

```prisma
model CreatorInvite {
  id        String   @id @default(cuid())
  token     String   @unique
  email     String?
  maxUses   Int      @default(1)
  uses      Int      @default(0)
  expiresAt DateTime?
  revoked   Boolean  @default(false)
  createdBy String?
  createdAt DateTime @default(now())
}
```

## Enums

### TrustTier
```prisma
enum TrustTier {
  UNVERIFIED    // New user, no verification
  BASIC         // Email verified
  VERIFIED      // Social accounts connected
  TRUSTED       // Completed collaborations
  PREMIUM       // Top-tier creators
}
```

## NextAuth Models

Required by NextAuth for authentication:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## Migrations

### Create New Migration
```bash
npx prisma migrate dev --name descriptive_name
```

### Apply to Production
```bash
npx prisma migrate deploy
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```

## Common Queries

### Get Creator with User
```typescript
const creator = await prisma.creatorProfile.findUnique({
  where: { handle: 'username' },
  include: { user: true }
})
```

### Update Creator Profile
```typescript
await prisma.creatorProfile.update({
  where: { id: creatorId },
  data: {
    instagramConnected: true,
    instagramFollowers: 10000,
    totalFollowers: 10000,
  }
})
```

### Check Handle Availability
```typescript
const existing = await prisma.creatorProfile.findUnique({
  where: { handle: 'desired_handle' }
})
const available = !existing
```

## Indexes

Consider adding indexes for frequently queried fields:
```prisma
@@index([handle])
@@index([instagramHandle])
@@index([trustTier])
@@index([createdAt])
```
