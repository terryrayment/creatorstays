import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateCreatorReadiness } from '@/lib/readiness'

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

// POST /api/creator/profile - Create a new creator profile (for logged-in users without a profile)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a creator profile
    const existingProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingProfile) {
      return NextResponse.json({ error: 'Creator profile already exists' }, { status: 409 })
    }

    const body = await request.json()
    const {
      displayName,
      handle,
      instagramHandle,
      tiktokHandle,
      youtubeHandle,
      isBeta,
      inviteTokenUsed,
    } = body

    // Validate required fields
    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
    }

    const normalizedHandle = handle.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')

    // Check if handle is taken
    const existingHandle = await prisma.creatorProfile.findUnique({
      where: { handle: normalizedHandle },
    })

    if (existingHandle) {
      return NextResponse.json({ error: 'This handle is already taken' }, { status: 409 })
    }

    // Create the profile
    const profile = await prisma.creatorProfile.create({
      data: {
        userId: session.user.id,
        displayName: displayName || session.user.name || 'Creator',
        handle: normalizedHandle,
        instagramHandle: instagramHandle || null,
        tiktokHandle: tiktokHandle || null,
        youtubeHandle: youtubeHandle || null,
        isBeta: isBeta || false,
        inviteTokenUsed: inviteTokenUsed || null,
        niches: [],
        dealTypes: ['flat', 'post-for-stay'],
        deliverables: ['Instagram Reels', 'Stories'],
        openToGiftedStays: true,
        profileComplete: 30,
      },
    })

    // If invite token was used, increment its usage
    if (inviteTokenUsed) {
      try {
        await prisma.creatorInvite.update({
          where: { token: inviteTokenUsed },
          data: { uses: { increment: 1 } },
        })
      } catch (e) {
        // Invite might not exist or already maxed, but profile is created so continue
        console.warn('[Creator Profile API] Failed to update invite usage:', e)
      }
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[Creator Profile API] POST error:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
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
      websiteUrl,
      totalFollowers,
      engagementRate,
      dealTypes,
      minimumFlatFee,
      minimumPercent,
      openToGiftedStays,
      deliverables,
      mediaKitUrl,
      profileComplete,
      onboardingComplete,
      contentStyle,
      preferredDealTypes,
      availability,
      travelRadius,
      portfolioUrls,
    } = body

    // Normalize handle - strip @ and invalid characters
    const normalizedHandle = handle ? handle.toLowerCase().trim().replace(/^@/, '').replace(/[^a-z0-9_]/g, '') : null

    // Check if handle is taken by another user
    if (normalizedHandle) {
      const existingHandle = await prisma.creatorProfile.findUnique({
        where: { handle: normalizedHandle },
      })
      
      // Only check for conflicts if someone ELSE has this handle
      if (existingHandle && existingHandle.userId !== session.user.id) {
        return NextResponse.json({ error: 'Handle is already taken' }, { status: 400 })
      }
    }

    // Upsert profile
    const profile = await prisma.creatorProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(normalizedHandle && { handle: normalizedHandle }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(niches !== undefined && { niches }),
        ...(instagramHandle !== undefined && { instagramHandle: instagramHandle?.replace(/^@/, '') || null }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(instagramFollowers !== undefined && { instagramFollowers }),
        ...(tiktokHandle !== undefined && { tiktokHandle: tiktokHandle?.replace(/^@/, '') || null }),
        ...(tiktokUrl !== undefined && { tiktokUrl }),
        ...(tiktokFollowers !== undefined && { tiktokFollowers }),
        ...(youtubeHandle !== undefined && { youtubeHandle: youtubeHandle?.replace(/^@/, '') || null }),
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
        ...(onboardingComplete !== undefined && { onboardingComplete }),
      },
      create: {
        userId: session.user.id,
        displayName: displayName || session.user.name || 'Creator',
        handle: normalizedHandle || `creator_${Date.now()}`,
        bio,
        location,
        avatarUrl,
        niches: niches || [],
        instagramHandle: instagramHandle?.replace(/^@/, '') || null,
        instagramUrl,
        instagramFollowers,
        tiktokHandle: tiktokHandle?.replace(/^@/, '') || null,
        tiktokUrl,
        tiktokFollowers,
        youtubeHandle: youtubeHandle?.replace(/^@/, '') || null,
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
        onboardingComplete: onboardingComplete || false,
      },
    })

    // Recompute readiness state on every profile save
    // This also updates trust tier since they share dependencies
    try {
      const readiness = await updateCreatorReadiness(profile.id)
      console.log(`[Creator Profile API] Readiness updated: ${readiness.state}, blockers: ${readiness.blockers.length}`)
    } catch (readinessError) {
      // Don't fail the profile update if readiness computation fails
      console.error('[Creator Profile API] Failed to update readiness:', readinessError)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[Creator Profile API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
