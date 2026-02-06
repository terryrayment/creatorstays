# API Routes

## Authentication

### NextAuth Endpoints
```
GET/POST /api/auth/[...nextauth]  - NextAuth handler
GET      /api/auth/csrf           - Get CSRF token
POST     /api/auth/signin/email   - Trigger magic link
GET      /api/auth/session        - Get current session
```

---

## Creator APIs

### Registration
```
POST /api/creator/register
```
Creates new creator account with beta invite validation.

**Body:**
```json
{
  "email": "creator@example.com",
  "displayName": "Creator Name",
  "handle": "creatorhandle",
  "instagramHandle": "instagram_username",
  "tiktokHandle": "tiktok_username",
  "inviteToken": "CREATORSTAYS2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created! Check your email to sign in.",
  "sendMagicLink": true,
  "user": { "id": "...", "email": "...", "name": "..." },
  "creatorProfile": { "id": "...", "handle": "...", "displayName": "..." }
}
```

### Profile
```
GET  /api/creator/profile  - Get current user's creator profile
POST /api/creator/profile  - Update creator profile
```

**POST Body:**
```json
{
  "displayName": "Updated Name",
  "handle": "newhandle",
  "bio": "About me...",
  "location": "Los Angeles, CA",
  "niches": ["travel", "lifestyle"],
  "deliverables": ["ig-post", "ig-reel"],
  "minimumFlatFee": 500,
  "openToGiftedStays": true,
  "travelRadius": "national",
  "onboardingComplete": true
}
```

### Handle Check
```
GET /api/creator/check-handle?handle=desiredhandle
```

**Response:**
```json
{
  "available": true
}
```

---

## OAuth Endpoints

### Instagram OAuth
```
GET /api/oauth/instagram/start     - Initiate OAuth flow
GET /api/oauth/instagram/callback  - Handle Instagram redirect
```

**Start:** Redirects to Instagram authorization URL with state token.

**Callback Query Params:**
- `code` - Authorization code from Instagram
- `state` - CSRF state token
- `error` - Error type if user denied

**Callback Success:** Redirects to `/onboarding/creator?ig_connected=true`
**Callback Error:** Redirects with `?ig_error=error_type`

### TikTok OAuth
```
GET /api/oauth/tiktok/start     - Initiate OAuth flow (with PKCE)
GET /api/oauth/tiktok/callback  - Handle TikTok redirect
```

---

## Invite Validation

### Validate Invite
```
GET /api/invites/validate?token=CREATORSTAYS2026
```

**Response:**
```json
{
  "valid": true,
  "reason": null
}
```

Or if invalid:
```json
{
  "valid": false,
  "reason": "Invite has expired"
}
```

---

## Host APIs

### Profile
```
GET  /api/host/profile  - Get current user's host profile
POST /api/host/profile  - Update host profile
```

---

## Admin APIs

### Stats
```
GET /api/admin/stats  - Dashboard statistics
```

**Response:**
```json
{
  "totalCreators": 150,
  "totalHosts": 45,
  "pendingApplications": 12,
  "activeCollaborations": 8
}
```

---

## Cron Jobs

Configured in `vercel.json`:

```
GET /api/cron/admin-daily-digest     - Daily admin email (3:30 AM UTC)
GET /api/cron/process-expired-offers - Check expired offers (9 AM UTC)
GET /api/cron/process-content-deadlines - Check deadlines (10 AM UTC)
GET /api/cron/sync-calendars         - Sync property calendars (every 6 hours)
GET /api/cron/social-sync            - Refresh social data (6 AM UTC)
```

---

## Error Responses

All API routes return consistent error format:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE"  // optional
}
```

HTTP Status Codes:
- `400` - Bad request / validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `409` - Conflict (e.g., duplicate)
- `500` - Server error

---

## Authentication

Most API routes require authentication via NextAuth session.

Check session in API route:
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // ... rest of handler
}
```
