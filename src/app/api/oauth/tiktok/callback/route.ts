import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/oauth/tiktok/callback
 * 
 * Handles TikTok OAuth callback after user authorization.
 * Exchanges code for access token, fetches user profile + stats, stores data.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const baseUrl = process.env.NEXTAUTH_URL || 'https://creatorstays.com'
  const dashboardUrl = `${baseUrl}/beta/dashboard/creator`

  // Handle user denial or errors
  if (error) {
    console.log('[TikTok OAuth] Error:', { error, errorDescription })
    return NextResponse.redirect(`${dashboardUrl}?tt_error=access_denied`)
  }

  // Validate code exists
  if (!code) {
    console.error('[TikTok OAuth] No code in callback')
    return NextResponse.redirect(`${dashboardUrl}?tt_error=no_code`)
  }

  // Validate state (CSRF protection)
  const storedState = request.cookies.get('tt_oauth_state')?.value
  const codeVerifier = request.cookies.get('tt_code_verifier')?.value

  if (!state || !storedState || state !== storedState) {
    console.error('[TikTok OAuth] State mismatch')
    return NextResponse.redirect(`${dashboardUrl}?tt_error=invalid_state`)
  }

  if (!codeVerifier) {
    console.error('[TikTok OAuth] Missing code verifier')
    return NextResponse.redirect(`${dashboardUrl}?tt_error=invalid_state`)
  }

  // Decode state to get creator ID
  let creatorId: string
  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    creatorId = stateData.creatorId
    
    // Check state isn't too old (10 min max)
    if (Date.now() - stateData.timestamp > 600000) {
      return NextResponse.redirect(`${dashboardUrl}?tt_error=expired_state`)
    }
  } catch (e) {
    console.error('[TikTok OAuth] Failed to decode state:', e)
    return NextResponse.redirect(`${dashboardUrl}?tt_error=invalid_state`)
  }

  // Check env vars
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET
  const redirectUri = process.env.TIKTOK_REDIRECT_URI

  if (!clientKey || !clientSecret || !redirectUri) {
    console.error('[TikTok OAuth] Missing env vars')
    return NextResponse.redirect(`${dashboardUrl}?tt_error=not_configured`)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[TikTok OAuth] Token exchange failed:', errorText)
      return NextResponse.redirect(`${dashboardUrl}?tt_error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      console.error('[TikTok OAuth] Token error:', tokenData)
      return NextResponse.redirect(`${dashboardUrl}?tt_error=token_error`)
    }

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      open_id: openId,
      expires_in: expiresIn,
      scope,
    } = tokenData

    if (!accessToken || !openId) {
      console.error('[TikTok OAuth] Invalid token response:', tokenData)
      return NextResponse.redirect(`${dashboardUrl}?tt_error=invalid_token_response`)
    }

    const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null

    // Fetch user info (basic profile)
    const userInfoResponse = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    let username = null
    let displayName = null
    let followerCount: number | null = null

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json()
      if (userInfo.data?.user) {
        username = userInfo.data.user.username
        displayName = userInfo.data.user.display_name
      }
    }

    // Fetch follower count if scope allows
    // Note: user.info.stats scope is required
    if (scope?.includes('user.info.stats')) {
      const statsResponse = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.data?.user?.follower_count !== undefined) {
          followerCount = statsData.data.user.follower_count
        }
      }
    }

    // Update creator profile
    await prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        tiktokConnected: true,
        tiktokOpenId: openId,
        tiktokAccessToken: accessToken, // In production, encrypt this
        tiktokRefreshToken: refreshToken,
        tiktokHandle: username || displayName,
        tiktokFollowers: followerCount,
        tiktokLastSyncAt: new Date(),
        tiktokTokenExpiresAt: tokenExpiresAt,
      },
    })

    console.log('[TikTok OAuth] Successfully connected:', {
      creatorId,
      openId,
      username,
      followerCount,
      scope,
    })

    // Clear state cookies
    const response = NextResponse.redirect(`${dashboardUrl}?tt_connected=true`)
    response.cookies.delete('tt_oauth_state')
    response.cookies.delete('tt_code_verifier')
    
    return response
  } catch (error) {
    console.error('[TikTok OAuth] Callback error:', error)
    return NextResponse.redirect(`${dashboardUrl}?tt_error=callback_failed`)
  }
}
