import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/offers/sent - Get all offers sent by the current host
export async function GET(request: NextRequest) {
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

    // Fetch all offers sent by this host
    const offers = await prisma.offer.findMany({
      where: { hostProfileId: hostProfile.id },
      include: {
        creatorProfile: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatarUrl: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            cityRegion: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format response
    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      offerType: offer.offerType,
      cashCents: offer.cashCents,
      stayNights: offer.stayNights,
      trafficBonusEnabled: offer.trafficBonusEnabled,
      trafficBonusThreshold: offer.trafficBonusThreshold,
      trafficBonusCents: offer.trafficBonusCents,
      deliverables: offer.deliverables,
      requirements: offer.requirements,
      status: offer.status,
      createdAt: offer.createdAt.toISOString(),
      expiresAt: offer.expiresAt?.toISOString() || null,
      respondedAt: offer.respondedAt?.toISOString() || null,
      counterCashCents: offer.counterCashCents,
      counterMessage: offer.counterMessage,
      creator: offer.creatorProfile,
      property: offer.property,
    }))

    return NextResponse.json({ offers: formattedOffers })
  } catch (error) {
    console.error('[Sent Offers API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 })
  }
}
