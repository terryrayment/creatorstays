import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const BOOST_PRICE_CENTS = 4900 // $49/month

// POST /api/properties/[id]/boost - Start boost subscription
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get property and verify ownership
    const property = await prisma.property.findUnique({
      where: { id },
      include: { hostProfile: true },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.hostProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not your property' }, { status: 403 })
    }

    if (property.isBoosted) {
      return NextResponse.json({ error: 'Property is already boosted' }, { status: 400 })
    }

    // Create Stripe checkout for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Boosted Listing: ${property.title || 'Property'}`,
              description: 'Featured placement in creator search results',
            },
            unit_amount: BOOST_PRICE_CENTS,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        propertyId: property.id,
        type: 'property_boost',
      },
      success_url: `${process.env.NEXTAUTH_URL}/beta/dashboard/host/properties?boosted=${property.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/beta/dashboard/host/properties`,
    })

    return NextResponse.json({ 
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('[Boost Property] Error:', error)
    return NextResponse.json(
      { error: 'Failed to start boost' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id]/boost - Cancel boost
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      include: { hostProfile: true },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.hostProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not your property' }, { status: 403 })
    }

    // Cancel Stripe subscription if exists
    if (property.boostStripeSubId) {
      await stripe.subscriptions.cancel(property.boostStripeSubId)
    }

    // Update property
    await prisma.property.update({
      where: { id },
      data: {
        isBoosted: false,
        boostExpiresAt: null,
        boostStripeSubId: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Cancel Boost] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel boost' },
      { status: 500 }
    )
  }
}
