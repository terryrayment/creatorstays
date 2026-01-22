"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

// Getting Started Checklist for beta hosts
function GettingStartedChecklist({ 
  hasProperty, 
  hasProfile, 
  hasSentOffer, 
  hasCollaboration,
  onDismiss
}: { 
  hasProperty: boolean
  hasProfile: boolean
  hasSentOffer: boolean
  hasCollaboration: boolean
  onDismiss: () => void
}) {
  const steps = [
    { 
      id: 'property', 
      label: 'Add your first property', 
      done: hasProperty, 
      href: '/dashboard/host/properties',
      description: 'Add your Airbnb or VRBO listing to get started'
    },
    { 
      id: 'profile', 
      label: 'Complete your host profile', 
      done: hasProfile, 
      href: '/dashboard/host/settings',
      description: 'Add your agency name and bio'
    },
    { 
      id: 'browse', 
      label: 'Browse creators', 
      done: hasSentOffer, 
      href: '/dashboard/host/search-creators',
      description: 'Find creators that match your property vibe'
    },
    { 
      id: 'offer', 
      label: 'Send your first offer', 
      done: hasSentOffer, 
      href: '/dashboard/host/search-creators',
      description: 'Reach out to a creator with a collaboration offer'
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const progressPercent = (completedCount / steps.length) * 100
  const allComplete = completedCount === steps.length

  if (allComplete) {
    return (
      <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-black">You&apos;re All Set!</h3>
            </div>
            <p className="mt-2 text-sm text-black/70">
              You&apos;ve completed the getting started checklist. Now focus on finding the right creators and building great collaborations.
            </p>
          </div>
          <button 
            onClick={onDismiss}
            className="text-black/40 hover:text-black text-xl"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border-2 border-black bg-gradient-to-br from-[#FFD84A]/20 to-white p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#FFD84A] px-2.5 py-0.5 text-[10px] font-bold uppercase">
              ✨ Beta Host
            </span>
          </div>
          <h3 className="mt-2 font-heading text-lg font-black uppercase tracking-wider text-black">Getting Started</h3>
          <p className="mt-1 text-xs text-black/60">{completedCount} of {steps.length} complete</p>
        </div>
        <button 
          onClick={onDismiss}
          className="text-black/40 hover:text-black text-sm"
        >
          Hide
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 w-full rounded-full bg-black/10 overflow-hidden">
        <div 
          className="h-full bg-[#28D17C] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <Link 
            key={step.id}
            href={step.href}
            className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
              step.done 
                ? 'bg-[#28D17C]/10' 
                : idx === completedCount 
                  ? 'bg-[#FFD84A]/20 border-2 border-[#FFD84A] -mx-0.5'
                  : 'bg-white/50'
            }`}
          >
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
              step.done 
                ? 'border-[#28D17C] bg-[#28D17C] text-white' 
                : idx === completedCount
                  ? 'border-[#FFD84A] bg-[#FFD84A]'
                  : 'border-black/20'
            }`}>
              {step.done ? (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-[10px] font-bold">{idx + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${step.done ? 'text-black/50 line-through' : 'text-black'}`}>
                {step.label}
              </p>
              {!step.done && idx === completedCount && (
                <p className="text-[10px] text-black/60 mt-0.5">{step.description}</p>
              )}
            </div>
            {!step.done && idx === completedCount && (
              <span className="text-xs text-black/40">→</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

// Location options for search
const ALL_LOCATIONS = [
  "Los Angeles, CA",
  "Austin, TX",
  "Miami, FL",
  "Denver, CO",
  "Portland, OR",
  "Seattle, WA",
  "San Francisco, CA",
  "San Diego, CA",
  "Phoenix, AZ",
  "Las Vegas, NV",
  "Lake Arrowhead, CA",
  "Big Bear Lake, CA",
  "Palm Springs, CA",
  "Joshua Tree, CA",
  "Nashville, TN",
  "New York, NY",
  "Chicago, IL",
]

// Location search component for Find Creators - uses Google Places for search
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
  const [showSearch, setShowSearch] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
        setShowSearch(false)
        setInputValue("")
        setSuggestions([])
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places?.AutocompleteService) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
    }
  }, [])

  // Fetch Google Places suggestions when typing
  useEffect(() => {
    if (!inputValue || inputValue.length < 2) {
      setSuggestions(ALL_LOCATIONS.filter(loc => loc.toLowerCase().includes(inputValue.toLowerCase())))
      return
    }

    if (!autocompleteServiceRef.current) {
      // Fallback to local search if Google Places isn't available
      setSuggestions(ALL_LOCATIONS.filter(loc => loc.toLowerCase().includes(inputValue.toLowerCase())))
      return
    }

    setIsLoading(true)
    const timer = setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: inputValue,
          types: ["(cities)"],
        },
        (predictions, status) => {
          setIsLoading(false)
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions.map(p => p.description))
          } else {
            // Fallback to local search on error
            setSuggestions(ALL_LOCATIONS.filter(loc => loc.toLowerCase().includes(inputValue.toLowerCase())))
          }
        }
      )
    }, 300) // Debounce

    return () => clearTimeout(timer)
  }, [inputValue])

  const presetLocations = ["Los Angeles", "Austin", "Miami", "Denver", "Portland"]

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center justify-between gap-2 rounded-full border-2 border-black bg-white px-3 text-[11px] font-bold text-black"
      >
        <span className="truncate">{value || "All Locations"}</span>
        <svg className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      
      {open && !showSearch && (
        <div className="absolute z-50 mt-1 w-48 rounded-xl border-2 border-black bg-white py-1 shadow-lg">
          {/* All Locations option */}
          <button
            type="button"
            className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-bold text-black transition-colors ${!value ? 'bg-[#FFD84A]' : 'hover:bg-black/5'}`}
            onClick={() => {
              onClear()
              setOpen(false)
            }}
          >
            {!value && <span>✓</span>}
            <span>All Locations</span>
          </button>
          
          {/* Preset locations */}
          {presetLocations.map((loc) => {
            const fullLoc = ALL_LOCATIONS.find(l => l.startsWith(loc)) || loc
            const isSelected = value === fullLoc
            return (
              <button
                key={loc}
                type="button"
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-medium text-black transition-colors ${isSelected ? 'bg-[#FFD84A] font-bold' : 'hover:bg-black/5'}`}
                onClick={() => {
                  onChange(fullLoc)
                  setOpen(false)
                }}
              >
                {isSelected && <span>✓</span>}
                <span>{loc}</span>
              </button>
            )
          })}
          
          {/* Search option */}
          <div className="border-t border-black/10 mt-1 pt-1">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-medium text-black transition-colors hover:bg-black/5"
              onClick={() => setShowSearch(true)}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span>Search...</span>
            </button>
          </div>
        </div>
      )}

      {/* Search view with Google Places */}
      {open && showSearch && (
        <div className="absolute z-50 mt-1 w-64 rounded-xl border-2 border-black bg-white p-2 shadow-lg">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowSearch(false)
                setInputValue("")
                setSuggestions([])
              }}
              className="text-black/50 hover:text-black"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <input
              autoFocus
              placeholder="Search any city..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="flex-1 rounded-lg border-2 border-black px-2 py-1.5 text-[11px] font-medium text-black placeholder:text-black/40 focus:outline-none"
            />
          </div>
          <div className="mt-2 max-h-48 overflow-y-auto">
            {isLoading && (
              <p className="px-3 py-2 text-[10px] text-black/50">Searching...</p>
            )}
            {!isLoading && suggestions.map((loc) => (
              <button
                key={loc}
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-[11px] font-medium text-black transition-colors hover:bg-[#FFD84A]"
                onClick={() => {
                  onChange(loc)
                  setOpen(false)
                  setShowSearch(false)
                  setInputValue("")
                  setSuggestions([])
                }}
              >
                {loc}
              </button>
            ))}
            {!isLoading && suggestions.length === 0 && inputValue && (
              <p className="px-3 py-2 text-[10px] text-black/50">No locations found. Try a different search.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Section wrapper
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-black bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-black uppercase tracking-wider text-black">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

// Chip selector
function ChipSelect({ options, selected, onChange, max = 3 }: { 
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  max?: number
}) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else if (selected.length < max) {
      onChange([...selected, option])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(option => (
        <button
          key={option}
          onClick={() => toggle(option)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            selected.includes(option)
              ? "border-black bg-black text-white"
              : "border-black bg-white text-black hover:border-black"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// Toast notification
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-3 rounded-xl border-2 border-black bg-[#28D17C] px-5 py-4 text-sm font-bold text-black shadow-xl">
      <span>✓</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-black/60 hover:text-black">✕</button>
    </div>
  )
}

// Match badge
function MatchBadge({ score }: { score: number }) {
  const tier = score >= 70 
    ? { label: "Strong Match", color: "bg-[#28D17C] text-black border-black" }
    : score >= 45 
    ? { label: "Good Match", color: "bg-[#FFD84A] text-black border-black" }
    : { label: "Possible Fit", color: "bg-white text-black border-black" }
  
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border-2 px-2.5 py-1 text-[10px] font-bold ${tier.color}`}>
      {tier.label}
    </span>
  )
}

// Mock creators for search
const mockCreators = [
  { 
    id: 1, 
    name: "Travel Creator A", 
    handle: "travelcreator_a", 
    niches: ["Travel", "Adventure"], 
    audience: "50K-100K", 
    location: "Los Angeles, CA", 
    platform: "Instagram",
    openToOffers: true,
    matchScore: 82,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  { 
    id: 2, 
    name: "Lifestyle Creator B", 
    handle: "lifestyle_b", 
    niches: ["Lifestyle", "Design"], 
    audience: "100K-250K", 
    location: "Austin, TX", 
    platform: "TikTok",
    openToOffers: true,
    matchScore: 68,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  { 
    id: 3, 
    name: "Photo Creator C", 
    handle: "photo_creator_c", 
    niches: ["Photography", "Luxury"], 
    audience: "25K-50K", 
    location: "Miami, FL", 
    platform: "Instagram",
    openToOffers: false,
    matchScore: 55,
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  { 
    id: 4, 
    name: "Vlog Creator D", 
    handle: "vlogger_d", 
    niches: ["Vlog", "Family"], 
    audience: "250K-500K", 
    location: "Denver, CO", 
    platform: "YouTube",
    openToOffers: true,
    matchScore: 74,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  { 
    id: 5, 
    name: "Food Creator E", 
    handle: "foodie_e", 
    niches: ["Food", "Lifestyle"], 
    audience: "50K-100K", 
    location: "Portland, OR", 
    platform: "TikTok",
    openToOffers: true,
    matchScore: 41,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  },
  { 
    id: 6, 
    name: "Adventure Creator F", 
    handle: "adventure_f", 
    niches: ["Adventure", "Travel"], 
    audience: "100K-250K", 
    location: "Seattle, WA", 
    platform: "Instagram",
    openToOffers: true,
    matchScore: 89,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
]

// Style tags
const styleTagOptions = ["Luxury", "Family-friendly", "Remote-work", "Adventure", "Pet-friendly", "Design-forward", "Budget", "Romantic"]
const guestOptions = ["Couples", "Families", "Remote workers", "Groups", "Luxury travelers", "Solo travelers"]
const vibeOptions = ["Minimal", "Cozy", "Bold", "Rustic", "Modern", "Coastal", "Cabin", "Urban"]
const rulesOptions = ["No parties", "Pets allowed", "No pets", "Quiet hours", "Self check-in", "Long stays welcome"]

// Price range options
const priceRangeOptions = [
  "$50-100/night",
  "$100-150/night",
  "$150-200/night",
  "$200-300/night",
  "$300-500/night",
  "$500-750/night",
  "$750-1000/night",
  "$1000+/night",
]

// Location suggestions for autocomplete
const locationSuggestions = [
  "Lake Arrowhead, CA",
  "Lake Tahoe, CA",
  "Big Bear Lake, CA",
  "Palm Springs, CA",
  "Joshua Tree, CA",
  "Malibu, CA",
  "Santa Barbara, CA",
  "San Diego, CA",
  "Los Angeles, CA",
  "San Francisco, CA",
  "Napa Valley, CA",
  "Aspen, CO",
  "Denver, CO",
  "Vail, CO",
  "Telluride, CO",
  "Austin, TX",
  "Scottsdale, AZ",
  "Sedona, AZ",
  "Miami Beach, FL",
  "Key West, FL",
  "Nashville, TN",
  "Gatlinburg, TN",
  "Savannah, GA",
  "Charleston, SC",
  "New Orleans, LA",
  "Portland, OR",
  "Seattle, WA",
  "Maui, HI",
  "Oahu, HI",
]

export function HostDashboard() {
  const { data: session } = useSession()
  
  // Host profile state
  const [hostProfile, setHostProfile] = useState({
    displayName: "",
    location: "",
    email: "",
    bio: "",
    styleTags: [] as string[],
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Listing state
  const [listing, setListing] = useState({
    url: "",
    title: "",
    location: "",
    priceRange: "",
    rating: "",
  })
  const [showPriceDropdown, setShowPriceDropdown] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [listingSaved, setListingSaved] = useState(false)
  const [listingSaving, setListingSaving] = useState(false)

  // Load profile from session on mount
  useEffect(() => {
    if (session?.user) {
      // Pre-fill from session
      setHostProfile(prev => ({
        ...prev,
        displayName: session.user.name || prev.displayName,
        email: session.user.email || prev.email,
      }))
      
      // Fetch full profile from database
      fetchHostProfile()
    }
  }, [session])

  const fetchHostProfile = async () => {
    try {
      const res = await fetch('/api/host/profile')
      if (res.ok) {
        const { profile } = await res.json()
        if (profile) {
          setHostProfile({
            displayName: profile.displayName || session?.user?.name || "",
            location: profile.location || "",
            email: profile.contactEmail || session?.user?.email || "",
            bio: profile.bio || "",
            styleTags: profile.styleTags || [],
          })
        }
      }
    } catch (e) {
      console.error('Failed to fetch profile:', e)
    }
  }

  // Save host profile to database
  const saveHostProfile = async () => {
    setProfileSaving(true)
    try {
      const res = await fetch('/api/host/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: hostProfile.displayName,
          contactEmail: hostProfile.email,
          location: hostProfile.location,
          bio: hostProfile.bio,
          styleTags: hostProfile.styleTags,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setProfileSaved(true)
        setToast("Profile saved!")
        setTimeout(() => setProfileSaved(false), 2000)
      } else {
        setToast(data.error || "Failed to save profile")
      }
    } catch (e) {
      console.error('Failed to save profile:', e)
      setToast("Failed to save profile. Please try again.")
    }
    setProfileSaving(false)
    setTimeout(() => setToast(""), 4000)
  }

  // Taste optimizer state
  const [taste, setTaste] = useState({
    guests: [] as string[],
    vibes: [] as string[],
    rules: [] as string[],
  })

  // Search state
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ platform: "", niche: "", location: "" })
  const [sortBy, setSortBy] = useState<"default" | "best_match" | "distance">("default")
  
  // Message composer state
  const [composing, setComposing] = useState<typeof mockCreators[0] | null>(null)
  const [message, setMessage] = useState({ 
    basePay: "", 
    text: "",
    trafficBonusEnabled: false,
    trafficBonusAmount: "50",
    trafficBonusThreshold: "1000",
  })
  
  // Toast
  const [toast, setToast] = useState("")

  // Getting Started checklist state
  const [showGettingStarted, setShowGettingStarted] = useState(true)
  const [stats, setStats] = useState({
    offersSent: 0,
    activeCollabs: 0,
    totalClicks: 0,
    totalSpent: 0,
    hasProperty: false,
    hasProfile: false,
  })

  // Fetch real stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) {
          const data = await res.json()
          setStats({
            offersSent: data.offersSent || 0,
            activeCollabs: data.activeCollabs || 0,
            totalClicks: data.totalClicks || 0,
            totalSpent: data.totalSpent || 0,
            hasProperty: data.hasProperty || false,
            hasProfile: data.hasProfile || false,
          })
        }
      } catch (e) {
        console.error('Failed to fetch stats:', e)
      }
    }
    fetchStats()
  }, [])

  // Check if getting started was dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('hostGettingStartedDismissed')
    if (dismissed === 'true') {
      setShowGettingStarted(false)
    }
  }, [])

  const dismissGettingStarted = () => {
    setShowGettingStarted(false)
    localStorage.setItem('hostGettingStartedDismissed', 'true')
  }

  // Generate creator brief
  const generateBrief = () => {
    const guests = taste.guests.length ? taste.guests.join(" and ").toLowerCase() : "travelers"
    const vibes = taste.vibes.length ? taste.vibes.join(", ").toLowerCase() : "authentic"
    return `We're looking for creators who connect with ${guests} and produce ${vibes} content. ${listing.title ? `Our property "${listing.title}"` : "Our property"} offers a unique experience. We'd love content that highlights the space and surrounding area.`
  }

  // Filter creators
  const filteredCreators = mockCreators
    .filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.handle.toLowerCase().includes(search.toLowerCase())) return false
      if (filters.platform && c.platform !== filters.platform) return false
      if (filters.niche && !c.niches.includes(filters.niche)) return false
      if (filters.location && !c.location.toLowerCase().includes(filters.location.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "best_match") return b.matchScore - a.matchScore
      if (sortBy === "distance" && filters.location) {
        // Sort by whether location matches filter
        const aMatch = a.location.toLowerCase().includes(filters.location.toLowerCase()) ? 0 : 1
        const bMatch = b.location.toLowerCase().includes(filters.location.toLowerCase()) ? 0 : 1
        return aMatch - bMatch
      }
      return 0
    })

  // Open composer
  const openComposer = (creator: typeof mockCreators[0]) => {
    setComposing(creator)
    setMessage({ 
      basePay: "", 
      text: generateBrief(),
      trafficBonusEnabled: false,
      trafficBonusAmount: "50",
      trafficBonusThreshold: "1000",
    })
  }

  // Send message
  const sendMessage = () => {
    const bonusText = message.trafficBonusEnabled 
      ? ` + $${message.trafficBonusAmount} bonus at ${parseInt(message.trafficBonusThreshold).toLocaleString()} clicks`
      : ""
    setToast(`Offer sent to @${composing?.handle}: $${message.basePay}${bonusText}`)
    setComposing(null)
    setTimeout(() => setToast(""), 4000)
  }

  // Save listing
  const saveListing = () => {
    setListingSaved(true)
    setToast("Listing details saved!")
    setTimeout(() => {
      setListingSaved(false)
      setToast("")
    }, 3000)
  }

  // Close dropdowns on outside click
  const handleOutsideClick = () => {
    setShowPriceDropdown(false)
    setShowLocationSuggestions(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-black">
                Welcome{hostProfile.displayName ? `, ${hostProfile.displayName.split(' ')[0]}` : ''}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-[#FFD84A] px-2 py-0.5 text-[10px] font-bold uppercase">
                ✨ Beta
              </span>
            </div>
            <p className="mt-1 text-sm text-black/70">
              {stats.offersSent > 0 
                ? `You've sent ${stats.offersSent} offer${stats.offersSent > 1 ? 's' : ''}. Keep building those creator relationships.`
                : 'Set up your property and start connecting with creators.'}
            </p>
          </div>
          <Link 
            href="/dashboard/host/search-creators"
            className="rounded-full border-2 border-black bg-[#FFD84A] px-5 py-2.5 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Browse all creators
          </Link>
        </div>

        {/* Getting Started Checklist */}
        {showGettingStarted && (
          <div className="mb-6">
            <GettingStartedChecklist
              hasProperty={stats.hasProperty}
              hasProfile={stats.hasProfile || Boolean(hostProfile.displayName && hostProfile.bio)}
              hasSentOffer={stats.offersSent > 0}
              hasCollaboration={stats.activeCollabs > 0}
              onDismiss={dismissGettingStarted}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Creator Search */}
            <Section title="Find Creators">
              <p className="mb-3 text-[11px] text-black">
                Match helps you find creators that fit your property and campaign.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input 
                  placeholder="Search by name or handle..." 
                  className="w-48 h-8 text-[11px]"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Select
                  className="w-32"
                  size="sm"
                  placeholder="All Platforms"
                  value={filters.platform}
                  onChange={e => setFilters({...filters, platform: e.target.value})}
                  options={[
                    { value: "", label: "All Platforms" },
                    { value: "Instagram", label: "Instagram" },
                    { value: "TikTok", label: "TikTok" },
                    { value: "YouTube", label: "YouTube" },
                  ]}
                />
                <Select
                  className="w-28"
                  size="sm"
                  placeholder="All Niches"
                  value={filters.niche}
                  onChange={e => setFilters({...filters, niche: e.target.value})}
                  options={[
                    { value: "", label: "All Niches" },
                    { value: "Travel", label: "Travel" },
                    { value: "Lifestyle", label: "Lifestyle" },
                    { value: "Photography", label: "Photography" },
                    { value: "Vlog", label: "Vlog" },
                    { value: "Food", label: "Food" },
                    { value: "Adventure", label: "Adventure" },
                  ]}
                />
                <LocationSearch
                  value={filters.location}
                  onChange={(loc) => setFilters({...filters, location: loc})}
                  onClear={() => setFilters({...filters, location: ""})}
                />
              </div>
              
              <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
                <p className="text-[11px] font-bold text-black">{filteredCreators.length} creators found</p>
                <div className="relative z-30">
                  <Select
                    className="w-48"
                    size="sm"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as "default" | "best_match" | "distance")}
                    options={[
                      { value: "default", label: "Sort: Default" },
                      { value: "best_match", label: "Sort: Best Match" },
                      { value: "distance", label: "Sort: Location, closest" },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {filteredCreators.map(creator => (
                  <div key={creator.id} className="flex items-center justify-between rounded-xl border-2 border-black bg-white p-4 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-black bg-gradient-to-br from-blue-100 to-purple-100">
                        {creator.avatarUrl ? (
                          <img src={creator.avatarUrl} alt={creator.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-blue-600">
                            {creator.name.split(" ")[0][0]}{creator.name.split(" ")[1]?.[0] || ""}
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-black">{creator.name}</p>
                        <p className="text-xs text-black/70">@{creator.handle} · {creator.niches[0]} · {creator.audience}</p>
                      </div>
                    </div>
                    {/* Right side - Badge and Button */}
                    <div className="flex items-center gap-3">
                      <MatchBadge score={creator.matchScore} />
                      <Button size="sm" variant="outline" className="border-2 border-black text-xs font-bold" onClick={() => openComposer(creator)}>
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Quick Stats - FIRST */}
            <Section title="Your Stats">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-black">{stats.offersSent}</p>
                  <p className="text-[10px] text-black">Offers Sent</p>
                </div>
                <div className="rounded-lg bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-black">{stats.activeCollabs}</p>
                  <p className="text-[10px] text-black">Active Collabs</p>
                </div>
                <div className="rounded-lg bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-black">{stats.totalClicks.toLocaleString()}</p>
                  <p className="text-[10px] text-black">Total Clicks</p>
                </div>
                <div className="rounded-lg bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-black">${stats.totalSpent.toLocaleString()}</p>
                  <p className="text-[10px] text-black">Spent</p>
                </div>
              </div>
              {stats.offersSent === 0 && stats.activeCollabs === 0 ? (
                <div className="mt-3 rounded-lg border-2 border-dashed border-black/20 bg-black/5 p-3 text-center">
                  <p className="text-[10px] text-black/60">Stats will populate as you send offers and work with creators</p>
                </div>
              ) : (
                <Link 
                  href="/dashboard/analytics" 
                  className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-black transition-colors hover:bg-black/5"
                >
                  View Analytics →
                </Link>
              )}
            </Section>

            {/* Quick Links - SECOND */}
            <Section title="Quick Links">
              <div className="space-y-1.5">
                <Link href="/dashboard/host/properties" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-black transition-colors hover:bg-black/5">
                  My Properties
                  <span className="text-black">→</span>
                </Link>
                <Link href="/dashboard/collaborations" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-black transition-colors hover:bg-black/5">
                  Collaborations
                  <span className="text-black">→</span>
                </Link>
                <Link href="/dashboard/host/offers" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-black transition-colors hover:bg-black/5">
                  Sent Offers
                  <span className="text-black">→</span>
                </Link>
                <Link href="/dashboard/host/settings" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-black transition-colors hover:bg-black/5">
                  Settings
                  <span className="text-black">→</span>
                </Link>
              </div>
            </Section>

            {/* Content Ideas - THIRD */}
            <Section title="Content Ideas">
              <div className="space-y-2">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs font-bold text-black">🏠 Property Tour</p>
                  <p className="mt-1 text-[10px] text-black/70">"Walk through the space, highlight unique features, show the views"</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs font-bold text-black">📍 Local Guide</p>
                  <p className="mt-1 text-[10px] text-black/70">"Best coffee spots, hidden gems, things to do within 10 min"</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs font-bold text-black">🌅 Day in the Life</p>
                  <p className="mt-1 text-[10px] text-black/70">"Morning routine at the property, cooking breakfast, sunset views"</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs font-bold text-black">✨ Vibe Check</p>
                  <p className="mt-1 text-[10px] text-black/70">"Aesthetic shots with trending audio, cozy moments, ambiance"</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-black/50">Suggest these to creators when sending offers</p>
            </Section>

            {/* Taste Optimizer - FOURTH */}
            <Section title="Taste Optimizer">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-black">Ideal Guests (1-2)</label>
                  <ChipSelect 
                    options={guestOptions} 
                    selected={taste.guests} 
                    onChange={s => setTaste({...taste, guests: s})}
                    max={2}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-black">Vibe Tags (up to 3)</label>
                  <ChipSelect 
                    options={vibeOptions} 
                    selected={taste.vibes} 
                    onChange={s => setTaste({...taste, vibes: s})}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-black">House Rules</label>
                  <ChipSelect 
                    options={rulesOptions} 
                    selected={taste.rules} 
                    onChange={s => setTaste({...taste, rules: s})}
                    max={4}
                  />
                </div>
              </div>
            </Section>

            {/* Resources - FOURTH */}
            <Section title="Resources">
              <div className="space-y-1.5">
                <Link href="/dashboard/host/welcome" className="flex items-center justify-between rounded-lg bg-[#FFD84A] px-3 py-2 text-xs font-bold text-black transition-colors hover:bg-[#FFD84A]/80">
                  📚 Host Guide
                  <span className="text-black">→</span>
                </Link>
                <Link href="/how-to/hosts" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-black transition-colors hover:bg-black/5">
                  How It Works
                  <span className="text-black">→</span>
                </Link>
                <Link href="/help" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-black transition-colors hover:bg-black/5">
                  Help Center
                  <span className="text-black">→</span>
                </Link>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-black bg-white py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-4 px-4 text-xs text-black sm:px-6">
          <Link href="/how-it-works" className="hover:text-black">How it works</Link>
          <span>•</span>
          <Link href="/waitlist" className="hover:text-black">Creator Waitlist</Link>
        </div>
      </div>

      {/* Message Composer Modal */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border-2 border-black bg-white p-6 shadow-xl my-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-black">Send Offer to @{composing.handle}</h3>
              <button onClick={() => setComposing(null)} className="text-black hover:text-black">✕</button>
            </div>
            
            <div className="space-y-4">
              {/* Base Pay */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-black">Base Pay (per deliverable set) *</label>
                <Input 
                  placeholder="e.g., 400"
                  value={message.basePay}
                  onChange={e => setMessage({...message, basePay: e.target.value})}
                  type="number"
                />
                <p className="mt-1 text-[10px] text-black">Flat rate for posts, reels, stories as agreed.</p>
              </div>

              {/* Traffic Bonus Toggle */}
              <div className="rounded-xl border-2 border-black p-4" style={{ border: '2px solid black' }}>
                <div 
                  className="flex cursor-pointer items-center gap-3"
                  onClick={() => setMessage({...message, trafficBonusEnabled: !message.trafficBonusEnabled})}
                >
                  <div 
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 ${message.trafficBonusEnabled ? 'bg-black' : 'bg-white'}`}
                    style={{ border: '2px solid black' }}
                  >
                    {message.trafficBonusEnabled && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-bold text-black">Add Traffic Bonus (optional)</span>
                </div>

                {message.trafficBonusEnabled && (
                  <div className="mt-4 space-y-4 border-t border-black/20 pt-4">
                    {/* Clicks info */}
                    <div className="text-xs text-black/60">
                      Bonus paid when tracking link reaches click threshold.
                    </div>

                    {/* Threshold */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-black">Click Threshold</label>
                      <div className="flex gap-2">
                        {["500", "1000", "2500", "5000"].map(t => (
                          <button 
                            key={t}
                            type="button"
                            onClick={() => setMessage({...message, trafficBonusThreshold: t})}
                            className="flex-1 rounded-full px-3 py-2 text-sm font-bold transition-colors"
                            style={{ 
                              border: '2px solid black',
                              backgroundColor: message.trafficBonusThreshold === t ? '#FFD84A' : 'white',
                              color: 'black'
                            }}
                          >
                            {parseInt(t).toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bonus Amount */}
                    <div>
                      <label className="mb-2 block text-xs font-bold text-black">Bonus Amount</label>
                      <div className="flex gap-2">
                        {["50", "100", "250"].map(a => (
                          <button 
                            key={a}
                            type="button"
                            onClick={() => setMessage({...message, trafficBonusAmount: a})}
                            className="flex-1 rounded-full px-4 py-2 text-sm font-bold transition-colors"
                            style={{ 
                              border: '2px solid black',
                              backgroundColor: message.trafficBonusAmount === a ? '#FFD84A' : 'white',
                              color: 'black'
                            }}
                          >
                            ${a}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div 
                      className="rounded-lg px-4 py-3"
                      style={{ border: '2px solid black', backgroundColor: 'rgba(40, 209, 124, 0.2)' }}
                    >
                      <p className="text-sm font-bold text-black">
                        +${message.trafficBonusAmount || "0"} bonus at {parseInt(message.trafficBonusThreshold || "0").toLocaleString()} clicks
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-black">Message</label>
                <textarea 
                  className="w-full rounded-lg px-3 py-2 text-sm text-black focus:outline-none"
                  style={{ border: '2px solid black' }}
                  rows={4}
                  value={message.text}
                  onChange={e => setMessage({...message, text: e.target.value})}
                />
              </div>

              {/* Total Summary */}
              {message.basePay && (
                <div 
                  className="rounded-lg p-3"
                  style={{ border: '2px solid black', backgroundColor: '#FFD84A' }}
                >
                  <p className="text-sm font-bold text-black">
                    Offer: ${message.basePay} base
                    {message.trafficBonusEnabled && ` + $${message.trafficBonusAmount} at ${parseInt(message.trafficBonusThreshold).toLocaleString()} clicks`}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-2 border-black" onClick={() => setComposing(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 border-2 border-black bg-black text-white" onClick={sendMessage} disabled={!message.basePay}>
                  Send Offer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  )
}
