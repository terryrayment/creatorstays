import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Mock creators for demo purposes when no real creators exist
const MOCK_CREATORS = [
  // Travel & Photography
  { id: 'mock-1', handle: 'wanderlust_jane', displayName: 'Jane Wanderlust', bio: 'Travel photographer capturing hidden gems across the American Southwest.', location: 'Los Angeles, CA', niches: ['Travel', 'Photography'], platforms: ['Instagram', 'TikTok'], totalFollowers: 85000, engagementRate: 4.2, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  { id: 'mock-2', handle: 'nomad_mike', displayName: 'Mike Chen', bio: 'Full-time van lifer & content creator. Finding unique stays off the beaten path.', location: 'Austin, TX', niches: ['Travel', 'Adventure'], platforms: ['YouTube', 'Instagram'], totalFollowers: 142000, engagementRate: 5.8, minimumRate: 75000, openToGiftedStays: false, isMock: true },
  { id: 'mock-3', handle: 'cozy.corners', displayName: 'Sarah Mitchell', bio: 'Interior design enthusiast showcasing the coziest Airbnbs and vacation rentals.', location: 'Denver, CO', niches: ['Design', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 67000, engagementRate: 6.1, minimumRate: 35000, openToGiftedStays: true, isMock: true },
  { id: 'mock-4', handle: 'adventure_fam', displayName: 'The Johnsons', bio: 'Family of 5 sharing adventures in family-friendly vacation rentals.', location: 'Miami, FL', niches: ['Family', 'Travel'], platforms: ['Instagram', 'TikTok', 'YouTube'], totalFollowers: 210000, engagementRate: 3.9, minimumRate: 95000, openToGiftedStays: false, isMock: true },
  { id: 'mock-5', handle: 'luxe_escapes', displayName: 'Marcus Reyes', bio: 'Luxury travel curator showcasing premium properties and exclusive experiences.', location: 'San Francisco, CA', niches: ['Luxury', 'Travel'], platforms: ['Instagram'], totalFollowers: 315000, engagementRate: 2.8, minimumRate: 150000, openToGiftedStays: false, isMock: true },
  { id: 'mock-6', handle: 'tiny_house_tina', displayName: 'Tina Park', bio: 'Tiny house enthusiast and minimalist traveler. Less is more!', location: 'Portland, OR', niches: ['Minimal', 'Design'], platforms: ['TikTok', 'Instagram'], totalFollowers: 98000, engagementRate: 7.2, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  // Lifestyle & Food
  { id: 'mock-7', handle: 'foodie_adventures', displayName: 'Alex Rivera', bio: 'Traveling foodie exploring local cuisines at vacation destinations.', location: 'San Diego, CA', niches: ['Food', 'Travel'], platforms: ['Instagram', 'TikTok'], totalFollowers: 156000, engagementRate: 5.1, minimumRate: 60000, openToGiftedStays: true, isMock: true },
  { id: 'mock-8', handle: 'beach_babe_bri', displayName: 'Brianna Scott', bio: 'Beach lifestyle content creator. Ocean views and sandy toes.', location: 'Miami, FL', niches: ['Lifestyle', 'Travel'], platforms: ['Instagram'], totalFollowers: 89000, engagementRate: 4.8, minimumRate: 50000, openToGiftedStays: true, isMock: true },
  { id: 'mock-9', handle: 'mountain_mike', displayName: 'Mike Thompson', bio: 'Mountain retreat specialist. Ski lodges, cabins, and alpine adventures.', location: 'Denver, CO', niches: ['Adventure', 'Travel'], platforms: ['YouTube', 'Instagram'], totalFollowers: 178000, engagementRate: 4.5, minimumRate: 80000, openToGiftedStays: false, isMock: true },
  { id: 'mock-10', handle: 'solo_sarah', displayName: 'Sarah Kim', bio: 'Solo female traveler sharing safe and beautiful stays worldwide.', location: 'Seattle, WA', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok', 'Instagram'], totalFollowers: 234000, engagementRate: 6.3, minimumRate: 70000, openToGiftedStays: true, isMock: true },
  // Photography & Design
  { id: 'mock-11', handle: 'lens_and_lux', displayName: 'David Chen', bio: 'Architectural photographer specializing in vacation rental photography.', location: 'Los Angeles, CA', niches: ['Photography', 'Design'], platforms: ['Instagram'], totalFollowers: 124000, engagementRate: 3.4, minimumRate: 85000, openToGiftedStays: false, isMock: true },
  { id: 'mock-12', handle: 'cabin_chronicles', displayName: 'Emily Woods', bio: 'Cabin lover documenting the most charming retreats in America.', location: 'Lake Arrowhead, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 92000, engagementRate: 5.9, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-13', handle: 'desert_dreams', displayName: 'Mia Santos', bio: 'Desert aesthetic curator. Joshua Tree, Palm Springs, and beyond.', location: 'Palm Springs, CA', niches: ['Design', 'Travel'], platforms: ['Instagram'], totalFollowers: 76000, engagementRate: 6.7, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  { id: 'mock-14', handle: 'urban_explorer', displayName: 'Jake Wilson', bio: 'City apartment reviews and urban getaway recommendations.', location: 'New York, NY', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok', 'YouTube'], totalFollowers: 287000, engagementRate: 4.1, minimumRate: 100000, openToGiftedStays: false, isMock: true },
  { id: 'mock-15', handle: 'boho_travels', displayName: 'Luna Martinez', bio: 'Bohemian traveler seeking unique and artistic vacation homes.', location: 'Austin, TX', niches: ['Lifestyle', 'Design'], platforms: ['Instagram'], totalFollowers: 145000, engagementRate: 5.2, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  // Adventure & Outdoors
  { id: 'mock-16', handle: 'camp_queen', displayName: 'Rachel Green', bio: 'Glamping and outdoor retreat specialist. Nature meets luxury.', location: 'Big Bear Lake, CA', niches: ['Adventure', 'Travel'], platforms: ['Instagram', 'TikTok'], totalFollowers: 167000, engagementRate: 5.6, minimumRate: 65000, openToGiftedStays: true, isMock: true },
  { id: 'mock-17', handle: 'surf_and_stay', displayName: 'Tyler Beach', bio: 'Surf travel content. Beach houses and coastal getaways.', location: 'San Diego, CA', niches: ['Adventure', 'Lifestyle'], platforms: ['YouTube', 'Instagram'], totalFollowers: 198000, engagementRate: 4.3, minimumRate: 75000, openToGiftedStays: false, isMock: true },
  { id: 'mock-18', handle: 'hike_and_home', displayName: 'Chris Mountain', bio: 'Hiking enthusiast reviewing trailside accommodations.', location: 'Denver, CO', niches: ['Adventure', 'Travel'], platforms: ['TikTok'], totalFollowers: 112000, engagementRate: 7.1, minimumRate: 50000, openToGiftedStays: true, isMock: true },
  { id: 'mock-19', handle: 'lake_life_lisa', displayName: 'Lisa Waters', bio: 'Lakefront property specialist. Docks, boats, and waterfront views.', location: 'Lake Tahoe, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 134000, engagementRate: 5.4, minimumRate: 60000, openToGiftedStays: true, isMock: true },
  { id: 'mock-20', handle: 'ski_bum_steve', displayName: 'Steve Alpine', bio: 'Ski resort and mountain lodge reviews. Winter wonderland content.', location: 'Vail, CO', niches: ['Adventure', 'Travel'], platforms: ['YouTube'], totalFollowers: 223000, engagementRate: 3.8, minimumRate: 90000, openToGiftedStays: false, isMock: true },
  // Family & Kids
  { id: 'mock-21', handle: 'family_getaways', displayName: 'The Martins', bio: 'Family travel tips and kid-friendly rental reviews.', location: 'Phoenix, AZ', niches: ['Family', 'Travel'], platforms: ['Instagram', 'YouTube'], totalFollowers: 178000, engagementRate: 4.7, minimumRate: 70000, openToGiftedStays: true, isMock: true },
  { id: 'mock-22', handle: 'mommy_travels', displayName: 'Jessica Mom', bio: 'Mom of 3 sharing family-friendly vacation rentals across the US.', location: 'Nashville, TN', niches: ['Family', 'Lifestyle'], platforms: ['TikTok', 'Instagram'], totalFollowers: 156000, engagementRate: 5.9, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  { id: 'mock-23', handle: 'dad_adventures', displayName: 'Tom Parker', bio: 'Adventure dad taking the kids to amazing vacation spots.', location: 'Chicago, IL', niches: ['Family', 'Adventure'], platforms: ['YouTube'], totalFollowers: 89000, engagementRate: 4.2, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  // Luxury & High-End
  { id: 'mock-24', handle: 'luxury_nomad', displayName: 'Victoria Luxe', bio: 'High-end travel curator. Only the finest accommodations.', location: 'Los Angeles, CA', niches: ['Luxury', 'Travel'], platforms: ['Instagram'], totalFollowers: 456000, engagementRate: 2.1, minimumRate: 200000, openToGiftedStays: false, isMock: true },
  { id: 'mock-25', handle: 'five_star_stays', displayName: 'Richard Elegant', bio: 'Five-star property reviews. Luxury without compromise.', location: 'Miami, FL', niches: ['Luxury', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 278000, engagementRate: 2.9, minimumRate: 120000, openToGiftedStays: false, isMock: true },
  { id: 'mock-26', handle: 'penthouse_pete', displayName: 'Peter Highrise', bio: 'Urban luxury apartments and penthouse reviews.', location: 'New York, NY', niches: ['Luxury', 'Design'], platforms: ['Instagram'], totalFollowers: 167000, engagementRate: 3.3, minimumRate: 95000, openToGiftedStays: false, isMock: true },
  // Vlog & YouTube
  { id: 'mock-27', handle: 'vlog_ventures', displayName: 'Danny Vlogger', bio: 'Travel vlogger documenting stays from budget to luxury.', location: 'Austin, TX', niches: ['Vlog', 'Travel'], platforms: ['YouTube', 'TikTok'], totalFollowers: 345000, engagementRate: 4.5, minimumRate: 85000, openToGiftedStays: true, isMock: true },
  { id: 'mock-28', handle: 'house_tour_hannah', displayName: 'Hannah Tours', bio: 'Property tour specialist. Full walkthrough content.', location: 'San Francisco, CA', niches: ['Vlog', 'Design'], platforms: ['YouTube'], totalFollowers: 234000, engagementRate: 3.7, minimumRate: 75000, openToGiftedStays: true, isMock: true },
  { id: 'mock-29', handle: 'review_ryan', displayName: 'Ryan Reviews', bio: 'Honest vacation rental reviews. The good, bad, and ugly.', location: 'Seattle, WA', niches: ['Vlog', 'Travel'], platforms: ['YouTube', 'Instagram'], totalFollowers: 189000, engagementRate: 4.8, minimumRate: 65000, openToGiftedStays: true, isMock: true },
  // TikTok Focused
  { id: 'mock-30', handle: 'tiktok_travels', displayName: 'Zoey Short', bio: 'Quick property tours in 60 seconds or less. TikTok specialist.', location: 'Los Angeles, CA', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok'], totalFollowers: 567000, engagementRate: 8.2, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-31', handle: 'viral_vacation', displayName: 'Max Viral', bio: 'Creating viral vacation content. Trends and transitions.', location: 'Miami, FL', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok', 'Instagram'], totalFollowers: 890000, engagementRate: 6.7, minimumRate: 80000, openToGiftedStays: false, isMock: true },
  { id: 'mock-32', handle: 'airbnb_annie', displayName: 'Annie Stays', bio: 'Airbnb tours and honest reviews. No filter, no fluff.', location: 'Portland, OR', niches: ['Travel', 'Vlog'], platforms: ['TikTok'], totalFollowers: 234000, engagementRate: 7.5, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  // Regional Specialists
  { id: 'mock-33', handle: 'florida_feels', displayName: 'Carlos Florida', bio: 'Florida vacation rental specialist. Beaches and theme parks.', location: 'Miami, FL', niches: ['Travel', 'Family'], platforms: ['Instagram', 'TikTok'], totalFollowers: 145000, engagementRate: 5.1, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  { id: 'mock-34', handle: 'texas_trips', displayName: 'Austin Local', bio: 'Texas hill country and beyond. Local insider knowledge.', location: 'Austin, TX', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 78000, engagementRate: 6.3, minimumRate: 35000, openToGiftedStays: true, isMock: true },
  { id: 'mock-35', handle: 'cali_cabins', displayName: 'Cali Cabin Girl', bio: 'California cabin specialist. Big Bear, Tahoe, and more.', location: 'Big Bear Lake, CA', niches: ['Travel', 'Adventure'], platforms: ['TikTok', 'Instagram'], totalFollowers: 167000, engagementRate: 5.8, minimumRate: 50000, openToGiftedStays: true, isMock: true },
  { id: 'mock-36', handle: 'pacific_stays', displayName: 'Kai Pacific', bio: 'Pacific Northwest retreats. Rain, forests, and cozy cabins.', location: 'Seattle, WA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 123000, engagementRate: 4.9, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  { id: 'mock-37', handle: 'southwest_sun', displayName: 'Desert Dan', bio: 'Southwest desert properties. Arizona, New Mexico, Nevada.', location: 'Phoenix, AZ', niches: ['Travel', 'Photography'], platforms: ['Instagram', 'TikTok'], totalFollowers: 98000, engagementRate: 5.4, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  // Niche Specialists
  { id: 'mock-38', handle: 'treehouse_tom', displayName: 'Tom Treehouse', bio: 'Treehouse and unique property specialist. Living the dream.', location: 'Portland, OR', niches: ['Adventure', 'Design'], platforms: ['Instagram', 'YouTube'], totalFollowers: 234000, engagementRate: 6.2, minimumRate: 70000, openToGiftedStays: true, isMock: true },
  { id: 'mock-39', handle: 'pool_party_pam', displayName: 'Pamela Poolside', bio: 'Pool and outdoor living specialist. Summer vibes year-round.', location: 'Las Vegas, NV', niches: ['Lifestyle', 'Travel'], platforms: ['TikTok', 'Instagram'], totalFollowers: 178000, engagementRate: 5.7, minimumRate: 60000, openToGiftedStays: true, isMock: true },
  { id: 'mock-40', handle: 'pet_friendly_pals', displayName: 'Pet Travelers', bio: 'Pet-friendly vacation rentals. Traveling with furry friends.', location: 'Denver, CO', niches: ['Family', 'Travel'], platforms: ['Instagram', 'TikTok'], totalFollowers: 145000, engagementRate: 6.8, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-41', handle: 'remote_work_rachel', displayName: 'Rachel Remote', bio: 'Work from anywhere. Best rentals for digital nomads.', location: 'Austin, TX', niches: ['Lifestyle', 'Travel'], platforms: ['Instagram'], totalFollowers: 112000, engagementRate: 5.3, minimumRate: 50000, openToGiftedStays: true, isMock: true },
  { id: 'mock-42', handle: 'honeymoon_haven', displayName: 'Romantic Retreats', bio: 'Romantic getaways and honeymoon destinations.', location: 'San Diego, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 167000, engagementRate: 4.6, minimumRate: 65000, openToGiftedStays: false, isMock: true },
  // More Variety
  { id: 'mock-43', handle: 'minimal_mike', displayName: 'Mike Minimal', bio: 'Minimalist design appreciation. Clean lines, clear minds.', location: 'San Francisco, CA', niches: ['Minimal', 'Design'], platforms: ['Instagram'], totalFollowers: 89000, engagementRate: 5.9, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  { id: 'mock-44', handle: 'historic_homes', displayName: 'History Hunter', bio: 'Historic properties and heritage stays. Stories in every wall.', location: 'Boston, MA', niches: ['Travel', 'Design'], platforms: ['Instagram', 'YouTube'], totalFollowers: 134000, engagementRate: 4.4, minimumRate: 60000, openToGiftedStays: true, isMock: true },
  { id: 'mock-45', handle: 'farm_stays', displayName: 'Farm Fresh Fiona', bio: 'Farm stays and agritourism properties. Country living.', location: 'Nashville, TN', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok', 'Instagram'], totalFollowers: 98000, engagementRate: 6.5, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  { id: 'mock-46', handle: 'couple_goals_travel', displayName: 'Couple Goals', bio: 'Couples travel content. Romantic stays for two.', location: 'Los Angeles, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 245000, engagementRate: 5.1, minimumRate: 70000, openToGiftedStays: true, isMock: true },
  { id: 'mock-47', handle: 'budget_traveler', displayName: 'Budget Ben', bio: 'Affordable vacation rentals. Great stays, small budgets.', location: 'Chicago, IL', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok', 'YouTube'], totalFollowers: 178000, engagementRate: 6.8, minimumRate: 25000, openToGiftedStays: true, isMock: true },
  { id: 'mock-48', handle: 'eco_escapes', displayName: 'Eco Emma', bio: 'Sustainable and eco-friendly vacation rentals.', location: 'Portland, OR', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 112000, engagementRate: 5.7, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-49', handle: 'senior_stays', displayName: 'Golden Travelers', bio: 'Vacation rentals for mature travelers. Accessibility matters.', location: 'Phoenix, AZ', niches: ['Travel', 'Family'], platforms: ['YouTube', 'Instagram'], totalFollowers: 67000, engagementRate: 4.2, minimumRate: 35000, openToGiftedStays: true, isMock: true },
  { id: 'mock-50', handle: 'bachelorette_bash', displayName: 'Party Planner Penny', bio: 'Bachelorette and group trip properties. Party-ready places.', location: 'Las Vegas, NV', niches: ['Lifestyle', 'Travel'], platforms: ['TikTok', 'Instagram'], totalFollowers: 189000, engagementRate: 7.1, minimumRate: 55000, openToGiftedStays: false, isMock: true },
  { id: 'mock-51', handle: 'golf_getaways', displayName: 'Golf Greg', bio: 'Golf course adjacent properties and resort reviews.', location: 'Scottsdale, AZ', niches: ['Luxury', 'Travel'], platforms: ['Instagram', 'YouTube'], totalFollowers: 98000, engagementRate: 3.8, minimumRate: 65000, openToGiftedStays: false, isMock: true },
  { id: 'mock-52', handle: 'spa_retreat', displayName: 'Spa Sarah', bio: 'Wellness retreats and spa properties. Relaxation focused.', location: 'San Diego, CA', niches: ['Luxury', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 145000, engagementRate: 4.5, minimumRate: 75000, openToGiftedStays: true, isMock: true },
  { id: 'mock-53', handle: 'music_city_stays', displayName: 'Nashville Nick', bio: 'Music city vacation rentals. Nashville and beyond.', location: 'Nashville, TN', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok', 'Instagram'], totalFollowers: 123000, engagementRate: 5.9, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-54', handle: 'photo_worthy_stays', displayName: 'Insta Interiors', bio: 'Most photogenic vacation rentals. Instagram-ready spaces.', location: 'Los Angeles, CA', niches: ['Photography', 'Design'], platforms: ['Instagram'], totalFollowers: 267000, engagementRate: 4.8, minimumRate: 80000, openToGiftedStays: true, isMock: true },
  { id: 'mock-55', handle: 'wine_country', displayName: 'Vineyard Vicky', bio: 'Wine country properties. Napa, Sonoma, and beyond.', location: 'Napa, CA', niches: ['Luxury', 'Travel'], platforms: ['Instagram', 'TikTok'], totalFollowers: 156000, engagementRate: 4.3, minimumRate: 70000, openToGiftedStays: true, isMock: true },
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
    
    // Always include mock data for beta - filter mock creators
    let filteredMocks = [...MOCK_CREATORS]
    
    if (query) {
      const q = query.toLowerCase()
      filteredMocks = filteredMocks.filter(c => 
        c.displayName.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      )
    }
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
    
    // Combine real creators first, then mock creators
    const allCreators = [...formattedCreators, ...filteredMocks]

    return NextResponse.json({
      creators: allCreators,
      pagination: {
        page,
        limit,
        total: allCreators.length,
        pages: Math.ceil(allCreators.length / limit),
      },
      isMockData: filteredMocks.length > 0,
    })
  } catch (error) {
    console.error('[Creators Search API] Error:', error)
    return NextResponse.json({ error: 'Failed to search creators' }, { status: 500 })
  }
}
