import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/oauth/instagram/start
 * 
 * Initiates Instagram OAuth flow via Meta (Facebook) Graph API.
 * Requires a Meta Business App with Instagram Basic Display or Instagram Graph API.
 * 
 * Required env vars:
 * - INSTAGRAM_APP_ID
 * - INSTAGRAM_APP_SECRET  
 * - INSTAGRAM_REDIRECT_URI (e.g., https://creatorstays.com/api/oauth/instagram/callback)
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
    const appId = process.env.INSTAGRAM_APP_ID
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI

    if (!appId || !redirectUri) {
      console.error('[Instagram OAuth] Missing env vars: INSTAGRAM_APP_ID or INSTAGRAM_REDIRECT_URI')
      return NextResponse.redirect(new URL('/beta/dashboard/creator?ig_error=not_configured', request.url))
    }

    // Generate state for CSRF protection (include creator profile ID)
    const state = Buffer.from(JSON.stringify({
      creatorId: creatorProfile.id,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7),
    })).toString('base64url')

    // Store state in a short-lived cookie for verification
    const response = NextResponse.redirect(buildInstagramAuthUrl(appId, redirectUri, state))
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
 * Build Instagram authorization URL
 * Uses Instagram Basic Display API for personal accounts
 * or Instagram Graph API for professional accounts
 */
function buildInstagramAuthUrl(appId: string, redirectUri: string, state: string): string {
  // Instagram Basic Display API (works for personal IG accounts)
  // For professional accounts, you'd use the Facebook OAuth flow instead
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: 'user_profile,user_media',
    response_type: 'code',
    state,
  })

  return `https://api.instagram.com/oauth/authorize?${params.toString()}`
}
