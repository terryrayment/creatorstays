import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'
import { sendEmail, counterAcceptedEmail, counterDeclinedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/offers/[id]/respond-counter - Host accepts, declines, or re-counters a counter offer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reCounterCashCents, reCounterMessage } = body // "accept", "decline", or "re-counter"

    if (!action || !['accept', 'decline', 're-counter'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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
      include: {
        property: true,
        creatorProfile: {
          include: { user: true }
        },
        hostProfile: {
          include: { user: true }
        },
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Verify host owns this offer
    if (offer.hostProfileId !== hostProfile.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Verify offer is countered
    if (offer.status !== 'countered') {
      return NextResponse.json({ error: 'Offer is not in countered status' }, { status: 400 })
    }

    if (action === 'decline') {
      // Simply update status to declined
      await prisma.offer.update({
        where: { id: params.id },
        data: {
          status: 'declined',
          respondedAt: new Date(),
        },
      })

      // Send email to creator
      const creatorEmail = offer.creatorProfile.user?.email
      if (creatorEmail) {
        const emailData = counterDeclinedEmail({
          creatorName: offer.creatorProfile.displayName,
          hostName: offer.hostProfile.displayName,
          propertyTitle: offer.property?.title || 'Property',
          counterAmount: offer.counterCashCents || 0,
        })

        sendEmail({
          to: creatorEmail,
          ...emailData,
        }).catch(err => console.error('[Counter Decline] Email error:', err))
      }

      return NextResponse.json({
        success: true,
        message: 'Counter offer declined',
      })
    }

    // ACTION: RE-COUNTER (Host sends back a new counter)
    if (action === 're-counter') {
      if (!reCounterCashCents || reCounterCashCents <= 0) {
        return NextResponse.json({ error: 'Re-counter amount required' }, { status: 400 })
      }

      // Update offer: reset status to pending, store host's re-counter
      // We reuse counterCashCents field but flip the negotiation back to creator
      await prisma.offer.update({
        where: { id: params.id },
        data: {
          status: 'pending', // Back to pending for creator to respond
          cashCents: reCounterCashCents, // Update the main offer amount
          counterCashCents: null, // Clear creator's counter
          counterMessage: null,
          requirements: reCounterMessage || offer.requirements, // Update message if provided
          respondedAt: null, // Reset response timestamp
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days to respond
        },
      })

      // Send email to creator about re-counter
      const creatorEmail = offer.creatorProfile.user?.email
      if (creatorEmail) {
        // Using the existing email system - we'll send a modified new offer email
        const { newOfferEmail } = await import('@/lib/email')
        const emailData = newOfferEmail({
          creatorName: offer.creatorProfile.displayName,
          hostName: offer.hostProfile.displayName,
          propertyTitle: offer.property?.title || 'Property',
          propertyLocation: offer.property?.cityRegion || '',
          dealType: offer.offerType,
          cashAmount: reCounterCashCents,
          stayNights: offer.stayNights || undefined,
          deliverables: offer.deliverables,
          offerId: offer.id,
        })

        // Customize subject to indicate it's a counter response
        await sendEmail({
          to: creatorEmail,
          subject: `💬 ${offer.hostProfile.displayName} responded to your counter offer`,
          html: emailData.html.replace('New Collaboration Offer!', 'Counter Response from Host'),
          text: emailData.text,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Re-counter sent to creator',
        newAmount: reCounterCashCents,
      })
    }

    // ACTION: ACCEPT COUNTER
    // Update offer with the counter amount as the new amount
    const acceptedAmount = offer.counterCashCents || offer.cashCents

    await prisma.offer.update({
      where: { id: params.id },
      data: {
        status: 'accepted',
        cashCents: acceptedAmount, // Update to accepted counter amount
        respondedAt: new Date(),
      },
    })

    // Get property (use offer's property or first property)
    let property = offer.property
    if (!property) {
      property = await prisma.property.findFirst({
        where: { hostProfileId: hostProfile.id },
      })
    }

    if (!property) {
      return NextResponse.json({ error: 'No property found for collaboration' }, { status: 400 })
    }

    // Generate affiliate token
    const affiliateToken = nanoid(8)

    // Create collaboration
    const collaboration = await prisma.collaboration.create({
      data: {
        offerId: offer.id,
        creatorId: offer.creatorProfileId,
        hostId: hostProfile.id,
        propertyId: property.id,
        status: 'pending-agreement',
        affiliateToken,
        contentDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    // Generate agreement text
    const hostName = offer.hostProfile.displayName || 'Host'
    const creatorName = offer.creatorProfile.displayName || 'Creator'
    const propertyTitle = property.title || 'Property'
    const deliverables = offer.deliverables.join(', ') || 'Content as agreed'

    const agreementText = `
COLLABORATION AGREEMENT

This agreement is entered into between:

HOST: ${hostName}
CREATOR: ${creatorName}

PROPERTY: ${propertyTitle}

DEAL TYPE: ${offer.offerType}
COMPENSATION: $${(acceptedAmount / 100).toFixed(2)} (counter offer accepted)
${offer.stayNights ? `STAY: ${offer.stayNights} nights` : ''}

DELIVERABLES:
${deliverables}

TERMS:
1. Creator agrees to produce and deliver the specified content within 30 days of signing.
2. Host agrees to provide the compensation upon approval of delivered content.
3. Content must be original and follow platform guidelines.
4. CreatorStays charges a 15% platform fee to each party.
5. Both parties agree to communicate professionally throughout the collaboration.

CONTENT DEADLINE: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}

By signing below, both parties agree to these terms.
`.trim()

    // Create agreement
    await prisma.collaborationAgreement.create({
      data: {
        collaborationId: collaboration.id,
        hostName,
        hostEmail: offer.hostProfile.user?.email || offer.hostProfile.contactEmail || '',
        creatorName,
        creatorHandle: offer.creatorProfile.handle,
        creatorEmail: offer.creatorProfile.user?.email || '',
        agreementText,
        propertyTitle,
        dealType: offer.offerType,
        cashAmount: acceptedAmount,
        stayIncluded: (offer.stayNights || 0) > 0,
        stayNights: offer.stayNights,
      },
    })

    // Send email notification to creator
    const creatorEmail = offer.creatorProfile.user?.email
    if (creatorEmail) {
      const emailData = counterAcceptedEmail({
        creatorName: offer.creatorProfile.displayName,
        hostName: offer.hostProfile.displayName,
        propertyTitle: property.title || 'Property',
        acceptedAmount: acceptedAmount,
        collaborationId: collaboration.id,
      })

      sendEmail({
        to: creatorEmail,
        ...emailData,
      }).catch(err => console.error('[Counter Accept] Email error:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Counter offer accepted! Collaboration created.',
      collaborationId: collaboration.id,
    })
  } catch (error) {
    console.error('[Respond Counter API] Error:', error)
    return NextResponse.json({ error: 'Failed to process response' }, { status: 500 })
  }
}
