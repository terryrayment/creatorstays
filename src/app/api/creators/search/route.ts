import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Mock creators for demo purposes when no real creators exist
const MOCK_CREATORS = [
  {
    id: 'mock-1',
    handle: 'wanderlust_jane',
    displayName: 'Jane Wanderlust',
    bio: 'Travel photographer capturing hidden gems across the American Southwest. Always chasing golden hour.',
    location: 'Los Angeles, CA',
    avatarUrl: null,
    niches: ['Travel', 'Photography'],
    platforms: ['Instagram', 'TikTok'],
    totalFollowers: 85000,
    engagementRate: 4.2,
    minimumRate: 40000,
    openToGiftedStays: true,
    deliverables: ['1 Reel', '3 Stories', '1 Feed Post'],
    isVerified: false,
    isMock: true,
  },
  {
    id: 'mock-2',
    handle: 'nomad_mike',
    displayName: 'Mike Chen',
    bio: 'Full-time van lifer & content creator. Helping people find unique stays off the beaten path.',
    location: 'Austin, TX',
    avatarUrl: null,
    niches: ['Travel', 'Adventure', 'Vlog'],
    platforms: ['YouTube', 'Instagram'],
    totalFollowers: 142000,
    engagementRate: 5.8,
    minimumRate: 75000,
    openToGiftedStays: false,
    deliverables: ['1 YouTube Video', '2 Reels'],
    isVerified: true,
    isMock: true,
  },
  {
    id: 'mock-3',
    handle: 'cozy.corners',
    displayName: 'Sarah Mitchell',
    bio: 'Interior design enthusiast showcasing the coziest Airbnbs and vacation rentals. Let me help tell your property\'s story.',
    location: 'Denver, CO',
    avatarUrl: null,
    niches: ['Design', 'Lifestyle', 'Travel'],
    platforms: ['Instagram'],
    totalFollowers: 67000,
    engagementRate: 6.1,
    minimumRate: 35000,
    openToGiftedStays: true,
    deliverables: ['1 Reel', '5 Stories', '2 Feed Posts'],
    isVerified: false,
    isMock: true,
  },
  {
    id: 'mock-4',
    handle: 'adventure_fam',
    displayName: 'The Johnsons',
    bio: 'Family of 5 sharing our adventures in family-friendly vacation rentals. Real reviews from real families.',
    location: 'Miami, FL',
    avatarUrl: null,
    niches: ['Family', 'Travel', 'Lifestyle'],
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    totalFollowers: 210000,
    engagementRate: 3.9,
    minimumRate: 95000,
    openToGiftedStays: false,
    deliverables: ['1 YouTube Video', '2 Reels', '3 Stories'],
    isVerified: true,
    isMock: true,
  },
  {
    id: 'mock-5',
    handle: 'luxe_escapes',
    displayName: 'Marcus Reyes',
    bio: 'Luxury travel curator. Showcasing premium properties and exclusive experiences for discerning travelers.',
    location: 'San Francisco, CA',
    avatarUrl: null,
    niches: ['Luxury', 'Travel', 'Lifestyle'],
    platforms: ['Instagram'],
    totalFollowers: 315000,
    engagementRate: 2.8,
    minimumRate: 150000,
    openToGiftedStays: false,
    deliverables: ['1 Reel', '2 Feed Posts', '5 Stories'],
    isVerified: true,
    isMock: true,
  },
  {
    id: 'mock-6',
    handle: 'tiny_house_tina',
    displayName: 'Tina Park',
    bio: 'Tiny house enthusiast and minimalist traveler. Showing that less is more when it comes to unforgettable stays.',
    location: 'Portland, OR',
    avatarUrl: null,
    niches: ['Minimal', 'Travel', 'Design'],
    platforms: ['TikTok', 'Instagram'],
    totalFollowers: 98000,
    engagementRate: 7.2,
    minimumRate: 45000,
    openToGiftedStays: true,
    deliverables: ['3 TikToks', '1 Reel'],
    isVerified: false,
    isMock: true,
  },
]

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

    // If no real creators found, return mock data
    if (creators.length === 0 && !query) {
      // Apply filters to mock data
      let filteredMocks = [...MOCK_CREATORS]
      
      if (niche && niche !== 'All Niches') {
        filteredMocks = filteredMocks.filter(c => c.niches.includes(niche))
      }
      if (location && location !== 'All Locations') {
        filteredMocks = filteredMocks.filter(c => 
          c.location.toLowerCase().includes(location.toLowerCase())
        )
      }
      if (platform && platform !== 'All Platforms') {
        filteredMocks = filteredMocks.filter(c => c.platforms.includes(platform))
      }
      if (openToGiftedStays) {
        filteredMocks = filteredMocks.filter(c => c.openToGiftedStays)
      }
      if (minFollowers > 0) {
        filteredMocks = filteredMocks.filter(c => c.totalFollowers >= minFollowers)
      }
      if (maxFollowers > 0) {
        filteredMocks = filteredMocks.filter(c => c.totalFollowers <= maxFollowers)
      }

      return NextResponse.json({
        creators: filteredMocks,
        pagination: {
          page: 1,
          limit,
          total: filteredMocks.length,
          pages: 1,
        },
        isMockData: true,
      })
    }

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
      isMock: false,
    }))

    return NextResponse.json({
      creators: formattedCreators,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      isMockData: false,
    })
  } catch (error) {
    console.error('[Creators Search API] Error:', error)
    return NextResponse.json({ error: 'Failed to search creators' }, { status: 500 })
  }
}
