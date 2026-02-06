# Deployment Guide

## Hosting

CreatorStays is hosted on **Vercel** with the following configuration:

- **Framework:** Next.js
- **Build Command:** `prisma generate && next build`
- **Output Directory:** Auto-detected
- **Node Version:** 18.x

## Domains

### Production Domains
| Domain | Type | Notes |
|--------|------|-------|
| `www.creatorstays.com` | Primary | Production site |
| `creatorstays.com` | Redirect | 307 → www.creatorstays.com |
| `creatorstays-a3va.vercel.app` | Vercel default | Auto-generated |

### DNS Configuration (Namecheap)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | Automatic |
| CNAME | www | cname.vercel-dns.com | Automatic |
| TXT | @ | google-site-verification=... | Automatic |
| TXT | @ | tiktok-developers-site-verification=... | 5 min |

**IMPORTANT:** The A record for `@` MUST point to `76.76.21.21` for domain redirects to work.

## Environment Variables

See [ENV_VARS.md](./ENV_VARS.md) for complete list.

**After changing env vars:**
1. Go to Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Select "Redeploy"

## Deployment Process

### Automatic Deployments
- Push to `main` branch triggers production deployment
- Pull requests create preview deployments

### Manual Deployment
```bash
vercel --prod
```

### Rollback
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## Database

### Provider
**Neon** - Serverless Postgres

### Connection
```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### Migrations
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

## Vercel Configuration

### vercel.json
```json
{
  "functions": {
    "src/app/api/upload/route.ts": {
      "maxDuration": 60
    },
    "src/app/api/cron/sync-calendars/route.ts": {
      "maxDuration": 300
    }
  },
  "crons": [
    {
      "path": "/api/cron/admin-daily-digest",
      "schedule": "30 3 * * *"
    }
  ]
}
```

### Function Limits
- Default timeout: 10s
- Max timeout: 300s (5 min) on Pro plan
- Memory: 1024 MB default

## Monitoring

### Vercel Logs
- Real-time logs: Vercel Dashboard → Logs
- Filter by function, status, time range
- Search for specific patterns like `[Instagram OAuth]`

### Error Tracking
Currently using console.log/console.error. Consider adding:
- Sentry
- LogRocket
- Vercel Analytics

## SSL/HTTPS

Handled automatically by Vercel. All traffic is HTTPS.

## Caching

### Static Assets
Automatically cached by Vercel's edge network.

### API Routes
Add cache headers as needed:
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 's-maxage=60, stale-while-revalidate'
  }
})
```

## Troubleshooting

### Build Failures
1. Check build logs in Vercel
2. Common issues:
   - TypeScript errors
   - Missing env vars
   - Prisma generation failed

### Domain Not Working
1. Check DNS propagation: https://dnschecker.org
2. Verify A record points to Vercel IP
3. Check Vercel domain configuration

### OAuth Redirect Issues
1. Ensure all redirect URIs match exactly
2. Check www vs non-www consistency
3. Verify env vars are deployed (redeploy after changes)

### Database Connection
1. Check DATABASE_URL is set
2. Verify Neon project is active
3. Check connection pooling settings
