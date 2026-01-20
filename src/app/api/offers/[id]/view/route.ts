import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/offers/[id]/view - Mark offer as viewed by host
 * Called when host opens an offer that has been responded to (accepted/countered/declined)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get host profile
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    // Get the offer
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Verify host owns this offer
    if (offer.hostProfileId !== hostProfile.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Only mark as viewed if:
    // 1. Offer has been responded to (not pending)
    // 2. Not already viewed
    if (offer.status === 'pending') {
      return NextResponse.json({ 
        success: true, 
        message: 'Offer is still pending, no view to record' 
      })
    }

    if (offer.hostViewedAt) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already viewed',
        viewedAt: offer.hostViewedAt,
      })
    }

    // Mark as viewed
    const updated = await prisma.offer.update({
      where: { id: params.id },
      data: { hostViewedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: 'Marked as viewed',
      viewedAt: updated.hostViewedAt,
    })
  } catch (error) {
    console.error('[Offer View API] Error:', error)
    return NextResponse.json({ error: 'Failed to mark as viewed' }, { status: 500 })
  }
}

/**
 * GET /api/offers/[id]/view - Get view status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        hostViewedAt: true,
        respondedAt: true,
        hostProfileId: true,
        creatorProfileId: true,
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Check user is party to this offer
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    const isHost = hostProfile?.id === offer.hostProfileId
    const isCreator = creatorProfile?.id === offer.creatorProfileId

    if (!isHost && !isCreator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      status: offer.status,
      respondedAt: offer.respondedAt,
      hostViewedAt: offer.hostViewedAt,
      hasBeenViewed: !!offer.hostViewedAt,
    })
  } catch (error) {
    console.error('[Offer View Status API] Error:', error)
    return NextResponse.json({ error: 'Failed to get view status' }, { status: 500 })
  }
}
