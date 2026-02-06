# OAuth Setup Guide

## Overview

CreatorStays uses OAuth to verify creator social media accounts. This provides:
- Verified follower counts (no manual entry fraud)
- Profile pictures
- Account type verification (Business/Creator only)

## Instagram OAuth (Business Login API)

### Prerequisites
- Meta Developer Account
- Meta App with Instagram Business Login product
- Instagram Business or Creator account (not Personal)

### Meta App Configuration

1. **Create App:** https://developers.facebook.com/apps/
   - App Type: Business
   - App Name: "Creator Stays - [YOUR_IDENTIFIER]"

2. **Add Instagram Product:**
   - Go to App Dashboard → Add Product → Instagram
   - Select "Set up" on Instagram Business Login

3. **Configure Business Login Settings:**
   - Navigate to: Instagram → API setup with Instagram login → Section 3 → Business login settings
   - **OAuth redirect URIs:** 
     ```
     https://creatorstays.com/api/oauth/instagram/callback
     https://www.creatorstays.com/api/oauth/instagram/callback
     ```
   - **Deauthorize callback URL:** `https://www.creatorstays.com/api/oauth/instagram/deauthorize`
   - **Data deletion request URL:** `https://www.creatorstays.com/api/oauth/instagram/delete`

4. **Get Credentials:**
   - Instagram App ID: Found in Instagram → API setup
   - Instagram App Secret: Click "Show" to reveal

5. **App Mode:**
   - Development: Only users added as Testers can connect
   - Live: Any user can connect (requires Business Verification)

### Code Endpoints

```
/api/oauth/instagram/start    - Initiates OAuth flow
/api/oauth/instagram/callback - Handles Instagram redirect
```

### Flow
1. User clicks "Connect Instagram" → `/api/oauth/instagram/start`
2. Generates state token, stores in cookie
3. Redirects to Instagram authorization URL
4. User approves on Instagram
5. Instagram redirects to callback with code
6. Callback exchanges code for access token
7. Fetches profile data (username, followers, avatar)
8. Saves to database, redirects to onboarding

### Common Issues

**"redirect_uri is not identical"**
- Ensure the URI in Meta EXACTLY matches `INSTAGRAM_REDIRECT_URI`
- Check for www vs non-www mismatch
- Verify Vercel env var is correct AND deployed

**307 Redirect Issues**
- Domain redirect (non-www to www) can interfere
- Ensure user starts on www.creatorstays.com
- Or ensure both URI variants are in Meta

**State Mismatch**
- Instagram's link shim (l.instagram.com) can append garbage to URLs
- Code cleans state parameter: `state?.replace(/[^a-zA-Z0-9_-]/g, '')`

**Cookie Not Found**
- Cookie domain set to `.creatorstays.com` to work across www/non-www
- SameSite: 'lax' for cross-site redirect compatibility

---

## TikTok OAuth (Login Kit)

### Prerequisites
- TikTok Developer Account
- TikTok App with Login Kit
- Domain verification

### TikTok App Configuration

1. **Create App:** https://developers.tiktok.com/
2. **Add Login Kit product**
3. **Verify Domain:**
   - Add TXT record: `tiktok-developers-site-verification=XXXXXX`
   - Host: `@`
   - Wait for propagation, click Verify

4. **Set Redirect URI:**
   ```
   https://www.creatorstays.com/api/oauth/tiktok/callback
   ```

5. **Request Scopes:**
   - `user.info.basic`
   - `user.info.stats` (for follower count)

6. **Submit for Review:**
   - Requires demo video showing the integration
   - Build integration first, record flow, then submit

### Code Endpoints

```
/api/oauth/tiktok/start    - Initiates OAuth flow (with PKCE)
/api/oauth/tiktok/callback - Handles TikTok redirect
```

### Flow
1. User clicks "Connect TikTok" → `/api/oauth/tiktok/start`
2. Generates PKCE code verifier/challenge
3. Stores verifier in cookie
4. Redirects to TikTok authorization
5. User approves on TikTok
6. TikTok redirects to callback with code
7. Callback exchanges code + verifier for access token
8. Fetches profile data
9. Saves to database

---

## Google OAuth

### Configuration

1. **Google Cloud Console:** https://console.cloud.google.com/
2. **Create OAuth 2.0 Client ID**
3. **Authorized redirect URIs:**
   ```
   https://www.creatorstays.com/api/auth/callback/google
   ```

### NextAuth Integration
Google OAuth is handled by NextAuth in `/src/lib/auth.ts`:
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
})
```

---

## Testing OAuth Flows

### Instagram
1. Add yourself as a Tester in Meta App Roles (if app is in Development mode)
2. Go to onboarding Step 2
3. Click "Connect Instagram"
4. Approve permissions
5. Should redirect back with data populated

### TikTok
1. App must be submitted for review OR you're a tester
2. Same flow as Instagram

### Debugging
- Check Vercel Logs for `[Instagram OAuth]` or `[TikTok OAuth]` entries
- Look for specific error messages
- Verify env vars are set and deployed
