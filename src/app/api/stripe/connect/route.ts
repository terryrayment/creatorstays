import { NextRequest, NextResponse } from 'next/server'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Create a Stripe Connect account for a creator
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('[Stripe Connect] No session found')
      return NextResponse.json({ error: 'Please log in to connect your payment account' }, { status: 401 })
    }

    // Get creator profile
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    })

    if (!creator) {
      console.log('[Stripe Connect] No creator profile for user:', session.user.id)
      return NextResponse.json({ error: 'Creator profile not found. Please complete your profile first.' }, { status: 404 })
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      console.error('[Stripe Connect] STRIPE_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Payment system is not configured. Please contact support.' }, { status: 500 })
    }

    // Check if creator already has a Stripe account
    if (creator.stripeAccountId) {
      console.log('[Stripe Connect] Creating account link for existing account:', creator.stripeAccountId)
      // Create a new account link for existing account
      const accountLink = await stripe.accountLinks.create({
        account: creator.stripeAccountId,
        refresh_url: `${process.env.NEXTAUTH_URL}/beta/dashboard/creator/settings?stripe=refresh`,
        return_url: `${process.env.NEXTAUTH_URL}/beta/dashboard/creator/settings?stripe=success`,
        type: 'account_onboarding',
      })

      return NextResponse.json({ url: accountLink.url })
    }

    console.log('[Stripe Connect] Creating new account for:', creator.user.email)
    
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

    console.log('[Stripe Connect] Account created:', account.id)

    // Save Stripe account ID to creator profile
    await prisma.creatorProfile.update({
      where: { id: creator.id },
      data: { stripeAccountId: account.id },
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/beta/dashboard/creator/settings?stripe=refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/beta/dashboard/creator/settings?stripe=success`,
      type: 'account_onboarding',
    })

    console.log('[Stripe Connect] Account link created, redirecting to Stripe')
    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('[Stripe Connect] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to connect payment account: ${errorMessage}` },
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

    // If Stripe isn't configured, return cached status from DB
    if (!isStripeConfigured()) {
      return NextResponse.json({
        connected: true,
        onboardingComplete: creator.stripeOnboardingComplete,
        chargesEnabled: creator.stripeChargesEnabled,
        payoutsEnabled: creator.stripePayoutsEnabled,
      })
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(creator.stripeAccountId)

    // Sync status to database if changed
    if (
      creator.stripeOnboardingComplete !== account.details_submitted ||
      creator.stripeChargesEnabled !== account.charges_enabled ||
      creator.stripePayoutsEnabled !== account.payouts_enabled
    ) {
      await prisma.creatorProfile.update({
        where: { id: creator.id },
        data: {
          stripeOnboardingComplete: account.details_submitted,
          stripeChargesEnabled: account.charges_enabled,
          stripePayoutsEnabled: account.payouts_enabled,
        },
      })
    }

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
