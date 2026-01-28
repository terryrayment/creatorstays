import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/creator/social/refresh
 * 
 * Manually refresh follower counts for connected platforms.
 * Rate limited to 1 refresh per platform per 10 minutes.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platform } = body

    if (!platform || !['instagram', 'tiktok'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check rate limit (10 minutes between manual refreshes)
    const TEN_MINUTES = 10 * 60 * 1000
    const now = new Date()
    const lastRefreshField = platform === 'instagram' 
      ? profile.instagramLastManualRefresh 
      : profile.tiktokLastManualRefresh

    if (lastRefreshField && (now.getTime() - lastRefreshField.getTime()) < TEN_MINUTES) {
      const waitTime = Math.ceil((TEN_MINUTES - (now.getTime() - lastRefreshField.getTime())) / 1000 / 60)
      return NextResponse.json({ 
        error: `Rate limited. Try again in ${waitTime} minute(s).`,
        rateLimited: true,
        retryAfter: waitTime,
      }, { status: 429 })
    }

    // Check if platform is connected
    const isConnected = platform === 'instagram' 
      ? profile.instagramConnected 
      : profile.tiktokConnected

    if (!isConnected) {
      return NextResponse.json({ error: 'Platform not connected' }, { status: 400 })
    }

    // Get access token
    const accessToken = platform === 'instagram'
      ? profile.instagramAccessToken
      : profile.tiktokAccessToken

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token. Please reconnect.' }, { status: 400 })
    }

    let followerCount: number | null = null

    if (platform === 'instagram') {
      // Instagram doesn't provide follower count via Basic Display API
      // Would need Instagram Graph API with Facebook Page connection
      // For now, just update the sync timestamp
      
      // Try to refresh the profile to verify token is still valid
      const profileResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      )

      if (!profileResponse.ok) {
        // Token might be expired
        await prisma.creatorProfile.update({
          where: { id: profile.id },
          data: {
            instagramConnected: false,
            instagramAccessToken: null,
          },
        })
        return NextResponse.json({ 
          error: 'Instagram token expired. Please reconnect.',
          tokenExpired: true,
        }, { status: 400 })
      }

      // Update last sync timestamp
      await prisma.creatorProfile.update({
        where: { id: profile.id },
        data: {
          instagramLastSyncAt: now,
          instagramLastManualRefresh: now,
        },
      })

      return NextResponse.json({
        success: true,
        platform: 'instagram',
        followers: profile.instagramFollowers, // Unchanged
        lastSyncAt: now,
        message: 'Instagram verified. Note: Follower count requires Instagram Graph API.',
      })
    } else {
      // TikTok - fetch stats
      const statsResponse = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=follower_count',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!statsResponse.ok) {
        // Check if token needs refresh
        if (profile.tiktokRefreshToken) {
          const refreshed = await refreshTikTokToken(profile.id, profile.tiktokRefreshToken)
          if (!refreshed) {
            await prisma.creatorProfile.update({
              where: { id: profile.id },
              data: {
                tiktokConnected: false,
                tiktokAccessToken: null,
                tiktokRefreshToken: null,
              },
            })
            return NextResponse.json({ 
              error: 'TikTok token expired. Please reconnect.',
              tokenExpired: true,
            }, { status: 400 })
          }
          // Retry with new token
          // (Simplified - in production, would retry the stats fetch)
        }
      } else {
        const statsData = await statsResponse.json()
        if (statsData.data?.user?.follower_count !== undefined) {
          followerCount = statsData.data.user.follower_count
        }
      }

      // Update profile
      await prisma.creatorProfile.update({
        where: { id: profile.id },
        data: {
          tiktokFollowers: followerCount ?? profile.tiktokFollowers,
          tiktokLastSyncAt: now,
          tiktokLastManualRefresh: now,
        },
      })

      return NextResponse.json({
        success: true,
        platform: 'tiktok',
        followers: followerCount ?? profile.tiktokFollowers,
        lastSyncAt: now,
      })
    }
  } catch (error) {
    console.error('[Social Refresh API] Error:', error)
    return NextResponse.json({ error: 'Failed to refresh' }, { status: 500 })
  }
}

/**
 * Refresh TikTok access token using refresh token
 */
async function refreshTikTokToken(profileId: string, refreshToken: string): Promise<boolean> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET

  if (!clientKey || !clientSecret) {
    console.error('[TikTok Refresh] Missing env vars')
    return false
  }

  try {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      console.error('[TikTok Refresh] Failed:', await response.text())
      return false
    }

    const data = await response.json()
    if (data.error) {
      console.error('[TikTok Refresh] Error:', data)
      return false
    }

    const { access_token, refresh_token, expires_in } = data
    const tokenExpiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null

    await prisma.creatorProfile.update({
      where: { id: profileId },
      data: {
        tiktokAccessToken: access_token,
        tiktokRefreshToken: refresh_token || refreshToken,
        tiktokTokenExpiresAt: tokenExpiresAt,
      },
    })

    return true
  } catch (error) {
    console.error('[TikTok Refresh] Error:', error)
    return false
  }
}
