import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/oauth/tiktok/start
 * 
 * Initiates TikTok OAuth flow using Login Kit (Web).
 * https://developers.tiktok.com/doc/login-kit-web/
 * 
 * Required env vars:
 * - TIKTOK_CLIENT_KEY
 * - TIKTOK_CLIENT_SECRET
 * - TIKTOK_REDIRECT_URI
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
    const clientKey = process.env.TIKTOK_CLIENT_KEY
    const redirectUri = process.env.TIKTOK_REDIRECT_URI

    if (!clientKey || !redirectUri) {
      console.error('[TikTok OAuth] Missing env vars: TIKTOK_CLIENT_KEY or TIKTOK_REDIRECT_URI')
      return NextResponse.redirect(new URL('/beta/dashboard/creator?tt_error=not_configured', request.url))
    }

    // Generate state for CSRF protection (encode creator ID + nonce)
    const state = Buffer.from(JSON.stringify({
      creatorId: creatorProfile.id,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7),
    })).toString('base64url')

    // Generate code verifier for PKCE (TikTok requires PKCE)
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    // Store state and code verifier in cookies
    const response = NextResponse.redirect(buildTikTokAuthUrl(clientKey, redirectUri, state, codeChallenge))
    
    response.cookies.set('tt_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    response.cookies.set('tt_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[TikTok OAuth] Start error:', error)
    return NextResponse.redirect(new URL('/beta/dashboard/creator?error=oauth_failed', request.url))
  }
}

/**
 * Build TikTok OAuth URL
 * https://developers.tiktok.com/doc/login-kit-web/
 * 
 * Scopes:
 * - user.info.basic: Display name, avatar, username
 * - user.info.stats: Follower count, following count, likes
 */
function buildTikTokAuthUrl(clientKey: string, redirectUri: string, state: string, codeChallenge: string): string {
  const scopes = 'user.info.basic,user.info.stats'

  const params = new URLSearchParams({
    client_key: clientKey,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
}

/**
 * Generate a random code verifier for PKCE
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64url')
}

/**
 * Generate code challenge from verifier (SHA-256)
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Buffer.from(digest).toString('base64url')
}
