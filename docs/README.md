# CreatorStays Documentation

> **Mission:** Connect content creators with vacation rental hosts for paid collaborations.

## Quick Links

- [Tech Stack](./TECH_STACK.md) - Technologies, frameworks, and services
- [Architecture](./ARCHITECTURE.md) - System design and data flow
- [Design System](./DESIGN_SYSTEM.md) - UI/UX patterns and components
- [OAuth Setup](./OAUTH_SETUP.md) - Instagram, TikTok, Google authentication
- [Environment Variables](./ENV_VARS.md) - All required configuration
- [Database Schema](./DATABASE.md) - Prisma models and relationships
- [API Routes](./API_ROUTES.md) - Endpoint documentation
- [Deployment](./DEPLOYMENT.md) - Vercel, DNS, and domain setup

## Project Status

**Current Phase:** Private Beta (Creator Onboarding)

### What's Built
- ✅ Creator signup with invite codes
- ✅ Magic link authentication (NextAuth + Resend)
- ✅ Instagram OAuth integration (Business/Creator accounts)
- ✅ TikTok OAuth integration (pending app review)
- ✅ Creator onboarding flow (4 steps)
- ✅ Creator dashboard
- ✅ Host dashboard (beta)
- ✅ Trust tier system
- ✅ Readiness scoring

### In Progress
- 🔄 Instagram OAuth debugging (redirect URI issues)
- 🔄 TikTok app review submission

### Upcoming
- ⏳ Collaboration offers system
- ⏳ Messaging between hosts and creators
- ⏳ Payment integration (Stripe)
- ⏳ Public creator profiles

## Key URLs

- **Production:** https://www.creatorstays.com
- **Beta Invite Link:** https://creatorstays.com/join/CREATORSTAYS2026
- **Vercel Dashboard:** https://vercel.com/terry-rayment/creatorstays-a3va
- **Meta Developer Console:** https://developers.facebook.com/apps/
- **TikTok Developer Portal:** https://developers.tiktok.com/

## Getting Started (New Conversation)

When starting a new Claude conversation for this project:

1. Share this docs folder context
2. Specify what you're working on
3. Reference the relevant doc files

Example prompt:
```
I'm working on CreatorStays. Here's the tech stack: [link to TECH_STACK.md]
I need to fix the Instagram OAuth flow. Current issue: [describe]
```
