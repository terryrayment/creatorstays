// Types for the collaboration system

export interface Creator {
  id: string
  handle: string
  displayName: string
  avatar?: string
  niches: string[]
  location: string
  platforms: {
    instagram?: string
    tiktok?: string
    youtube?: string
  }
  // Creator-set pricing
  defaultAffiliatePercent: number // e.g., 10 = 10%
  minimumFlatFee?: number
  openToPostForStay: boolean
  deliverables: string[]
}

export interface Host {
  id: string
  displayName: string
  email: string
  location: string
  properties: Property[]
}

export interface Property {
  id: string
  hostId: string
  title: string
  listingUrl: string
  neighborhood: string
  priceRange: string
  photoUrls: string[]
}

export interface CollaborationRequest {
  id: string
  hostId: string
  creatorId: string
  propertyId: string
  
  // Host's proposed terms
  proposedType: 'affiliate' | 'flat' | 'post-for-stay'
  proposedPercent?: number
  proposedFlatFee?: number
  message: string
  deliverables: string[]
  
  status: 'pending' | 'approved' | 'countered' | 'declined' | 'expired'
  
  // Creator's counter (if any)
  counterPercent?: number
  counterFlatFee?: number
  counterMessage?: string
  
  createdAt: Date
  respondedAt?: Date
}

export interface Collaboration {
  id: string
  requestId: string
  hostId: string
  creatorId: string
  propertyId: string
  
  // Final agreed terms
  dealType: 'affiliate' | 'flat' | 'post-for-stay'
  affiliatePercent?: number
  flatFee?: number
  deliverables: string[]
  
  // Unique affiliate link for this collaboration
  affiliateToken: string
  affiliateUrl: string
  
  // Status
  status: 'active' | 'content-submitted' | 'completed' | 'cancelled'
  contentLinks: string[] // URLs to posted content
  
  // Payment tracking (off-platform)
  paymentStatus: 'pending' | 'settled'
  paymentNotes?: string
  
  createdAt: Date
  completedAt?: Date
}

export interface Click {
  id: string
  collaborationId: string
  affiliateToken: string
  
  clickedAt: Date
  visitorId: string // hashed/anonymous
  isUnique: boolean
  isRevisit: boolean
  
  // Metadata
  device?: string
  country?: string
  referer?: string
}

export interface CollaborationAnalytics {
  collaborationId: string
  totalClicks: number
  uniqueClicks: number
  revisits: number
  clicksByDay: { date: string; clicks: number }[]
  clicksByDevice: { device: string; count: number }[]
  lastClickAt?: Date
}

// ============================================================================
// MOCK DATA STORE (replace with Prisma later)
// ============================================================================

export const mockCreators: Creator[] = [
  {
    id: 'creator-1',
    handle: 'wanderlust_amy',
    displayName: 'Amy Chen',
    niches: ['Travel', 'Lifestyle'],
    location: 'Los Angeles, CA',
    platforms: { instagram: '@wanderlust_amy', tiktok: '@amychen' },
    defaultAffiliatePercent: 12,
    minimumFlatFee: 500,
    openToPostForStay: true,
    deliverables: ['2 Reels', '5 Stories', '1 Feed Post'],
  },
  {
    id: 'creator-2',
    handle: 'photo_marcus',
    displayName: 'Marcus Webb',
    niches: ['Photography', 'Adventure'],
    location: 'Denver, CO',
    platforms: { instagram: '@photo_marcus', youtube: 'MarcusWebb' },
    defaultAffiliatePercent: 15,
    minimumFlatFee: 750,
    openToPostForStay: true,
    deliverables: ['10 Photos', '1 Reel', '3 Stories'],
  },
  {
    id: 'creator-3',
    handle: 'cozy_interiors',
    displayName: 'Sarah Park',
    niches: ['Interior Design', 'Lifestyle'],
    location: 'Austin, TX',
    platforms: { instagram: '@cozy_interiors', tiktok: '@sarahpark' },
    defaultAffiliatePercent: 10,
    openToPostForStay: false,
    deliverables: ['1 Reel', '3 Stories', 'Room Tour'],
  },
]

export const mockHosts: Host[] = [
  {
    id: 'host-1',
    displayName: 'Mountain View Retreats',
    email: 'host@example.com',
    location: 'Big Bear, CA',
    properties: [
      {
        id: 'prop-1',
        hostId: 'host-1',
        title: 'Cozy A-Frame Cabin',
        listingUrl: 'https://airbnb.com/rooms/12345',
        neighborhood: 'Big Bear Lake',
        priceRange: '$180-250',
        photoUrls: [],
      }
    ],
  },
]

// In-memory stores (would be database in production)
export const collaborationRequests: CollaborationRequest[] = []
export const collaborations: Collaboration[] = []
export const clicks: Click[] = []

// Helper to generate tokens
export function generateToken(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}
