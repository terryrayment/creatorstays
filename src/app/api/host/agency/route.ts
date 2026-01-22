import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const AGENCY_PRICE_CENTS = 14900 // $149/month

// GET /api/host/agency - Get agency status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    // Get team members if agency
    let teamMembers: any[] = []
    if (hostProfile.isAgency) {
      teamMembers = await prisma.agencyTeamMember.findMany({
        where: { agencyHostId: hostProfile.id },
        orderBy: { createdAt: 'desc' },
      })
    }

    // Get property count
    const propertyCount = await prisma.property.count({
      where: { hostProfileId: hostProfile.id },
    })

    return NextResponse.json({
      isAgency: hostProfile.isAgency,
      agencyName: hostProfile.agencyName,
      subscribedAt: hostProfile.agencySubscribedAt,
      expiresAt: hostProfile.agencyExpiresAt,
      teamSeats: hostProfile.teamSeats,
      teamMembers,
      propertyCount,
      features: {
        unlimitedProperties: hostProfile.isAgency,
        teamMembers: hostProfile.isAgency ? hostProfile.teamSeats : 0,
        bulkOffers: hostProfile.isAgency,
        apiAccess: hostProfile.isAgency,
        prioritySupport: hostProfile.isAgency,
        whiteLabel: hostProfile.isAgency,
      },
    })
  } catch (error) {
    console.error('[Agency Status] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get agency status' },
      { status: 500 }
    )
  }
}

// POST /api/host/agency - Subscribe to Agency Pro
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { agencyName } = body

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    if (hostProfile.isAgency) {
      return NextResponse.json({ error: 'Already subscribed to Agency Pro' }, { status: 400 })
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
              name: 'CreatorStays Agency Pro',
              description: 'Multi-property management, team seats, bulk offers, API access',
            },
            unit_amount: AGENCY_PRICE_CENTS,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        hostProfileId: hostProfile.id,
        agencyName: agencyName || hostProfile.displayName,
        type: 'agency_subscription',
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/host?agency=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/host/upgrade`,
    })

    return NextResponse.json({ 
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('[Agency Subscribe] Error:', error)
    return NextResponse.json(
      { error: 'Failed to start subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/host/agency - Cancel Agency subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    if (!hostProfile.isAgency || !hostProfile.agencySubscriptionId) {
      return NextResponse.json({ error: 'No active agency subscription' }, { status: 400 })
    }

    // Cancel Stripe subscription
    await stripe.subscriptions.cancel(hostProfile.agencySubscriptionId)

    // Update profile (will be fully removed at period end via webhook)
    await prisma.hostProfile.update({
      where: { id: hostProfile.id },
      data: {
        // Keep isAgency true until subscription actually ends
        agencySubscriptionId: null,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
    })
  } catch (error) {
    console.error('[Agency Cancel] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

// PATCH /api/host/agency - Manually activate agency (for testing/admin)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { activate, agencyName } = body

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    if (activate) {
      // Activate agency
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)
      
      await prisma.hostProfile.update({
        where: { id: hostProfile.id },
        data: {
          isAgency: true,
          agencyName: agencyName || hostProfile.displayName || 'My Agency',
          agencySubscribedAt: new Date(),
          agencyExpiresAt: expiresAt,
          teamSeats: 5,
        },
      })

      return NextResponse.json({ 
        success: true,
        message: 'Agency Pro activated',
        isAgency: true,
      })
    } else {
      // Deactivate agency
      await prisma.hostProfile.update({
        where: { id: hostProfile.id },
        data: {
          isAgency: false,
          agencySubscriptionId: null,
          agencyExpiresAt: null,
        },
      })

      return NextResponse.json({ 
        success: true,
        message: 'Agency Pro deactivated',
        isAgency: false,
      })
    }
  } catch (error) {
    console.error('[Agency PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update agency status' },
      { status: 500 }
    )
  }
}
