import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/creator/social
 * 
 * Returns the current social connection status for the authenticated creator.
 * Used by the dashboard to display connection state.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        // Instagram
        instagramConnected: true,
        instagramHandle: true,
        instagramFollowers: true,
        instagramLastSyncAt: true,
        instagramTokenExpiresAt: true,
        instagramLastManualRefresh: true,
        // TikTok
        tiktokConnected: true,
        tiktokHandle: true,
        tiktokFollowers: true,
        tiktokLastSyncAt: true,
        tiktokTokenExpiresAt: true,
        tiktokLastManualRefresh: true,
        // YouTube (self-reported for now)
        youtubeHandle: true,
        youtubeSubscribers: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Calculate if tokens are expired
    const now = new Date()
    const instagramTokenExpired = profile.instagramTokenExpiresAt 
      ? profile.instagramTokenExpiresAt < now 
      : false
    const tiktokTokenExpired = profile.tiktokTokenExpiresAt
      ? profile.tiktokTokenExpiresAt < now
      : false

    // Calculate if manual refresh is allowed (10 min cooldown)
    const TEN_MINUTES = 10 * 60 * 1000
    const canRefreshInstagram = !profile.instagramLastManualRefresh ||
      (now.getTime() - profile.instagramLastManualRefresh.getTime()) > TEN_MINUTES
    const canRefreshTiktok = !profile.tiktokLastManualRefresh ||
      (now.getTime() - profile.tiktokLastManualRefresh.getTime()) > TEN_MINUTES

    return NextResponse.json({
      instagram: {
        connected: profile.instagramConnected,
        handle: profile.instagramHandle,
        followers: profile.instagramFollowers,
        verified: profile.instagramConnected && profile.instagramFollowers !== null,
        lastSyncAt: profile.instagramLastSyncAt,
        tokenExpired: instagramTokenExpired,
        canRefresh: canRefreshInstagram,
        nextRefreshAt: profile.instagramLastManualRefresh
          ? new Date(profile.instagramLastManualRefresh.getTime() + TEN_MINUTES)
          : null,
      },
      tiktok: {
        connected: profile.tiktokConnected,
        handle: profile.tiktokHandle,
        followers: profile.tiktokFollowers,
        verified: profile.tiktokConnected && profile.tiktokFollowers !== null,
        lastSyncAt: profile.tiktokLastSyncAt,
        tokenExpired: tiktokTokenExpired,
        canRefresh: canRefreshTiktok,
        nextRefreshAt: profile.tiktokLastManualRefresh
          ? new Date(profile.tiktokLastManualRefresh.getTime() + TEN_MINUTES)
          : null,
      },
      youtube: {
        connected: false, // YouTube OAuth not implemented yet
        handle: profile.youtubeHandle,
        followers: profile.youtubeSubscribers,
        verified: false, // Self-reported
        lastSyncAt: null,
      },
    })
  } catch (error) {
    console.error('[Social Status API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch social status' }, { status: 500 })
  }
}
