import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Minimum time between manual refreshes (10 minutes)
const MANUAL_REFRESH_COOLDOWN_MS = 10 * 60 * 1000

// Auto-refresh threshold (data older than 24 hours is considered stale)
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000

/**
 * POST /api/instagram/refresh
 * 
 * Refreshes Instagram data from Graph API.
 * - Called manually by creator (rate limited)
 * - Called automatically on profile view if data is stale
 * - Called by cron job for all connected accounts
 * 
 * If token is expired or invalid, marks account as needing reconnection.
 * NEVER falls back to manual entry or cached guesses.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        instagramConnected: true,
        instagramAccountId: true,
        instagramAccessToken: true,
        instagramLastSyncAt: true,
        instagramLastManualRefresh: true,
        instagramTokenExpiresAt: true,
      },
    })

    if (!creatorProfile) {
      return NextResponse.json({ error: 'No creator profile' }, { status: 404 })
    }

    if (!creatorProfile.instagramConnected || !creatorProfile.instagramAccessToken) {
      return NextResponse.json({ 
        error: 'Instagram not connected',
        code: 'NOT_CONNECTED',
        message: 'Connect your Instagram account to sync data.',
      }, { status: 400 })
    }

    // Check for manual refresh rate limiting
    const body = await request.json().catch(() => ({}))
    const isManualRefresh = body.manual === true

    if (isManualRefresh && creatorProfile.instagramLastManualRefresh) {
      const timeSinceLastRefresh = Date.now() - creatorProfile.instagramLastManualRefresh.getTime()
      if (timeSinceLastRefresh < MANUAL_REFRESH_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((MANUAL_REFRESH_COOLDOWN_MS - timeSinceLastRefresh) / 1000)
        return NextResponse.json({
          error: 'Rate limited',
          code: 'RATE_LIMITED',
          message: `Please wait ${waitSeconds} seconds before refreshing again.`,
          retryAfter: waitSeconds,
        }, { status: 429 })
      }
    }

    // Check if token is expired
    if (creatorProfile.instagramTokenExpiresAt && 
        new Date() > creatorProfile.instagramTokenExpiresAt) {
      // Mark as disconnected - needs re-auth
      await prisma.creatorProfile.update({
        where: { id: creatorProfile.id },
        data: {
          instagramConnected: false,
          isVerified: false,
        },
      })

      return NextResponse.json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'Your Instagram connection has expired. Please reconnect.',
        needsReconnect: true,
      }, { status: 401 })
    }

    // Fetch fresh data from Instagram Graph API
    const igAccountId = creatorProfile.instagramAccountId
    const accessToken = creatorProfile.instagramAccessToken

    const igResponse = await fetch(
      `https://graph.instagram.com/v21.0/me?` +
      `fields=user_id,username,name,profile_picture_url,followers_count,follows_count,media_count&` +
      `access_token=${accessToken}`
    )

    if (!igResponse.ok) {
      const errorData = await igResponse.json().catch(() => ({}))
      console.error('[Instagram Refresh] API error:', errorData)

      // Check if token is invalid
      if (igResponse.status === 401 || igResponse.status === 400) {
        // Mark as disconnected - needs re-auth
        await prisma.creatorProfile.update({
          where: { id: creatorProfile.id },
          data: {
            instagramConnected: false,
            isVerified: false,
          },
        })

        return NextResponse.json({
          error: 'Token invalid',
          code: 'TOKEN_INVALID',
          message: 'Your Instagram connection is no longer valid. Please reconnect.',
          needsReconnect: true,
        }, { status: 401 })
      }

      return NextResponse.json({
        error: 'Instagram API error',
        code: 'API_ERROR',
        message: 'Could not fetch Instagram data. Try again later.',
      }, { status: 502 })
    }

    const igData = await igResponse.json()

    // Update creator profile with fresh, verified data
    const updateData: Record<string, unknown> = {
      instagramHandle: igData.username,
      instagramFollowers: igData.followers_count,
      instagramLastSyncAt: new Date(),
      totalFollowers: igData.followers_count, // Update total (will need logic for multiple platforms)
      isVerified: true, // Data is system-sourced
    }

    // Update avatar if we have a new one
    if (igData.profile_picture_url) {
      updateData.avatarUrl = igData.profile_picture_url
    }

    // Track manual refresh
    if (isManualRefresh) {
      updateData.instagramLastManualRefresh = new Date()
    }

    await prisma.creatorProfile.update({
      where: { id: creatorProfile.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        username: igData.username,
        followers: igData.followers_count,
        followsCount: igData.follows_count,
        mediaCount: igData.media_count,
        lastSyncAt: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('[Instagram Refresh] Error:', error)
    return NextResponse.json({ 
      error: 'Refresh failed',
      code: 'UNKNOWN_ERROR',
    }, { status: 500 })
  }
}

/**
 * GET /api/instagram/refresh
 * 
 * Check if Instagram data is stale and needs refresh.
 * Used by frontend to determine if auto-refresh should be triggered.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        instagramConnected: true,
        instagramHandle: true,
        instagramFollowers: true,
        instagramLastSyncAt: true,
        instagramTokenExpiresAt: true,
      },
    })

    if (!creatorProfile) {
      return NextResponse.json({ error: 'No creator profile' }, { status: 404 })
    }

    if (!creatorProfile.instagramConnected) {
      return NextResponse.json({
        connected: false,
        needsConnection: true,
      })
    }

    const lastSync = creatorProfile.instagramLastSyncAt
    const isStale = !lastSync || (Date.now() - lastSync.getTime()) > STALE_THRESHOLD_MS
    const isExpired = creatorProfile.instagramTokenExpiresAt && 
                      new Date() > creatorProfile.instagramTokenExpiresAt

    return NextResponse.json({
      connected: true,
      username: creatorProfile.instagramHandle,
      followers: creatorProfile.instagramFollowers,
      lastSyncAt: lastSync?.toISOString(),
      isStale,
      needsReconnect: isExpired,
    })

  } catch (error) {
    console.error('[Instagram Status] Error:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
