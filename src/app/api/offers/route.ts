import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, newOfferEmail, offerSentConfirmationEmail } from '@/lib/email'
import { canAccessMarketplace, getMarketplaceBlockedMessage } from '@/lib/feature-flags'

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

    // Helper: Check and update expired offers in real-time
    const checkAndExpireOffers = async (offerList: any[]) => {
      const now = new Date()
      const expiredOfferIds: string[] = []
      
      for (const offer of offerList) {
        if (offer.status === 'pending' && offer.expiresAt && new Date(offer.expiresAt) < now) {
          expiredOfferIds.push(offer.id)
        }
      }
      
      // Batch update expired offers
      if (expiredOfferIds.length > 0) {
        await prisma.offer.updateMany({
          where: { id: { in: expiredOfferIds } },
          data: { status: 'expired', respondedAt: now },
        })
      }
      
      // Return offers with corrected status
      return offerList.map(offer => {
        if (expiredOfferIds.includes(offer.id)) {
          return { ...offer, status: 'expired', respondedAt: now }
        }
        return offer
      })
    }

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

      // Check for expired offers in real-time
      offers = await checkAndExpireOffers(offers)
      
      // If filtering by status, re-filter after expiration check
      if (status) {
        offers = offers.filter((o: any) => o.status === status)
      }

      // Enrich with property data (get first property from host for now)
      // In a full implementation, offers would have a propertyId
      const enrichedOffers = await Promise.all(
        offers.map(async (offer: any) => {
          const property = await prisma.property.findFirst({
            where: { hostProfileId: offer.hostProfileId },
            select: {
              id: true,
              title: true,
              cityRegion: true,
              airbnbUrl: true,
              heroImageUrl: true,
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

    // ========================================================================
    // BETA GATE: Block offer creation during split beta
    // ========================================================================
    if (!canAccessMarketplace(session.user.email)) {
      return NextResponse.json({
        error: getMarketplaceBlockedMessage('Sending offers to creators'),
        code: 'BETA_MARKETPLACE_BLOCKED',
      }, { status: 403 })
    }
    // ========================================================================

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
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
      include: { user: true },
    })

    if (!creatorProfile) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Get property - use selected propertyId or fall back to first property
    let property
    if (propertyId) {
      property = await prisma.property.findUnique({
        where: { id: propertyId },
      })
      // Verify property belongs to host
      if (property && property.hostProfileId !== hostProfile.id) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
    }
    if (!property) {
      property = await prisma.property.findFirst({
        where: { hostProfileId: hostProfile.id },
      })
    }

    if (!property) {
      return NextResponse.json({ error: 'No property found. Please add a property first.' }, { status: 400 })
    }

    // Create the offer
    const offer = await prisma.offer.create({
      data: {
        hostProfileId: hostProfile.id,
        creatorProfileId: creatorProfileId,
        propertyId: property.id,
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

    // Send email notification to creator
    if (creatorProfile.user.email) {
      const emailData = newOfferEmail({
        creatorName: creatorProfile.displayName,
        hostName: hostProfile.displayName,
        propertyTitle: property?.title || 'Property',
        propertyLocation: property?.cityRegion || '',
        dealType: offerType || 'flat',
        cashAmount: cashCents || 0,
        stayNights: stayNights,
        deliverables: deliverables || [],
        offerId: offer.id,
      })
      
      sendEmail({
        to: creatorProfile.user.email,
        ...emailData,
      }).catch(err => console.error('[Offers API] Creator email error:', err))
    }

    // Send confirmation email to host
    if (hostProfile.user.email) {
      const confirmationData = offerSentConfirmationEmail({
        hostName: hostProfile.displayName,
        creatorName: creatorProfile.displayName,
        creatorHandle: creatorProfile.handle,
        propertyTitle: property?.title || 'Property',
        propertyLocation: property?.cityRegion || '',
        dealType: offerType || 'flat',
        cashAmount: cashCents || 0,
        stayNights: stayNights,
        bonusEnabled: trafficBonusEnabled || false,
        bonusAmount: trafficBonusCents || undefined,
        bonusThreshold: trafficBonusThreshold || undefined,
        deliverables: deliverables || [],
        offerId: offer.id,
      })
      
      sendEmail({
        to: hostProfile.user.email,
        ...confirmationData,
      }).catch(err => console.error('[Offers API] Host confirmation email error:', err))
    }

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
