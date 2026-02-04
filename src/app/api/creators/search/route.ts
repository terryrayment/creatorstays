import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isLaunchMode } from '@/lib/feature-flags'
import { TrustTier } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Mock creators for demo purposes - 60 sample creators
// Heavy concentration in Lake Arrowhead, Big Bear, and Los Angeles area
const MOCK_CREATORS = [
  // ============ LAKE ARROWHEAD / BIG BEAR SPECIALISTS (15 creators) ============
  { id: 'mock-1', handle: 'cabin_chronicles', displayName: 'Emily Woods', bio: 'Cabin lover documenting the most charming mountain retreats in Southern California.', location: 'Lake Arrowhead, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 92000, engagementRate: 5.9, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-2', handle: 'arrowhead_adventures', displayName: 'Jake Mountain', bio: 'Lake Arrowhead local sharing hidden gems and cozy cabin stays.', location: 'Lake Arrowhead, CA', niches: ['Adventure', 'Travel'], platforms: ['Instagram', 'YouTube'], totalFollowers: 78000, engagementRate: 6.4, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  { id: 'mock-3', handle: 'camp_queen', displayName: 'Rachel Green', bio: 'Glamping and outdoor retreat specialist. Nature meets luxury in Big Bear.', location: 'Big Bear Lake, CA', niches: ['Adventure', 'Travel'], platforms: ['Instagram', 'TikTok'], totalFollowers: 167000, engagementRate: 5.6, minimumRate: 65000, openToGiftedStays: true, isMock: true },
  { id: 'mock-4', handle: 'cali_cabins', displayName: 'Cali Cabin Girl', bio: 'California cabin specialist. Big Bear, Lake Arrowhead, and mountain escapes.', location: 'Big Bear Lake, CA', niches: ['Travel', 'Adventure'], platforms: ['TikTok', 'Instagram'], totalFollowers: 167000, engagementRate: 5.8, minimumRate: 50000, openToGiftedStays: true, isMock: true },
  { id: 'mock-5', handle: 'mountain_mornings', displayName: 'Sierra Dawn', bio: 'Sunrise hikes and mountain cabin content. Living the alpine dream.', location: 'Lake Arrowhead, CA', niches: ['Adventure', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 54000, engagementRate: 7.2, minimumRate: 35000, openToGiftedStays: true, isMock: true },
  { id: 'mock-6', handle: 'bear_country_blake', displayName: 'Blake Harrison', bio: 'Big Bear skiing, hiking, and cabin life year-round.', location: 'Big Bear Lake, CA', niches: ['Adventure', 'Travel'], platforms: ['YouTube', 'Instagram'], totalFollowers: 123000, engagementRate: 4.9, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  { id: 'mock-7', handle: 'pine_and_ponder', displayName: 'Willow Bennett', bio: 'Slow living in the San Bernardino Mountains. Cabin aesthetics and forest bathing.', location: 'Lake Arrowhead, CA', niches: ['Lifestyle', 'Design'], platforms: ['Instagram', 'TikTok'], totalFollowers: 89000, engagementRate: 6.1, minimumRate: 42000, openToGiftedStays: true, isMock: true },
  { id: 'mock-8', handle: 'snow_summit_sam', displayName: 'Sam Winters', bio: 'Ski season specialist. Big Bear slopes and après-ski cabin vibes.', location: 'Big Bear Lake, CA', niches: ['Adventure', 'Travel'], platforms: ['TikTok', 'YouTube'], totalFollowers: 145000, engagementRate: 5.3, minimumRate: 60000, openToGiftedStays: false, isMock: true },
  { id: 'mock-9', handle: 'lakeside_luna', displayName: 'Luna Shores', bio: 'Lake Arrowhead waterfront properties and boat dock living.', location: 'Lake Arrowhead, CA', niches: ['Travel', 'Luxury'], platforms: ['Instagram'], totalFollowers: 67000, engagementRate: 5.7, minimumRate: 38000, openToGiftedStays: true, isMock: true },
  { id: 'mock-10', handle: 'cozy_cabin_couple', displayName: 'The Carsons', bio: 'Married duo reviewing romantic mountain getaways in Big Bear and Arrowhead.', location: 'Big Bear Lake, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 112000, engagementRate: 6.8, minimumRate: 52000, openToGiftedStays: true, isMock: true },
  { id: 'mock-11', handle: 'forest_finds', displayName: 'Aspen Taylor', bio: 'Unique A-frames and treehouses in the San Bernardino National Forest.', location: 'Lake Arrowhead, CA', niches: ['Design', 'Adventure'], platforms: ['Instagram', 'YouTube'], totalFollowers: 98000, engagementRate: 5.4, minimumRate: 48000, openToGiftedStays: true, isMock: true },
  { id: 'mock-12', handle: 'big_bear_fam', displayName: 'The Hendersons', bio: 'Family of 4 sharing kid-friendly cabin adventures in Big Bear.', location: 'Big Bear Lake, CA', niches: ['Family', 'Travel'], platforms: ['YouTube', 'Instagram'], totalFollowers: 156000, engagementRate: 4.5, minimumRate: 65000, openToGiftedStays: true, isMock: true },
  { id: 'mock-13', handle: 'rim_of_world', displayName: 'Chris Ridgeline', bio: 'Scenic Route 18 explorer. Mountain communities from Crestline to Running Springs.', location: 'Lake Arrowhead, CA', niches: ['Travel', 'Photography'], platforms: ['Instagram'], totalFollowers: 45000, engagementRate: 7.8, minimumRate: 30000, openToGiftedStays: true, isMock: true },
  { id: 'mock-14', handle: 'alpine_aesthetics', displayName: 'Megan Frost', bio: 'Interior-focused cabin content. Styling mountain rentals for the gram.', location: 'Big Bear Lake, CA', niches: ['Design', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 134000, engagementRate: 6.2, minimumRate: 58000, openToGiftedStays: true, isMock: true },
  { id: 'mock-15', handle: 'mountain_mutt_mom', displayName: 'Kelsey Trails', bio: 'Dog-friendly cabin stays in Lake Arrowhead. Hiking with huskies.', location: 'Lake Arrowhead, CA', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok', 'Instagram'], totalFollowers: 87000, engagementRate: 8.1, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  
  // ============ LOS ANGELES AREA (15 creators) ============
  { id: 'mock-16', handle: 'wanderlust_jane', displayName: 'Jane Wanderlust', bio: 'Travel photographer capturing hidden gems across Southern California.', location: 'Los Angeles, CA', niches: ['Travel', 'Photography'], platforms: ['Instagram', 'TikTok'], totalFollowers: 85000, engagementRate: 4.2, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  { id: 'mock-17', handle: 'lens_and_lux', displayName: 'David Chen', bio: 'Architectural photographer specializing in vacation rental photography.', location: 'Los Angeles, CA', niches: ['Photography', 'Design'], platforms: ['Instagram'], totalFollowers: 124000, engagementRate: 3.4, minimumRate: 85000, openToGiftedStays: false, isMock: true },
  { id: 'mock-18', handle: 'luxury_nomad', displayName: 'Victoria Luxe', bio: 'High-end travel curator. Only the finest LA accommodations.', location: 'Los Angeles, CA', niches: ['Luxury', 'Travel'], platforms: ['Instagram'], totalFollowers: 456000, engagementRate: 2.1, minimumRate: 200000, openToGiftedStays: false, isMock: true },
  { id: 'mock-19', handle: 'tiktok_travels', displayName: 'Zoey Short', bio: 'Quick property tours in 60 seconds or less. TikTok specialist.', location: 'Los Angeles, CA', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok'], totalFollowers: 567000, engagementRate: 8.2, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-20', handle: 'la_living', displayName: 'Marcus Cole', bio: 'LA lifestyle and Airbnb tours. From Venice Beach to the Hollywood Hills.', location: 'Los Angeles, CA', niches: ['Lifestyle', 'Travel'], platforms: ['Instagram', 'YouTube'], totalFollowers: 234000, engagementRate: 4.7, minimumRate: 75000, openToGiftedStays: false, isMock: true },
  { id: 'mock-21', handle: 'silverlake_stays', displayName: 'Indie Amy', bio: 'Boutique rentals in Silverlake, Echo Park, and Highland Park.', location: 'Los Angeles, CA', niches: ['Design', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 67000, engagementRate: 6.3, minimumRate: 38000, openToGiftedStays: true, isMock: true },
  { id: 'mock-22', handle: 'malibu_maven', displayName: 'Brooke Waters', bio: 'Malibu beach houses and oceanfront escapes. California dreaming.', location: 'Malibu, CA', niches: ['Luxury', 'Travel'], platforms: ['Instagram', 'TikTok'], totalFollowers: 198000, engagementRate: 3.9, minimumRate: 90000, openToGiftedStays: false, isMock: true },
  { id: 'mock-23', handle: 'pasadena_pad', displayName: 'Historic Henry', bio: 'Historic homes and craftsman bungalows in Pasadena and surrounds.', location: 'Pasadena, CA', niches: ['Design', 'Travel'], platforms: ['Instagram', 'YouTube'], totalFollowers: 78000, engagementRate: 5.1, minimumRate: 42000, openToGiftedStays: true, isMock: true },
  { id: 'mock-24', handle: 'hollywood_hideaways', displayName: 'Star Gazer Sam', bio: 'Celebrity-worthy rentals in the Hollywood Hills and Laurel Canyon.', location: 'Los Angeles, CA', niches: ['Luxury', 'Lifestyle'], platforms: ['TikTok', 'Instagram'], totalFollowers: 312000, engagementRate: 5.4, minimumRate: 95000, openToGiftedStays: false, isMock: true },
  { id: 'mock-25', handle: 'dtla_digs', displayName: 'Urban Elle', bio: 'Downtown LA lofts and Arts District finds. City living at its finest.', location: 'Los Angeles, CA', niches: ['Design', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 89000, engagementRate: 5.8, minimumRate: 48000, openToGiftedStays: true, isMock: true },
  { id: 'mock-26', handle: 'long_beach_local', displayName: 'Marina Mike', bio: 'Long Beach and San Pedro waterfront properties. Harbor vibes.', location: 'Long Beach, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 56000, engagementRate: 6.7, minimumRate: 35000, openToGiftedStays: true, isMock: true },
  { id: 'mock-27', handle: 'santa_monica_sun', displayName: 'Beach Bella', bio: 'Santa Monica and Venice Beach rentals. Ocean breezes and boardwalks.', location: 'Santa Monica, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 145000, engagementRate: 4.4, minimumRate: 62000, openToGiftedStays: true, isMock: true },
  { id: 'mock-28', handle: 'burbank_bound', displayName: 'Studio City Steve', bio: 'Valley rentals near Universal and Warner Bros. Entertainment industry insider.', location: 'Burbank, CA', niches: ['Travel', 'Lifestyle'], platforms: ['YouTube', 'Instagram'], totalFollowers: 67000, engagementRate: 5.2, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  { id: 'mock-29', handle: 'socal_escapes', displayName: 'Jenny Pacific', bio: 'Weekend getaways from LA. Mountains, desert, and beaches.', location: 'Los Angeles, CA', niches: ['Travel', 'Adventure'], platforms: ['TikTok', 'Instagram'], totalFollowers: 178000, engagementRate: 6.1, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  { id: 'mock-30', handle: 'pool_party_la', displayName: 'Summer Ray', bio: 'LA homes with the best pools. Backyard paradise content.', location: 'Los Angeles, CA', niches: ['Lifestyle', 'Luxury'], platforms: ['TikTok', 'Instagram'], totalFollowers: 234000, engagementRate: 7.3, minimumRate: 68000, openToGiftedStays: true, isMock: true },
  
  // ============ OTHER SOUTHERN CALIFORNIA (8 creators) ============
  { id: 'mock-31', handle: 'desert_dreams', displayName: 'Mia Santos', bio: 'Desert aesthetic curator. Joshua Tree, Palm Springs, and beyond.', location: 'Palm Springs, CA', niches: ['Design', 'Travel'], platforms: ['Instagram'], totalFollowers: 76000, engagementRate: 6.7, minimumRate: 40000, openToGiftedStays: true, isMock: true },
  { id: 'mock-32', handle: 'foodie_adventures', displayName: 'Alex Rivera', bio: 'Traveling foodie exploring local cuisines at vacation destinations.', location: 'San Diego, CA', niches: ['Food', 'Travel'], platforms: ['Instagram', 'TikTok'], totalFollowers: 156000, engagementRate: 5.1, minimumRate: 60000, openToGiftedStays: true, isMock: true },
  { id: 'mock-33', handle: 'surf_and_stay', displayName: 'Tyler Beach', bio: 'Surf travel content. Beach houses and coastal getaways.', location: 'San Diego, CA', niches: ['Adventure', 'Lifestyle'], platforms: ['YouTube', 'Instagram'], totalFollowers: 198000, engagementRate: 4.3, minimumRate: 75000, openToGiftedStays: false, isMock: true },
  { id: 'mock-34', handle: 'honeymoon_haven', displayName: 'Romantic Retreats', bio: 'Romantic getaways and honeymoon destinations in SoCal.', location: 'San Diego, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 167000, engagementRate: 4.6, minimumRate: 65000, openToGiftedStays: false, isMock: true },
  { id: 'mock-35', handle: 'jtree_julie', displayName: 'Julie Yucca', bio: 'Joshua Tree specialist. Desert modern and stargazing spots.', location: 'Joshua Tree, CA', niches: ['Design', 'Adventure'], platforms: ['Instagram'], totalFollowers: 112000, engagementRate: 5.9, minimumRate: 52000, openToGiftedStays: true, isMock: true },
  { id: 'mock-36', handle: 'temecula_wine', displayName: 'Vineyard Vicky', bio: 'Wine country escapes in Temecula Valley. Sip and stay content.', location: 'Temecula, CA', niches: ['Food', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 89000, engagementRate: 6.4, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-37', handle: 'orange_county_oasis', displayName: 'Newport Nate', bio: 'Orange County beach rentals from Laguna to Huntington.', location: 'Newport Beach, CA', niches: ['Luxury', 'Travel'], platforms: ['Instagram'], totalFollowers: 134000, engagementRate: 4.1, minimumRate: 70000, openToGiftedStays: false, isMock: true },
  { id: 'mock-38', handle: 'catalina_calling', displayName: 'Island Iris', bio: 'Catalina Island getaways. Ferry over for the perfect escape.', location: 'Avalon, CA', niches: ['Travel', 'Adventure'], platforms: ['TikTok', 'Instagram'], totalFollowers: 67000, engagementRate: 7.2, minimumRate: 38000, openToGiftedStays: true, isMock: true },
  
  // ============ NATIONAL - DIVERSE CITIES (22 creators) ============
  { id: 'mock-39', handle: 'nomad_mike', displayName: 'Mike Chen', bio: 'Full-time van lifer & content creator. Finding unique stays coast to coast.', location: 'Austin, TX', niches: ['Travel', 'Adventure'], platforms: ['YouTube', 'Instagram'], totalFollowers: 142000, engagementRate: 5.8, minimumRate: 75000, openToGiftedStays: false, isMock: true },
  { id: 'mock-40', handle: 'cozy_corners', displayName: 'Sarah Mitchell', bio: 'Interior design enthusiast showcasing the coziest vacation rentals.', location: 'Denver, CO', niches: ['Design', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 67000, engagementRate: 6.1, minimumRate: 35000, openToGiftedStays: true, isMock: true },
  { id: 'mock-41', handle: 'adventure_fam', displayName: 'The Johnsons', bio: 'Family of 5 sharing adventures in family-friendly vacation rentals.', location: 'Nashville, TN', niches: ['Family', 'Travel'], platforms: ['Instagram', 'TikTok', 'YouTube'], totalFollowers: 210000, engagementRate: 3.9, minimumRate: 95000, openToGiftedStays: false, isMock: true },
  { id: 'mock-42', handle: 'urban_explorer', displayName: 'Jake Wilson', bio: 'City apartment reviews and urban getaway recommendations.', location: 'New York, NY', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok', 'YouTube'], totalFollowers: 287000, engagementRate: 4.1, minimumRate: 100000, openToGiftedStays: false, isMock: true },
  { id: 'mock-43', handle: 'beach_babe_bri', displayName: 'Brianna Scott', bio: 'Beach lifestyle content creator. Ocean views and sandy toes.', location: 'Miami, FL', niches: ['Lifestyle', 'Travel'], platforms: ['Instagram'], totalFollowers: 89000, engagementRate: 4.8, minimumRate: 50000, openToGiftedStays: true, isMock: true },
  { id: 'mock-44', handle: 'solo_sarah', displayName: 'Sarah Kim', bio: 'Solo female traveler sharing safe and beautiful stays worldwide.', location: 'Seattle, WA', niches: ['Travel', 'Lifestyle'], platforms: ['TikTok', 'Instagram'], totalFollowers: 234000, engagementRate: 6.3, minimumRate: 70000, openToGiftedStays: true, isMock: true },
  { id: 'mock-45', handle: 'tiny_house_tina', displayName: 'Tina Park', bio: 'Tiny house enthusiast and minimalist traveler. Less is more!', location: 'Portland, OR', niches: ['Minimal', 'Design'], platforms: ['TikTok', 'Instagram'], totalFollowers: 98000, engagementRate: 7.2, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-46', handle: 'mountain_mike', displayName: 'Mike Thompson', bio: 'Mountain retreat specialist. Ski lodges, cabins, and alpine adventures.', location: 'Denver, CO', niches: ['Adventure', 'Travel'], platforms: ['YouTube', 'Instagram'], totalFollowers: 178000, engagementRate: 4.5, minimumRate: 80000, openToGiftedStays: false, isMock: true },
  { id: 'mock-47', handle: 'lake_life_lisa', displayName: 'Lisa Waters', bio: 'Lakefront property specialist. Docks, boats, and waterfront views.', location: 'Lake Tahoe, CA', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 134000, engagementRate: 5.4, minimumRate: 60000, openToGiftedStays: true, isMock: true },
  { id: 'mock-48', handle: 'ski_bum_steve', displayName: 'Steve Alpine', bio: 'Ski resort and mountain lodge reviews. Winter wonderland content.', location: 'Vail, CO', niches: ['Adventure', 'Travel'], platforms: ['YouTube'], totalFollowers: 223000, engagementRate: 3.8, minimumRate: 90000, openToGiftedStays: false, isMock: true },
  { id: 'mock-49', handle: 'mommy_travels', displayName: 'Jessica Hayes', bio: 'Mom of 3 sharing family-friendly vacation rentals across the US.', location: 'Charlotte, NC', niches: ['Family', 'Lifestyle'], platforms: ['TikTok', 'Instagram'], totalFollowers: 156000, engagementRate: 5.9, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  { id: 'mock-50', handle: 'penthouse_pete', displayName: 'Peter Highrise', bio: 'Urban luxury apartments and penthouse reviews.', location: 'Chicago, IL', niches: ['Luxury', 'Design'], platforms: ['Instagram'], totalFollowers: 167000, engagementRate: 3.3, minimumRate: 95000, openToGiftedStays: false, isMock: true },
  { id: 'mock-51', handle: 'vlog_ventures', displayName: 'Danny Vlogger', bio: 'Travel vlogger documenting stays from budget to luxury.', location: 'Atlanta, GA', niches: ['Vlog', 'Travel'], platforms: ['YouTube', 'TikTok'], totalFollowers: 345000, engagementRate: 4.5, minimumRate: 85000, openToGiftedStays: true, isMock: true },
  { id: 'mock-52', handle: 'pacific_stays', displayName: 'Kai Pacific', bio: 'Pacific Northwest retreats. Rain, forests, and cozy cabins.', location: 'Portland, OR', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram'], totalFollowers: 123000, engagementRate: 4.9, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  { id: 'mock-53', handle: 'florida_feels', displayName: 'Carlos Florida', bio: 'Florida vacation rental specialist. Beaches and theme parks.', location: 'Orlando, FL', niches: ['Travel', 'Family'], platforms: ['Instagram', 'TikTok'], totalFollowers: 145000, engagementRate: 5.1, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  { id: 'mock-54', handle: 'boho_travels', displayName: 'Luna Martinez', bio: 'Bohemian traveler seeking unique and artistic vacation homes.', location: 'Santa Fe, NM', niches: ['Lifestyle', 'Design'], platforms: ['Instagram'], totalFollowers: 145000, engagementRate: 5.2, minimumRate: 55000, openToGiftedStays: true, isMock: true },
  { id: 'mock-55', handle: 'treehouse_tom', displayName: 'Tom Treehouse', bio: 'Treehouse and unique property specialist. Living the dream.', location: 'Asheville, NC', niches: ['Adventure', 'Design'], platforms: ['Instagram', 'YouTube'], totalFollowers: 234000, engagementRate: 6.2, minimumRate: 70000, openToGiftedStays: true, isMock: true },
  { id: 'mock-56', handle: 'southwest_sun', displayName: 'Desert Dan', bio: 'Southwest desert properties. Arizona, New Mexico, Nevada.', location: 'Phoenix, AZ', niches: ['Travel', 'Photography'], platforms: ['Instagram', 'TikTok'], totalFollowers: 98000, engagementRate: 5.4, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-57', handle: 'pool_party_pam', displayName: 'Pamela Poolside', bio: 'Pool and outdoor living specialist. Summer vibes year-round.', location: 'Las Vegas, NV', niches: ['Lifestyle', 'Travel'], platforms: ['TikTok', 'Instagram'], totalFollowers: 178000, engagementRate: 5.7, minimumRate: 60000, openToGiftedStays: true, isMock: true },
  { id: 'mock-58', handle: 'pet_friendly_pals', displayName: 'Pet Travelers', bio: 'Pet-friendly vacation rentals. Traveling with furry friends.', location: 'Bend, OR', niches: ['Family', 'Travel'], platforms: ['Instagram', 'TikTok'], totalFollowers: 145000, engagementRate: 6.8, minimumRate: 45000, openToGiftedStays: true, isMock: true },
  { id: 'mock-59', handle: 'remote_work_rachel', displayName: 'Rachel Remote', bio: 'Work from anywhere. Best rentals for digital nomads.', location: 'Savannah, GA', niches: ['Lifestyle', 'Travel'], platforms: ['Instagram'], totalFollowers: 112000, engagementRate: 5.3, minimumRate: 50000, openToGiftedStays: true, isMock: true },
  { id: 'mock-60', handle: 'coastal_carolina', displayName: 'Charleston Charlie', bio: 'Lowcountry charm and coastal Carolina vacation homes.', location: 'Charleston, SC', niches: ['Travel', 'Lifestyle'], platforms: ['Instagram', 'TikTok'], totalFollowers: 89000, engagementRate: 6.1, minimumRate: 42000, openToGiftedStays: true, isMock: true },
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

    // ========================================================================
    // BETA MODE: Return mock data only
    // LAUNCH MODE: Return real creators from database
    // ========================================================================
    if (isLaunchMode()) {
      // LAUNCH MODE: Query real creator profiles
      const where: any = {
        isActive: true,
        isPublic: true, // Only show creators who have opted into discovery
        onboardingComplete: true,
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
          where.instagramConnected = true
        } else if (platform === 'TikTok') {
          where.tiktokConnected = true
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
      // Trust tier ordering: PROVEN > VERIFIED > NEW
      // We use a combination of trust tier + secondary sort
      let orderBy: any[] = []
      
      // Always add trust tier as primary sort (PROVEN first, then VERIFIED, then NEW)
      // Prisma sorts enums alphabetically, but we want: PROVEN > VERIFIED > NEW
      // Since Prisma doesn't support custom enum ordering directly,
      // we'll handle this with a raw query or post-sort
      // For now, we'll use the standard Prisma approach and note the limitation
      
      switch (sortBy) {
        case 'followers_high':
          orderBy = [{ totalFollowers: 'desc' }]
          break
        case 'followers_low':
          orderBy = [{ totalFollowers: 'asc' }]
          break
        case 'engagement_high':
          orderBy = [{ engagementRate: 'desc' }]
          break
        case 'newest':
          orderBy = [{ createdAt: 'desc' }]
          break
        case 'trust':
          // Trust-first sorting - will be handled in post-processing
          orderBy = [{ totalFollowers: 'desc' }]
          break
        default:
          // Default: relevance = trust tier weighted, then followers
          orderBy = [{ totalFollowers: 'desc' }]
      }

      // Get total count
      const total = await prisma.creatorProfile.count({ where })

      // Get creators (fetch more than needed for trust-based reordering)
      const fetchLimit = sortBy === 'trust' || sortBy === 'relevance' ? limit * 3 : limit
      let creators = await prisma.creatorProfile.findMany({
        where,
        orderBy,
        skip: sortBy === 'trust' || sortBy === 'relevance' ? 0 : (page - 1) * limit,
        take: sortBy === 'trust' || sortBy === 'relevance' ? Math.min(fetchLimit, total) : limit,
        select: {
          id: true,
          handle: true,
          displayName: true,
          bio: true,
          location: true,
          avatarUrl: true,
          niches: true,
          instagramHandle: true,
          instagramConnected: true,
          instagramFollowers: true,
          tiktokHandle: true,
          tiktokConnected: true,
          tiktokFollowers: true,
          youtubeHandle: true,
          youtubeSubscribers: true,
          totalFollowers: true,
          engagementRate: true,
          minimumFlatFee: true,
          openToGiftedStays: true,
          deliverables: true,
          isVerified: true,
          trustTier: true,
          readinessState: true,
        },
      })

      // Apply trust tier sorting for 'trust' and 'relevance' sort modes
      // PROVEN > VERIFIED > NEW
      if (sortBy === 'trust' || sortBy === 'relevance' || !sortBy) {
        const tierOrder: Record<TrustTier, number> = {
          [TrustTier.PROVEN]: 0,
          [TrustTier.VERIFIED]: 1,
          [TrustTier.NEW]: 2,
        }
        
        creators = creators.sort((a, b) => {
          // Primary sort by trust tier
          const tierDiff = tierOrder[a.trustTier] - tierOrder[b.trustTier]
          if (tierDiff !== 0) return tierDiff
          
          // Secondary sort by followers (desc)
          return (b.totalFollowers || 0) - (a.totalFollowers || 0)
        })
        
        // Apply pagination after sorting
        const startIndex = (page - 1) * limit
        creators = creators.slice(startIndex, startIndex + limit)
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
          c.instagramConnected ? 'Instagram' : null,
          c.tiktokConnected ? 'TikTok' : null,
          c.youtubeHandle ? 'YouTube' : null,
        ].filter(Boolean),
        totalFollowers: c.totalFollowers,
        engagementRate: c.engagementRate,
        minimumRate: c.minimumFlatFee,
        openToGiftedStays: c.openToGiftedStays,
        deliverables: c.deliverables,
        isVerified: c.isVerified,
        trustTier: c.trustTier,
        readinessState: c.readinessState,
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
    }

    // ========================================================================
    // BETA MODE: Return mock creators only (no real user data)
    // ========================================================================
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
    
    // Sort mock data
    switch (sortBy) {
      case 'followers_high':
        filteredMocks.sort((a, b) => b.totalFollowers - a.totalFollowers)
        break
      case 'followers_low':
        filteredMocks.sort((a, b) => a.totalFollowers - b.totalFollowers)
        break
      case 'engagement_high':
        filteredMocks.sort((a, b) => b.engagementRate - a.engagementRate)
        break
    }

    // Paginate
    const startIndex = (page - 1) * limit
    const paginatedMocks = filteredMocks.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      creators: paginatedMocks,
      pagination: {
        page,
        limit,
        total: filteredMocks.length,
        pages: Math.ceil(filteredMocks.length / limit),
      },
      isMockData: true,
    })
  } catch (error) {
    console.error('[Creators Search API] Error:', error)
    return NextResponse.json({ error: 'Failed to search creators' }, { status: 500 })
  }
}
