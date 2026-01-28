import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 second timeout for Vercel

/**
 * POST /api/cron/social-sync
 * 
 * Scheduled job to refresh social follower counts for all connected creators.
 * Should be called by Vercel Cron once daily.
 * 
 * Protected by CRON_SECRET header.
 * 
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/social-sync",
 *     "schedule": "0 6 * * *"
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[Social Sync Cron] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Social Sync Cron] Invalid authorization')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results = {
    instagram: { synced: 0, failed: 0, refreshed: 0 },
    tiktok: { synced: 0, failed: 0, refreshed: 0 },
  }

  try {
    // Find all creators with connected social accounts
    const creators = await prisma.creatorProfile.findMany({
      where: {
        OR: [
          { instagramConnected: true },
          { tiktokConnected: true },
        ],
      },
      select: {
        id: true,
        instagramConnected: true,
        instagramAccessToken: true,
        instagramTokenExpiresAt: true,
        tiktokConnected: true,
        tiktokAccessToken: true,
        tiktokRefreshToken: true,
        tiktokTokenExpiresAt: true,
      },
    })

    console.log(`[Social Sync Cron] Processing ${creators.length} creators`)

    const now = new Date()

    for (const creator of creators) {
      // Process Instagram
      if (creator.instagramConnected && creator.instagramAccessToken) {
        try {
          // Check if token is expired
          if (creator.instagramTokenExpiresAt && creator.instagramTokenExpiresAt < now) {
            // Instagram long-lived tokens need to be refreshed before expiry
            // Try to refresh
            const refreshed = await refreshInstagramToken(creator.id, creator.instagramAccessToken)
            if (refreshed) {
              results.instagram.refreshed++
            } else {
              results.instagram.failed++
              continue
            }
          }

          // Instagram Basic Display doesn't provide follower count
          // Just verify the token is still valid
          const response = await fetch(
            `https://graph.instagram.com/me?fields=id,username&access_token=${creator.instagramAccessToken}`
          )

          if (response.ok) {
            await prisma.creatorProfile.update({
              where: { id: creator.id },
              data: { instagramLastSyncAt: now },
            })
            results.instagram.synced++
          } else {
            // Token invalid, mark as disconnected
            await prisma.creatorProfile.update({
              where: { id: creator.id },
              data: {
                instagramConnected: false,
                instagramAccessToken: null,
              },
            })
            results.instagram.failed++
          }
        } catch (e) {
          console.error(`[Social Sync Cron] Instagram error for ${creator.id}:`, e)
          results.instagram.failed++
        }
      }

      // Process TikTok
      if (creator.tiktokConnected && creator.tiktokAccessToken) {
        try {
          // Check if token needs refresh
          if (creator.tiktokTokenExpiresAt && creator.tiktokTokenExpiresAt < now) {
            if (creator.tiktokRefreshToken) {
              const refreshed = await refreshTikTokToken(creator.id, creator.tiktokRefreshToken)
              if (refreshed) {
                results.tiktok.refreshed++
                // Re-fetch the updated token
                const updatedCreator = await prisma.creatorProfile.findUnique({
                  where: { id: creator.id },
                  select: { tiktokAccessToken: true },
                })
                if (updatedCreator?.tiktokAccessToken) {
                  creator.tiktokAccessToken = updatedCreator.tiktokAccessToken
                }
              } else {
                results.tiktok.failed++
                continue
              }
            } else {
              results.tiktok.failed++
              continue
            }
          }

          // Fetch follower count
          const statsResponse = await fetch(
            'https://open.tiktokapis.com/v2/user/info/?fields=follower_count',
            {
              headers: {
                'Authorization': `Bearer ${creator.tiktokAccessToken}`,
              },
            }
          )

          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            const followerCount = statsData.data?.user?.follower_count

            await prisma.creatorProfile.update({
              where: { id: creator.id },
              data: {
                tiktokFollowers: followerCount ?? undefined,
                tiktokLastSyncAt: now,
              },
            })
            results.tiktok.synced++
          } else {
            results.tiktok.failed++
          }
        } catch (e) {
          console.error(`[Social Sync Cron] TikTok error for ${creator.id}:`, e)
          results.tiktok.failed++
        }
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const duration = Date.now() - startTime

    console.log('[Social Sync Cron] Complete:', {
      duration: `${duration}ms`,
      creatorsProcessed: creators.length,
      results,
    })

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      creatorsProcessed: creators.length,
      results,
    })
  } catch (error) {
    console.error('[Social Sync Cron] Fatal error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

/**
 * Refresh Instagram long-lived token (valid for 60 days, must refresh before expiry)
 */
async function refreshInstagramToken(profileId: string, currentToken: string): Promise<boolean> {
  const appSecret = process.env.INSTAGRAM_APP_SECRET

  if (!appSecret) {
    return false
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?` +
      `grant_type=ig_refresh_token&access_token=${currentToken}`
    )

    if (!response.ok) {
      console.error('[Instagram Refresh] Failed:', await response.text())
      return false
    }

    const data = await response.json()
    const { access_token, expires_in } = data

    if (!access_token) {
      return false
    }

    const tokenExpiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null

    await prisma.creatorProfile.update({
      where: { id: profileId },
      data: {
        instagramAccessToken: access_token,
        instagramTokenExpiresAt: tokenExpiresAt,
      },
    })

    return true
  } catch (error) {
    console.error('[Instagram Refresh] Error:', error)
    return false
  }
}

/**
 * Refresh TikTok access token using refresh token
 */
async function refreshTikTokToken(profileId: string, refreshToken: string): Promise<boolean> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET

  if (!clientKey || !clientSecret) {
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

// Also allow GET for Vercel Cron (which uses GET by default)
export async function GET(request: NextRequest) {
  return POST(request)
}
