import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/reviews - Get reviews for a user or collaboration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collaborationId = searchParams.get('collaborationId')
    const creatorId = searchParams.get('creatorId')
    const hostId = searchParams.get('hostId')

    // Get reviews for a specific collaboration
    if (collaborationId) {
      const reviews = await prisma.review.findMany({
        where: { collaborationId },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ reviews })
    }

    // Get reviews for a creator (reviews they received)
    if (creatorId) {
      const reviews = await prisma.review.findMany({
        where: {
          revieweeId: creatorId,
          revieweeType: 'creator',
          isPublic: true,
        },
        include: {
          collaboration: {
            select: {
              property: { select: { title: true, cityRegion: true } },
              host: { select: { displayName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Calculate average rating
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null

      return NextResponse.json({ 
        reviews,
        stats: {
          count: reviews.length,
          avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        },
      })
    }

    // Get reviews for a host (reviews they received)
    if (hostId) {
      const reviews = await prisma.review.findMany({
        where: {
          revieweeId: hostId,
          revieweeType: 'host',
          isPublic: true,
        },
        include: {
          collaboration: {
            select: {
              property: { select: { title: true } },
              creator: { select: { displayName: true, handle: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null

      return NextResponse.json({ 
        reviews,
        stats: {
          count: reviews.length,
          avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        },
      })
    }

    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  } catch (error) {
    console.error('[Reviews API] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      collaborationId, 
      rating, 
      title, 
      body: reviewBody,
      communicationRating,
      professionalismRating,
      qualityRating,
    } = body

    if (!collaborationId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Get user's profile
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    const isHost = !!hostProfile
    const userProfile = isHost ? hostProfile : creatorProfile

    if (!userProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get the collaboration
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        host: true,
        creator: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify user is part of this collaboration
    if (isHost && collaboration.hostId !== userProfile.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    if (!isHost && collaboration.creatorId !== userProfile.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Check collaboration is completed
    if (collaboration.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed collaborations' }, { status: 400 })
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        collaborationId_reviewerType: {
          collaborationId,
          reviewerType: isHost ? 'host' : 'creator',
        },
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this collaboration' }, { status: 400 })
    }

    // Determine reviewee
    const revieweeType = isHost ? 'creator' : 'host'
    const revieweeId = isHost ? collaboration.creatorId : collaboration.hostId

    // Create the review
    const review = await prisma.review.create({
      data: {
        collaborationId,
        reviewerType: isHost ? 'host' : 'creator',
        reviewerId: userProfile.id,
        revieweeType,
        revieweeId,
        rating,
        title: title || null,
        body: reviewBody || null,
        communicationRating: communicationRating || null,
        professionalismRating: professionalismRating || null,
        qualityRating: qualityRating || null,
      },
    })

    return NextResponse.json({ 
      success: true, 
      review,
      message: 'Review submitted successfully',
    })
  } catch (error) {
    console.error('[Reviews API] POST Error:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
