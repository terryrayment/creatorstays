import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Create a Stripe Connect account for a creator
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get creator profile
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    })

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })
    }

    // Check if creator already has a Stripe account
    if (creator.stripeAccountId) {
      // Create a new account link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: creator.stripeAccountId,
        refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/creator/settings?stripe=refresh`,
        return_url: `${process.env.NEXTAUTH_URL}/dashboard/creator/settings?stripe=success`,
        type: 'account_onboarding',
      })

      return NextResponse.json({ url: accountLink.url })
    }

    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: creator.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        creatorId: creator.id,
        userId: session.user.id,
      },
    })

    // Save Stripe account ID to creator profile
    await prisma.creatorProfile.update({
      where: { id: creator.id },
      data: { stripeAccountId: account.id },
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/creator/settings?stripe=refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/creator/settings?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('[Stripe Connect] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}

// Get Stripe account status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!creator?.stripeAccountId) {
      return NextResponse.json({ 
        connected: false,
        onboardingComplete: false 
      })
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(creator.stripeAccountId)

    return NextResponse.json({
      connected: true,
      onboardingComplete: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    })
  } catch (error) {
    console.error('[Stripe Connect] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get Stripe status' },
      { status: 500 }
    )
  }
}
