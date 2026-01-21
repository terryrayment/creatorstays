"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import LocationAutocomplete from "@/components/ui/location-autocomplete"

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface OnboardingData {
  // Step 1: Welcome / About You
  displayName: string
  contactEmail: string
  phone: string
  location: string
  bio: string
  avatarUrl: string
  // Step 2: Property
  airbnbUrl: string
  propertyTitle: string
  propertyType: string
  cityRegion: string
  priceRange: string
  bedrooms: string
  bathrooms: string
  maxGuests: string
  amenities: string[]
  vibeTags: string[]
  photos: string[]
  heroImageUrl: string
  // Step 3: What You're Looking For
  idealCreators: string[]
  contentNeeds: string[]
  budgetRange: string
  timeline: string
  // Step 4: Review & Launch
}

const PROPERTY_TYPES = [
  { value: "cabin", label: "🏔️ Cabin", emoji: "🏔️" },
  { value: "beach-house", label: "🏖️ Beach House", emoji: "🏖️" },
  { value: "mountain", label: "⛰️ Mountain Retreat", emoji: "⛰️" },
  { value: "city", label: "🌆 City Apartment", emoji: "🌆" },
  { value: "farmhouse", label: "🌾 Farmhouse", emoji: "🌾" },
  { value: "villa", label: "🏛️ Villa", emoji: "🏛️" },
  { value: "cottage", label: "🏡 Cottage", emoji: "🏡" },
  { value: "treehouse", label: "🌳 Treehouse", emoji: "🌳" },
  { value: "tiny-home", label: "🏠 Tiny Home", emoji: "🏠" },
  { value: "loft", label: "🏢 Loft", emoji: "🏢" },
  { value: "other", label: "✨ Other", emoji: "✨" },
]

const AMENITIES = [
  "Pool", "Hot Tub", "Ocean View", "Mountain View", "Lake View",
  "Fireplace", "Chef's Kitchen", "Outdoor Space", "Fire Pit",
  "Pet Friendly", "EV Charger", "Game Room", "Home Theater",
  "Gym", "Sauna", "BBQ Grill", "Ski-in/Ski-out", "Beach Access"
]

const VIBE_TAGS = [
  "Romantic", "Family-Friendly", "Party-Ready", "Work-Friendly",
  "Secluded", "Walkable", "Instagrammable", "Cozy", "Modern",
  "Rustic", "Luxury", "Budget-Friendly", "Pet Paradise", "Eco-Friendly"
]

const CREATOR_TYPES = [
  { value: "travel", label: "✈️ Travel Creators", desc: "Destination-focused content" },
  { value: "lifestyle", label: "🌟 Lifestyle Influencers", desc: "Broad appeal, daily life" },
  { value: "photography", label: "📸 Photography Focused", desc: "Stunning visuals" },
  { value: "video", label: "🎬 Video/Vlog Creators", desc: "YouTube, long-form" },
  { value: "family", label: "👨‍👩‍👧 Family Content", desc: "Parents & kids" },
  { value: "luxury", label: "💎 Luxury/High-End", desc: "Premium audiences" },
  { value: "adventure", label: "🏕️ Adventure/Outdoor", desc: "Active travelers" },
  { value: "wellness", label: "🧘 Wellness/Retreat", desc: "Health-conscious" },
  { value: "food", label: "🍳 Food/Culinary", desc: "Foodies & chefs" },
]

const CONTENT_NEEDS = [
  { value: "ig-post", label: "Instagram Post", platform: "instagram" },
  { value: "ig-reel", label: "Instagram Reel", platform: "instagram" },
  { value: "ig-stories", label: "Instagram Stories", platform: "instagram" },
  { value: "tiktok", label: "TikTok Video", platform: "tiktok" },
  { value: "youtube", label: "YouTube Video", platform: "youtube" },
  { value: "youtube-short", label: "YouTube Short", platform: "youtube" },
  { value: "blog", label: "Blog Post", platform: "blog" },
  { value: "photos", label: "Professional Photos", platform: "photos" },
  { value: "drone", label: "Drone Footage", platform: "video" },
]

const BUDGET_RANGES = [
  { value: "post-for-stay", label: "Post-for-Stay Only", desc: "Free stay in exchange for content" },
  { value: "under-500", label: "Under $500", desc: "Plus free stay" },
  { value: "500-1000", label: "$500 - $1,000", desc: "Plus free stay" },
  { value: "1000-2500", label: "$1,000 - $2,500", desc: "Plus free stay" },
  { value: "2500-plus", label: "$2,500+", desc: "Premium creators" },
]

// Filter out Airbnb branding images
function filterAirbnbBranding(photos: string[]): string[] {
  const brandingPatterns = [
    'airbnb-static', 'airbnb_logo', 'airbnb-logo', '/logo', '/icon',
    'belo', 'brandmark', '/illustrations/', '/platform-assets/',
    '/airbnb-platform-assets/', 'placeholder', 'empty', 'default',
    '/em/', '/social/', 'badge', 'superhost', 'verified', 'safety',
  ]
  
  return photos.filter(url => {
    const lowerUrl = url.toLowerCase()
    for (const pattern of brandingPatterns) {
      if (lowerUrl.includes(pattern)) return false
    }
    const dimMatch = url.match(/\/(\d+)x(\d+)/)
    if (dimMatch && (parseInt(dimMatch[1]) < 200 || parseInt(dimMatch[2]) < 200)) {
      return false
    }
    return true
  })
}

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
          className="h-full rounded-full bg-[#28D17C] transition-all duration-500"
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

function ChipSelector({ 
  options, 
  selected, 
  onChange,
  columns = 3,
}: { 
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  columns?: number
}) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className={`grid gap-2 grid-cols-2 sm:grid-cols-${columns}`}>
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className={`rounded-lg border-2 border-black px-3 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 ${
            selected.includes(option)
              ? "bg-[#28D17C] text-black"
              : "bg-white text-black hover:bg-black/5"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function RadioCards<T extends string>({ 
  options, 
  value, 
  onChange,
  columns = 2,
}: { 
  options: { value: T; label: string; desc?: string; emoji?: string }[]
  value: T | ""
  onChange: (value: T) => void
  columns?: number
}) {
  return (
    <div className={`grid gap-3 sm:grid-cols-${columns}`}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-xl border-2 border-black p-4 text-left transition-all hover:-translate-y-0.5 ${
            value === option.value
              ? "bg-[#FFD84A] ring-2 ring-black ring-offset-2"
              : "bg-white hover:bg-black/5"
          }`}
        >
          {option.emoji && <span className="text-2xl">{option.emoji}</span>}
          <p className="mt-1 text-sm font-bold text-black">{option.label}</p>
          {option.desc && <p className="mt-0.5 text-xs text-black/60">{option.desc}</p>}
        </button>
      ))}
    </div>
  )
}

function PhotoGrid({ 
  photos, 
  onRemove 
}: { 
  photos: string[]
  onRemove: (index: number) => void 
}) {
  if (photos.length === 0) return null
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {photos.slice(0, 8).map((photo, i) => (
        <div key={i} className="relative aspect-square overflow-hidden rounded-lg border-2 border-black">
          <img 
            src={`/api/image-proxy?url=${encodeURIComponent(photo)}`} 
            alt="" 
            className="h-full w-full object-cover" 
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white hover:bg-red-600"
          >
            ✕
          </button>
          {i === 0 && (
            <span className="absolute bottom-1 left-1 rounded-full bg-[#FFD84A] px-1.5 py-0.5 text-[8px] font-bold text-black">
              Cover
            </span>
          )}
        </div>
      ))}
      {photos.length > 8 && (
        <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-black/30 bg-black/5">
          <span className="text-xs font-bold text-black/40">+{photos.length - 8}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HostOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  
  // Airbnb import state
  const [importingAirbnb, setImportingAirbnb] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    contactEmail: "",
    phone: "",
    location: "",
    bio: "",
    avatarUrl: "",
    airbnbUrl: "",
    propertyTitle: "",
    propertyType: "",
    cityRegion: "",
    priceRange: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    amenities: [],
    vibeTags: [],
    photos: [],
    heroImageUrl: "",
    idealCreators: [],
    contentNeeds: [],
    budgetRange: "",
    timeline: "",
  })

  const totalSteps = 4
  
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
        router.push("/login?callbackUrl=/onboarding/host")
        return
      }
      
      // Check if already completed onboarding
      try {
        const res = await fetch("/api/host/profile")
        if (res.ok) {
          const profile = await res.json()
          if (profile.onboardingComplete) {
            router.push("/dashboard/host")
            return
          }
          // Pre-fill with existing data
          setData(prev => ({
            ...prev,
            displayName: profile.displayName || session?.user?.name || "",
            contactEmail: profile.contactEmail || session?.user?.email || "",
            location: profile.location || "",
            bio: profile.bio || "",
            avatarUrl: profile.avatarUrl || session?.user?.image || "",
          }))
        } else {
          // No profile yet, pre-fill from session
          setData(prev => ({
            ...prev,
            displayName: session?.user?.name || "",
            contactEmail: session?.user?.email || "",
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

  // Airbnb import
  const handleAirbnbImport = async () => {
    if (!data.airbnbUrl) {
      setError("Please enter your Airbnb listing URL")
      return
    }

    setImportingAirbnb(true)
    setError("")

    try {
      const res = await fetch(`/api/airbnb/prefill?url=${encodeURIComponent(data.airbnbUrl)}`)
      const result = await res.json()
      
      if (!result.ok) {
        setError(result.error || "Couldn't import listing. Try entering details manually.")
        setManualEntry(true)
        setImportingAirbnb(false)
        return
      }
      
      const cleanPhotos = filterAirbnbBranding(result.photos || [])
      
      setData(prev => ({
        ...prev,
        propertyTitle: result.title || prev.propertyTitle,
        propertyType: result.propertyType || prev.propertyType,
        cityRegion: result.cityRegion || prev.cityRegion,
        bedrooms: result.bedrooms?.toString() || prev.bedrooms,
        bathrooms: result.baths?.toString() || prev.bathrooms,
        maxGuests: result.guests?.toString() || prev.maxGuests,
        priceRange: result.price || prev.priceRange,
        photos: cleanPhotos,
        heroImageUrl: cleanPhotos[0] || "",
      }))
      
      setImportSuccess(true)
    } catch (e) {
      setError("Failed to connect. Try entering details manually.")
      setManualEntry(true)
    }
    
    setImportingAirbnb(false)
  }

  // Remove photo
  const removePhoto = (index: number) => {
    setData(prev => {
      const newPhotos = [...prev.photos]
      newPhotos.splice(index, 1)
      return {
        ...prev,
        photos: newPhotos,
        heroImageUrl: index === 0 ? newPhotos[0] || "" : prev.heroImageUrl,
      }
    })
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
        if (!data.contactEmail.trim()) {
          setError("Please enter your email")
          return false
        }
        return true
        
      case 2:
        if (!importSuccess && !manualEntry) {
          setError("Please import your listing or enter details manually")
          return false
        }
        if (!data.propertyTitle.trim()) {
          setError("Property title is required")
          return false
        }
        if (!data.cityRegion.trim()) {
          setError("Location is required")
          return false
        }
        return true
        
      case 3:
        if (data.idealCreators.length === 0) {
          setError("Please select at least one creator type")
          return false
        }
        if (data.contentNeeds.length === 0) {
          setError("Please select at least one content type")
          return false
        }
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
      // Create/update host profile
      const profileRes = await fetch("/api/host/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          contactEmail: data.contactEmail,
          phone: data.phone,
          location: data.location,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          idealCreators: data.idealCreators,
          contentNeeds: data.contentNeeds,
          budgetRange: data.budgetRange,
          onboardingComplete: true,
        }),
      })
      
      if (!profileRes.ok) {
        throw new Error("Failed to save profile")
      }
      
      // Create property
      const propertyRes = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          airbnbUrl: data.airbnbUrl,
          title: data.propertyTitle,
          propertyType: data.propertyType,
          cityRegion: data.cityRegion,
          priceNightlyRange: data.priceRange,
          bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
          baths: data.bathrooms ? parseInt(data.bathrooms) : undefined,
          guests: data.maxGuests ? parseInt(data.maxGuests) : undefined,
          amenities: data.amenities,
          vibeTags: data.vibeTags,
          photos: data.photos,
          heroImageUrl: data.heroImageUrl || data.photos[0],
          isActive: true,
          isDraft: false,
        }),
      })
      
      if (!propertyRes.ok) {
        throw new Error("Failed to save property")
      }
      
      // Success! Redirect to dashboard
      router.push("/dashboard/host?welcome=true")
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
          <span className="rounded-full bg-[#4AA3FF] px-3 py-1 text-xs font-bold text-black">
            Host Setup
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
              emoji="👋"
              title="Welcome! Let's get started"
              subtitle="Tell us a bit about yourself so creators know who they'll be working with"
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
                  placeholder="How creators will see you"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={data.contactEmail}
                    onChange={e => updateField("contactEmail", e.target.value)}
                    placeholder="you@email.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={e => updateField("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={inputClass}
                  />
                </div>
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
                  Short Bio
                </label>
                <textarea
                  value={data.bio}
                  onChange={e => updateField("bio", e.target.value)}
                  placeholder="Tell creators about your hosting style, your properties, why you love hosting..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Your Property */}
        {step === 2 && (
          <div>
            <StepHeader
              emoji="🏡"
              title="Add your first property"
              subtitle="Import from Airbnb or enter details manually"
            />

            <div className="space-y-6">
              {/* Airbnb Import */}
              {!importSuccess && !manualEntry && (
                <div className="rounded-xl border-2 border-black bg-white p-6">
                  <h3 className="mb-1 text-sm font-bold text-black">Import from Airbnb</h3>
                  <p className="mb-4 text-xs text-black/60">
                    Paste your listing URL and we'll pull in all your photos and details
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.airbnbUrl}
                      onChange={e => updateField("airbnbUrl", e.target.value)}
                      placeholder="airbnb.com/rooms/..."
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      onClick={handleAirbnbImport}
                      disabled={importingAirbnb}
                      className="rounded-lg border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {importingAirbnb ? "Importing..." : "Import"}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setManualEntry(true)}
                    className="mt-3 text-xs font-bold text-black/60 hover:text-black"
                  >
                    Or enter details manually →
                  </button>
                </div>
              )}

              {/* Import Success */}
              {importSuccess && (
                <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <div>
                      <p className="text-sm font-bold text-black">Import successful!</p>
                      <p className="text-xs text-black/60">
                        We pulled {data.photos.length} photos and your details. Review below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Property Form (shown after import or manual entry) */}
              {(importSuccess || manualEntry) && (
                <>
                  {/* Photos */}
                  {data.photos.length > 0 && (
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                        Photos ({data.photos.length})
                      </label>
                      <PhotoGrid photos={data.photos} onRemove={removePhoto} />
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Property Title *
                      </label>
                      <input
                        type="text"
                        value={data.propertyTitle}
                        onChange={e => updateField("propertyTitle", e.target.value)}
                        placeholder="e.g., A-Frame Cabin in the Pines"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Location *
                      </label>
                      <LocationAutocomplete
                        value={data.cityRegion}
                        onChange={val => updateField("cityRegion", val)}
                        placeholder="Lake Arrowhead, CA"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Price / Night
                      </label>
                      <input
                        type="text"
                        value={data.priceRange}
                        onChange={e => updateField("priceRange", e.target.value)}
                        placeholder="$200-$350"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        value={data.bedrooms}
                        onChange={e => updateField("bedrooms", e.target.value)}
                        placeholder="2"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        value={data.bathrooms}
                        onChange={e => updateField("bathrooms", e.target.value)}
                        placeholder="1"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Guests
                      </label>
                      <input
                        type="number"
                        value={data.maxGuests}
                        onChange={e => updateField("maxGuests", e.target.value)}
                        placeholder="6"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                      Property Type
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {PROPERTY_TYPES.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateField("propertyType", type.value)}
                          className={`rounded-lg border-2 border-black px-2 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 ${
                            data.propertyType === type.value
                              ? "bg-[#FFD84A]"
                              : "bg-white hover:bg-black/5"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                      Amenities
                    </label>
                    <ChipSelector
                      options={AMENITIES}
                      selected={data.amenities}
                      onChange={val => updateField("amenities", val)}
                      columns={4}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                      Vibe Tags
                    </label>
                    <ChipSelector
                      options={VIBE_TAGS}
                      selected={data.vibeTags}
                      onChange={val => updateField("vibeTags", val)}
                      columns={4}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: What You're Looking For */}
        {step === 3 && (
          <div>
            <StepHeader
              emoji="🎯"
              title="What are you looking for?"
              subtitle="Help us match you with the right creators"
            />

            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-bold text-black">
                  What types of creators interest you?
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {CREATOR_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        const current = data.idealCreators
                        if (current.includes(type.value)) {
                          updateField("idealCreators", current.filter(v => v !== type.value))
                        } else {
                          updateField("idealCreators", [...current, type.value])
                        }
                      }}
                      className={`rounded-xl border-2 border-black p-3 text-left transition-all hover:-translate-y-0.5 ${
                        data.idealCreators.includes(type.value)
                          ? "bg-[#4AA3FF] ring-2 ring-black ring-offset-2"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      <p className="text-sm font-bold text-black">{type.label}</p>
                      <p className="text-xs text-black/60">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-black">
                  What content do you need?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTENT_NEEDS.map(content => (
                    <button
                      key={content.value}
                      type="button"
                      onClick={() => {
                        const current = data.contentNeeds
                        if (current.includes(content.value)) {
                          updateField("contentNeeds", current.filter(v => v !== content.value))
                        } else {
                          updateField("contentNeeds", [...current, content.value])
                        }
                      }}
                      className={`rounded-lg border-2 border-black px-3 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 ${
                        data.contentNeeds.includes(content.value)
                          ? "bg-[#28D17C]"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      {content.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-black">
                  What's your budget per collaboration?
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {BUDGET_RANGES.map(budget => (
                    <button
                      key={budget.value}
                      type="button"
                      onClick={() => updateField("budgetRange", budget.value)}
                      className={`rounded-xl border-2 border-black p-4 text-left transition-all hover:-translate-y-0.5 ${
                        data.budgetRange === budget.value
                          ? "bg-[#FFD84A] ring-2 ring-black ring-offset-2"
                          : "bg-white hover:bg-black/5"
                      }`}
                    >
                      <p className="text-sm font-bold text-black">{budget.label}</p>
                      <p className="text-xs text-black/60">{budget.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Launch */}
        {step === 4 && (
          <div>
            <StepHeader
              emoji="🚀"
              title="You're all set!"
              subtitle="Review your profile and launch"
            />

            <div className="space-y-6">
              {/* Profile Preview */}
              <div className="rounded-xl border-2 border-black bg-white p-6">
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
                    <p className="text-sm text-black/60">{data.location || "No location set"}</p>
                    {data.bio && <p className="mt-2 text-sm text-black/80">{data.bio}</p>}
                  </div>
                </div>
              </div>

              {/* Property Preview */}
              <div className="rounded-xl border-2 border-black bg-white overflow-hidden">
                {data.photos[0] && (
                  <div className="aspect-video relative">
                    <img 
                      src={`/api/image-proxy?url=${encodeURIComponent(data.photos[0])}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-black">{data.propertyTitle}</h3>
                  <p className="text-sm text-black/60">{data.cityRegion}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.bedrooms && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black">
                        {data.bedrooms} bed
                      </span>
                    )}
                    {data.bathrooms && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black">
                        {data.bathrooms} bath
                      </span>
                    )}
                    {data.maxGuests && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black">
                        {data.maxGuests} guests
                      </span>
                    )}
                    {data.priceRange && (
                      <span className="rounded-full bg-[#28D17C]/20 px-2 py-0.5 text-xs font-bold text-black">
                        {data.priceRange}/night
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences Summary */}
              <div className="rounded-xl border-2 border-black bg-[#FFD84A]/20 p-4">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-black">
                  Your Preferences
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Looking for:</strong> {data.idealCreators.map(c => CREATOR_TYPES.find(t => t.value === c)?.label.split(' ').slice(1).join(' ')).join(', ') || 'Any creators'}</p>
                  <p><strong>Content needs:</strong> {data.contentNeeds.map(c => CONTENT_NEEDS.find(t => t.value === c)?.label).join(', ') || 'Flexible'}</p>
                  <p><strong>Budget:</strong> {BUDGET_RANGES.find(b => b.value === data.budgetRange)?.label || 'Flexible'}</p>
                </div>
              </div>

              {/* What's Next */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <h4 className="mb-3 text-sm font-bold text-black">What happens next?</h4>
                <div className="space-y-3">
                  {[
                    { emoji: "🔍", text: "Browse our creator marketplace" },
                    { emoji: "💌", text: "Send offers to creators you like" },
                    { emoji: "🤝", text: "Agree on terms and book their stay" },
                    { emoji: "📸", text: "Get amazing content for your property" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-sm text-black">{item.text}</span>
                    </div>
                  ))}
                </div>
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
              className="rounded-full border-2 border-black bg-[#28D17C] px-8 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? "Launching..." : "Launch My Profile 🚀"}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
