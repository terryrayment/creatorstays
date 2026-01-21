import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const MEMBERSHIP_PRICE_CENTS = 19900 // $199.00

// POST /api/host/membership/checkout - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { promoCode } = body

    // Check if user already paid
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (hostProfile?.membershipPaid) {
      return NextResponse.json({ error: 'Membership already paid' }, { status: 400 })
    }

    let finalAmount = MEMBERSHIP_PRICE_CENTS
    let promoCodeRecord = null

    // Validate promo code if provided
    if (promoCode) {
      promoCodeRecord = await prisma.hostPromoCode.findUnique({
        where: { code: promoCode.toUpperCase().trim() },
      })

      if (!promoCodeRecord) {
        return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 })
      }

      if (!promoCodeRecord.isActive) {
        return NextResponse.json({ error: 'This promo code is no longer active' }, { status: 400 })
      }

      if (promoCodeRecord.expiresAt && new Date() > promoCodeRecord.expiresAt) {
        return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 })
      }

      if (promoCodeRecord.maxUses && promoCodeRecord.uses >= promoCodeRecord.maxUses) {
        return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 400 })
      }

      // Calculate discount
      if (promoCodeRecord.discountType === 'full') {
        finalAmount = 0
      } else if (promoCodeRecord.discountType === 'percent' && promoCodeRecord.discountAmount) {
        finalAmount = Math.round(MEMBERSHIP_PRICE_CENTS * (1 - promoCodeRecord.discountAmount / 100))
      } else if (promoCodeRecord.discountType === 'fixed' && promoCodeRecord.discountAmount) {
        finalAmount = Math.max(0, MEMBERSHIP_PRICE_CENTS - (promoCodeRecord.discountAmount * 100))
      }
    }

    // If promo code covers full amount, mark as paid immediately
    if (finalAmount === 0 && promoCodeRecord) {
      // Update host profile
      await prisma.hostProfile.update({
        where: { userId: session.user.id },
        data: {
          membershipPaid: true,
          membershipPaidAt: new Date(),
          membershipAmount: 0,
          promoCodeUsed: promoCodeRecord.code,
        },
      })

      // Record redemption and increment usage
      await prisma.hostPromoCode.update({
        where: { id: promoCodeRecord.id },
        data: { uses: { increment: 1 } },
      })

      if (hostProfile) {
        await prisma.hostPromoRedemption.create({
          data: {
            promoCodeId: promoCodeRecord.id,
            hostProfileId: hostProfile.id,
            amountSaved: MEMBERSHIP_PRICE_CENTS,
          },
        })
      }

      return NextResponse.json({ 
        success: true, 
        freeAccess: true,
        message: 'Promo code applied! You have free access.' 
      })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CreatorStays Host Membership',
              description: 'Lifetime access to creator directory and campaign tools',
            },
            unit_amount: finalAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        promoCode: promoCodeRecord?.code || '',
        originalAmount: MEMBERSHIP_PRICE_CENTS.toString(),
        discountAmount: (MEMBERSHIP_PRICE_CENTS - finalAmount).toString(),
      },
      success_url: `${process.env.NEXTAUTH_URL}/onboarding/host/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/onboarding/host?step=checkout`,
    })

    return NextResponse.json({ 
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('[Host Membership Checkout] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
