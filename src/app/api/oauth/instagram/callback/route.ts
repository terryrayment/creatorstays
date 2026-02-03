import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Types for Instagram Graph API responses
interface FacebookPage {
  id: string
  name: string
  access_token: string
  instagram_business_account?: {
    id: string
  }
}

interface InstagramAccount {
  id: string
  username: string
  name?: string
  profile_picture_url?: string
  followers_count: number
  follows_count?: number
  media_count?: number
  account_type?: string
  biography?: string
  website?: string
  is_verified?: boolean
  pageId: string
  pageAccessToken: string
}

/**
 * GET /api/oauth/instagram/callback
 * 
 * Handles Facebook OAuth callback and discovers Instagram Business/Creator accounts.
 * 
 * Flow:
 * 1. Exchange code for Facebook access token
 * 2. Get long-lived token (60 days)
 * 3. List user's Facebook Pages
 * 4. For each Page, check for linked Instagram Business account
 * 5. Fetch follower count and profile data for each IG account
 * 6. Select the account with highest follower count
 * 7. Store verified data - NO manual entry allowed
 * 
 * Rejection cases:
 * - No Facebook Pages found → instructions to create one
 * - No Instagram accounts linked → instructions to link
 * - Personal Instagram account → instructions to upgrade to Business/Creator
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
    console.log('[Instagram OAuth] User denied:', { error, errorDescription })
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
    
    if (Date.now() - stateData.timestamp > 600000) {
      return NextResponse.redirect(`${dashboardUrl}?ig_error=expired_state`)
    }
  } catch (e) {
    console.error('[Instagram OAuth] Failed to decode state:', e)
    return NextResponse.redirect(`${dashboardUrl}?ig_error=invalid_state`)
  }

  // Check env vars
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const redirectUri = process.env.META_REDIRECT_URI

  if (!appId || !appSecret || !redirectUri) {
    console.error('[Instagram OAuth] Missing env vars')
    return NextResponse.redirect(`${dashboardUrl}?ig_error=not_configured`)
  }

  try {
    // Step 1: Exchange code for short-lived access token
    console.log('[Instagram OAuth] Exchanging code for token...')
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `client_secret=${appSecret}&` +
      `code=${code}`
    )

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[Instagram OAuth] Token exchange failed:', errorText)
      return NextResponse.redirect(`${dashboardUrl}?ig_error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()
    const shortLivedToken = tokenData.access_token

    if (!shortLivedToken) {
      console.error('[Instagram OAuth] No access token in response')
      return NextResponse.redirect(`${dashboardUrl}?ig_error=no_token`)
    }

    // Step 2: Exchange for long-lived token (60 days)
    console.log('[Instagram OAuth] Getting long-lived token...')
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${shortLivedToken}`
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

    // Step 3: Get Facebook Pages with Instagram accounts
    console.log('[Instagram OAuth] Fetching Facebook Pages...')
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?` +
      `fields=id,name,access_token,instagram_business_account&` +
      `access_token=${accessToken}`
    )

    if (!pagesResponse.ok) {
      const errorText = await pagesResponse.text()
      console.error('[Instagram OAuth] Pages fetch failed:', errorText)
      return NextResponse.redirect(`${dashboardUrl}?ig_error=pages_fetch_failed`)
    }

    const pagesData = await pagesResponse.json()
    const pages: FacebookPage[] = pagesData.data || []

    if (pages.length === 0) {
      // No Facebook Pages - creator needs to create one
      console.log('[Instagram OAuth] No Facebook Pages found')
      return NextResponse.redirect(`${dashboardUrl}?ig_error=no_pages`)
    }

    // Step 4: Find all Instagram Business accounts linked to Pages
    const instagramAccounts: InstagramAccount[] = []

    for (const page of pages) {
      if (!page.instagram_business_account?.id) {
        continue // This Page has no linked Instagram
      }

      const igAccountId = page.instagram_business_account.id
      const pageAccessToken = page.access_token

      // Fetch Instagram account details with follower count
      console.log(`[Instagram OAuth] Fetching IG account ${igAccountId}...`)
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${igAccountId}?` +
        `fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website&` +
        `access_token=${pageAccessToken}`
      )

      if (igResponse.ok) {
        const igData = await igResponse.json()
        instagramAccounts.push({
          ...igData,
          pageId: page.id,
          pageAccessToken: pageAccessToken,
        })
      }
    }

    if (instagramAccounts.length === 0) {
      // Found Pages but no Instagram Business accounts linked
      console.log('[Instagram OAuth] No Instagram Business accounts found')
      return NextResponse.redirect(`${dashboardUrl}?ig_error=no_instagram_business`)
    }

    // Step 5: Select the account with highest follower count
    const primaryAccount = instagramAccounts.reduce((best, current) => {
      return (current.followers_count || 0) > (best.followers_count || 0) ? current : best
    }, instagramAccounts[0])

    console.log('[Instagram OAuth] Selected primary account:', {
      username: primaryAccount.username,
      followers: primaryAccount.followers_count,
      accountsFound: instagramAccounts.length,
    })

    // Step 6: Get current profile to check onboarding status
    const currentProfile = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      select: { onboardingComplete: true },
    })

    // Step 7: Update creator profile with VERIFIED data only
    await prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        // Core Instagram connection - all system-sourced, never editable
        instagramConnected: true,
        instagramAccountId: primaryAccount.id,
        instagramHandle: primaryAccount.username,
        instagramFollowers: primaryAccount.followers_count,
        instagramAccessToken: primaryAccount.pageAccessToken, // Page token for future API calls
        instagramLastSyncAt: new Date(),
        instagramTokenExpiresAt: tokenExpiresAt,
        
        // Update avatar if creator hasn't set one
        avatarUrl: primaryAccount.profile_picture_url || undefined,
        
        // Mark as verified since data is system-sourced
        isVerified: true,
        
        // Update total followers (will be max of all connected platforms)
        totalFollowers: primaryAccount.followers_count,
      },
    })

    // Store additional IG accounts for potential future switching
    // (in a separate table or JSON field if needed)
    if (instagramAccounts.length > 1) {
      console.log('[Instagram OAuth] Multiple accounts available:', 
        instagramAccounts.map(a => ({ username: a.username, followers: a.followers_count }))
      )
    }

    console.log('[Instagram OAuth] Successfully connected:', {
      creatorId,
      igAccountId: primaryAccount.id,
      username: primaryAccount.username,
      followers: primaryAccount.followers_count,
    })

    // Clear state cookie and redirect appropriately
    // If onboarding not complete, go back to onboarding
    // Otherwise go to dashboard
    const redirectUrl = currentProfile?.onboardingComplete
      ? `${dashboardUrl}?ig_connected=true&followers=${primaryAccount.followers_count}`
      : `${baseUrl}/onboarding/creator?ig_connected=true&followers=${primaryAccount.followers_count}`
    
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.delete('ig_oauth_state')
    
    return response
  } catch (error) {
    console.error('[Instagram OAuth] Callback error:', error)
    return NextResponse.redirect(`${dashboardUrl}?ig_error=callback_failed`)
  }
}
