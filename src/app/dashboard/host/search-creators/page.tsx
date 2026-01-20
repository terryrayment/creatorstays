"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Container } from "@/components/layout/container"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { SendOfferModal } from "@/components/hosts/send-offer-modal"

// Toast notification
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border-2 border-black bg-[#28D17C] px-4 py-3 shadow-lg">
      <span className="text-sm font-bold text-black">{message}</span>
      <button onClick={onClose} className="text-black/60 hover:text-black">✕</button>
    </div>
  )
}

// City coordinates for distance calculation (lat, lng)
const CITY_COORDS: Record<string, [number, number]> = {
  "Los Angeles, CA": [34.0522, -118.2437],
  "Austin, TX": [30.2672, -97.7431],
  "Miami, FL": [25.7617, -80.1918],
  "Denver, CO": [39.7392, -104.9903],
  "Portland, OR": [45.5152, -122.6784],
  "Seattle, WA": [47.6062, -122.3321],
  "San Francisco, CA": [37.7749, -122.4194],
  "San Diego, CA": [32.7157, -117.1611],
  "Phoenix, AZ": [33.4484, -112.0740],
  "Las Vegas, NV": [36.1699, -115.1398],
  "Lake Arrowhead, CA": [34.2483, -117.1897],
  "Big Bear Lake, CA": [34.2439, -116.9114],
  "Palm Springs, CA": [33.8303, -116.5453],
  "Joshua Tree, CA": [34.1347, -116.3131],
  "Nashville, TN": [36.1627, -86.7816],
  "New York, NY": [40.7128, -74.0060],
  "Chicago, IL": [41.8781, -87.6298],
}

// Calculate distance between two coordinates in miles
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Parse audience size to number
function parseAudienceSize(size: string): number {
  return parseInt(size.replace('K', '000').replace('M', '000000'))
}

// Parse engagement rate to number
function parseEngagementRate(rate: string): number {
  return parseFloat(rate.replace('%', ''))
}

// Format follower count
function formatFollowers(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(0) + 'K'
  return count.toString()
}

const PLATFORM_OPTIONS = ["All Platforms", "Instagram", "TikTok", "YouTube"]
const NICHE_OPTIONS = ["All Niches", "Travel", "Lifestyle", "Photography", "Vlog", "Food", "Adventure", "Luxury", "Design", "Family", "Minimal"]
const AUDIENCE_OPTIONS = ["All Sizes", "Under 50K", "50K-100K", "100K-250K", "250K+"]
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "followers_high", label: "Followers: High to Low" },
  { value: "followers_low", label: "Followers: Low to High" },
  { value: "engagement_high", label: "Engagement: High to Low" },
  { value: "engagement_low", label: "Engagement: Low to High" },
  { value: "distance", label: "Distance: Nearest" },
]

const ALL_LOCATIONS = Object.keys(CITY_COORDS)

// Location search component
function LocationSearch({ 
  value, 
  onChange,
  onClear 
}: { 
  value: string
  onChange: (value: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredLocations = inputValue
    ? ALL_LOCATIONS.filter(loc => loc.toLowerCase().includes(inputValue.toLowerCase()))
    : ALL_LOCATIONS

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-44 items-center justify-between rounded-full border-2 border-black bg-white px-3 text-[12px] font-bold text-black"
      >
        <span className="truncate">{value || "All Locations"}</span>
        {value ? (
          <span 
            onClick={(e) => { e.stopPropagation(); onClear(); setInputValue("") }}
            className="ml-1 text-black/50 hover:text-black"
          >
            ✕
          </span>
        ) : (
          <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>
      
      {open && (
        <div className="absolute z-20 mt-1 w-56 rounded-xl border-2 border-black bg-white p-2 shadow-lg">
          <input
            autoFocus
            placeholder="Search location..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full rounded-lg border-2 border-black px-3 py-2 text-[12px] font-medium text-black placeholder:text-black/40 focus:outline-none"
          />
          <p className="mt-2 px-2 text-[9px] font-bold uppercase tracking-wider text-black/50">
            Shows creators within 150 miles
          </p>
          <div className="mt-1 max-h-48 overflow-y-auto">
            {filteredLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-[12px] font-medium text-black transition-colors hover:bg-[#FFD84A]"
                onClick={() => {
                  onChange(loc)
                  setOpen(false)
                  setInputValue("")
                }}
              >
                {loc}
              </button>
            ))}
            {filteredLocations.length === 0 && (
              <p className="px-3 py-2 text-[11px] text-black/50">No locations found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchCreatorsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // Filters
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState("All Platforms")
  const [niche, setNiche] = useState("All Niches")
  const [audienceSize, setAudienceSize] = useState("All Sizes")
  const [location, setLocation] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [openToGiftedStays, setOpenToGiftedStays] = useState(false)

  // Data state
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  // Modal state
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null)
  const [toast, setToast] = useState("")

  // Fetch creators from API
  useEffect(() => {
    async function fetchCreators() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('q', search)
        if (niche !== 'All Niches') params.set('niche', niche)
        if (platform !== 'All Platforms') params.set('platform', platform)
        if (location) params.set('location', location)
        if (openToGiftedStays) params.set('openToGiftedStays', 'true')
        if (sortBy !== 'relevance') params.set('sortBy', sortBy)
        
        // Audience size filters
        if (audienceSize === 'Under 50K') {
          params.set('maxFollowers', '50000')
        } else if (audienceSize === '50K-100K') {
          params.set('minFollowers', '50000')
          params.set('maxFollowers', '100000')
        } else if (audienceSize === '100K-250K') {
          params.set('minFollowers', '100000')
          params.set('maxFollowers', '250000')
        } else if (audienceSize === '250K+') {
          params.set('minFollowers', '250000')
        }

        const res = await fetch(`/api/creators/search?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setCreators(data.creators || [])
          setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
        }
      } catch (e) {
        console.error('Failed to fetch creators:', e)
      }
      setLoading(false)
    }

    // Debounce search
    const timer = setTimeout(fetchCreators, 300)
    return () => clearTimeout(timer)
  }, [search, platform, niche, audienceSize, location, sortBy, openToGiftedStays])

  // Format creators for display (merge with mock data structure)
  const displayCreators = creators.map(c => ({
    id: c.id,
    name: c.displayName,
    displayName: c.displayName,
    handle: c.handle,
    avatar: c.avatarUrl || (c.displayName ? c.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'CR'),
    niches: c.niches || [],
    audienceSize: c.totalFollowers ? formatFollowers(c.totalFollowers) : 'N/A',
    location: c.location || 'Unknown',
    platforms: c.platforms || [],
    rate: c.minimumRate ? `$${(c.minimumRate / 100).toLocaleString()}+` : 'Contact',
    bio: c.bio || '',
    engagementRate: c.engagementRate ? `${c.engagementRate}%` : 'N/A',
    openToGiftedStays: c.openToGiftedStays,
    isVerified: c.isVerified,
    distance: null,
  }))

  // Use only real creators from the database
  const allCreators = displayCreators

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <p className="text-black">Loading...</p>
      </div>
    )
  }

  return (
    <div className="dashboard min-h-screen bg-[#FAFAFA]">
      <div className="py-6">
        <Container>
          <div className="mb-4">
            <Link href="/dashboard/host" className="text-xs font-bold text-black hover:underline">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 rounded-xl border-2 border-black bg-white p-5">
            <h1 className="font-heading text-[2rem] font-black text-black">FIND CREATORS</h1>
            <p className="mt-1 text-sm text-black">
              Browse approved creators and send collaboration offers.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl border-2 border-black bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  placeholder="Search by name, handle, or location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-10 w-full rounded-full border-2 border-black px-4 text-[12px] font-medium text-black placeholder:text-black/40 focus:outline-none"
                />
              </div>

              {/* Platform Dropdown */}
              <Select
                className="w-36"
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                options={PLATFORM_OPTIONS.map(opt => ({ value: opt, label: opt }))}
              />

              {/* Niche Dropdown */}
              <Select
                className="w-32"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                options={NICHE_OPTIONS.map(opt => ({ value: opt, label: opt }))}
              />

              {/* Location Search */}
              <LocationSearch
                value={location}
                onChange={setLocation}
                onClear={() => setLocation("")}
              />

              {/* Audience Dropdown */}
              <Select
                className="w-32"
                value={audienceSize}
                onChange={e => setAudienceSize(e.target.value)}
                options={AUDIENCE_OPTIONS.map(opt => ({ value: opt, label: opt }))}
              />
            </div>

            {/* Sort row */}
            <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
              <p className="text-sm font-bold text-black">
                {loading ? 'Searching...' : `${pagination.total || allCreators.length} creator${(pagination.total || allCreators.length) !== 1 ? 's' : ''} found`}
                {location && ` near ${location}`}
              </p>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-black/60">
                  <input
                    type="checkbox"
                    checked={openToGiftedStays}
                    onChange={e => setOpenToGiftedStays(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-black"
                  />
                  Gifted stays only
                </label>
                <span className="text-black/30">|</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">Sort:</span>
                <Select
                  className="w-44"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  options={SORT_OPTIONS}
                />
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 animate-pulse rounded-xl border-2 border-black/20 bg-black/5" />
              ))}
            </div>
          )}

          {/* Creator Grid */}
          {!loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allCreators.map(creator => (
              <div
                key={creator.id}
                className="rounded-xl border-2 border-black bg-white p-4 transition-transform hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A] text-sm font-bold text-black">
                    {creator.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black">{creator.name}</p>
                    <p className="text-sm text-black">@{creator.handle}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-black/20 bg-black/5 p-2">
                    <p className="text-lg font-bold text-black">{creator.audienceSize}</p>
                    <p className="text-[9px] text-black">Followers</p>
                  </div>
                  <div className="rounded-lg border border-black/20 bg-black/5 p-2">
                    <p className="text-lg font-bold text-black">{creator.engagementRate}</p>
                    <p className="text-[9px] text-black">Engagement</p>
                  </div>
                  <div className="rounded-lg border border-black/20 bg-black/5 p-2">
                    <p className="text-sm font-bold text-black">{creator.rate}</p>
                    <p className="text-[9px] text-black">Rate</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="mt-3 text-xs text-black line-clamp-2">{creator.bio}</p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {creator.niches.map((n: string) => (
                    <span key={n} className="rounded-full border border-black bg-[#4AA3FF]/20 px-2 py-0.5 text-[9px] font-bold text-black">
                      {n}
                    </span>
                  ))}
                  {creator.platforms.map((p: string) => (
                    <span key={p} className="rounded-full border border-black bg-[#FFD84A]/30 px-2 py-0.5 text-[9px] font-bold text-black">
                      {p}
                    </span>
                  ))}
                </div>

                {/* Location with distance */}
                <p className="mt-2 text-[10px] text-black">
                  📍 {creator.location}
                  {creator.distance !== null && (
                    <span className="ml-1 text-black/50">({Math.round(creator.distance)} mi away)</span>
                  )}
                </p>

                {/* Action */}
                <Button 
                  className="mt-4 w-full" 
                  size="sm"
                  onClick={() => setSelectedCreator(creator)}
                >
                  Send Offer
                </Button>
              </div>
            ))}
          </div>
          )}

          {/* Empty State */}
          {!loading && allCreators.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-black/30 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black/30 bg-black/5">
                <svg className="h-8 w-8 text-black/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-black">No creators available yet</p>
              <p className="mt-2 text-xs text-black/60">
                {search || niche !== 'All Niches' || platform !== 'All Platforms' || location 
                  ? "Try adjusting your search criteria or clearing filters"
                  : "We're onboarding creators in beta. Check back soon!"}
              </p>
              {(search || niche !== 'All Niches' || platform !== 'All Platforms' || location) && (
                <button
                  onClick={() => {
                    setSearch("")
                    setNiche("All Niches")
                    setPlatform("All Platforms")
                    setLocation("")
                    setAudienceSize("All Sizes")
                    setOpenToGiftedStays(false)
                  }}
                  className="mt-4 rounded-full border-2 border-black px-4 py-2 text-xs font-bold text-black hover:bg-black/5"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </Container>
      </div>

      {/* Send Offer Modal */}
      {selectedCreator && (
        <SendOfferModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
          onSuccess={(msg) => {
            setToast(msg)
            setSelectedCreator(null)
          }}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  )
}
