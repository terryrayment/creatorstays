import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, offerResentEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/offers/[id]/resend - Host resends an expired or declined offer
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

    // Get the original offer
    const originalOffer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        creatorProfile: {
          include: { user: true },
        },
        property: true,
      },
    })

    if (!originalOffer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Verify host owns this offer
    if (originalOffer.hostProfileId !== hostProfile.id) {
      return NextResponse.json({ error: 'Not authorized to resend this offer' }, { status: 403 })
    }

    // Can only resend expired or declined offers
    if (!['expired', 'declined'].includes(originalOffer.status)) {
      return NextResponse.json({ 
        error: `Cannot resend offer with status: ${originalOffer.status}. Only expired or declined offers can be resent.` 
      }, { status: 400 })
    }

    // Create a new offer with the same terms
    const newOffer = await prisma.offer.create({
      data: {
        hostProfileId: hostProfile.id,
        creatorProfileId: originalOffer.creatorProfileId,
        propertyId: originalOffer.propertyId,
        offerType: originalOffer.offerType,
        cashCents: originalOffer.cashCents,
        stayNights: originalOffer.stayNights,
        stayStartDate: originalOffer.stayStartDate,
        stayEndDate: originalOffer.stayEndDate,
        trafficBonusEnabled: originalOffer.trafficBonusEnabled,
        trafficBonusThreshold: originalOffer.trafficBonusThreshold,
        trafficBonusCents: originalOffer.trafficBonusCents,
        deliverables: originalOffer.deliverables,
        requirements: originalOffer.requirements,
        status: 'pending',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    })

    // Send email to creator
    const creatorEmail = originalOffer.creatorProfile.user?.email
    if (creatorEmail) {
      const emailData = offerResentEmail({
        creatorName: originalOffer.creatorProfile.displayName,
        hostName: hostProfile.displayName,
        propertyTitle: originalOffer.property?.title || 'Property',
        propertyLocation: originalOffer.property?.cityRegion || '',
        dealType: originalOffer.offerType,
        cashAmount: originalOffer.cashCents,
        stayNights: originalOffer.stayNights,
        deliverables: originalOffer.deliverables,
        offerId: newOffer.id,
      })

      sendEmail({
        to: creatorEmail,
        ...emailData,
      }).catch(err => console.error('[Offer Resend] Email error:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Offer resent successfully',
      newOfferId: newOffer.id,
    })
  } catch (error) {
    console.error('[Offer Resend API] Error:', error)
    return NextResponse.json({ error: 'Failed to resend offer' }, { status: 500 })
  }
}
