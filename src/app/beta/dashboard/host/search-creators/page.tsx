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
import { DashboardFooter } from "@/components/navigation/dashboard-footer"

// Toast notification
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border-2 border-black bg-[#28D17C] px-4 py-3 shadow-lg">
      <span className="text-sm font-bold text-black">{message}</span>
      <button onClick={onClose} className="text-black/60 hover:text-black">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// City coordinates for distance calculation (lat, lng)
const CITY_COORDS: Record<string, [number, number]> = {
  // Major metros
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
  "Nashville, TN": [36.1627, -86.7816],
  "New York, NY": [40.7128, -74.0060],
  "Chicago, IL": [41.8781, -87.6298],
  "Atlanta, GA": [33.7490, -84.3880],
  "Houston, TX": [29.7604, -95.3698],
  "Dallas, TX": [32.7767, -96.7970],
  "Boston, MA": [42.3601, -71.0589],
  "Philadelphia, PA": [39.9526, -75.1652],
  "Washington, DC": [38.9072, -77.0369],
  "Detroit, MI": [42.3314, -83.0458],
  "Minneapolis, MN": [44.9778, -93.2650],
  "Tampa, FL": [27.9506, -82.4572],
  "Orlando, FL": [28.5383, -81.3792],
  "Charlotte, NC": [35.2271, -80.8431],
  "Raleigh, NC": [35.7796, -78.6382],
  "Salt Lake City, UT": [40.7608, -111.8910],
  "San Jose, CA": [37.3382, -121.8863],
  "Sacramento, CA": [38.5816, -121.4944],
  "Kansas City, MO": [39.0997, -94.5786],
  "St. Louis, MO": [38.6270, -90.1994],
  "Indianapolis, IN": [39.7684, -86.1581],
  "Columbus, OH": [39.9612, -82.9988],
  "Cleveland, OH": [41.4993, -81.6944],
  "Cincinnati, OH": [39.1031, -84.5120],
  "Pittsburgh, PA": [40.4406, -79.9959],
  "Baltimore, MD": [39.2904, -76.6122],
  "Milwaukee, WI": [43.0389, -87.9065],
  "New Orleans, LA": [29.9511, -90.0715],
  "Oklahoma City, OK": [35.4676, -97.5164],
  "Louisville, KY": [38.2527, -85.7585],
  "Memphis, TN": [35.1495, -90.0490],
  "Albuquerque, NM": [35.0844, -106.6504],
  "Tucson, AZ": [32.2226, -110.9747],
  "Fresno, CA": [36.7378, -119.7871],
  "Mesa, AZ": [33.4152, -111.8315],
  "Scottsdale, AZ": [33.4942, -111.9261],
  "Boise, ID": [43.6150, -116.2023],
  "Spokane, WA": [47.6588, -117.4260],
  "Anchorage, AK": [61.2181, -149.9003],
  "Honolulu, HI": [21.3069, -157.8583],
  // Vacation destinations
  "Lake Arrowhead, CA": [34.2483, -117.1897],
  "Big Bear Lake, CA": [34.2439, -116.9114],
  "Palm Springs, CA": [33.8303, -116.5453],
  "Joshua Tree, CA": [34.1347, -116.3131],
  "Lake Tahoe, CA": [39.0968, -120.0324],
  "Napa Valley, CA": [38.2975, -122.2869],
  "Malibu, CA": [34.0259, -118.7798],
  "Sedona, AZ": [34.8697, -111.7610],
  "Park City, UT": [40.6461, -111.4980],
  "Aspen, CO": [39.1911, -106.8175],
  "Vail, CO": [39.6403, -106.3742],
  "Telluride, CO": [37.9375, -107.8123],
  "Jackson Hole, WY": [43.4799, -110.7624],
  "Savannah, GA": [32.0809, -81.0912],
  "Charleston, SC": [32.7765, -79.9311],
  "Asheville, NC": [35.5951, -82.5515],
  "Key West, FL": [24.5551, -81.7800],
  "Fort Lauderdale, FL": [26.1224, -80.1373],
  "Naples, FL": [26.1420, -81.7948],
  "Sarasota, FL": [27.3364, -82.5307],
  "Clearwater, FL": [27.9659, -82.8001],
  "Destin, FL": [30.3935, -86.4958],
  "Hilton Head, SC": [32.2163, -80.7526],
  "Myrtle Beach, SC": [33.6891, -78.8867],
  "Outer Banks, NC": [35.5585, -75.4665],
  "Maui, HI": [20.7984, -156.3319],
  "Big Island, HI": [19.5429, -155.6659],
  "Kauai, HI": [22.0964, -159.5261],
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
  { value: "default", label: "Sort: Default" },
  { value: "best_match", label: "Sort: Best Match" },
  { value: "distance", label: "Sort: Location, closest" },
]

const ALL_LOCATIONS = Object.keys(CITY_COORDS)

// Location search component - uses Google Places API
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
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<any>(null)

  // Expanded fallback cities
  const POPULAR_CITIES = [
    "Los Angeles, CA", "New York, NY", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
    "San Antonio, TX", "San Diego, CA", "Dallas, TX", "Austin, TX", "San Francisco, CA",
    "Seattle, WA", "Denver, CO", "Boston, MA", "Nashville, TN", "Portland, OR",
    "Las Vegas, NV", "Atlanta, GA", "Miami, FL", "Tampa, FL", "Orlando, FL",
    "Charlotte, NC", "Raleigh, NC", "Minneapolis, MN", "Detroit, MI", "Cleveland, OH",
    "Pittsburgh, PA", "Philadelphia, PA", "Baltimore, MD", "Washington, DC", "Richmond, VA",
    "Salt Lake City, UT", "Boise, ID", "Albuquerque, NM", "Tucson, AZ", "Oklahoma City, OK",
    "Kansas City, MO", "St. Louis, MO", "Indianapolis, IN", "Columbus, OH", "Cincinnati, OH",
    "Milwaukee, WI", "New Orleans, LA", "Memphis, TN", "Louisville, KY", "San Jose, CA",
    "Sacramento, CA", "Oakland, CA", "Long Beach, CA", "Fresno, CA", "Bakersfield, CA",
    "Lake Tahoe, CA", "Big Bear, CA", "Palm Springs, CA", "Sedona, AZ", "Scottsdale, AZ",
    "Park City, UT", "Aspen, CO", "Vail, CO", "Jackson Hole, WY", "Savannah, GA",
    "Charleston, SC", "Asheville, NC", "Key West, FL", "Fort Lauderdale, FL", "Naples, FL",
    "Honolulu, HI", "Maui, HI", "Anchorage, AK"
  ]

  // Load Google Maps
  useEffect(() => {
    let mounted = true
    const loadGoogleMaps = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).google?.maps?.places) {
          autocompleteRef.current = new (window as any).google.maps.places.AutocompleteService()
          setIsGoogleLoaded(true)
          return
        }

        const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
        if (!existingScript) {
          const script = document.createElement('script')
          script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyClauePA6V5yio6N1Ucr9m1ULmzPZ6zcoo&libraries=places'
          script.async = true
          script.defer = true
          document.head.appendChild(script)
          
          script.onload = () => {
            if (mounted && (window as any).google?.maps?.places?.AutocompleteService) {
              autocompleteRef.current = new (window as any).google.maps.places.AutocompleteService()
              setIsGoogleLoaded(true)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error)
      }
    }
    loadGoogleMaps()
    return () => { mounted = false }
  }, [])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
        setInputValue("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch suggestions when input changes
  useEffect(() => {
    if (!inputValue || inputValue.length < 2) {
      setSuggestions([])
      return
    }

    if (isGoogleLoaded && autocompleteRef.current) {
      autocompleteRef.current.getPlacePredictions(
        { input: inputValue, types: ["(cities)"] },
        (predictions: any[] | null, status: string) => {
          if (status === "OK" && predictions) {
            setSuggestions(predictions.map((p: any) => p.description).slice(0, 6))
          } else {
            setSuggestions([])
          }
        }
      )
    } else {
      // Fallback to local filtering
      const filtered = POPULAR_CITIES.filter(city =>
        city.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 6)
      setSuggestions(filtered)
    }
  }, [inputValue, isGoogleLoaded])

  const presetLocations = ["Los Angeles, CA", "Austin, TX", "Miami, FL", "Denver, CO", "Atlanta, GA"]

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center justify-between gap-2 rounded-full border-2 border-black bg-white px-4 text-[12px] font-bold text-black"
      >
        <span className="truncate">{value || "All Locations"}</span>
        <svg className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      
      {open && (
        <div className="absolute z-20 mt-1 w-64 rounded-xl border-2 border-black bg-white py-2 shadow-lg">
          {/* Search input */}
          <div className="px-2 pb-2">
            <input
              autoFocus
              placeholder="Search any city..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="w-full rounded-lg border-2 border-black px-3 py-2 text-[12px] font-medium text-black placeholder:text-black/40 focus:outline-none"
            />
          </div>

          {/* Show suggestions if searching, otherwise show presets */}
          {inputValue.length >= 2 ? (
            <div className="max-h-48 overflow-y-auto border-t border-black pt-1">
              {suggestions.length > 0 ? (
                suggestions.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className="w-full px-4 py-2 text-left text-[12px] font-bold text-black transition-colors hover:bg-[#FFD84A]"
                    onClick={() => {
                      onChange(loc)
                      setOpen(false)
                      setInputValue("")
                    }}
                  >
                    {loc}
                  </button>
                ))
              ) : (
                <p className="px-4 py-2 text-[11px] text-black">
                  No results found. Try another search.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* All Locations option */}
              <button
                type="button"
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-[12px] font-bold text-black transition-colors ${!value ? 'bg-[#FFD84A]' : 'hover:bg-black/5'}`}
                onClick={() => {
                  onClear()
                  setOpen(false)
                }}
              >
                {!value && <span>✓</span>}
                <span>All Locations</span>
              </button>
              
              {/* Preset locations */}
              <div className="border-t border-black mt-1 pt-1">
                <p className="px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-black">Popular</p>
                {presetLocations.map((loc) => {
                  const isSelected = value === loc
                  return (
                    <button
                      key={loc}
                      type="button"
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-[12px] font-bold text-black transition-colors ${isSelected ? 'bg-[#FFD84A]' : 'hover:bg-black/5'}`}
                      onClick={() => {
                        onChange(loc)
                        setOpen(false)
                      }}
                    >
                      {isSelected && <span>✓</span>}
                      <span>{loc}</span>
                    </button>
                  )
                })}
              </div>
              
              <p className="mt-2 px-4 text-[9px] text-black">
                Shows creators within 150 miles of location
              </p>
            </>
          )}
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
  const [sortBy, setSortBy] = useState("default")
  const [openToGiftedStays, setOpenToGiftedStays] = useState(false)

  // Data state
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [isMockData, setIsMockData] = useState(false)
  const [showEducationalModal, setShowEducationalModal] = useState(false)

  // Modal state
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null)
  const [toast, setToast] = useState("")

  // Check if user has seen the educational modal before
  useEffect(() => {
    const hasSeenModal = localStorage.getItem('cs_seen_mock_creator_modal')
    if (!hasSeenModal && isMockData) {
      setShowEducationalModal(true)
    }
  }, [isMockData])

  const dismissEducationalModal = () => {
    localStorage.setItem('cs_seen_mock_creator_modal', 'true')
    setShowEducationalModal(false)
  }

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
          setIsMockData(data.isMockData || false)
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
    isMock: c.isMock || false,
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
    <div className="dashboard min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header and navigation now handled by layout - DashboardHeader component */}

      <div className="flex-1 py-6">
        <Container>
          <div className="mb-4">
            <Link href="/beta/dashboard/host" className="text-xs font-bold text-black/60 hover:text-black">
              ← Dashboard
            </Link>
          </div>

          {/* Header - no hover animation on outer containers */}
          <div className="mb-6 rounded-xl border-2 border-black bg-white p-5">
            <h1 className="font-heading text-[2rem] font-black text-black">FIND CREATORS</h1>
            <p className="mt-1 text-sm text-black">
              Browse approved creators and send collaboration offers.
            </p>
          </div>

          {/* Mock Data Banner - no hover animation on outer container */}
          {isMockData && (
            <div className="mb-4 rounded-xl border-2 border-dashed border-[#4AA3FF] bg-[#4AA3FF]/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4AA3FF] text-white">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-black">You're viewing sample creators</p>
                  <p className="mt-1 text-xs text-black/70">
                    These profiles show you how the platform works. Once we match you with real creators in your area, they'll appear here. Sample profiles are marked with a badge.
                  </p>
                </div>
                <button 
                  onClick={() => setShowEducationalModal(true)}
                  className="shrink-0 rounded-full border border-[#4AA3FF] bg-white px-3 py-1 text-[10px] font-bold text-[#4AA3FF] hover:bg-[#4AA3FF] hover:text-white transition-colors"
                >
                  Learn more
                </button>
              </div>
            </div>
          )}

          {/* Filters - no hover animation on outer container */}
          <div className="mb-6 rounded-xl border-2 border-black bg-white p-4 relative z-20">
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
            <div className="mt-3 flex items-center justify-between border-t-2 border-black pt-3">
              <p className="text-sm font-bold text-black">
                {loading ? 'Searching...' : `${pagination.total || allCreators.length} creator${(pagination.total || allCreators.length) !== 1 ? 's' : ''} found`}
                {location && ` near ${location}`}
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[12px] font-bold text-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openToGiftedStays}
                    onChange={e => setOpenToGiftedStays(e.target.checked)}
                    className="h-4 w-4 rounded border-2 border-black accent-black"
                  />
                  Gifted stays only
                </label>
                <Select
                  className="w-40"
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

          {/* Creator Grid - with subtle hover animation */}
          {!loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allCreators.map(creator => (
              <div
                key={creator.id}
                className={`relative rounded-xl border-2 bg-white p-4 transition-transform duration-200 hover:-translate-y-1 ${
                  creator.isMock ? 'border-dashed border-black/40' : 'border-black'
                }`}
              >
                {/* SAMPLE Badge */}
                {creator.isMock && (
                  <div className="absolute -top-2 -right-2 rounded-full border border-[#4AA3FF] bg-[#4AA3FF] px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-wider">
                    Sample
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold text-black ${
                    creator.isMock ? 'border-dashed border-black/40 bg-[#4AA3FF]/20' : 'border-black bg-[#FFD84A]'
                  }`}>
                    {creator.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black">{creator.name}</p>
                    <p className="text-sm text-black/70">@{creator.handle}</p>
                  </div>
                </div>

                {/* Stats - removed transition classes */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-black/20 bg-black/5 p-2">
                    <p className="text-lg font-bold text-black">{creator.audienceSize}</p>
                    <p className="text-[9px] text-black/70">Followers</p>
                  </div>
                  <div className="rounded-lg border border-black/20 bg-black/5 p-2">
                    <p className="text-lg font-bold text-black">{creator.engagementRate}</p>
                    <p className="text-[9px] text-black/70">Engagement</p>
                  </div>
                  <div className="rounded-lg border border-black/20 bg-black/5 p-2">
                    <p className="text-sm font-bold text-black">{creator.rate}</p>
                    <p className="text-[9px] text-black/70">Rate</p>
                  </div>
                </div>

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
                <p className="mt-2 text-[10px] text-black/70">
                   {creator.location}
                  {creator.distance !== null && (
                    <span className="ml-1">({Math.round(creator.distance)} mi away)</span>
                  )}
                </p>

                {/* Action - no transition on button */}
                {creator.isMock ? (
                  <button 
                    className="mt-4 w-full rounded-full border-2 border-dashed border-black/40 bg-black/5 py-2 text-xs font-bold text-black/50 cursor-not-allowed"
                    disabled
                  >
                    Sample Profile
                  </button>
                ) : (
                  <button 
                    className="mt-4 w-full rounded-full border-2 border-black bg-black py-2 text-xs font-bold text-white hover:bg-black/80"
                    onClick={() => setSelectedCreator(creator)}
                  >
                    Send Offer
                  </button>
                )}
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

      {/* Educational Modal for Mock Data */}
      {showEducationalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border-[3px] border-black bg-white overflow-hidden">
            {/* Header with illustration */}
            <div className="bg-gradient-to-br from-[#4AA3FF]/20 to-[#FFD84A]/20 p-6 text-center border-b-2 border-black">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-black bg-white">
                <svg className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h2 className="font-heading text-2xl font-black text-black">Preview Mode</h2>
              <p className="mt-2 text-sm text-black/70">You're viewing sample creator profiles</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFD84A] text-black font-bold text-sm">1</div>
                <div>
                  <p className="font-bold text-black">These are example profiles</p>
                  <p className="text-sm text-black/70">They show you how real creator cards will look, including stats, rates, and niches.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4AA3FF] text-white font-bold text-sm">2</div>
                <div>
                  <p className="font-bold text-black">Creator matching opens in waves</p>
                  <p className="text-sm text-black/70">Hosts who complete their setup are first in line. We'll notify you when creators matching your property are available.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#28D17C] text-black font-bold text-sm">3</div>
                <div>
                  <p className="font-bold text-black">You can't send offers to samples</p>
                  <p className="text-sm text-black/70">Sample profiles are for preview only. When real creators are available, you'll be able to send offers directly.</p>
                </div>
              </div>

              {/* Visual indicator */}
              <div className="mt-4 rounded-lg border-2 border-dashed border-[#4AA3FF]/50 bg-[#4AA3FF]/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-[#4AA3FF] bg-[#4AA3FF] px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-wider">
                    Sample
                  </div>
                  <p className="text-xs text-black/70">Look for this badge to identify sample profiles</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-black p-4 bg-black/5">
              <button
                onClick={dismissEducationalModal}
                className="w-full rounded-full border-2 border-black bg-black py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Got it, let me explore
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <DashboardFooter />
    </div>
  )
}
