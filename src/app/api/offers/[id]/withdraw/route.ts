import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, offerWithdrawnEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/offers/[id]/withdraw - Host withdraws a pending offer
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
      include: {
        creatorProfile: {
          include: { user: true },
        },
        property: true,
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Verify host owns this offer
    if (offer.hostProfileId !== hostProfile.id) {
      return NextResponse.json({ error: 'Not authorized to withdraw this offer' }, { status: 403 })
    }

    // Can only withdraw pending or countered offers
    if (!['pending', 'countered'].includes(offer.status)) {
      return NextResponse.json({ 
        error: `Cannot withdraw offer with status: ${offer.status}. Only pending or countered offers can be withdrawn.` 
      }, { status: 400 })
    }

    // Update offer status to withdrawn
    await prisma.offer.update({
      where: { id: params.id },
      data: {
        status: 'withdrawn',
        respondedAt: new Date(),
      },
    })

    // Send email to creator
    const creatorEmail = offer.creatorProfile.user?.email
    if (creatorEmail) {
      const emailData = offerWithdrawnEmail({
        creatorName: offer.creatorProfile.displayName,
        hostName: hostProfile.displayName,
        propertyTitle: offer.property?.title || 'Property',
      })

      sendEmail({
        to: creatorEmail,
        ...emailData,
      }).catch(err => console.error('[Offer Withdraw] Email error:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Offer withdrawn successfully',
    })
  } catch (error) {
    console.error('[Offer Withdraw API] Error:', error)
    return NextResponse.json({ error: 'Failed to withdraw offer' }, { status: 500 })
  }
}
