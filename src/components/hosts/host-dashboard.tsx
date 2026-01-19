"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Section wrapper
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</h2>
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
              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
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
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-black px-4 py-3 text-sm text-white shadow-lg">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/60 hover:text-white">✕</button>
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

export function HostDashboard() {
  // Host profile state
  const [hostProfile, setHostProfile] = useState({
    displayName: "",
    location: "",
    email: "",
    bio: "",
    styleTags: [] as string[],
  })

  // Listing state
  const [listing, setListing] = useState({
    url: "",
    title: "",
    neighborhood: "",
    priceRange: "",
    rating: "",
    reviewCount: "",
  })

  // Taste optimizer state
  const [taste, setTaste] = useState({
    guests: [] as string[],
    vibes: [] as string[],
    rules: [] as string[],
  })

  // Search state
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ platform: "", niche: "" })
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">BETA</span>
            <span className="text-xs text-gray-500">Host Dashboard</span>
          </div>
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-900">← Back to site</Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, Host</h1>
            <p className="mt-1 text-gray-600">Set up your property and start outreach.</p>
          </div>
          <Button asChild>
            <Link href="/creators">Browse all creators</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Host Profile */}
            <Section title="Host Profile">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Display Name</label>
                  <Input 
                    placeholder="Your name or brand" 
                    value={hostProfile.displayName}
                    onChange={e => setHostProfile({...hostProfile, displayName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Location</label>
                  <Input 
                    placeholder="City, Region" 
                    value={hostProfile.location}
                    onChange={e => setHostProfile({...hostProfile, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Contact Email</label>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={hostProfile.email}
                    onChange={e => setHostProfile({...hostProfile, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">About (short bio)</label>
                  <Input 
                    placeholder="A few words about you" 
                    value={hostProfile.bio}
                    onChange={e => setHostProfile({...hostProfile, bio: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-gray-600">Style Tags (select up to 3)</label>
                <ChipSelect 
                  options={styleTagOptions} 
                  selected={hostProfile.styleTags} 
                  onChange={s => setHostProfile({...hostProfile, styleTags: s})}
                />
              </div>
            </Section>

            {/* Listing Details */}
            <Section title="Listing Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Airbnb/VRBO Listing URL</label>
                  <Input 
                    placeholder="https://airbnb.com/rooms/..." 
                    value={listing.url}
                    onChange={e => setListing({...listing, url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Property Title</label>
                  <Input 
                    placeholder="Cozy Mountain Cabin" 
                    value={listing.title}
                    onChange={e => setListing({...listing, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Neighborhood/Area</label>
                  <Input 
                    placeholder="Lake Tahoe, Big Bear, etc." 
                    value={listing.neighborhood}
                    onChange={e => setListing({...listing, neighborhood: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Price Range</label>
                  <Input 
                    placeholder="$150-250/night" 
                    value={listing.priceRange}
                    onChange={e => setListing({...listing, priceRange: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Rating</label>
                  <Input 
                    placeholder="4.9" 
                    value={listing.rating}
                    onChange={e => setListing({...listing, rating: e.target.value})}
                  />
                </div>
              </div>
            </Section>

            {/* Creator Search */}
            <Section title="Find Creators">
              <p className="mb-3 text-[11px] text-gray-500">
                Match helps you find creators that fit your property and campaign.
              </p>
              <div className="flex flex-wrap gap-2">
                <Input 
                  placeholder="Search by name or handle..." 
                  className="w-48"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select 
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={filters.platform}
                  onChange={e => setFilters({...filters, platform: e.target.value})}
                >
                  <option value="">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                </select>
                <select 
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={filters.niche}
                  onChange={e => setFilters({...filters, niche: e.target.value})}
                >
                  <option value="">All Niches</option>
                  <option value="Travel">Travel</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Photography">Photography</option>
                  <option value="Vlog">Vlog</option>
                  <option value="Food">Food</option>
                  <option value="Adventure">Adventure</option>
                </select>
                <select 
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as "default" | "match")}
                >
                  <option value="default">Sort: Default</option>
                  <option value="match">Sort: Best Match</option>
                </select>
              </div>

              <div className="mt-4 space-y-2">
                {filteredCreators.map(creator => (
                  <div key={creator.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-semibold text-blue-600">
                        {creator.name.split(" ")[0][0]}{creator.name.split(" ")[2]?.[0] || ""}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{creator.name}</p>
                          <MatchBadge score={creator.matchScore} />
                        </div>
                        <p className="text-xs text-gray-500">@{creator.handle} · {creator.niches[0]} · {creator.audience}</p>
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
                  <label className="mb-2 block text-xs font-medium text-gray-600">Ideal Guests (1-2)</label>
                  <ChipSelect 
                    options={guestOptions} 
                    selected={taste.guests} 
                    onChange={s => setTaste({...taste, guests: s})}
                    max={2}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-600">Vibe Tags (up to 3)</label>
                  <ChipSelect 
                    options={vibeOptions} 
                    selected={taste.vibes} 
                    onChange={s => setTaste({...taste, vibes: s})}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-600">House Rules</label>
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
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs leading-relaxed text-gray-700">{generateBrief()}</p>
              </div>
              <p className="mt-2 text-[10px] text-gray-400">This is auto-generated from your profile and taste settings.</p>
            </Section>

            {/* Quick Stats */}
            <Section title="Your Stats">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-[10px] text-gray-500">Messages Sent</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-[10px] text-gray-500">Active Collabs</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-[10px] text-gray-500">Total Clicks</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">$0</p>
                  <p className="text-[10px] text-gray-500">Spent</p>
                </div>
              </div>
            </Section>

            {/* Quick Links */}
            <Section title="Quick Links">
              <div className="space-y-1.5">
                <Link href="/dashboard/host/settings" className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 transition-colors hover:bg-gray-100">
                  Account Settings
                  <span className="text-gray-400">→</span>
                </Link>
                <Link href="/how-to/hosts" className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 transition-colors hover:bg-gray-100">
                  How It Works
                  <span className="text-gray-400">→</span>
                </Link>
                <Link href="/pricing" className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 transition-colors hover:bg-gray-100">
                  Pricing
                  <span className="text-gray-400">→</span>
                </Link>
                <Link href="/help" className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 transition-colors hover:bg-gray-100">
                  Help Center
                  <span className="text-gray-400">→</span>
                </Link>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-4 px-4 text-xs text-gray-400 sm:px-6">
          <Link href="/how-it-works" className="hover:text-gray-600">How it works</Link>
          <span>•</span>
          <Link href="/waitlist" className="hover:text-gray-600">Creator Waitlist</Link>
        </div>
      </div>

      {/* Message Composer Modal */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border-2 border-black bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-black">Send Offer to @{composing.handle}</h3>
              <button onClick={() => setComposing(null)} className="text-black/60 hover:text-black">✕</button>
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
                <p className="mt-1 text-[10px] text-black/60">Flat rate for posts, reels, stories as agreed.</p>
              </div>

              {/* Traffic Bonus Toggle */}
              <div className="rounded-lg border-2 border-black p-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input 
                    type="checkbox"
                    checked={message.trafficBonusEnabled}
                    onChange={e => setMessage({...message, trafficBonusEnabled: e.target.checked})}
                    className="h-4 w-4 rounded border-2 border-black accent-black"
                  />
                  <span className="text-sm font-bold text-black">Add Traffic Bonus (optional)</span>
                </label>

                {message.trafficBonusEnabled && (
                  <div className="mt-3 space-y-3 border-t border-black/10 pt-3">
                    {/* Metric */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-black">Metric</label>
                      <div className="flex gap-2">
                        <button className="flex-1 rounded-lg border-2 border-black bg-[#FFD84A] px-3 py-1.5 text-xs font-bold text-black">
                          Clicks
                        </button>
                        <button disabled className="flex-1 rounded-lg border-2 border-black/30 bg-white px-3 py-1.5 text-xs font-bold text-black/40">
                          Views (coming soon)
                        </button>
                      </div>
                    </div>

                    {/* Threshold */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-black">Threshold</label>
                      <div className="flex gap-1.5">
                        {["250", "500", "1000", "2500"].map(t => (
                          <button 
                            key={t}
                            onClick={() => setMessage({...message, trafficBonusThreshold: t})}
                            className={`flex-1 rounded-lg border-2 px-2 py-1.5 text-xs font-bold transition-colors ${
                              message.trafficBonusThreshold === t 
                                ? "border-black bg-black text-white" 
                                : "border-black bg-white text-black hover:bg-black/5"
                            }`}
                          >
                            {parseInt(t).toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bonus Amount */}
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-black">Bonus Amount ($)</label>
                      <div className="flex gap-1.5">
                        {["25", "50", "100"].map(a => (
                          <button 
                            key={a}
                            onClick={() => setMessage({...message, trafficBonusAmount: a})}
                            className={`rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors ${
                              message.trafficBonusAmount === a 
                                ? "border-black bg-black text-white" 
                                : "border-black bg-white text-black hover:bg-black/5"
                            }`}
                          >
                            ${a}
                          </button>
                        ))}
                        <Input 
                          placeholder="Custom"
                          value={!["25", "50", "100"].includes(message.trafficBonusAmount) ? message.trafficBonusAmount : ""}
                          onChange={e => setMessage({...message, trafficBonusAmount: e.target.value})}
                          className="w-20 text-xs"
                          type="number"
                        />
                      </div>
                    </div>

                    {/* Payout Mode */}
                    <div className="rounded-lg bg-black/5 p-2">
                      <p className="text-[10px] font-bold text-black">Payout Mode: Manual Approve (Beta)</p>
                      <p className="mt-0.5 text-[9px] text-black/60">
                        You approve bonuses after the dashboard shows the threshold was reached.
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg border-2 border-black bg-[#28D17C] p-2">
                      <p className="text-xs font-bold text-black">
                        Bonus: ${message.trafficBonusAmount} when link hits {parseInt(message.trafficBonusThreshold).toLocaleString()} clicks.
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
