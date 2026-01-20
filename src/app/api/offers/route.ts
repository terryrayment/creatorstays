import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/offers - Get offers for current user (creator or host)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // "pending", "accepted", "declined", etc.
    const role = searchParams.get('role') // "host" or "creator" (optional, auto-detect if not provided)

    // Find user's profiles
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    let offers = []

    // Determine which role to fetch for
    const isHost = role === 'host' || (!role && hostProfile && !creatorProfile)
    const isCreator = role === 'creator' || (!role && creatorProfile)

    if (isCreator && creatorProfile) {
      // Fetch offers sent TO this creator
      offers = await prisma.offer.findMany({
        where: {
          creatorProfileId: creatorProfile.id,
          ...(status ? { status } : {}),
        },
        include: {
          hostProfile: {
            select: {
              id: true,
              displayName: true,
              contactEmail: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Enrich with property data (get first property from host for now)
      // In a full implementation, offers would have a propertyId
      const enrichedOffers = await Promise.all(
        offers.map(async (offer) => {
          const property = await prisma.property.findFirst({
            where: { hostProfileId: offer.hostProfileId },
            select: {
              id: true,
              title: true,
              cityRegion: true,
              airbnbUrl: true,
              photos: true,
            },
          })
          return {
            ...offer,
            host: offer.hostProfile,
            property,
          }
        })
      )

      return NextResponse.json({ offers: enrichedOffers })
    }

    if (isHost && hostProfile) {
      // Fetch offers sent BY this host
      offers = await prisma.offer.findMany({
        where: {
          hostProfileId: hostProfile.id,
          ...(status ? { status } : {}),
        },
        include: {
          creatorProfile: {
            select: {
              id: true,
              displayName: true,
              handle: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ 
        offers: offers.map(o => ({
          ...o,
          creator: o.creatorProfile,
        }))
      })
    }

    return NextResponse.json({ offers: [] })
  } catch (error) {
    console.error('[Offers API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 })
  }
}

// POST /api/offers - Create a new offer (host sends to creator)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      creatorProfileId,
      propertyId,
      offerType,
      cashCents,
      stayNights,
      trafficBonusEnabled,
      trafficBonusThreshold,
      trafficBonusCents,
      deliverables,
      message,
    } = body

    // Validate creator exists
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { id: creatorProfileId },
    })

    if (!creatorProfile) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Create the offer
    const offer = await prisma.offer.create({
      data: {
        hostProfileId: hostProfile.id,
        creatorProfileId: creatorProfileId,
        offerType: offerType || 'flat',
        cashCents: cashCents || 0,
        stayNights: stayNights || null,
        trafficBonusEnabled: trafficBonusEnabled || false,
        trafficBonusThreshold: trafficBonusThreshold || null,
        trafficBonusCents: trafficBonusCents || null,
        deliverables: deliverables || [],
        requirements: message || null,
        status: 'pending',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    })

    return NextResponse.json({
      success: true,
      offer,
      message: `Offer sent to ${creatorProfile.displayName}`,
    })
  } catch (error) {
    console.error('[Offers API] POST error:', error)
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 })
  }
}
