import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/creator/social/disconnect
 * 
 * Disconnects a social platform from the creator's profile.
 * Clears stored tokens and resets connection status.
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

    if (platform === 'instagram') {
      // Note: Instagram Basic Display API doesn't have a token revocation endpoint
      // We just clear the stored data
      await prisma.creatorProfile.update({
        where: { id: profile.id },
        data: {
          instagramConnected: false,
          instagramAccountId: null,
          instagramAccessToken: null,
          instagramLastSyncAt: null,
          instagramTokenExpiresAt: null,
          instagramLastManualRefresh: null,
          // Keep instagramHandle and instagramFollowers as self-reported values
        },
      })

      console.log('[Social Disconnect] Instagram disconnected for creator:', profile.id)
    } else {
      // TikTok - attempt to revoke token
      if (profile.tiktokAccessToken) {
        try {
          // TikTok doesn't have a standard revoke endpoint in v2
          // Token will expire naturally
          console.log('[Social Disconnect] TikTok token will expire naturally')
        } catch (e) {
          console.error('[Social Disconnect] Failed to revoke TikTok token:', e)
        }
      }

      await prisma.creatorProfile.update({
        where: { id: profile.id },
        data: {
          tiktokConnected: false,
          tiktokOpenId: null,
          tiktokAccessToken: null,
          tiktokRefreshToken: null,
          tiktokLastSyncAt: null,
          tiktokTokenExpiresAt: null,
          tiktokLastManualRefresh: null,
          // Keep tiktokHandle and tiktokFollowers as self-reported values
        },
      })

      console.log('[Social Disconnect] TikTok disconnected for creator:', profile.id)
    }

    return NextResponse.json({
      success: true,
      platform,
      message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected successfully`,
    })
  } catch (error) {
    console.error('[Social Disconnect API] Error:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
