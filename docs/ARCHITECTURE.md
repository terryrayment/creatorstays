# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Next.js   │  │   React     │  │  Tailwind   │             │
│  │  App Router │  │ Components  │  │    CSS      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Vercel)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  NextAuth   │  │  API Routes │  │    OAuth    │             │
│  │  Sessions   │  │  /api/*     │  │  Callbacks  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Prisma    │  │  PostgreSQL │  │    Neon     │             │
│  │    ORM      │  │   Database  │  │   Hosting   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Instagram  │  │   TikTok    │  │   Resend    │             │
│  │  Graph API  │  │    API      │  │   (Email)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## User Flows

### Creator Registration Flow

```
1. User visits /join/CREATORSTAYS2026
                    │
                    ▼
2. Validate invite code via /api/invites/validate
                    │
                    ▼
3. User chooses: Google OAuth OR Email signup
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
4a. Google OAuth           4b. Email Form
    - signIn("google")         - POST /api/creator/register
    - Callback creates         - Creates User + CreatorProfile
      User if new              - Triggers magic link
        │                       │
        └───────────┬───────────┘
                    ▼
5. User lands on /onboarding/creator
                    │
                    ▼
6. Four-step onboarding:
   Step 1: Basic info (name, handle, bio, location)
   Step 2: Connect platforms (Instagram, TikTok) + niches
   Step 3: Set rates and deliverables
   Step 4: Review and launch
                    │
                    ▼
7. POST /api/creator/profile with onboardingComplete: true
                    │
                    ▼
8. Redirect to /dashboard/creator
```

### Instagram OAuth Flow

```
1. User clicks "Connect Instagram"
                    │
                    ▼
2. GET /api/oauth/instagram/start
   - Verify session exists
   - Generate state token (base64url encoded JSON)
   - Store state in cookie (httpOnly, secure)
   - Redirect to Instagram auth URL
                    │
                    ▼
3. Instagram shows consent screen
   - User approves permissions
   - Instagram redirects to callback
                    │
                    ▼
4. GET /api/oauth/instagram/callback?code=XXX&state=YYY
   - Validate state matches cookie
   - Exchange code for access token
   - Exchange short-lived for long-lived token
   - Fetch profile data (username, followers, avatar)
   - Update CreatorProfile in database
   - Clear state cookie
   - Redirect to onboarding with success params
```

### Magic Link Authentication Flow

```
1. User enters email on login page
                    │
                    ▼
2. signIn("email", { email, redirect: false })
   - NextAuth creates verification token
   - Resend API sends email with magic link
                    │
                    ▼
3. User clicks link in email
   - Link contains token: /api/auth/callback/email?token=XXX
                    │
                    ▼
4. NextAuth verifies token
   - Creates session
   - Redirects to callbackUrl (e.g., /onboarding/creator)
```

## Data Flow

### Creator Profile Data Sources

```
┌─────────────────────────────────────────────────────────────┐
│                    CreatorProfile                            │
├─────────────────────────────────────────────────────────────┤
│ User-entered:                                                │
│   - displayName, bio, location                              │
│   - niches, deliverables, minimumFlatFee                    │
│   - openToGiftedStays, travelRadius                         │
├─────────────────────────────────────────────────────────────┤
│ System-sourced (Instagram OAuth):                           │
│   - instagramHandle (from API)                              │
│   - instagramFollowers (from API)                           │
│   - instagramAccountId (from API)                           │
│   - instagramAccessToken (encrypted)                        │
│   - avatarUrl (from profile picture)                        │
│   - instagramConnected = true                               │
│   - isVerified = true                                       │
├─────────────────────────────────────────────────────────────┤
│ Computed:                                                    │
│   - totalFollowers (sum of platform followers)              │
│   - trustTier (based on verification status)                │
│   - profileComplete (percentage)                            │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

### Authentication
- Sessions stored in database (not JWT)
- Magic links expire in 24 hours
- CSRF protection via state tokens

### OAuth
- State tokens prevent CSRF attacks
- Tokens stored server-side only
- Access tokens encrypted at rest

### API Security
- All routes check session authentication
- Rate limiting via Vercel
- Input validation on all endpoints

## Scalability

### Current Architecture
- Serverless functions (Vercel)
- Serverless database (Neon)
- Edge caching for static assets

### Future Considerations
- Database connection pooling
- Redis for session storage
- CDN for media files
- Background job processing (Inngest/Trigger.dev)
