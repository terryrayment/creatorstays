import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/oauth/tiktok/callback
 * 
 * Handles TikTok OAuth callback.
 * https://developers.tiktok.com/doc/login-kit-web/
 * 
 * Flow:
 * 1. Exchange code for access token (with PKCE code verifier)
 * 2. Fetch user profile with follower count
 * 3. Store verified data on CreatorProfile
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const baseUrl = process.env.NEXTAUTH_URL || 'https://creatorstays.com'
  const dashboardUrl = `${baseUrl}/beta/dashboard/creator`

  // Handle user denial
  if (error) {
    console.log('[TikTok OAuth] User denied or error:', { error, errorDescription })
    return NextResponse.redirect(`${dashboardUrl}?tt_error=access_denied`)
  }

  // Validate code exists
  if (!code) {
    console.error('[TikTok OAuth] No code in callback')
    return NextResponse.redirect(`${dashboardUrl}?tt_error=no_code`)
  }

  // Validate state (CSRF protection)
  const storedState = request.cookies.get('tt_oauth_state')?.value
  if (!state || !storedState || state !== storedState) {
    console.error('[TikTok OAuth] State mismatch')
    return NextResponse.redirect(`${dashboardUrl}?tt_error=invalid_state`)
  }

  // Get code verifier for PKCE
  const codeVerifier = request.cookies.get('tt_code_verifier')?.value
  if (!codeVerifier) {
    console.error('[TikTok OAuth] Missing code verifier')
    return NextResponse.redirect(`${dashboardUrl}?tt_error=missing_verifier`)
  }

  // Decode state to get creator ID
  let creatorId: string
  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    creatorId = stateData.creatorId
    
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
    // Step 1: Exchange code for access token
    console.log('[TikTok OAuth] Exchanging code for token...')
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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
    
    if (tokenData.error || !tokenData.access_token) {
      console.error('[TikTok OAuth] Token error:', tokenData)
      return NextResponse.redirect(`${dashboardUrl}?tt_error=token_error`)
    }

    const { access_token: accessToken, open_id: openId, expires_in: expiresIn, refresh_token: refreshToken } = tokenData

    // Calculate token expiry
    const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null

    // Step 2: Fetch user profile with follower count
    console.log('[TikTok OAuth] Fetching profile...')
    const profileResponse = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count', 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('[TikTok OAuth] Profile fetch failed:', errorText)
      return NextResponse.redirect(`${dashboardUrl}?tt_error=profile_fetch_failed`)
    }

    const profileResponse2 = await profileResponse.json()
    const profileData = profileResponse2.data?.user

    if (!profileData) {
      console.error('[TikTok OAuth] No user data in response:', profileResponse2)
      return NextResponse.redirect(`${dashboardUrl}?tt_error=no_profile_data`)
    }

    console.log('[TikTok OAuth] Profile data:', profileData)

    const username = profileData.username || profileData.display_name
    const followersCount = profileData.follower_count || 0
    const avatarUrl = profileData.avatar_url

    // Step 3: Check onboarding status
    const currentProfile = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      select: { 
        onboardingComplete: true,
        instagramFollowers: true,
      },
    })

    // Step 4: Update creator profile with verified TikTok data
    const totalFollowers = (currentProfile?.instagramFollowers || 0) + followersCount

    await prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        // TikTok connection data
        tiktokConnected: true,
        tiktokOpenId: openId,
        tiktokHandle: username,
        tiktokFollowers: followersCount,
        tiktokAccessToken: accessToken,
        tiktokRefreshToken: refreshToken || null,
        tiktokLastSyncAt: new Date(),
        tiktokTokenExpiresAt: tokenExpiresAt,
        
        // Update avatar if no existing one
        ...(!currentProfile?.instagramFollowers && avatarUrl ? { avatarUrl } : {}),
        
        // Update total followers (combined platforms)
        totalFollowers,
      },
    })

    console.log('[TikTok OAuth] Successfully connected:', {
      creatorId,
      openId,
      username,
      followers: followersCount,
    })

    // Clear cookies and redirect
    const redirectUrl = currentProfile?.onboardingComplete
      ? `${dashboardUrl}?tt_connected=true&followers=${followersCount}`
      : `${baseUrl}/onboarding/creator?tt_connected=true&followers=${followersCount}`
    
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.delete('tt_oauth_state')
    response.cookies.delete('tt_code_verifier')
    
    return response
  } catch (error) {
    console.error('[TikTok OAuth] Callback error:', error)
    return NextResponse.redirect(`${dashboardUrl}?tt_error=callback_failed`)
  }
}
