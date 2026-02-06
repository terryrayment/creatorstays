# Environment Variables

## Required Variables

### Database
```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### Authentication (NextAuth)
```bash
NEXTAUTH_URL="https://www.creatorstays.com"
NEXTAUTH_SECRET="your-secret-key"
```

### Google OAuth
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Instagram OAuth (Business Login)
```bash
INSTAGRAM_APP_ID="746343141880929"
INSTAGRAM_APP_SECRET="your-instagram-app-secret"
INSTAGRAM_REDIRECT_URI="https://www.creatorstays.com/api/oauth/instagram/callback"
```

### TikTok OAuth
```bash
TIKTOK_CLIENT_KEY="your-tiktok-client-key"
TIKTOK_CLIENT_SECRET="your-tiktok-client-secret"
TIKTOK_REDIRECT_URI="https://www.creatorstays.com/api/oauth/tiktok/callback"
```

### Email (Resend)
```bash
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="CreatorStays <hello@creatorstays.com>"
```

### Beta Access
```bash
MASTER_BETA_CODES="CREATORSTAYS2026"
```

### Admin
```bash
ADMIN_EMAILS="terry@wolfpup.xyz"
```

## Optional Variables

### Stripe (Future)
```bash
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

### Analytics
```bash
NEXT_PUBLIC_GA_ID=""
```

## Environment Setup

### Local Development
1. Copy `.env.example` to `.env`
2. Fill in all required values
3. Run `npx prisma generate`

### Vercel Production
1. Go to Project Settings → Environment Variables
2. Add all variables for "All Environments" or specific environments
3. **Redeploy after changes** — env var changes require a new deployment

## Critical Notes

### URL Consistency
**IMPORTANT:** All URLs must use `www.creatorstays.com` (with www):
- `NEXTAUTH_URL`
- `INSTAGRAM_REDIRECT_URI`
- `TIKTOK_REDIRECT_URI`

The non-www domain (`creatorstays.com`) redirects to www via Vercel domain settings.

### Instagram OAuth
- Redirect URI in Vercel must EXACTLY match the one in Meta Developer Console
- Both `creatorstays.com` and `www.creatorstays.com` versions should be added to Meta
- App must be in "Live" mode for non-test users

### After Changing Env Vars
Always redeploy after changing environment variables in Vercel:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Select "Redeploy"
