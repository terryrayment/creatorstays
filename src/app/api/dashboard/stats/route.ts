import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/dashboard/stats - Get dashboard stats for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is host or creator
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ 
        where: { userId: session.user.id },
        select: { id: true, displayName: true, bio: true }
      }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    // HOST STATS
    if (hostProfile) {
      // Get offers sent
      const offers = await prisma.offer.findMany({
        where: { hostProfileId: hostProfile.id },
        select: { status: true },
      })

      // Get collaborations
      const collaborations = await prisma.collaboration.findMany({
        where: { hostId: hostProfile.id },
        select: { 
          status: true, 
          paymentAmount: true,
          affiliateToken: true,
        },
      })

      // Get total clicks from affiliate links
      const affiliateLinks = await prisma.affiliateLink.findMany({
        where: { hostId: hostProfile.id },
        select: { clickCount: true },
      })

      // Get properties count
      const propertiesCount = await prisma.property.count({
        where: { hostProfileId: hostProfile.id },
      })

      const totalClicks = affiliateLinks.reduce((sum, link) => sum + link.clickCount, 0)
      const totalSpent = collaborations
        .filter(c => c.paymentAmount)
        .reduce((sum, c) => sum + (c.paymentAmount || 0), 0)

      return NextResponse.json({
        role: 'host',
        // Flat structure for easy consumption
        offersSent: offers.length,
        offersPending: offers.filter(o => o.status === 'pending').length,
        offersAccepted: offers.filter(o => o.status === 'accepted').length,
        offersDeclined: offers.filter(o => o.status === 'declined').length,
        activeCollabs: collaborations.filter(c => 
          ['active', 'pending-agreement', 'content-submitted', 'content-uploaded', 'approved', 'content-live'].includes(c.status)
        ).length,
        completedCollabs: collaborations.filter(c => c.status === 'completed').length,
        totalCollabs: collaborations.length,
        totalClicks,
        totalSpent: Math.round(totalSpent / 100), // Convert cents to dollars
        propertiesCount,
        // Getting Started checklist flags
        hasProperty: propertiesCount > 0,
        hasProfile: Boolean(hostProfile.displayName && hostProfile.bio),
        // Also include nested stats for backward compatibility
        stats: {
          offersSent: offers.length,
          offersPending: offers.filter(o => o.status === 'pending').length,
          offersAccepted: offers.filter(o => o.status === 'accepted').length,
          offersDeclined: offers.filter(o => o.status === 'declined').length,
          activeCollabs: collaborations.filter(c => 
            ['active', 'pending-agreement', 'content-submitted', 'content-uploaded', 'approved', 'content-live'].includes(c.status)
          ).length,
          completedCollabs: collaborations.filter(c => c.status === 'completed').length,
          totalCollabs: collaborations.length,
          totalClicks,
          totalSpentCents: totalSpent,
          propertiesCount,
        },
      })
    }

    // CREATOR STATS
    if (creatorProfile) {
      // Get offers received
      const offers = await prisma.offer.findMany({
        where: { creatorProfileId: creatorProfile.id },
        select: { status: true },
      })

      // Get collaborations
      const collaborations = await prisma.collaboration.findMany({
        where: { creatorId: creatorProfile.id },
        select: { 
          status: true, 
          paymentAmount: true,
          affiliateToken: true,
        },
      })

      // Get total clicks from collaborations
      const affiliateTokens = collaborations
        .filter(c => c.affiliateToken)
        .map(c => c.affiliateToken as string)
      
      let totalClicks = 0
      if (affiliateTokens.length > 0) {
        const links = await prisma.affiliateLink.findMany({
          where: { token: { in: affiliateTokens } },
          select: { clickCount: true },
        })
        totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0)
      }

      const totalEarned = collaborations
        .filter(c => c.paymentAmount && c.status === 'completed')
        .reduce((sum, c) => sum + (c.paymentAmount || 0), 0)

      // Calculate creator's net (after 15% fee)
      const creatorNetEarnings = Math.round(totalEarned * 0.85)

      return NextResponse.json({
        role: 'creator',
        stats: {
          // Offers
          offersReceived: offers.length,
          offersPending: offers.filter(o => o.status === 'pending').length,
          offersAccepted: offers.filter(o => o.status === 'accepted').length,
          // Collaborations
          activeCollabs: collaborations.filter(c => 
            ['active', 'pending-agreement', 'content-submitted'].includes(c.status)
          ).length,
          completedCollabs: collaborations.filter(c => c.status === 'completed').length,
          totalCollabs: collaborations.length,
          // Performance
          totalClicks,
          totalEarnedCents: creatorNetEarnings,
          // Pending payment
          pendingPaymentCents: collaborations
            .filter(c => c.status === 'approved')
            .reduce((sum, c) => sum + Math.round((c.paymentAmount || 0) * 0.85), 0),
        },
      })
    }

    return NextResponse.json({ error: 'No profile found' }, { status: 404 })
  } catch (error) {
    console.error('[Dashboard Stats API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
