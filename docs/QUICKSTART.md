# Quick Start for Claude Conversations

Use this document to quickly onboard Claude in a new conversation.

## Copy-Paste Prompt

```
I'm working on CreatorStays - a platform connecting content creators with vacation rental hosts.

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Neon)
- NextAuth (magic links + Google)
- Instagram/TikTok OAuth for verification
- Vercel hosting
- Resend for email

**Codebase:** /Users/terryrayment/Documents/GitHub/creatorstays

**Key Docs:** Check /docs folder for:
- TECH_STACK.md - Full technology overview
- ENV_VARS.md - Environment configuration
- OAUTH_SETUP.md - Instagram/TikTok integration
- DESIGN_SYSTEM.md - UI patterns and components
- DATABASE.md - Prisma schema
- API_ROUTES.md - Endpoint documentation
- DEPLOYMENT.md - Vercel/DNS setup
- ARCHITECTURE.md - System design

**Current Task:** [DESCRIBE WHAT YOU'RE WORKING ON]

**Current Issue:** [DESCRIBE ANY PROBLEMS]
```

## Key Files

### Authentication
- `/src/lib/auth.ts` - NextAuth configuration
- `/src/app/api/auth/[...nextauth]/route.ts` - Auth handler

### OAuth
- `/src/app/api/oauth/instagram/start/route.ts` - Instagram OAuth start
- `/src/app/api/oauth/instagram/callback/route.ts` - Instagram callback
- `/src/app/api/oauth/tiktok/start/route.ts` - TikTok OAuth start
- `/src/app/api/oauth/tiktok/callback/route.ts` - TikTok callback

### Creator Flow
- `/src/app/join/[code]/page.tsx` - Beta invite landing
- `/src/app/creators/signup/creator-signup-client.tsx` - Email signup form
- `/src/app/api/creator/register/route.ts` - Registration endpoint
- `/src/app/onboarding/creator/page.tsx` - 4-step onboarding

### Database
- `/prisma/schema.prisma` - Database schema

## Common Tasks

### "Fix Instagram OAuth"
1. Check Vercel logs for `[Instagram OAuth]`
2. Verify env vars match Meta console
3. Ensure www/non-www consistency
4. See OAUTH_SETUP.md

### "Add a new feature"
1. Check DESIGN_SYSTEM.md for UI patterns
2. Check DATABASE.md for schema
3. Check API_ROUTES.md for existing endpoints

### "Debug deployment"
1. Check Vercel dashboard logs
2. Verify env vars are set
3. Remember to redeploy after env changes
4. See DEPLOYMENT.md

### "Update styling"
1. Follow DESIGN_SYSTEM.md patterns
2. Use existing color palette
3. Maintain border/radius conventions

## Known Issues & Gotchas

1. **OAuth redirect URI** - Must match EXACTLY in Meta/TikTok console
2. **www vs non-www** - Always use www.creatorstays.com
3. **Env var changes** - Require Vercel redeploy
4. **Instagram link shim** - Corrupts URL params, code cleans them
5. **DNS A record** - Must point to 76.76.21.21 for redirects

## Production URLs

- Site: https://www.creatorstays.com
- Beta invite: https://creatorstays.com/join/CREATORSTAYS2026
- Vercel: https://vercel.com/terry-rayment/creatorstays-a3va
- Meta Console: https://developers.facebook.com/apps/
