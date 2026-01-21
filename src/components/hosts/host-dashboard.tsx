"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

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
    ? { label: "Strong Match", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
    : score >= 45 
    ? { label: "Good Match", color: "bg-blue-100 text-blue-700 border-blue-200" }
    : { label: "Possible Fit", color: "bg-slate-100 text-slate-600 border-slate-200" }
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${tier.color}`}>
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
  const [sortBy, setSortBy] = useState<"default" | "match">("default")
  
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
      if (sortBy === "match") return b.matchScore - a.matchScore
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Welcome, Host</h1>
            <p className="mt-1 text-black">Set up your property and start outreach.</p>
          </div>
          <Link 
            href="/dashboard/host/search-creators"
            className="rounded-full border-2 border-black bg-[#FFD84A] px-5 py-2.5 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Browse all creators
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Host Profile */}
            <Section 
              title="Host Profile" 
              action={
                <button
                  onClick={saveHostProfile}
                  disabled={profileSaving}
                  className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    profileSaved 
                      ? "bg-[#28D17C] text-black" 
                      : "bg-black text-white hover:-translate-y-0.5"
                  }`}
                >
                  {profileSaving ? "Saving..." : profileSaved ? "✓ Saved!" : "Save Profile"}
                </button>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black">Display Name</label>
                  <Input 
                    placeholder="Your name or brand" 
                    value={hostProfile.displayName}
                    onChange={e => setHostProfile({...hostProfile, displayName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black">Location</label>
                  <Input 
                    placeholder="City, Region" 
                    value={hostProfile.location}
                    onChange={e => setHostProfile({...hostProfile, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black">Contact Email</label>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={hostProfile.email}
                    onChange={e => setHostProfile({...hostProfile, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black">About (short bio)</label>
                  <Input 
                    placeholder="A few words about you" 
                    value={hostProfile.bio}
                    onChange={e => setHostProfile({...hostProfile, bio: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-bold text-black">Style Tags (select up to 3)</label>
                <ChipSelect 
                  options={styleTagOptions} 
                  selected={hostProfile.styleTags} 
                  onChange={s => setHostProfile({...hostProfile, styleTags: s})}
                />
              </div>
            </Section>

            {/* Listing Details */}
            <Section 
              title="Listing Details"
              action={
                <button 
                  onClick={saveListing}
                  className="rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-bold text-white transition-transform hover:-translate-y-0.5"
                >
                  Save Listing
                </button>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-black">Airbnb Listing URL</label>
                  <Input 
                    placeholder="https://airbnb.com/rooms/..." 
                    value={listing.url}
                    onChange={e => setListing({...listing, url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black">Property Title</label>
                  <Input 
                    placeholder="Cozy Mountain Cabin" 
                    value={listing.title}
                    onChange={e => setListing({...listing, title: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <label className="mb-1.5 block text-xs font-bold text-black">Location</label>
                  <Input 
                    placeholder="Start typing..." 
                    value={listing.location}
                    onChange={e => {
                      setListing({...listing, location: e.target.value})
                      setShowLocationSuggestions(e.target.value.length > 1)
                    }}
                    onFocus={() => setShowLocationSuggestions(listing.location.length > 1)}
                  />
                  {showLocationSuggestions && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border-2 border-black bg-white py-1 shadow-lg">
                      {locationSuggestions
                        .filter(loc => loc.toLowerCase().includes(listing.location.toLowerCase()))
                        .slice(0, 5)
                        .map(loc => (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setListing({...listing, location: loc})
                              setShowLocationSuggestions(false)
                            }}
                            className="w-full px-3 py-2 text-left text-sm font-medium text-black hover:bg-[#FFD84A]"
                          >
                            {loc}
                          </button>
                        ))
                      }
                      {locationSuggestions.filter(loc => loc.toLowerCase().includes(listing.location.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-sm text-black">No suggestions found</div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black">Price Range</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                      className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-left text-sm font-medium text-black"
                    >
                      {listing.priceRange || "Select price range"}
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className={`h-4 w-4 transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                    </button>
                    {showPriceDropdown && (
                      <div className="absolute z-50 mt-1 w-full rounded-lg border-2 border-black bg-white py-1 shadow-lg">
                        {priceRangeOptions.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setListing({...listing, priceRange: opt})
                              setShowPriceDropdown(false)
                            }}
                            className={`w-full px-3 py-2 text-left text-sm font-medium text-black hover:bg-[#FFD84A] ${listing.priceRange === opt ? 'bg-[#FFD84A]' : ''}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-black">Rating (1.0 - 5.0)</label>
                  <Input 
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="4.9" 
                    value={listing.rating}
                    onChange={e => {
                      const val = parseFloat(e.target.value)
                      if (e.target.value === '' || (val >= 1 && val <= 5)) {
                        setListing({...listing, rating: e.target.value})
                      }
                    }}
                  />
                </div>
              </div>
              {listingSaved && (
                <div className="mt-4 rounded-lg border-2 border-black bg-[#28D17C] px-4 py-2 text-sm font-bold text-black">
                  ✓ Listing details saved!
                </div>
              )}
            </Section>

            {/* Creator Search */}
            <Section title="Find Creators">
              <p className="mb-3 text-[11px] text-black">
                Match helps you find creators that fit your property and campaign.
              </p>
              <div className="flex flex-wrap gap-2">
                <Input 
                  placeholder="Search by name or handle..." 
                  className="w-48"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Select
                  className="w-36"
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
                  className="w-32"
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
                <Select
                  className="w-36"
                  size="sm"
                  placeholder="All Locations"
                  value={filters.location}
                  onChange={e => setFilters({...filters, location: e.target.value})}
                  options={[
                    { value: "", label: "All Locations" },
                    { value: "Los Angeles", label: "Los Angeles" },
                    { value: "Austin", label: "Austin" },
                    { value: "Miami", label: "Miami" },
                    { value: "Denver", label: "Denver" },
                    { value: "Portland", label: "Portland" },
                    { value: "Seattle", label: "Seattle" },
                  ]}
                />
                <Select
                  className="w-36"
                  size="sm"
                  placeholder="Sort: Default"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as "default" | "match")}
                  options={[
                    { value: "default", label: "Sort: Default" },
                    { value: "match", label: "Sort: Best Match" },
                  ]}
                />
              </div>

              <div className="mt-4 space-y-2">
                {filteredCreators.map(creator => (
                  <div key={creator.id} className="flex items-center justify-between rounded-lg border border-black bg-white p-3 transition-all hover:border-black hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-semibold text-blue-600">
                        {creator.name.split(" ")[0][0]}{creator.name.split(" ")[2]?.[0] || ""}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-black">{creator.name}</p>
                          <MatchBadge score={creator.matchScore} />
                        </div>
                        <p className="text-xs text-black">@{creator.handle} · {creator.niches[0]} · {creator.audience}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => openComposer(creator)}>
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Taste Optimizer */}
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

            {/* Creator Brief Preview */}
            <Section title="Creator Brief Preview">
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs leading-relaxed text-black">{generateBrief()}</p>
              </div>
              <p className="mt-2 text-[10px] text-black">This is auto-generated from your profile and taste settings.</p>
            </Section>

            {/* Quick Stats */}
            <Section title="Your Stats">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-black">0</p>
                  <p className="text-[10px] text-black">Messages Sent</p>
                </div>
                <div className="rounded-lg bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-black">0</p>
                  <p className="text-[10px] text-black">Active Collabs</p>
                </div>
                <div className="rounded-lg bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-black">0</p>
                  <p className="text-[10px] text-black">Total Clicks</p>
                </div>
                <div className="rounded-lg bg-white p-3 text-center">
                  <p className="text-2xl font-bold text-black">$0</p>
                  <p className="text-[10px] text-black">Spent</p>
                </div>
              </div>
            </Section>

            {/* Quick Links */}
            <Section title="Quick Links">
              <div className="space-y-1.5">
                <Link href="/dashboard/host/settings" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-black transition-colors hover:bg-black/5">
                  Account Settings
                  <span className="text-black">→</span>
                </Link>
                <Link href="/how-to/hosts" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-black transition-colors hover:bg-black/5">
                  How It Works
                  <span className="text-black">→</span>
                </Link>
                <Link href="/pricing" className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-black transition-colors hover:bg-black/5">
                  Pricing
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border-2 border-black bg-white p-6 shadow-xl">
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
              <div className="rounded-xl border-2 border-black p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input 
                    type="checkbox"
                    checked={message.trafficBonusEnabled}
                    onChange={e => setMessage({...message, trafficBonusEnabled: e.target.checked})}
                    className="h-5 w-5 rounded border-2 border-black accent-black"
                  />
                  <span className="text-sm font-bold text-black">Add Traffic Bonus (optional)</span>
                </label>

                {message.trafficBonusEnabled && (
                  <div className="mt-4 space-y-4 border-t border-black/20 pt-4">
                    {/* Metric */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-black/60">Metric</label>
                      <div className="flex gap-3">
                        <button className="flex-1 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-medium text-black">
                          Clicks
                        </button>
                        <button disabled className="flex-1 rounded-full border-2 border-black/20 bg-white px-4 py-2 text-sm font-medium text-black/40">
                          Views (coming soon)
                        </button>
                      </div>
                    </div>

                    {/* Threshold */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-black/60">Threshold</label>
                      <div className="flex gap-2">
                        {["250", "500", "1000", "2500"].map(t => (
                          <button 
                            key={t}
                            onClick={() => setMessage({...message, trafficBonusThreshold: t})}
                            className={`flex-1 rounded-full border-2 px-3 py-2 text-sm font-medium transition-colors ${
                              message.trafficBonusThreshold === t 
                                ? "border-black bg-white text-black" 
                                : "border-black/20 bg-white text-black/60 hover:border-black/40"
                            }`}
                          >
                            {parseInt(t).toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bonus Amount */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-black/60">Bonus Amount ($)</label>
                      <div className="flex gap-2">
                        {["25", "50", "100"].map(a => (
                          <button 
                            key={a}
                            onClick={() => setMessage({...message, trafficBonusAmount: a})}
                            className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                              message.trafficBonusAmount === a 
                                ? "border-black bg-white text-black" 
                                : "border-black/20 bg-white text-black/60 hover:border-black/40"
                            }`}
                          >
                            ${a}
                          </button>
                        ))}
                        <input 
                          placeholder="Custom"
                          value={!["25", "50", "100"].includes(message.trafficBonusAmount) ? message.trafficBonusAmount : ""}
                          onChange={e => setMessage({...message, trafficBonusAmount: e.target.value})}
                          className={`w-24 rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors placeholder:text-black/40 focus:outline-none ${
                            !["25", "50", "100"].includes(message.trafficBonusAmount) && message.trafficBonusAmount
                              ? "border-black bg-white text-black"
                              : "border-black/20 bg-white text-black/60"
                          }`}
                          type="number"
                        />
                      </div>
                    </div>

                    {/* Payout Mode */}
                    <div className="rounded-full border-2 border-black/20 bg-white px-4 py-3">
                      <p className="text-sm font-medium text-black/60">Payout Mode: Manual Approve (Beta)</p>
                      <p className="mt-0.5 text-xs text-black/40">
                        You approve bonuses after the dashboard shows the threshold was reached.
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="rounded-full border-2 border-black/20 bg-white px-4 py-3">
                      <p className="text-sm font-medium text-black/60">
                        Bonus: ${message.trafficBonusAmount || "0"} when link hits {parseInt(message.trafficBonusThreshold || "0").toLocaleString()} clicks.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-black">Message</label>
                <textarea 
                  className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm text-black focus:outline-none"
                  rows={4}
                  value={message.text}
                  onChange={e => setMessage({...message, text: e.target.value})}
                />
              </div>

              {/* Total Summary */}
              {message.basePay && (
                <div className="rounded-lg border-2 border-black bg-[#FFD84A] p-3">
                  <p className="text-xs font-bold text-black">
                    Offer: ${message.basePay} base
                    {message.trafficBonusEnabled && ` + $${message.trafficBonusAmount} at ${parseInt(message.trafficBonusThreshold).toLocaleString()} clicks`}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setComposing(null)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={sendMessage} disabled={!message.basePay}>
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
