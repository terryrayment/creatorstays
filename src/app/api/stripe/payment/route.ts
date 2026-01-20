import { NextRequest, NextResponse } from 'next/server'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Create a payment from host to creator
export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Payment system is not configured' }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { collaborationId, amount } = body

    if (!collaborationId || !amount) {
      return NextResponse.json(
        { error: 'Missing collaborationId or amount' },
        { status: 400 }
      )
    }

    // Get collaboration with creator info
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        creator: true,
        host: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify the host owns this collaboration
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile || collaboration.hostId !== hostProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check creator has Stripe account
    if (!collaboration.creator.stripeAccountId) {
      return NextResponse.json(
        { error: 'Creator has not set up payments yet' },
        { status: 400 }
      )
    }

    // Verify creator's Stripe account is ready
    const creatorAccount = await stripe.accounts.retrieve(
      collaboration.creator.stripeAccountId
    )

    if (!creatorAccount.charges_enabled) {
      return NextResponse.json(
        { error: 'Creator payment account is not fully set up' },
        { status: 400 }
      )
    }

    // Calculate platform fees (15% from creator, 15% surcharge on host)
    // If host wants to pay creator $100:
    // - Host pays: $100 + 15% = $115
    // - Creator receives: $100 - 15% = $85
    // - Platform keeps: $15 (from host) + $15 (from creator) = $30
    
    const creatorBaseAmount = amount // What host intends for creator
    const hostSurcharge = Math.round(creatorBaseAmount * 0.15) // 15% host surcharge
    const totalHostPays = creatorBaseAmount + hostSurcharge // Host pays this
    const creatorFee = Math.round(creatorBaseAmount * 0.15) // 15% creator fee
    const creatorReceives = creatorBaseAmount - creatorFee // Creator gets this
    const platformTotal = hostSurcharge + creatorFee // Platform keeps this

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalHostPays, // Total amount host pays (in cents)
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      transfer_data: {
        destination: collaboration.creator.stripeAccountId,
        amount: creatorReceives, // Creator receives amount minus their fee
      },
      metadata: {
        collaborationId,
        hostId: hostProfile.id,
        creatorId: collaboration.creator.id,
        creatorBaseAmount: creatorBaseAmount.toString(),
        hostSurcharge: hostSurcharge.toString(),
        creatorFee: creatorFee.toString(),
        platformTotal: platformTotal.toString(),
      },
    })

    // Update collaboration with payment info
    await prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
        paymentAmount: amount,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('[Stripe Payment] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

// Get payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('paymentIntentId')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing paymentIntentId' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    return NextResponse.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    console.error('[Stripe Payment] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    )
  }
}
