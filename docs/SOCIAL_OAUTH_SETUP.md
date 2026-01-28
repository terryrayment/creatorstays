# Social Platform OAuth Integration

This document describes how to set up Instagram and TikTok OAuth for verified follower counts.

## Required Environment Variables

Add these to your `.env` file and Vercel environment settings:

```bash
# Instagram (Meta) OAuth
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=https://creatorstays.com/api/oauth/instagram/callback

# TikTok OAuth
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_REDIRECT_URI=https://creatorstays.com/api/oauth/tiktok/callback

# Cron job protection
CRON_SECRET=your_random_secret_string
```

## Instagram (Meta) Setup

### 1. Create a Meta Developer App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app (select "Consumer" or "Business" type)
3. Add the "Instagram Basic Display" product to your app

### 2. Configure Instagram Basic Display

1. In your app dashboard, go to Instagram Basic Display > Settings
2. Add your redirect URI: `https://creatorstays.com/api/oauth/instagram/callback`
3. Add these Instagram accounts as testers during development:
   - Go to Roles > Roles
   - Add Instagram Test Users
   - Each user must accept the invite in their Instagram app settings

### 3. Required Scopes

- `user_profile` - Basic profile info (username, account type)
- `user_media` - Access to user's media

### 4. Important Limitation

**Instagram Basic Display API does NOT provide follower count.**

For follower counts, you need:
- Instagram Graph API (not Basic Display)
- A Facebook Page connected to the Instagram account
- The Instagram account must be a Professional account (Creator or Business)

For now, we verify the connection and store the username. Follower count shows as "self-reported" unless using Graph API.

### 5. Going Live

1. Complete App Review for required permissions
2. Submit for verification if needed
3. Switch app mode from "Development" to "Live"

## TikTok Setup

### 1. Create a TikTok Developer App

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Select "Login Kit" product

### 2. Configure OAuth

1. In your app settings, add the redirect URI:
   - `https://creatorstays.com/api/oauth/tiktok/callback`
2. Request these scopes:
   - `user.info.basic` - Basic profile info
   - `user.info.stats` - Follower count (**requires approval**)

### 3. Getting Follower Count Access

The `user.info.stats` scope requires TikTok approval:
1. Submit your app for review
2. Explain use case: "Display verified follower counts for creator profiles"
3. Once approved, follower counts will sync automatically

### 4. Going Live

1. Complete required app information
2. Submit for review with `user.info.stats` scope
3. Once approved, all users can connect

## Database Migration

Run the migration to add OAuth fields:

```bash
cd ~/Documents/GitHub/creatorstays
npx prisma migrate deploy
```

## Cron Job

The social sync cron runs daily at 6 AM UTC (configured in `vercel.json`):
- Refreshes expiring tokens
- Updates follower counts
- Disconnects invalid accounts

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/oauth/instagram/start` | GET | Start Instagram OAuth |
| `/api/oauth/instagram/callback` | GET | Instagram callback |
| `/api/oauth/tiktok/start` | GET | Start TikTok OAuth |
| `/api/oauth/tiktok/callback` | GET | TikTok callback |
| `/api/creator/social` | GET | Get connection status |
| `/api/creator/social/refresh` | POST | Manual refresh (10 min cooldown) |
| `/api/creator/social/disconnect` | POST | Disconnect platform |
| `/api/cron/social-sync` | POST | Daily sync (requires CRON_SECRET) |

## Security

1. **Tokens**: Stored in database (consider encryption for production)
2. **CSRF**: State parameter validated via secure cookies
3. **Rate Limiting**: 10 minute cooldown on manual refresh
4. **Cron Auth**: Requires `Authorization: Bearer CRON_SECRET` header
