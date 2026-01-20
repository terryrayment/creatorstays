import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/creators/search - Search and filter creators
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const query = searchParams.get('q') || ''
    const niche = searchParams.get('niche') || ''
    const location = searchParams.get('location') || ''
    const platform = searchParams.get('platform') || ''
    const minFollowers = parseInt(searchParams.get('minFollowers') || '0')
    const maxFollowers = parseInt(searchParams.get('maxFollowers') || '0')
    const openToGiftedStays = searchParams.get('openToGiftedStays') === 'true'
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = {
      isActive: true,
    }

    // Text search
    if (query) {
      where.OR = [
        { displayName: { contains: query, mode: 'insensitive' } },
        { handle: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Niche filter
    if (niche && niche !== 'All Niches') {
      where.niches = { has: niche }
    }

    // Location filter
    if (location && location !== 'All Locations') {
      where.location = { contains: location, mode: 'insensitive' }
    }

    // Platform filter
    if (platform && platform !== 'All Platforms') {
      if (platform === 'Instagram') {
        where.instagramHandle = { not: null }
      } else if (platform === 'TikTok') {
        where.tiktokHandle = { not: null }
      } else if (platform === 'YouTube') {
        where.youtubeHandle = { not: null }
      }
    }

    // Follower count filter
    if (minFollowers > 0) {
      where.totalFollowers = { ...where.totalFollowers, gte: minFollowers }
    }
    if (maxFollowers > 0) {
      where.totalFollowers = { ...where.totalFollowers, lte: maxFollowers }
    }

    // Gifted stays filter
    if (openToGiftedStays) {
      where.openToGiftedStays = true
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'followers_high':
        orderBy = { totalFollowers: 'desc' }
        break
      case 'followers_low':
        orderBy = { totalFollowers: 'asc' }
        break
      case 'engagement_high':
        orderBy = { engagementRate: 'desc' }
        break
      case 'engagement_low':
        orderBy = { engagementRate: 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
    }

    // Get total count
    const total = await prisma.creatorProfile.count({ where })

    // Get creators
    const creators = await prisma.creatorProfile.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        handle: true,
        displayName: true,
        bio: true,
        location: true,
        avatarUrl: true,
        niches: true,
        instagramHandle: true,
        tiktokHandle: true,
        youtubeHandle: true,
        totalFollowers: true,
        engagementRate: true,
        minimumFlatFee: true,
        openToGiftedStays: true,
        deliverables: true,
        isVerified: true,
      },
    })

    // Format response
    const formattedCreators = creators.map(c => ({
      id: c.id,
      handle: c.handle,
      displayName: c.displayName,
      bio: c.bio,
      location: c.location,
      avatarUrl: c.avatarUrl,
      niches: c.niches,
      platforms: [
        c.instagramHandle ? 'Instagram' : null,
        c.tiktokHandle ? 'TikTok' : null,
        c.youtubeHandle ? 'YouTube' : null,
      ].filter(Boolean),
      totalFollowers: c.totalFollowers,
      engagementRate: c.engagementRate,
      minimumRate: c.minimumFlatFee,
      openToGiftedStays: c.openToGiftedStays,
      deliverables: c.deliverables,
      isVerified: c.isVerified,
    }))

    return NextResponse.json({
      creators: formattedCreators,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[Creators Search API] Error:', error)
    return NextResponse.json({ error: 'Failed to search creators' }, { status: 500 })
  }
}
