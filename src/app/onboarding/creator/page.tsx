"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import LocationAutocomplete from "@/components/ui/location-autocomplete"

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface OnboardingData {
  // Step 1: About You
  displayName: string
  handle: string
  bio: string
  location: string
  avatarUrl: string
  // Step 2: Platforms
  instagramHandle: string
  instagramFollowers: string
  tiktokHandle: string
  tiktokFollowers: string
  youtubeHandle: string
  youtubeSubscribers: string
  websiteUrl: string
  // Step 3: Your Niche & Content
  niches: string[]
  deliverables: string[]
  contentStyle: string[]
  // Step 4: Rates & Availability
  minimumFlatFee: string
  openToGiftedStays: boolean
  preferredDealTypes: string[]
  availability: string
  travelRadius: string
  // Step 5: Portfolio
  portfolioUrls: string[]
  mediaKitUrl: string
}

const NICHES = [
  { value: "travel", label: "✈️ Travel", desc: "Destinations & experiences" },
  { value: "lifestyle", label: "🌟 Lifestyle", desc: "Daily life & aesthetics" },
  { value: "photography", label: "📸 Photography", desc: "Visual storytelling" },
  { value: "adventure", label: "🏔️ Adventure", desc: "Outdoor & active" },
  { value: "food", label: "🍜 Food & Culinary", desc: "Dining & cooking" },
  { value: "wellness", label: "🧘 Wellness", desc: "Health & self-care" },
  { value: "luxury", label: "💎 Luxury", desc: "High-end experiences" },
  { value: "budget", label: "💰 Budget", desc: "Value-focused" },
  { value: "family", label: "👨‍👩‍👧 Family", desc: "Traveling with kids" },
  { value: "couples", label: "💑 Couples", desc: "Romantic getaways" },
  { value: "solo", label: "🎒 Solo Travel", desc: "Independent adventures" },
  { value: "digital-nomad", label: "💻 Digital Nomad", desc: "Work & travel" },
]

const DELIVERABLES = [
  { value: "ig-post", label: "Instagram Post", platform: "instagram", icon: "📷" },
  { value: "ig-reel", label: "Instagram Reel", platform: "instagram", icon: "🎬" },
  { value: "ig-stories", label: "Instagram Stories", platform: "instagram", icon: "⭕" },
  { value: "tiktok", label: "TikTok Video", platform: "tiktok", icon: "🎵" },
  { value: "youtube", label: "YouTube Video", platform: "youtube", icon: "▶️" },
  { value: "youtube-short", label: "YouTube Short", platform: "youtube", icon: "📱" },
  { value: "blog", label: "Blog Post", platform: "blog", icon: "📝" },
  { value: "twitter", label: "Twitter/X Thread", platform: "twitter", icon: "🐦" },
  { value: "photos", label: "Raw Photos", platform: "photos", icon: "🖼️" },
  { value: "drone", label: "Drone Footage", platform: "video", icon: "🚁" },
]

const CONTENT_STYLES = [
  "Cinematic", "Casual/Authentic", "Polished/Editorial", "Vlog-style",
  "Aesthetic/Moody", "Bright & Airy", "Storytelling", "Informative/Guide",
  "Humorous", "Inspirational"
]

const DEAL_TYPES = [
  { value: "paid", label: "💵 Paid Collaborations", desc: "Flat fee + free stay" },
  { value: "gifted", label: "🎁 Post-for-Stay", desc: "Content in exchange for stay" },
  { value: "hybrid", label: "🤝 Hybrid Deals", desc: "Reduced rate + stay" },
  { value: "affiliate", label: "📊 Affiliate/Commission", desc: "Earn per booking" },
]

const AVAILABILITY_OPTIONS = [
  { value: "immediate", label: "Available now" },
  { value: "2-weeks", label: "In 2+ weeks" },
  { value: "1-month", label: "In 1+ month" },
  { value: "flexible", label: "Flexible" },
]

const TRAVEL_RADIUS = [
  { value: "local", label: "Local only (driving distance)" },
  { value: "regional", label: "Regional (same country)" },
  { value: "international", label: "International" },
  { value: "anywhere", label: "Will travel anywhere" },
]

// ============================================================================
// COMPONENTS  
// ============================================================================

function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100
  
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-black/60">
        <span>Step {step} of {totalSteps}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/10">
        <div 
          className="h-full rounded-full bg-[#D7B6FF] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function StepHeader({ 
  title, 
  subtitle, 
  emoji 
}: { 
  title: string
  subtitle: string
  emoji: string 
}) {
  return (
    <div className="mb-8 text-center">
      <span className="mb-2 inline-block text-5xl">{emoji}</span>
      <h1 className="font-heading text-3xl tracking-tight text-black sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-black/60">{subtitle}</p>
    </div>
  )
}

function formatFollowerCount(count: string): string {
  const num = parseInt(count.replace(/,/g, ''))
  if (isNaN(num)) return count
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return count
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreatorOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null)
  const [checkingHandle, setCheckingHandle] = useState(false)
  
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    handle: "",
    bio: "",
    location: "",
    avatarUrl: "",
    instagramHandle: "",
    instagramFollowers: "",
    tiktokHandle: "",
    tiktokFollowers: "",
    youtubeHandle: "",
    youtubeSubscribers: "",
    websiteUrl: "",
    niches: [],
    deliverables: [],
    contentStyle: [],
    minimumFlatFee: "",
    openToGiftedStays: true,
    preferredDealTypes: ["paid", "gifted"],
    availability: "flexible",
    travelRadius: "anywhere",
    portfolioUrls: ["", "", ""],
    mediaKitUrl: "",
  })

  const totalSteps = 5
  
  const updateField = <K extends keyof OnboardingData>(
    field: K, 
    value: OnboardingData[K]
  ) => {
    setData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  // Check auth and existing profile
  useEffect(() => {
    async function init() {
      if (status === "loading") return
      
      if (status === "unauthenticated") {
        router.push("/login?callbackUrl=/onboarding/creator")
        return
      }
      
      try {
        const res = await fetch("/api/creator/profile")
        if (res.ok) {
          const profile = await res.json()
          if (profile.onboardingComplete) {
            router.push("/dashboard/creator")
            return
          }
          // Pre-fill with existing data
          setData(prev => ({
            ...prev,
            displayName: profile.displayName || session?.user?.name || "",
            handle: profile.handle || "",
            bio: profile.bio || "",
            location: profile.location || "",
            avatarUrl: profile.avatarUrl || session?.user?.image || "",
            instagramHandle: profile.instagramHandle || "",
            instagramFollowers: profile.instagramFollowers?.toString() || "",
            tiktokHandle: profile.tiktokHandle || "",
            tiktokFollowers: profile.tiktokFollowers?.toString() || "",
            youtubeHandle: profile.youtubeHandle || "",
            youtubeSubscribers: profile.youtubeSubscribers?.toString() || "",
          }))
        } else {
          setData(prev => ({
            ...prev,
            displayName: session?.user?.name || "",
            avatarUrl: session?.user?.image || "",
          }))
        }
      } catch (e) {
        console.error("Failed to check profile:", e)
      }
      
      setLoading(false)
    }
    
    init()
  }, [status, session, router])

  // Check handle availability
  useEffect(() => {
    const checkHandle = async () => {
      if (!data.handle || data.handle.length < 3) {
        setHandleAvailable(null)
        return
      }
      
      setCheckingHandle(true)
      try {
        const res = await fetch(`/api/creator/check-handle?handle=${encodeURIComponent(data.handle)}`)
        const result = await res.json()
        setHandleAvailable(result.available)
      } catch {
        setHandleAvailable(null)
      }
      setCheckingHandle(false)
    }
    
    const timeout = setTimeout(checkHandle, 500)
    return () => clearTimeout(timeout)
  }, [data.handle])

  // Calculate total followers
  const totalFollowers = () => {
    let total = 0
    if (data.instagramFollowers) total += parseInt(data.instagramFollowers.replace(/,/g, '')) || 0
    if (data.tiktokFollowers) total += parseInt(data.tiktokFollowers.replace(/,/g, '')) || 0
    if (data.youtubeSubscribers) total += parseInt(data.youtubeSubscribers.replace(/,/g, '')) || 0
    return total
  }

  // Validation
  const validateStep = (stepNum: number): boolean => {
    setError("")
    
    switch (stepNum) {
      case 1:
        if (!data.displayName.trim()) {
          setError("Please enter your name")
          return false
        }
        if (!data.handle.trim()) {
          setError("Please choose a handle")
          return false
        }
        if (data.handle.length < 3) {
          setError("Handle must be at least 3 characters")
          return false
        }
        if (handleAvailable === false) {
          setError("This handle is already taken")
          return false
        }
        return true
        
      case 2:
        // At least one platform required
        if (!data.instagramHandle && !data.tiktokHandle && !data.youtubeHandle) {
          setError("Please add at least one social platform")
          return false
        }
        return true
        
      case 3:
        if (data.niches.length === 0) {
          setError("Please select at least one niche")
          return false
        }
        if (data.deliverables.length === 0) {
          setError("Please select at least one deliverable type")
          return false
        }
        return true
        
      case 4:
        // Optional, can proceed
        return true
        
      case 5:
        // Optional, can proceed
        return true
        
      default:
        return true
    }
  }

  // Navigation
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps))
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }

  // Final submission
  const handleComplete = async () => {
    if (!validateStep(step)) return
    
    setSaving(true)
    setError("")
    
    try {
      const res = await fetch("/api/creator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          handle: data.handle.toLowerCase(),
          bio: data.bio,
          location: data.location,
          avatarUrl: data.avatarUrl,
          instagramHandle: data.instagramHandle,
          instagramFollowers: data.instagramFollowers ? parseInt(data.instagramFollowers.replace(/,/g, '')) : null,
          tiktokHandle: data.tiktokHandle,
          tiktokFollowers: data.tiktokFollowers ? parseInt(data.tiktokFollowers.replace(/,/g, '')) : null,
          youtubeHandle: data.youtubeHandle,
          youtubeSubscribers: data.youtubeSubscribers ? parseInt(data.youtubeSubscribers.replace(/,/g, '')) : null,
          websiteUrl: data.websiteUrl,
          niches: data.niches,
          deliverables: data.deliverables,
          contentStyle: data.contentStyle,
          minimumFlatFee: data.minimumFlatFee ? parseInt(data.minimumFlatFee.replace(/[^0-9]/g, '')) : null,
          openToGiftedStays: data.openToGiftedStays,
          preferredDealTypes: data.preferredDealTypes,
          availability: data.availability,
          travelRadius: data.travelRadius,
          portfolioUrls: data.portfolioUrls.filter(url => url.trim()),
          mediaKitUrl: data.mediaKitUrl,
          totalFollowers: totalFollowers(),
          onboardingComplete: true,
        }),
      })
      
      if (!res.ok) {
        throw new Error("Failed to save profile")
      }
      
      router.push("/dashboard/creator?welcome=true")
    } catch (e) {
      setError("Something went wrong. Please try again.")
      setSaving(false)
    }
  }

  // Loading state
  if (loading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm font-medium text-black/60">Setting things up...</p>
        </div>
      </div>
    )
  }

  const inputClass = "w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="font-heading text-xl tracking-tight">
            <span className="text-black">CREATOR</span>
            <span className="text-black/40">STAYS</span>
          </div>
          <span className="rounded-full bg-[#D7B6FF] px-3 py-1 text-xs font-bold text-black">
            Creator Setup
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <ProgressBar step={step} totalSteps={totalSteps} />

        {/* STEP 1: About You */}
        {step === 1 && (
          <div>
            <StepHeader
              emoji="✨"
              title="Let's build your profile"
              subtitle="This is how hosts will discover and connect with you"
            />

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-black bg-black/10">
                    {data.avatarUrl ? (
                      <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">
                        {data.displayName?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={data.displayName}
                  onChange={e => updateField("displayName", e.target.value)}
                  placeholder="How hosts will see you"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Choose Your Handle *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-black/40">
                    @
                  </span>
                  <input
                    type="text"
                    value={data.handle}
                    onChange={e => updateField("handle", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="yourhandle"
                    className={`${inputClass} pl-8`}
                  />
                  {data.handle.length >= 3 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2">
                      {checkingHandle ? (
                        <span className="text-black/40">...</span>
                      ) : handleAvailable ? (
                        <span className="text-[#28D17C]">✓</span>
                      ) : (
                        <span className="text-red-500">✕</span>
                      )}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-black/50">
                  creatorstays.com/c/{data.handle || "yourhandle"}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Your Location
                </label>
                <LocationAutocomplete
                  value={data.location}
                  onChange={val => updateField("location", val)}
                  placeholder="Where are you based?"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Bio
                </label>
                <textarea
                  value={data.bio}
                  onChange={e => updateField("bio", e.target.value)}
                  placeholder="Tell hosts what makes you unique. What do you create? What are you passionate about?"
                  rows={4}
                  maxLength={500}
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1 text-right text-xs text-black/50">
                  {data.bio.length}/500
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Your Platforms */}
        {step === 2 && (
          <div>
            <StepHeader
              emoji="📱"
              title="Connect your platforms"
              subtitle="Add your social accounts so hosts can see your reach"
            />

            <div className="space-y-6">
              {/* Instagram */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">📸</span>
                  <span className="text-sm font-bold text-black">Instagram</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/60">
                      Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">@</span>
                      <input
                        type="text"
                        value={data.instagramHandle}
                        onChange={e => updateField("instagramHandle", e.target.value.replace('@', ''))}
                        placeholder="yourhandle"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/60">
                      Followers
                    </label>
                    <input
                      type="text"
                      value={data.instagramFollowers}
                      onChange={e => updateField("instagramFollowers", e.target.value)}
                      placeholder="e.g., 25000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* TikTok */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">🎵</span>
                  <span className="text-sm font-bold text-black">TikTok</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/60">
                      Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">@</span>
                      <input
                        type="text"
                        value={data.tiktokHandle}
                        onChange={e => updateField("tiktokHandle", e.target.value.replace('@', ''))}
                        placeholder="yourhandle"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/60">
                      Followers
                    </label>
                    <input
                      type="text"
                      value={data.tiktokFollowers}
                      onChange={e => updateField("tiktokFollowers", e.target.value)}
                      placeholder="e.g., 50000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* YouTube */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">▶️</span>
                  <span className="text-sm font-bold text-black">YouTube</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/60">
                      Channel Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">@</span>
                      <input
                        type="text"
                        value={data.youtubeHandle}
                        onChange={e => updateField("youtubeHandle", e.target.value.replace('@', ''))}
                        placeholder="yourchannel"
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/60">
                      Subscribers
                    </label>
                    <input
                      type="text"
                      value={data.youtubeSubscribers}
                      onChange={e => updateField("youtubeSubscribers", e.target.value)}
                      placeholder="e.g., 10000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Website / Portfolio (optional)
                </label>
                <input
                  type="url"
                  value={data.websiteUrl}
                  onChange={e => updateField("websiteUrl", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className={inputClass}
                />
              </div>

              {/* Total Reach */}
              {totalFollowers() > 0 && (
                <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-black/60">Total Reach</p>
                  <p className="text-3xl font-bold text-black">{formatFollowerCount(totalFollowers().toString())}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Your Niche & Content */}
        {step === 3 && (
          <div>
            <StepHeader
              emoji="🎨"
              title="What do you create?"
              subtitle="Help hosts understand your style and expertise"
            />

            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-bold text-black">
                  Your niches (select all that apply)
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {NICHES.map(niche => (
                    <button
                      key={niche.value}
                      type="button"
                      onClick={() => {
                        const current = data.niches
                        if (current.includes(niche.value)) {
                          updateField("niches", current.filter(v => v !== niche.value))
                        } else {
                          updateField("niches", [...current, niche.value])
                        }
                      }}
                      className={`rounded-lg border-2 border-black p-3 text-left transition-all hover:-translate-y-0.5 ${
                        data.niches.includes(niche.value)
                          ? "bg-[#D7B6FF] ring-2 ring-black ring-offset-2"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      <p className="text-sm font-bold text-black">{niche.label}</p>
                      <p className="text-xs text-black/60">{niche.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-black">
                  What can you deliver?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DELIVERABLES.map(del => (
                    <button
                      key={del.value}
                      type="button"
                      onClick={() => {
                        const current = data.deliverables
                        if (current.includes(del.value)) {
                          updateField("deliverables", current.filter(v => v !== del.value))
                        } else {
                          updateField("deliverables", [...current, del.value])
                        }
                      }}
                      className={`flex items-center gap-2 rounded-lg border-2 border-black px-3 py-2 text-left transition-all hover:-translate-y-0.5 ${
                        data.deliverables.includes(del.value)
                          ? "bg-[#28D17C]"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      <span>{del.icon}</span>
                      <span className="text-xs font-bold text-black">{del.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-black">
                  Your content style (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_STYLES.map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        const current = data.contentStyle
                        if (current.includes(style)) {
                          updateField("contentStyle", current.filter(v => v !== style))
                        } else {
                          updateField("contentStyle", [...current, style])
                        }
                      }}
                      className={`rounded-full border-2 border-black px-3 py-1 text-xs font-bold transition-all hover:-translate-y-0.5 ${
                        data.contentStyle.includes(style)
                          ? "bg-[#FFD84A]"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Rates & Availability */}
        {step === 4 && (
          <div>
            <StepHeader
              emoji="💰"
              title="Set your rates"
              subtitle="Let hosts know your pricing and availability"
            />

            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-bold text-black">
                  What types of deals are you open to?
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DEAL_TYPES.map(deal => (
                    <button
                      key={deal.value}
                      type="button"
                      onClick={() => {
                        const current = data.preferredDealTypes
                        if (current.includes(deal.value)) {
                          updateField("preferredDealTypes", current.filter(v => v !== deal.value))
                        } else {
                          updateField("preferredDealTypes", [...current, deal.value])
                        }
                      }}
                      className={`rounded-xl border-2 border-black p-4 text-left transition-all hover:-translate-y-0.5 ${
                        data.preferredDealTypes.includes(deal.value)
                          ? "bg-[#FFD84A] ring-2 ring-black ring-offset-2"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      <p className="text-sm font-bold text-black">{deal.label}</p>
                      <p className="text-xs text-black/60">{deal.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {data.preferredDealTypes.includes("paid") && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                    Minimum Rate (for paid collaborations)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-black/40">
                      $
                    </span>
                    <input
                      type="text"
                      value={data.minimumFlatFee}
                      onChange={e => updateField("minimumFlatFee", e.target.value)}
                      placeholder="500"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-black/50">
                    This is your starting rate, plus the free stay
                  </p>
                </div>
              )}

              <div>
                <label className="mb-3 block text-sm font-bold text-black">
                  When are you available?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField("availability", opt.value)}
                      className={`rounded-lg border-2 border-black px-3 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                        data.availability === opt.value
                          ? "bg-[#4AA3FF]"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-black">
                  How far will you travel?
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TRAVEL_RADIUS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField("travelRadius", opt.value)}
                      className={`rounded-lg border-2 border-black px-3 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                        data.travelRadius === opt.value
                          ? "bg-[#28D17C]"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Portfolio */}
        {step === 5 && (
          <div>
            <StepHeader
              emoji="🖼️"
              title="Show off your work"
              subtitle="Add links to your best content (optional but recommended)"
            />

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Best content examples
                </label>
                <p className="mb-3 text-xs text-black/60">
                  Add links to 3 pieces that showcase your style (Instagram posts, TikToks, YouTube videos, etc.)
                </p>
                <div className="space-y-3">
                  {data.portfolioUrls.map((url, i) => (
                    <input
                      key={i}
                      type="url"
                      value={url}
                      onChange={e => {
                        const newUrls = [...data.portfolioUrls]
                        newUrls[i] = e.target.value
                        updateField("portfolioUrls", newUrls)
                      }}
                      placeholder={`Example ${i + 1} URL`}
                      className={inputClass}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Media Kit URL (optional)
                </label>
                <input
                  type="url"
                  value={data.mediaKitUrl}
                  onChange={e => updateField("mediaKitUrl", e.target.value)}
                  placeholder="Link to your media kit PDF or page"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-black/50">
                  Dropbox, Google Drive, Notion, or your own website
                </p>
              </div>

              {/* Profile Preview */}
              <div className="mt-8 rounded-xl border-2 border-black bg-white p-6">
                <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-black/60">
                  Profile Preview
                </h3>
                
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-black bg-black/10">
                    {data.avatarUrl ? (
                      <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                        {data.displayName?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black">{data.displayName}</h3>
                    <p className="text-sm text-black/60">@{data.handle}</p>
                    {data.location && <p className="text-xs text-black/50">{data.location}</p>}
                  </div>
                </div>

                {data.bio && (
                  <p className="mt-4 text-sm text-black/80">{data.bio}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {totalFollowers() > 0 && (
                    <span className="rounded-full bg-[#D7B6FF]/30 px-2 py-0.5 text-xs font-bold text-black">
                      {formatFollowerCount(totalFollowers().toString())} followers
                    </span>
                  )}
                  {data.niches.slice(0, 3).map(n => (
                    <span key={n} className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black">
                      {NICHES.find(x => x.value === n)?.label.split(' ').slice(1).join(' ')}
                    </span>
                  ))}
                </div>

                {data.minimumFlatFee && (
                  <p className="mt-3 text-xs text-black/60">
                    Starting at <span className="font-bold text-black">${data.minimumFlatFee}</span> + free stay
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 rounded-lg border-2 border-red-500 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="rounded-full border-2 border-black bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          
          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className="rounded-full border-2 border-black bg-black px-8 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="rounded-full border-2 border-black bg-[#D7B6FF] px-8 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? "Launching..." : "Launch My Profile 🚀"}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
