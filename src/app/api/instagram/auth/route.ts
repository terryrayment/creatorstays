import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Instagram OAuth - Step 1: Redirect to Meta OAuth
 * 
 * Meta App Settings Required:
 * 1. Create a Meta App at https://developers.facebook.com/
 * 2. Add "Facebook Login" product
 * 3. Add "Instagram Basic Display" or "Instagram Graph API" product
 * 4. Set Valid OAuth Redirect URI: https://yourdomain.com/api/instagram/callback
 * 5. Add test users in development mode
 * 
 * Environment Variables:
 * - META_APP_ID: Your Meta App ID
 * - META_APP_SECRET: Your Meta App Secret
 * - META_REDIRECT_URI: https://yourdomain.com/api/instagram/callback
 */

export async function GET() {
  const appId = process.env.META_APP_ID
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/instagram/callback'
  
  if (!appId) {
    return NextResponse.redirect(new URL('/beta/dashboard/creator?ig_error=not_configured', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
  }

  // Generate random state for CSRF protection
  const state = crypto.randomUUID()
  
  // Store state in cookie for validation in callback
  const cookieStore = await cookies()
  cookieStore.set('cs_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  // Build Meta OAuth URL
  // Using Facebook Login which provides access to Instagram Graph API
  const scopes = [
    'public_profile',
    'email',
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
  ].join(',')

  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
  authUrl.searchParams.set('client_id', appId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('response_type', 'code')

  return NextResponse.redirect(authUrl.toString())
}
