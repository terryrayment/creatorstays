import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/payout-status?collaborationId=xxx
 * Get payout timeline/status for a specific collaboration (for creators)
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

    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!creatorProfile) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 })
    }

    // Get collaboration
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        offer: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify creator owns this collaboration
    if (collaboration.creatorId !== creatorProfile.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build payout status response
    const payoutStatus = buildPayoutStatus(collaboration, creatorProfile)

    return NextResponse.json(payoutStatus)
  } catch (error) {
    console.error('[Payout Status API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch payout status' }, { status: 500 })
  }
}

interface PayoutStatus {
  status: 'pending' | 'processing' | 'in_transit' | 'paid' | 'failed' | 'not_started'
  statusLabel: string
  statusDescription: string
  timeline: TimelineStep[]
  estimatedArrival: string | null
  amountCents: number | null
  paidAt: string | null
}

interface TimelineStep {
  label: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
  date?: string
}

function buildPayoutStatus(
  collaboration: {
    paymentStatus: string
    paidAt: Date | null
    paymentAmount: number | null
    status: string
    offer: {
      cashCents: number
      trafficBonusEnabled: boolean
      trafficBonusCents: number | null
    }
  },
  creatorProfile: {
    stripeAccountId: string | null
    stripeOnboardingComplete: boolean
    stripePayoutsEnabled: boolean
  }
): PayoutStatus {
  // Calculate amount (base + potential bonus)
  const baseCents = collaboration.offer.cashCents
  const creatorFeeCents = Math.round(baseCents * 0.15)
  const creatorNetCents = baseCents - creatorFeeCents

  // Check if Stripe is set up
  if (!creatorProfile.stripeAccountId || !creatorProfile.stripeOnboardingComplete) {
    return {
      status: 'not_started',
      statusLabel: 'Setup Required',
      statusDescription: 'Connect your Stripe account to receive payments.',
      timeline: [
        {
          label: 'Connect Stripe',
          description: 'Set up your payout account',
          status: 'current',
        },
        {
          label: 'Host Pays',
          description: 'Payment initiated by host',
          status: 'upcoming',
        },
        {
          label: 'Funds Transfer',
          description: 'Money moves to your account',
          status: 'upcoming',
        },
        {
          label: 'Bank Deposit',
          description: 'Arrives in your bank',
          status: 'upcoming',
        },
      ],
      estimatedArrival: null,
      amountCents: creatorNetCents,
      paidAt: null,
    }
  }

  // Payment not yet made
  if (collaboration.paymentStatus === 'pending') {
    return {
      status: 'pending',
      statusLabel: 'Awaiting Payment',
      statusDescription: 'Waiting for the host to complete payment.',
      timeline: [
        {
          label: 'Connect Stripe',
          description: 'Payout account ready',
          status: 'completed',
        },
        {
          label: 'Host Pays',
          description: 'Waiting for host to pay',
          status: 'current',
        },
        {
          label: 'Funds Transfer',
          description: 'Money moves to your account',
          status: 'upcoming',
        },
        {
          label: 'Bank Deposit',
          description: 'Arrives in your bank',
          status: 'upcoming',
        },
      ],
      estimatedArrival: null,
      amountCents: creatorNetCents,
      paidAt: null,
    }
  }

  // Payment processing
  if (collaboration.paymentStatus === 'processing') {
    return {
      status: 'processing',
      statusLabel: 'Processing',
      statusDescription: 'Payment received! Your payout is being processed.',
      timeline: [
        {
          label: 'Connect Stripe',
          description: 'Payout account ready',
          status: 'completed',
        },
        {
          label: 'Host Pays',
          description: 'Payment received',
          status: 'completed',
        },
        {
          label: 'Funds Transfer',
          description: 'Processing now',
          status: 'current',
        },
        {
          label: 'Bank Deposit',
          description: 'Arrives in 2-5 business days',
          status: 'upcoming',
        },
      ],
      estimatedArrival: getEstimatedArrival(new Date(), 3),
      amountCents: collaboration.paymentAmount || creatorNetCents,
      paidAt: null,
    }
  }

  // Payment completed
  if (collaboration.paymentStatus === 'completed' && collaboration.paidAt) {
    const paidDate = new Date(collaboration.paidAt)
    const estimatedArrival = getEstimatedArrival(paidDate, 3) // 2-5 business days, avg 3
    const now = new Date()
    const arrivalDate = new Date(estimatedArrival)
    const hasArrived = now >= arrivalDate

    return {
      status: hasArrived ? 'paid' : 'in_transit',
      statusLabel: hasArrived ? 'Deposited' : 'On the Way',
      statusDescription: hasArrived 
        ? 'Your payout has been deposited to your bank account.'
        : 'Your payout is on the way! Funds typically arrive in 2-5 business days.',
      timeline: [
        {
          label: 'Connect Stripe',
          description: 'Payout account ready',
          status: 'completed',
        },
        {
          label: 'Host Pays',
          description: 'Payment received',
          status: 'completed',
          date: formatDate(paidDate),
        },
        {
          label: 'Funds Transfer',
          description: 'Sent to your bank',
          status: 'completed',
        },
        {
          label: 'Bank Deposit',
          description: hasArrived ? 'Deposited' : `Expected by ${formatDate(arrivalDate)}`,
          status: hasArrived ? 'completed' : 'current',
          date: hasArrived ? formatDate(arrivalDate) : undefined,
        },
      ],
      estimatedArrival,
      amountCents: collaboration.paymentAmount || creatorNetCents,
      paidAt: collaboration.paidAt.toISOString(),
    }
  }

  // Payment failed
  if (collaboration.paymentStatus === 'failed') {
    return {
      status: 'failed',
      statusLabel: 'Payment Failed',
      statusDescription: 'There was an issue with the payment. The host has been notified.',
      timeline: [
        {
          label: 'Connect Stripe',
          description: 'Payout account ready',
          status: 'completed',
        },
        {
          label: 'Host Pays',
          description: 'Payment failed',
          status: 'current',
        },
        {
          label: 'Funds Transfer',
          description: 'Waiting for retry',
          status: 'upcoming',
        },
        {
          label: 'Bank Deposit',
          description: 'Pending',
          status: 'upcoming',
        },
      ],
      estimatedArrival: null,
      amountCents: creatorNetCents,
      paidAt: null,
    }
  }

  // Default fallback
  return {
    status: 'pending',
    statusLabel: 'Pending',
    statusDescription: 'Payment status is being determined.',
    timeline: [],
    estimatedArrival: null,
    amountCents: creatorNetCents,
    paidAt: null,
  }
}

function getEstimatedArrival(fromDate: Date, businessDays: number): string {
  const date = new Date(fromDate)
  let daysAdded = 0
  
  while (daysAdded < businessDays) {
    date.setDate(date.getDate() + 1)
    const dayOfWeek = date.getDay()
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++
    }
  }
  
  return date.toISOString()
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
