"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Container } from "@/components/layout/container"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Mock approved creators database
const APPROVED_CREATORS = [
  { 
    id: 1, 
    name: "Sarah Chen", 
    handle: "sarahexplores", 
    avatar: "SC",
    niches: ["Travel", "Photography"], 
    audienceSize: "85K", 
    location: "Los Angeles, CA", 
    platforms: ["Instagram", "TikTok"],
    rate: "$400-600",
    bio: "Travel photographer capturing hidden gems across the West Coast.",
    engagementRate: "4.2%",
  },
  { 
    id: 2, 
    name: "Marcus Johnson", 
    handle: "marcusjtravel", 
    avatar: "MJ",
    niches: ["Lifestyle", "Adventure"], 
    audienceSize: "120K", 
    location: "Austin, TX", 
    platforms: ["YouTube", "Instagram"],
    rate: "$600-900",
    bio: "Adventure lifestyle creator focusing on unique stays and outdoor experiences.",
    engagementRate: "3.8%",
  },
  { 
    id: 3, 
    name: "Emily Rodriguez", 
    handle: "emilystays", 
    avatar: "ER",
    niches: ["Luxury", "Design"], 
    audienceSize: "65K", 
    location: "Miami, FL", 
    platforms: ["Instagram"],
    rate: "$350-500",
    bio: "Interior design enthusiast showcasing beautiful vacation rentals.",
    engagementRate: "5.1%",
  },
  { 
    id: 4, 
    name: "Jake Williams", 
    handle: "jakewanders", 
    avatar: "JW",
    niches: ["Vlog", "Family"], 
    audienceSize: "250K", 
    location: "Denver, CO", 
    platforms: ["YouTube", "TikTok"],
    rate: "$800-1200",
    bio: "Family travel vlogger documenting adventures with kids.",
    engagementRate: "3.5%",
  },
  { 
    id: 5, 
    name: "Mia Thompson", 
    handle: "miafoodtravel", 
    avatar: "MT",
    niches: ["Food", "Travel"], 
    audienceSize: "95K", 
    location: "Portland, OR", 
    platforms: ["Instagram", "TikTok"],
    rate: "$450-650",
    bio: "Food and travel content creator exploring local cuisines.",
    engagementRate: "4.8%",
  },
  { 
    id: 6, 
    name: "Alex Kim", 
    handle: "alexkimphoto", 
    avatar: "AK",
    niches: ["Photography", "Minimal"], 
    audienceSize: "45K", 
    location: "Seattle, WA", 
    platforms: ["Instagram"],
    rate: "$300-450",
    bio: "Minimalist photography focusing on architecture and interiors.",
    engagementRate: "6.2%",
  },
]

const PLATFORM_OPTIONS = ["All Platforms", "Instagram", "TikTok", "YouTube"]
const NICHE_OPTIONS = ["All Niches", "Travel", "Lifestyle", "Photography", "Vlog", "Food", "Adventure", "Luxury", "Design", "Family", "Minimal"]
const AUDIENCE_OPTIONS = ["All Sizes", "Under 50K", "50K-100K", "100K-250K", "250K+"]

export default function SearchCreatorsPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState("All Platforms")
  const [niche, setNiche] = useState("All Niches")
  const [audienceSize, setAudienceSize] = useState("All Sizes")
  
  // Dropdowns
  const [showPlatform, setShowPlatform] = useState(false)
  const [showNiche, setShowNiche] = useState(false)
  const [showAudience, setShowAudience] = useState(false)

  // Check if user is logged in as host
  useEffect(() => {
    const role = localStorage.getItem('creatorstays_role')
    if (role !== 'host') {
      router.push('/demo-login?role=host')
    } else {
      setIsAuthorized(true)
    }
    setIsLoading(false)
  }, [router])

  // Filter creators
  const filteredCreators = APPROVED_CREATORS.filter(creator => {
    // Search
    if (search && !creator.name.toLowerCase().includes(search.toLowerCase()) && 
        !creator.handle.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    // Platform
    if (platform !== "All Platforms" && !creator.platforms.includes(platform)) {
      return false
    }
    // Niche
    if (niche !== "All Niches" && !creator.niches.includes(niche)) {
      return false
    }
    // Audience size
    if (audienceSize !== "All Sizes") {
      const size = parseInt(creator.audienceSize.replace('K', '000'))
      if (audienceSize === "Under 50K" && size >= 50000) return false
      if (audienceSize === "50K-100K" && (size < 50000 || size > 100000)) return false
      if (audienceSize === "100K-250K" && (size < 100000 || size > 250000)) return false
      if (audienceSize === "250K+" && size < 250000) return false
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <p className="text-black">Loading...</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="dashboard flex min-h-screen flex-col bg-[#FAFAFA]">
      <Navbar />
      <main className="flex-1 py-6 pt-20">
        <Container>
          <div className="mb-4">
            <Link href="/dashboard/host" className="text-xs font-bold text-black hover:underline">
              ← Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-6 rounded-xl border-2 border-black bg-[#4AA3FF] p-5">
            <h1 className="text-2xl font-bold text-black">Find Creators</h1>
            <p className="mt-1 text-sm text-black">
              Browse approved creators and send collaboration offers.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl border-2 border-black bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by name or handle..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Platform Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowPlatform(!showPlatform); setShowNiche(false); setShowAudience(false) }}
                  className="rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black"
                >
                  {platform} ▾
                </button>
                {showPlatform && (
                  <div className="absolute z-50 mt-1 w-40 rounded-lg border-2 border-black bg-white py-1 shadow-lg">
                    {PLATFORM_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setPlatform(opt); setShowPlatform(false) }}
                        className={`w-full px-3 py-2 text-left text-sm font-medium text-black hover:bg-[#FFD84A] ${platform === opt ? 'bg-[#FFD84A]' : ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Niche Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowNiche(!showNiche); setShowPlatform(false); setShowAudience(false) }}
                  className="rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black"
                >
                  {niche} ▾
                </button>
                {showNiche && (
                  <div className="absolute z-50 mt-1 w-40 rounded-lg border-2 border-black bg-white py-1 shadow-lg max-h-48 overflow-y-auto">
                    {NICHE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setNiche(opt); setShowNiche(false) }}
                        className={`w-full px-3 py-2 text-left text-sm font-medium text-black hover:bg-[#FFD84A] ${niche === opt ? 'bg-[#FFD84A]' : ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Audience Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowAudience(!showAudience); setShowPlatform(false); setShowNiche(false) }}
                  className="rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black"
                >
                  {audienceSize} ▾
                </button>
                {showAudience && (
                  <div className="absolute z-50 mt-1 w-40 rounded-lg border-2 border-black bg-white py-1 shadow-lg">
                    {AUDIENCE_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setAudienceSize(opt); setShowAudience(false) }}
                        className={`w-full px-3 py-2 text-left text-sm font-medium text-black hover:bg-[#FFD84A] ${audienceSize === opt ? 'bg-[#FFD84A]' : ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="mb-4 text-sm font-bold text-black">
            {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
          </p>

          {/* Creator Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCreators.map(creator => (
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
                  {creator.niches.map(n => (
                    <span key={n} className="rounded-full border border-black bg-[#4AA3FF]/20 px-2 py-0.5 text-[9px] font-bold text-black">
                      {n}
                    </span>
                  ))}
                  {creator.platforms.map(p => (
                    <span key={p} className="rounded-full border border-black bg-[#FFD84A]/30 px-2 py-0.5 text-[9px] font-bold text-black">
                      {p}
                    </span>
                  ))}
                </div>

                {/* Location */}
                <p className="mt-2 text-[10px] text-black">📍 {creator.location}</p>

                {/* Action */}
                <Button className="mt-4 w-full" size="sm">
                  Send Offer
                </Button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCreators.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-black/30 p-8 text-center">
              <p className="text-sm font-bold text-black">No creators match your filters</p>
              <p className="mt-1 text-xs text-black">Try adjusting your search criteria</p>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  )
}
