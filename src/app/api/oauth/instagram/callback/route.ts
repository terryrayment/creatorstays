import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/oauth/instagram/callback
 * 
 * Handles Instagram OAuth callback after user authorization.
 * Exchanges code for access token, fetches user profile, and stores data.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorReason = searchParams.get('error_reason')
  const errorDescription = searchParams.get('error_description')

  const baseUrl = process.env.NEXTAUTH_URL || 'https://creatorstays.com'
  const dashboardUrl = `${baseUrl}/beta/dashboard/creator`

  // Handle user denial
  if (error) {
    console.log('[Instagram OAuth] User denied:', { error, errorReason, errorDescription })
    return NextResponse.redirect(`${dashboardUrl}?ig_error=access_denied`)
  }

  // Validate code exists
  if (!code) {
    console.error('[Instagram OAuth] No code in callback')
    return NextResponse.redirect(`${dashboardUrl}?ig_error=no_code`)
  }

  // Validate state (CSRF protection)
  const storedState = request.cookies.get('ig_oauth_state')?.value
  if (!state || !storedState || state !== storedState) {
    console.error('[Instagram OAuth] State mismatch')
    return NextResponse.redirect(`${dashboardUrl}?ig_error=invalid_state`)
  }

  // Decode state to get creator ID
  let creatorId: string
  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    creatorId = stateData.creatorId
    
    // Check state isn't too old (10 min max)
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
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI

  if (!appId || !appSecret || !redirectUri) {
    console.error('[Instagram OAuth] Missing env vars')
    return NextResponse.redirect(`${dashboardUrl}?ig_error=not_configured`)
  }

  try {
    // Exchange code for short-lived access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
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

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?` +
      `grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
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

    // Fetch user profile
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    )

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('[Instagram OAuth] Profile fetch failed:', errorText)
      return NextResponse.redirect(`${dashboardUrl}?ig_error=profile_fetch_failed`)
    }

    const profileData = await profileResponse.json()
    const { username, account_type, media_count } = profileData

    // Note: Instagram Basic Display API does NOT provide follower count
    // For follower count, you need Instagram Graph API with a Facebook Page connection
    // We'll store what we can and mark as connected
    
    // Update creator profile
    await prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        instagramConnected: true,
        instagramAccountId: igUserId,
        instagramAccessToken: accessToken, // In production, encrypt this
        instagramHandle: username,
        instagramLastSyncAt: new Date(),
        instagramTokenExpiresAt: tokenExpiresAt,
        // Note: follower count not available via Basic Display API
        // Set to null to indicate "connected but not verified count"
        // instagramFollowers: null,
      },
    })

    console.log('[Instagram OAuth] Successfully connected:', {
      creatorId,
      igUserId,
      username,
      accountType: account_type,
      mediaCount: media_count,
    })

    // Clear state cookie
    const response = NextResponse.redirect(`${dashboardUrl}?ig_connected=true`)
    response.cookies.delete('ig_oauth_state')
    
    return response
  } catch (error) {
    console.error('[Instagram OAuth] Callback error:', error)
    return NextResponse.redirect(`${dashboardUrl}?ig_error=callback_failed`)
  }
}
