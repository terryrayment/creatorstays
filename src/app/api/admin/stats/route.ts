import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats - Get platform-wide statistics
export async function GET() {
  try {
    // Check admin session cookie
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts
    const [
      totalUsers,
      totalCreators,
      totalHosts,
      totalProperties,
      totalOffers,
      totalCollaborations,
      totalMessages,
      totalReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.creatorProfile.count(),
      prisma.hostProfile.count(),
      prisma.property.count(),
      prisma.offer.count(),
      prisma.collaboration.count(),
      prisma.message.count(),
      prisma.review.count(),
    ])

    // Get offer stats
    const offerStats = await prisma.offer.groupBy({
      by: ['status'],
      _count: true,
    })

    // Get collaboration stats
    const collabStats = await prisma.collaboration.groupBy({
      by: ['status'],
      _count: true,
    })

    // Get recent users (last 7 days)
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    })

    // Get recent offers (last 7 days)
    const recentOffers = await prisma.offer.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    })

    // Get total payment volume
    const paymentVolume = await prisma.collaboration.aggregate({
      _sum: { paymentAmount: true },
      where: { paymentAmount: { not: null } },
    })

    // Get recent creators
    const recentCreators = await prisma.creatorProfile.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, createdAt: true } },
      },
    })

    // Get recent hosts with more details
    const recentHosts = await prisma.hostProfile.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, createdAt: true, lastLoginAt: true } },
        properties: { 
          take: 1, 
          select: { 
            airbnbUrl: true, 
            vrboUrl: true, 
            cityRegion: true,
            title: true,
          } 
        },
        _count: { select: { properties: true } },
      },
    })

    // Get recent collaborations
    const recentCollaborations = await prisma.collaboration.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { displayName: true, handle: true } },
        host: { select: { displayName: true } },
        property: { select: { title: true } },
      },
    })

    // Get recent offers
    const recentOffersList = await prisma.offer.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        creatorProfile: { select: { displayName: true, handle: true } },
        hostProfile: { select: { displayName: true } },
      },
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        totalCreators,
        totalHosts,
        totalProperties,
        totalOffers,
        totalCollaborations,
        totalMessages,
        totalReviews,
        recentUsers,
        recentOffers,
        paymentVolume: paymentVolume._sum.paymentAmount || 0,
      },
      offerStats: offerStats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      collabStats: collabStats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      recentCreators: recentCreators.map(c => ({
        id: c.id,
        displayName: c.displayName,
        handle: c.handle,
        email: c.user.email,
        location: c.location,
        createdAt: c.createdAt,
      })),
      recentHosts: recentHosts.map(h => ({
        id: h.id,
        displayName: h.displayName || 'Unknown',
        email: h.user.email,
        propertyCount: h._count.properties,
        createdAt: h.createdAt,
        lastLoginAt: h.user.lastLoginAt,
        location: h.location || h.properties[0]?.cityRegion || null,
        propertyUrl: h.properties[0]?.airbnbUrl || h.properties[0]?.vrboUrl || null,
        propertyTitle: h.properties[0]?.title || null,
        bio: h.bio || null,
        onboardingComplete: h.onboardingComplete,
        membershipPaid: h.membershipPaid,
      })),
      recentCollaborations: recentCollaborations.map(c => ({
        id: c.id,
        creatorName: c.creator.displayName,
        hostName: c.host.displayName,
        propertyTitle: c.property.title,
        status: c.status,
        createdAt: c.createdAt,
      })),
      recentOffers: recentOffersList.map(o => ({
        id: o.id,
        creatorName: o.creatorProfile.displayName,
        hostName: o.hostProfile.displayName,
        status: o.status,
        cashCents: o.cashCents,
        createdAt: o.createdAt,
      })),
    })
  } catch (error) {
    console.error('[Admin Stats API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
