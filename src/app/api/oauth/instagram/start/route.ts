import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/oauth/instagram/start
 * 
 * Initiates Instagram Business Login OAuth flow.
 * This is the new (2024+) Instagram API that directly authenticates
 * Instagram Business/Creator accounts and provides follower counts.
 * 
 * Requirements for creators:
 * - Instagram Business or Creator account (NOT personal)
 * 
 * Required env vars:
 * - INSTAGRAM_APP_ID
 * - INSTAGRAM_APP_SECRET  
 * - INSTAGRAM_REDIRECT_URI
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

    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      creatorId: creatorProfile.id,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7),
    })).toString('base64url')

    // Store state in cookie
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
 * Build Instagram Business Login OAuth URL
 * 
 * Scopes:
 * - instagram_business_basic: Profile info, username, follower count
 * - instagram_business_manage_insights: Detailed analytics
 */
function buildInstagramAuthUrl(appId: string, redirectUri: string, state: string): string {
  const scopes = [
    'instagram_business_basic',           // Username, profile pic, follower count
    'instagram_business_manage_insights', // Analytics and insights
  ].join(',')

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state,
  })

  return `https://www.instagram.com/oauth/authorize?${params.toString()}`
}
