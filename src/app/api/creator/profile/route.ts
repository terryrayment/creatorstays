import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/creator/profile - Get current user's creator profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[Creator Profile API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT /api/creator/profile - Update creator profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      displayName,
      handle,
      bio,
      location,
      avatarUrl,
      niches,
      instagramHandle,
      instagramUrl,
      instagramFollowers,
      tiktokHandle,
      tiktokUrl,
      tiktokFollowers,
      youtubeHandle,
      youtubeUrl,
      youtubeSubscribers,
      totalFollowers,
      engagementRate,
      dealTypes,
      minimumFlatFee,
      minimumPercent,
      openToGiftedStays,
      deliverables,
      mediaKitUrl,
      profileComplete,
    } = body

    // Check if handle is taken by another user
    if (handle) {
      const existingHandle = await prisma.creatorProfile.findUnique({
        where: { handle: handle.toLowerCase() },
      })
      
      const currentProfile = await prisma.creatorProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (existingHandle && existingHandle.id !== currentProfile?.id) {
        return NextResponse.json({ error: 'Handle is already taken' }, { status: 400 })
      }
    }

    // Upsert profile
    const profile = await prisma.creatorProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(handle !== undefined && { handle: handle.toLowerCase() }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(niches !== undefined && { niches }),
        ...(instagramHandle !== undefined && { instagramHandle }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(instagramFollowers !== undefined && { instagramFollowers }),
        ...(tiktokHandle !== undefined && { tiktokHandle }),
        ...(tiktokUrl !== undefined && { tiktokUrl }),
        ...(tiktokFollowers !== undefined && { tiktokFollowers }),
        ...(youtubeHandle !== undefined && { youtubeHandle }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
        ...(youtubeSubscribers !== undefined && { youtubeSubscribers }),
        ...(totalFollowers !== undefined && { totalFollowers }),
        ...(engagementRate !== undefined && { engagementRate }),
        ...(dealTypes !== undefined && { dealTypes }),
        ...(minimumFlatFee !== undefined && { minimumFlatFee }),
        ...(minimumPercent !== undefined && { minimumPercent }),
        ...(openToGiftedStays !== undefined && { openToGiftedStays }),
        ...(deliverables !== undefined && { deliverables }),
        ...(mediaKitUrl !== undefined && { mediaKitUrl }),
        ...(profileComplete !== undefined && { profileComplete }),
      },
      create: {
        userId: session.user.id,
        displayName: displayName || session.user.name || 'Creator',
        handle: handle?.toLowerCase() || `creator_${Date.now()}`,
        bio,
        location,
        avatarUrl,
        niches: niches || [],
        instagramHandle,
        instagramUrl,
        instagramFollowers,
        tiktokHandle,
        tiktokUrl,
        tiktokFollowers,
        youtubeHandle,
        youtubeUrl,
        youtubeSubscribers,
        totalFollowers,
        engagementRate,
        dealTypes: dealTypes || [],
        minimumFlatFee,
        minimumPercent,
        openToGiftedStays: openToGiftedStays ?? true,
        deliverables: deliverables || [],
        mediaKitUrl,
        profileComplete: profileComplete || 0,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[Creator Profile API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
