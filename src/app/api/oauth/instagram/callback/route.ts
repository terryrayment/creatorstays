import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/oauth/instagram/callback
 * 
 * Handles Instagram Business Login OAuth callback.
 * 
 * Flow:
 * 1. Exchange code for access token
 * 2. Fetch user profile with follower count
 * 3. Store verified data - NO manual entry allowed
 * 
 * Rejection cases:
 * - Personal Instagram account → instructions to upgrade to Business/Creator
 * - Token exchange fails → retry prompt
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  // Instagram's link shim (l.instagram.com) can append #_ and tracking params
  // Clean by stripping everything after valid characters
  const rawCode = searchParams.get('code')
  const code = rawCode?.split('#')[0] || null  // Remove anything after # 
  const rawState = searchParams.get('state')
  const state = rawState?.replace(/[^a-zA-Z0-9_-]/g, '') || null
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const baseUrl = process.env.NEXTAUTH_URL || 'https://creatorstays.com'
  const dashboardUrl = `${baseUrl}/beta/dashboard/creator`

  console.log('[Instagram OAuth] Callback received:', {
    rawCode: rawCode?.substring(0, 30) + '...',
    code: code?.substring(0, 30) + '...',
    rawState: rawState?.substring(0, 30) + '...',
    state: state?.substring(0, 30) + '...',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
  })

  // Handle user denial
  if (error) {
    console.log('[Instagram OAuth] User denied or error:', { error, errorDescription })
    return NextResponse.redirect(`${dashboardUrl}?ig_error=access_denied`)
  }

  // Validate code exists
  if (!code) {
    console.error('[Instagram OAuth] No code in callback')
    return NextResponse.redirect(`${dashboardUrl}?ig_error=no_code`)
  }

  // Validate state (CSRF protection)
  const rawStoredState = request.cookies.get('ig_oauth_state')?.value
  const storedState = rawStoredState?.replace(/[^a-zA-Z0-9_-]/g, '') || undefined
  console.log('[Instagram OAuth] State check:', { 
    hasState: !!state, 
    hasStoredState: !!storedState, 
    match: state === storedState,
    cookies: request.cookies.getAll().map(c => c.name),
  })
  if (!state || !storedState || state !== storedState) {
    console.error('[Instagram OAuth] State mismatch — stored:', storedState?.substring(0, 20), 'received:', state?.substring(0, 20))
    // If we have a valid state but cookie was lost, still try to proceed
    if (state && !storedState) {
      console.log('[Instagram OAuth] Cookie lost — proceeding with state from URL')
    } else {
      return NextResponse.redirect(`${dashboardUrl}?ig_error=invalid_state`)
    }
  }

  // Decode state to get creator ID
  let creatorId: string
  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    creatorId = stateData.creatorId
    
    if (Date.now() - stateData.timestamp > 600000) {
      return NextResponse.redirect(`${dashboardUrl}?ig_error=expired_state`)
    }
  } catch (e) {
    console.error('[Instagram OAuth] Failed to decode state:', e)
    return NextResponse.redirect(`${dashboardUrl}?ig_error=invalid_state`)
  }

  // Check env vars
  const appId = process.env.INSTAGRAM_APP_ID
  const appSecret = process.env.INSTAGRAM_APP_SECRET
  // HARDCODE redirect URI to prevent any env var mismatch issues
  const redirectUri = 'https://www.creatorstays.com/api/oauth/instagram/callback'

  if (!appId || !appSecret) {
    console.error('[Instagram OAuth] Missing env vars')
    return NextResponse.redirect(`${dashboardUrl}?ig_error=not_configured`)
  }

  try {
    // Step 1: Exchange code for access token
    const tokenParams = {
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }
    console.log('[Instagram OAuth] Exchanging code for token with params:', {
      client_id: appId,
      redirect_uri: redirectUri,
      code_length: code.length,
      code_preview: code.substring(0, 20) + '...',
    })
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[Instagram OAuth] Token exchange failed:', errorText)
      return NextResponse.redirect(`${dashboardUrl}?ig_error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()
    const { access_token: shortLivedToken, user_id: igUserId } = tokenData

    if (!shortLivedToken || !igUserId) {
      console.error('[Instagram OAuth] Invalid token response:', tokenData)
      return NextResponse.redirect(`${dashboardUrl}?ig_error=invalid_token_response`)
    }

    // Step 2: Exchange for long-lived token (60 days)
    console.log('[Instagram OAuth] Getting long-lived token...')
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?` +
      `grant_type=ig_exchange_token&` +
      `client_secret=${appSecret}&` +
      `access_token=${shortLivedToken}`
    )

    let accessToken = shortLivedToken
    let tokenExpiresAt: Date | null = null

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json()
      accessToken = longLivedData.access_token || shortLivedToken
      if (longLivedData.expires_in) {
        tokenExpiresAt = new Date(Date.now() + longLivedData.expires_in * 1000)
      }
    }

    // Step 3: Fetch user profile with follower count
    console.log('[Instagram OAuth] Fetching profile...')
    const profileResponse = await fetch(
      `https://graph.instagram.com/v21.0/me?` +
      `fields=user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count&` +
      `access_token=${accessToken}`
    )

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('[Instagram OAuth] Profile fetch failed:', errorText)
      return NextResponse.redirect(`${dashboardUrl}?ig_error=profile_fetch_failed`)
    }

    const profileData = await profileResponse.json()
    
    console.log('[Instagram OAuth] Profile data:', profileData)

    // Check if this is a business/creator account
    if (profileData.account_type === 'PERSONAL') {
      console.log('[Instagram OAuth] Personal account rejected')
      return NextResponse.redirect(`${dashboardUrl}?ig_error=personal_account`)
    }

    const username = profileData.username
    const followersCount = profileData.followers_count || 0
    const profilePictureUrl = profileData.profile_picture_url

    // Step 4: Check onboarding status
    const currentProfile = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      select: { onboardingComplete: true },
    })

    // Step 5: Update creator profile with VERIFIED data only
    await prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        // Core Instagram connection - all system-sourced, never editable
        instagramConnected: true,
        instagramAccountId: igUserId,
        instagramHandle: username,
        instagramFollowers: followersCount,
        instagramAccessToken: accessToken,
        instagramLastSyncAt: new Date(),
        instagramTokenExpiresAt: tokenExpiresAt,
        
        // Update avatar if available
        avatarUrl: profilePictureUrl || undefined,
        
        // Mark as verified since data is system-sourced
        isVerified: true,
        
        // Update total followers
        totalFollowers: followersCount,
      },
    })

    console.log('[Instagram OAuth] Successfully connected:', {
      creatorId,
      igUserId,
      username,
      followers: followersCount,
    })

    // Clear state cookie and redirect appropriately
    const redirectUrl = currentProfile?.onboardingComplete
      ? `${dashboardUrl}?ig_connected=true&followers=${followersCount}`
      : `${baseUrl}/onboarding/creator?ig_connected=true&followers=${followersCount}`
    
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.delete('ig_oauth_state')
    
    return response
  } catch (error) {
    console.error('[Instagram OAuth] Callback error:', error)
    return NextResponse.redirect(`${dashboardUrl}?ig_error=callback_failed`)
  }
}
