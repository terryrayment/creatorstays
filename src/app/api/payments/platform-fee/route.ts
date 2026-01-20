import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { POST_FOR_STAY_FEE_CENTS } from '@/lib/payments/calc'

export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/platform-fee
 * Creates a Stripe Checkout session for the $99 post-for-stay platform fee
 * Called when host signs agreement for a post-for-stay collaboration
 */
export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { collaborationId } = body

    if (!collaborationId) {
      return NextResponse.json({ error: 'collaborationId required' }, { status: 400 })
    }

    // Get host profile
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    // Get collaboration with related data
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        creator: true,
        property: true,
        offer: true,
        agreement: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify host owns this collaboration
    if (collaboration.hostId !== hostProfile.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Verify this is a post-for-stay deal
    if (collaboration.offer.offerType !== 'post-for-stay') {
      return NextResponse.json({ 
        error: 'Platform fee only applies to post-for-stay deals' 
      }, { status: 400 })
    }

    // Check if fee already paid
    if (collaboration.paymentStatus === 'completed') {
      return NextResponse.json({ 
        error: 'Platform fee already paid',
        alreadyPaid: true,
      }, { status: 400 })
    }

    // Create Stripe Checkout session for $99 platform fee
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CreatorStays Platform Fee',
              description: `Post-for-Stay collaboration with @${collaboration.creator.handle}`,
            },
            unit_amount: POST_FOR_STAY_FEE_CENTS, // $99.00
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/collaborations/${collaborationId}?platform_fee=success`,
      cancel_url: `${baseUrl}/dashboard/collaborations/${collaborationId}?platform_fee=cancelled`,
      metadata: {
        type: 'platform_fee',
        collaborationId,
        hostProfileId: hostProfile.id,
        creatorProfileId: collaboration.creatorId,
        dealType: 'post-for-stay',
      },
    })

    // Update collaboration payment status
    await prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        paymentStatus: 'processing',
        paymentAmount: POST_FOR_STAY_FEE_CENTS,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('[Platform Fee API] Error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

/**
 * GET /api/payments/platform-fee?collaborationId=xxx
 * Check if platform fee has been paid for a collaboration
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const collaborationId = searchParams.get('collaborationId')

    if (!collaborationId) {
      return NextResponse.json({ error: 'collaborationId required' }, { status: 400 })
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      select: {
        paymentStatus: true,
        paymentAmount: true,
        paidAt: true,
        offer: {
          select: { offerType: true },
        },
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    const isPostForStay = collaboration.offer.offerType === 'post-for-stay'
    const isPaid = collaboration.paymentStatus === 'completed'

    return NextResponse.json({
      isPostForStay,
      isPaid,
      paymentStatus: collaboration.paymentStatus,
      paidAt: collaboration.paidAt,
      amount: isPostForStay ? POST_FOR_STAY_FEE_CENTS : null,
    })
  } catch (error) {
    console.error('[Platform Fee API] GET Error:', error)
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 })
  }
}
