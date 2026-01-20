import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculatePaymentBreakdown } from '@/lib/payments/calc'

export const dynamic = 'force-dynamic'

// POST /api/payments/checkout - Create Stripe Checkout session
export async function POST(request: NextRequest) {
  try {
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

    // Get collaboration
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        creator: {
          include: { user: true },
        },
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

    // Check collaboration is ready for payment
    if (!collaboration.agreement?.isFullyExecuted) {
      return NextResponse.json({ error: 'Agreement must be signed before payment' }, { status: 400 })
    }

    if (collaboration.status !== 'approved' && collaboration.status !== 'active') {
      return NextResponse.json({ 
        error: `Cannot pay for collaboration with status: ${collaboration.status}` 
      }, { status: 400 })
    }

    // Calculate payment including traffic bonus if earned
    const baseCashCents = collaboration.offer.cashCents
    if (baseCashCents <= 0) {
      return NextResponse.json({ error: 'No payment required for stay-only deals' }, { status: 400 })
    }

    // Check if traffic bonus was earned
    const bonusEnabled = collaboration.offer.trafficBonusEnabled
    const bonusThreshold = collaboration.offer.trafficBonusThreshold || 0
    const bonusCents = collaboration.offer.trafficBonusCents || 0
    const bonusEarned = bonusEnabled && collaboration.clicksGenerated >= bonusThreshold
    const earnedBonusCents = bonusEarned ? bonusCents : 0
    
    // Total cash payment to creator (base + bonus if earned)
    const totalCashCents = baseCashCents + earnedBonusCents

    const breakdown = calculatePaymentBreakdown(totalCashCents)

    // Check if creator has Stripe account connected
    const creatorStripeAccountId = collaboration.creator.stripeAccountId

    // Build line items
    const lineItems: Array<{
      price_data: {
        currency: string
        product_data: { name: string; description?: string }
        unit_amount: number
      }
      quantity: number
    }> = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Creator Payment: ${collaboration.creator.displayName}`,
            description: `Collaboration for ${collaboration.property.title}`,
          },
          unit_amount: baseCashCents,
        },
        quantity: 1,
      },
    ]
    
    // Add bonus as separate line item if earned
    if (bonusEarned && earnedBonusCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Performance Bonus: ${collaboration.creator.displayName}`,
            description: `Traffic bonus for reaching ${bonusThreshold.toLocaleString()} clicks`,
          },
          unit_amount: earnedBonusCents,
        },
        quantity: 1,
      })
    }
    
    // Add platform fee
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Platform Fee (15%)',
          description: 'CreatorStays service fee',
        },
        unit_amount: breakdown.hostFeeCents,
      },
      quantity: 1,
    })

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'
    
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${baseUrl}/dashboard/collaborations/${collaborationId}?payment=success`,
      cancel_url: `${baseUrl}/dashboard/collaborations/${collaborationId}?payment=cancelled`,
      metadata: {
        collaborationId,
        hostProfileId: hostProfile.id,
        creatorProfileId: collaboration.creatorId,
        baseCashCents: baseCashCents.toString(),
        bonusEarned: bonusEarned.toString(),
        bonusCents: earnedBonusCents.toString(),
        totalCashCents: totalCashCents.toString(),
        hostFeeCents: breakdown.hostFeeCents.toString(),
        creatorFeeCents: breakdown.creatorFeeCents.toString(),
        creatorNetCents: breakdown.creatorNetCents.toString(),
      },
      // If creator has connected Stripe, set up for transfer
      ...(creatorStripeAccountId ? {
        payment_intent_data: {
          transfer_data: {
            destination: creatorStripeAccountId,
            amount: breakdown.creatorNetCents, // Creator receives this amount
          },
        },
      } : {}),
    })

    // Update collaboration with pending payment info
    await prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        paymentStatus: 'processing',
        paymentAmount: breakdown.hostTotalCents,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('[Checkout API] Error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
