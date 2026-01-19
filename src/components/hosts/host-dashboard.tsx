"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Edge blur
function EdgeBlur() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full bg-[hsl(199,89%,48%)]/6 blur-[200px]" />
      <div className="absolute -bottom-60 -left-40 h-[600px] w-[600px] rounded-full bg-[hsl(213,94%,45%)]/5 blur-[180px]" />
    </div>
  )
}

// Section wrapper
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-foreground/5 bg-white/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
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
  onChange: (s: string[]) => void
  max?: number
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt))
    } else if (selected.length < max) {
      onChange([...selected, opt])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            selected.includes(opt) 
              ? "bg-primary text-white" 
              : "border border-foreground/10 bg-white hover:border-foreground/20"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// Toast notification
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg">
      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      <span className="text-sm font-medium text-emerald-800">{message}</span>
      <button onClick={onClose} className="text-emerald-600 hover:text-emerald-800">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// Mock creators for search
const mockCreators = [
  { id: 1, name: "Travel Creator A", handle: "travelcreator_a", niche: "Travel", audience: "50K-100K", location: "Los Angeles, CA", platform: "Instagram" },
  { id: 2, name: "Lifestyle Creator B", handle: "lifestyle_b", niche: "Lifestyle", audience: "100K-250K", location: "Austin, TX", platform: "TikTok" },
  { id: 3, name: "Photo Creator C", handle: "photo_creator_c", niche: "Photography", audience: "25K-50K", location: "Miami, FL", platform: "Instagram" },
  { id: 4, name: "Vlog Creator D", handle: "vlogger_d", niche: "Vlog", audience: "250K-500K", location: "Denver, CO", platform: "YouTube" },
  { id: 5, name: "Food Creator E", handle: "foodie_e", niche: "Food", audience: "50K-100K", location: "Portland, OR", platform: "TikTok" },
  { id: 6, name: "Adventure Creator F", handle: "adventure_f", niche: "Adventure", audience: "100K-250K", location: "Seattle, WA", platform: "Instagram" },
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
    photos: ["", "", "", "", "", ""],
  })

  // Taste optimizer state
  const [taste, setTaste] = useState({
    guests: [] as string[],
    vibes: [] as string[],
    rules: [] as string[],
  })

  // Search state
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ platform: "", niche: "", audience: "" })
  
  // Message composer state
  const [composing, setComposing] = useState<typeof mockCreators[0] | null>(null)
  const [message, setMessage] = useState({ offerType: "flat", amount: "", text: "" })
  
  // Toast
  const [toast, setToast] = useState("")

  // Generate creator brief
  const generateBrief = () => {
    const guests = taste.guests.length ? taste.guests.join(" and ").toLowerCase() : "travelers"
    const vibes = taste.vibes.length ? taste.vibes.join(", ").toLowerCase() : "authentic"
    const rules = taste.rules.filter(r => r.includes("allowed") || r.includes("welcome")).join(", ").toLowerCase()
    return `We're looking for creators who connect with ${guests} and produce ${vibes} content. ${listing.title ? `Our property "${listing.title}" in ${listing.neighborhood || "the area"}` : "Our property"} offers a unique experience${rules ? ` (${rules})` : ""}. We'd love content that highlights the space and surrounding area.`
  }

  // Filter creators
  const filteredCreators = mockCreators.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.handle.toLowerCase().includes(search.toLowerCase())) return false
    if (filters.platform && c.platform !== filters.platform) return false
    if (filters.niche && c.niche !== filters.niche) return false
    return true
  })

  // Open composer
  const openComposer = (creator: typeof mockCreators[0]) => {
    setComposing(creator)
    setMessage({ offerType: "flat", amount: "", text: generateBrief() })
  }

  // Send message
  const sendMessage = () => {
    setToast(`Message sent to @${composing?.handle}!`)
    setComposing(null)
    setTimeout(() => setToast(""), 3000)
  }

  return (
    <div className="relative min-h-screen bg-[hsl(210,20%,99%)]">
      <EdgeBlur />

      {/* Top bar */}
      <div className="border-b border-foreground/5 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">BETA</span>
            <span className="text-xs text-muted-foreground">Host Dashboard</span>
          </div>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome, Host</h1>
          <p className="mt-1 text-muted-foreground">Set up your property and start outreach.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Host Profile */}
            <Section title="Host Profile">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Display Name</label>
                  <Input 
                    placeholder="Your name or brand" 
                    value={hostProfile.displayName}
                    onChange={e => setHostProfile({...hostProfile, displayName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Location</label>
                  <Input 
                    placeholder="City, Region" 
                    value={hostProfile.location}
                    onChange={e => setHostProfile({...hostProfile, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Contact Email</label>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={hostProfile.email}
                    onChange={e => setHostProfile({...hostProfile, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">About (short bio)</label>
                  <Input 
                    placeholder="A few words about you" 
                    value={hostProfile.bio}
                    onChange={e => setHostProfile({...hostProfile, bio: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Style Tags (select up to 3)</label>
                <ChipSelect 
                  options={styleTagOptions} 
                  selected={hostProfile.styleTags} 
                  onChange={s => setHostProfile({...hostProfile, styleTags: s})}
                />
              </div>
            </Section>

            {/* Listing Preview */}
            <Section title="Listing Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Airbnb/VRBO Listing URL</label>
                  <Input 
                    placeholder="https://airbnb.com/rooms/..." 
                    value={listing.url}
                    onChange={e => setListing({...listing, url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Property Title</label>
                  <Input 
                    placeholder="Cozy Mountain Cabin" 
                    value={listing.title}
                    onChange={e => setListing({...listing, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Neighborhood/City</label>
                  <Input 
                    placeholder="Big Bear, CA" 
                    value={listing.neighborhood}
                    onChange={e => setListing({...listing, neighborhood: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price Range (nightly)</label>
                  <Input 
                    placeholder="$150-200" 
                    value={listing.priceRange}
                    onChange={e => setListing({...listing, priceRange: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Rating</label>
                    <Input 
                      placeholder="4.9" 
                      value={listing.rating}
                      onChange={e => setListing({...listing, rating: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Reviews</label>
                    <Input 
                      placeholder="127" 
                      value={listing.reviewCount}
                      onChange={e => setListing({...listing, reviewCount: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Photo grid */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">Photo URLs (up to 6)</label>
                <div className="grid grid-cols-3 gap-2">
                  {listing.photos.map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg border-2 border-dashed border-foreground/10 bg-foreground/[0.02] flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground/50">Photo {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Listing preview card */}
              {listing.title && (
                <div className="mt-4 rounded-xl border border-foreground/10 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground">{listing.neighborhood}</p>
                      <div className="mt-2 flex items-center gap-3 text-sm">
                        {listing.priceRange && <span className="font-medium">{listing.priceRange}/night</span>}
                        {listing.rating && (
                          <span className="flex items-center gap-1">
                            <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {listing.rating} ({listing.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                    {listing.url && (
                      <a href={listing.url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90">
                        View on Airbnb
                      </a>
                    )}
                  </div>
                </div>
              )}
            </Section>

            {/* Creator Search */}
            <Section title="Find Creators">
              <div className="flex flex-wrap gap-2">
                <Input 
                  placeholder="Search by name or handle..." 
                  className="w-48"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select 
                  className="rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm"
                  value={filters.platform}
                  onChange={e => setFilters({...filters, platform: e.target.value})}
                >
                  <option value="">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                </select>
                <select 
                  className="rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm"
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
              </div>

              <div className="mt-4 space-y-2">
                {filteredCreators.map(creator => (
                  <div key={creator.id} className="flex items-center justify-between rounded-lg border border-foreground/5 bg-white/50 p-3 transition-all hover:border-foreground/10 hover:bg-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-semibold text-primary">
                        {creator.name.split(" ")[0][0]}{creator.name.split(" ")[2]?.[0] || ""}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{creator.name}</p>
                        <p className="text-xs text-muted-foreground">@{creator.handle} · {creator.niche} · {creator.audience}</p>
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

          {/* Right column */}
          <div className="space-y-6">
            {/* Taste Optimizer */}
            <Section title="Taste Optimizer">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">Ideal Guests (1-2)</label>
                  <ChipSelect options={guestOptions} selected={taste.guests} onChange={g => setTaste({...taste, guests: g})} max={2} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">Vibe (2-3)</label>
                  <ChipSelect options={vibeOptions} selected={taste.vibes} onChange={v => setTaste({...taste, vibes: v})} max={3} />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">House Rules</label>
                  <ChipSelect options={rulesOptions} selected={taste.rules} onChange={r => setTaste({...taste, rules: r})} max={4} />
                </div>
              </div>

              {/* Generated brief */}
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">Generated Creator Brief</p>
                <p className="text-xs leading-relaxed text-foreground/80">{generateBrief()}</p>
              </div>
            </Section>

            {/* Message Composer */}
            {composing && (
              <Section title={`Message @${composing.handle}`}>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Offer Type</label>
                    <select 
                      className="w-full rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm"
                      value={message.offerType}
                      onChange={e => setMessage({...message, offerType: e.target.value})}
                    >
                      <option value="flat">Flat Fee</option>
                      <option value="percent">Commission %</option>
                      <option value="post-for-stay">Post-for-Stay</option>
                    </select>
                  </div>
                  {message.offerType !== "post-for-stay" && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        {message.offerType === "flat" ? "Amount ($)" : "Commission (%)"}
                      </label>
                      <Input 
                        placeholder={message.offerType === "flat" ? "500" : "10"}
                        value={message.amount}
                        onChange={e => setMessage({...message, amount: e.target.value})}
                      />
                    </div>
                  )}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
                    <textarea 
                      className="w-full rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm"
                      rows={5}
                      value={message.text}
                      onChange={e => setMessage({...message, text: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 text-xs" onClick={sendMessage}>Send Message</Button>
                    <Button variant="outline" className="text-xs" onClick={() => setComposing(null)}>Cancel</Button>
                  </div>
                </div>
              </Section>
            )}

            {/* Quick stats placeholder */}
            <div className="rounded-xl border border-foreground/5 bg-white/60 p-5 backdrop-blur-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outreach Stats</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-[10px] text-muted-foreground">Messages sent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-[10px] text-muted-foreground">Responses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-[10px] text-muted-foreground">Active deals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">—</p>
                  <p className="text-[10px] text-muted-foreground">Link clicks</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link href="/how-it-works" className="hover:text-foreground">How it works</Link>
          <span className="text-foreground/20">•</span>
          <Link href="/waitlist" className="hover:text-foreground">Creator Waitlist</Link>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  )
}
