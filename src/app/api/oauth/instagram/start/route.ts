import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/oauth/instagram/start
 * 
 * Initiates Instagram Graph API OAuth flow via Facebook Login.
 * This is the ONLY way to get verified follower counts.
 * 
 * Requirements for creators:
 * - Instagram Business or Creator account (NOT personal)
 * - Instagram account linked to a Facebook Page
 * 
 * Personal accounts will be rejected at callback with upgrade instructions.
 * 
 * Required env vars:
 * - META_APP_ID (Facebook App ID)
 * - META_APP_SECRET (Facebook App Secret)
 * - META_REDIRECT_URI (e.g., https://creatorstays.com/api/oauth/instagram/callback)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login?error=auth_required', request.url))
    }

    // Verify user has a creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!creatorProfile) {
      return NextResponse.redirect(new URL('/beta/dashboard/creator?error=no_profile', request.url))
    }

    // Check env vars
    const appId = process.env.META_APP_ID
    const redirectUri = process.env.META_REDIRECT_URI

    if (!appId || !redirectUri) {
      console.error('[Instagram OAuth] Missing env vars: META_APP_ID or META_REDIRECT_URI')
      return NextResponse.redirect(new URL('/beta/dashboard/creator?ig_error=not_configured', request.url))
    }

    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      creatorId: creatorProfile.id,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7),
    })).toString('base64url')

    // Store state in cookie
    const response = NextResponse.redirect(buildFacebookAuthUrl(appId, redirectUri, state))
    response.cookies.set('ig_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Instagram OAuth] Start error:', error)
    return NextResponse.redirect(new URL('/beta/dashboard/creator?error=oauth_failed', request.url))
  }
}

/**
 * Build Facebook OAuth URL with Instagram permissions
 * 
 * This uses Facebook Login to request Instagram Graph API access.
 * Scopes requested:
 * - instagram_basic: Read profile info, username
 * - instagram_manage_insights: Read follower count and analytics
 * - pages_show_list: List Facebook Pages (required to find linked IG accounts)
 * - pages_read_engagement: Read Page engagement data
 */
function buildFacebookAuthUrl(appId: string, redirectUri: string, state: string): string {
  const scopes = [
    'instagram_basic',           // Basic profile access
    'instagram_manage_insights', // Follower count, demographics
    'pages_show_list',           // List FB Pages to find linked IG
    'pages_read_engagement',     // Page engagement metrics
    'business_management',       // Access business assets
  ].join(',')

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code',
    state,
  })

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
}
