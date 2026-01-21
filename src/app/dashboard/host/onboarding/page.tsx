"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import LocationAutocomplete from "@/components/ui/location-autocomplete"

interface OnboardingData {
  // Step 1: About You
  displayName: string
  contactEmail: string
  location: string
  bio: string
  // Step 2: Property (Airbnb import or manual)
  airbnbUrl: string
  propertyTitle: string
  propertyType: string
  cityRegion: string
  priceRange: string
  bedrooms: string
  bathrooms: string
  maxGuests: string
  amenities: string[]
  photos: string[]
  heroImageUrl: string
  // Step 3: Creator Preferences
  idealCreators: string[]
  contentNeeds: string[]
  budget: string
}

const PROPERTY_TYPES = [
  "Cabin", "Beach House", "Mountain Retreat", "City Apartment",
  "Farmhouse", "Villa", "Cottage", "Loft", "Treehouse", "Tiny Home",
  "Historic Home", "Modern Home", "Other"
]

const AMENITY_OPTIONS = [
  "Pool", "Hot Tub", "Ocean View", "Mountain View", "Fireplace",
  "Chef's Kitchen", "Outdoor Space", "Pet Friendly", "EV Charger",
  "Fire Pit", "Game Room", "Home Theater", "Gym", "Sauna"
]

const CREATOR_TYPES = [
  "Travel Creators", "Lifestyle Influencers", "Photography Focused",
  "Video/Vlog Creators", "Family Content", "Luxury/High-End",
  "Adventure/Outdoor", "Wellness/Retreat", "Food/Culinary"
]

const CONTENT_NEEDS = [
  "Instagram Posts", "Instagram Reels", "TikTok Videos",
  "YouTube Videos", "Blog Features", "Professional Photos",
  "Drone Footage", "Virtual Tours"
]

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-xs font-bold ${
            i + 1 <= currentStep ? "bg-[#28D17C] text-black" : "bg-white text-black/40"
          }`}>
            {i + 1 <= currentStep ? "✓" : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`h-0.5 w-6 ${i + 1 < currentStep ? "bg-[#28D17C]" : "bg-black/20"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function ChipSelector({ 
  options, 
  selected, 
  onChange, 
  max 
}: { 
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  max?: number 
}) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else if (!max || selected.length < max) {
      onChange([...selected, option])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className={`rounded-full border-2 border-black px-3 py-1.5 text-xs font-bold transition-all ${
            selected.includes(option)
              ? "bg-[#4AA3FF] text-black"
              : "bg-white text-black hover:bg-black/5"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

// Custom styled dropdown component
function StyledSelect({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedOption = options.find(o => o.value === value)
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border-2 border-black px-4 py-3 text-sm font-medium text-left bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
      >
        <span className={selectedOption ? "text-black" : "text-black/40"}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className={`h-4 w-4 text-black transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full rounded-lg border-2 border-black bg-white shadow-lg max-h-60 overflow-auto">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-black/5 ${
                  value === option.value ? "bg-[#4AA3FF]/20 text-black" : "text-black"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function HostOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [importingAirbnb, setImportingAirbnb] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    contactEmail: "",
    location: "",
    bio: "",
    airbnbUrl: "",
    propertyTitle: "",
    propertyType: "",
    cityRegion: "",
    priceRange: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    amenities: [],
    photos: [],
    heroImageUrl: "",
    idealCreators: [],
    contentNeeds: [],
    budget: "",
  })

  // Check if user already has a profile with property
  useEffect(() => {
    async function checkProfile() {
      if (status !== "authenticated") return
      
      try {
        const res = await fetch("/api/host/profile")
        if (res.ok) {
          const profile = await res.json()
          if (profile.properties && profile.properties.length > 0) {
            router.push("/dashboard/host")
            return
          }
          setData(prev => ({
            ...prev,
            displayName: profile.displayName || session?.user?.name || "",
            contactEmail: profile.contactEmail || session?.user?.email || "",
            location: profile.location || "",
            bio: profile.bio || "",
          }))
        } else {
          setData(prev => ({
            ...prev,
            displayName: session?.user?.name || "",
            contactEmail: session?.user?.email || "",
          }))
        }
      } catch (e) {
        console.error("Failed to check profile:", e)
      }
      setCheckingProfile(false)
    }
    
    checkProfile()
  }, [status, session, router])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const updateField = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleAirbnbImport = async () => {
    if (!data.airbnbUrl) {
      setError("Please enter your Airbnb listing URL")
      return
    }

    setImportingAirbnb(true)
    setError("")

    try {
      const res = await fetch(`/api/airbnb/prefill?url=${encodeURIComponent(data.airbnbUrl)}`)

      if (res.ok) {
        const result = await res.json()
        
        // Check if prefill was successful
        if (!result.ok) {
          setError(result.error || "Failed to import. Please enter details manually.")
          setManualEntry(true)
          setImportingAirbnb(false)
          return
        }
        
        // Populate form with imported data
        setData(prev => ({
          ...prev,
          propertyTitle: result.title || prev.propertyTitle,
          propertyType: result.propertyType || prev.propertyType,
          cityRegion: result.cityRegion || prev.cityRegion,
          bedrooms: result.bedrooms?.toString() || prev.bedrooms,
          bathrooms: result.baths?.toString() || prev.bathrooms,
          maxGuests: result.guests?.toString() || prev.maxGuests,
          priceRange: result.price || prev.priceRange,
          amenities: prev.amenities,
          photos: result.photos || [],
          heroImageUrl: result.photos?.[0] || "",
        }))
        
        setImportSuccess(true)
      } else {
        const errorData = await res.json()
        setError(errorData.error || "Failed to import. Please enter details manually.")
        setManualEntry(true)
      }
    } catch (e) {
      setError("Failed to connect. Please enter details manually.")
      setManualEntry(true)
    }
    setImportingAirbnb(false)
  }

  const validateStep = (stepNum: number): boolean => {
    setError("")
    switch (stepNum) {
      case 1:
        if (!data.displayName.trim()) {
          setError("Display name is required")
          return false
        }
        if (!data.contactEmail.trim()) {
          setError("Contact email is required")
          return false
        }
        return true
      case 2:
        if (!data.propertyTitle.trim()) {
          setError("Property title is required")
          return false
        }
        if (!data.propertyType) {
          setError("Property type is required")
          return false
        }
        if (!data.cityRegion.trim()) {
          setError("Location is required")
          return false
        }
        return true
      case 3:
        if (data.idealCreators.length === 0) {
          setError("Select at least one creator type")
          return false
        }
        if (data.contentNeeds.length === 0) {
          setError("Select at least one content need")
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => s + 1)
    }
  }

  const handleBack = () => {
    setStep(s => s - 1)
    setError("")
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    setLoading(true)
    setError("")

    try {
      // Create/update host profile
      const profileRes = await fetch("/api/host/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          contactEmail: data.contactEmail,
          location: data.location,
          bio: data.bio,
          idealGuests: data.idealCreators,
        }),
      })

      if (!profileRes.ok) {
        const result = await profileRes.json()
        setError(result.error || "Failed to save profile")
        setLoading(false)
        return
      }

      // Create property
      const propertyRes = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.propertyTitle,
          propertyType: data.propertyType,
          cityRegion: data.cityRegion,
          airbnbUrl: data.airbnbUrl || null,
          bedrooms: parseInt(data.bedrooms) || null,
          bathrooms: parseFloat(data.bathrooms) || null,
          maxGuests: parseInt(data.maxGuests) || null,
          amenities: data.amenities,
          photos: data.photos,
          heroImageUrl: data.heroImageUrl,
          isActive: true,
        }),
      })

      if (!propertyRes.ok) {
        const result = await propertyRes.json()
        setError(result.error || "Failed to save property")
        setLoading(false)
        return
      }

      router.push("/dashboard/host?onboarded=true")
    } catch (e) {
      setError("Network error. Please try again.")
    }
    setLoading(false)
  }

  if (status === "loading" || checkingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const inputClass = "w-full rounded-lg border-2 border-black px-4 py-3 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  const propertyTypeOptions = PROPERTY_TYPES.map(t => ({ value: t, label: t }))
  const budgetOptions = [
    { value: "gifted", label: "Gifted stays only (no cash)" },
    { value: "under500", label: "Under $500" },
    { value: "500-1000", label: "$500 - $1,000" },
    { value: "1000-2500", label: "$1,000 - $2,500" },
    { value: "2500-5000", label: "$2,500 - $5,000" },
    { value: "5000+", label: "$5,000+" },
  ]

  return (
    <div className="min-h-screen bg-black px-4 py-8 pt-20">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">Host Setup</p>
          <h1 className="mt-1 font-heading text-2xl font-black text-white">LIST YOUR PROPERTY</h1>
          <div className="mt-4 flex justify-center">
            <StepIndicator currentStep={step} totalSteps={3} />
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border-[3px] border-black bg-white p-6">
          {/* Step 1: About You */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">About You</h2>
                <p className="text-sm text-black/60">Tell creators about yourself</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={data.displayName}
                  onChange={e => updateField("displayName", e.target.value)}
                  placeholder="Your name or company"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={data.contactEmail}
                  onChange={e => updateField("contactEmail", e.target.value)}
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Location
                </label>
                <LocationAutocomplete
                  value={data.location}
                  onChange={val => updateField("location", val)}
                  placeholder="City, State"
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
                  placeholder="Tell creators about your hosting style..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          )}

          {/* Step 2: Property */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Your Property</h2>
                <p className="text-sm text-black/60">Import from Airbnb or enter manually</p>
              </div>

              {/* Airbnb Import Section */}
              {!importSuccess && !manualEntry && (
                <div className="rounded-xl border-2 border-[#FF5A5F] bg-[#FF5A5F]/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="h-5 w-5 text-[#FF5A5F]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 16.09v-.07c-.01-.12-.03-.24-.03-.36 0-.12.01-.24.03-.36v-.07c.01-.11.04-.21.07-.31l.02-.07c.03-.1.07-.19.12-.28l.03-.06c.05-.09.1-.17.16-.25l.04-.06c.06-.08.13-.15.2-.22l.05-.05c.08-.07.16-.13.25-.19l.04-.03c.09-.06.19-.11.29-.15l.06-.03c.1-.04.2-.08.31-.1l.07-.02c.11-.02.23-.04.35-.04h.07c.12 0 .24.01.35.04l.07.02c.11.03.21.06.31.1l.06.03c.1.05.2.1.29.15l.04.03c.09.06.17.12.25.19l.05.05c.07.07.14.14.2.22l.04.06c.06.08.11.16.16.25l.03.06c.05.09.09.18.12.28l.02.07c.03.1.06.2.07.31v.07c.02.12.03.24.03.36 0 .12-.01.24-.03.36v.07c-.01.11-.04.21-.07.31l-.02.07c-.03.1-.07.19-.12.28l-.03.06c-.05.09-.1.17-.16.25l-.04.06c-.06.08-.13.15-.2.22l-.05.05c-.08.07-.16.13-.25.19l-.04.03c-.09.06-.19.11-.29.15l-.06.03c-.1.04-.2.08-.31.1l-.07.02c-.11.02-.23.04-.35.04h-.07c-.12 0-.24-.02-.35-.04l-.07-.02c-.11-.03-.21-.06-.31-.1l-.06-.03c-.1-.05-.2-.1-.29-.15l-.04-.03c-.09-.06-.17-.12-.25-.19l-.05-.05c-.07-.07-.14-.14-.2-.22l-.04-.06c-.06-.08-.11-.16-.16-.25l-.03-.06c-.05-.09-.09-.18-.12-.28l-.02-.07c-.03-.1-.06-.2-.07-.31z"/>
                    </svg>
                    <span className="text-sm font-bold text-black">Import from Airbnb</span>
                  </div>
                  <p className="text-xs text-black/60 mb-3">
                    Paste your Airbnb listing URL and we'll automatically import your photos and details.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={data.airbnbUrl}
                      onChange={e => updateField("airbnbUrl", e.target.value)}
                      placeholder="https://airbnb.com/rooms/12345678"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={handleAirbnbImport}
                      disabled={importingAirbnb}
                      className="shrink-0 rounded-lg border-2 border-black bg-[#FF5A5F] px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {importingAirbnb ? "Importing..." : "Import"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualEntry(true)}
                    className="mt-3 text-xs font-medium text-black/60 hover:text-black underline"
                  >
                    Or enter details manually →
                  </button>
                </div>
              )}

              {/* Import Success */}
              {importSuccess && (
                <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-[#28D17C]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-bold text-black">Imported successfully!</span>
                  </div>
                  <p className="text-xs text-black/60 mt-1">
                    We pulled {data.photos.length} photos and your property details. Review below.
                  </p>
                </div>
              )}

              {/* Imported Data Preview - Read-only summary */}
              {importSuccess && (
                <div className="space-y-3">
                  {/* Title & City Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/60">
                        Title *
                      </label>
                      <div className="rounded-lg border-2 border-black/20 bg-white px-3 py-2.5 text-sm text-black">
                        {data.propertyTitle || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/60">
                        City / Region *
                      </label>
                      <div className="rounded-lg border-2 border-black/20 bg-white px-3 py-2.5 text-sm text-black">
                        {data.cityRegion || "—"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Price, Guests, Beds, Baths Row */}
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/60">
                        Price/night
                      </label>
                      <div className="rounded-lg border-2 border-black/20 bg-white px-3 py-2.5 text-sm text-black">
                        {data.priceRange || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/60">
                        Guests
                      </label>
                      <div className="rounded-lg border-2 border-black/20 bg-white px-3 py-2.5 text-sm text-black">
                        {data.maxGuests || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/60">
                        Beds
                      </label>
                      <div className="rounded-lg border-2 border-black/20 bg-white px-3 py-2.5 text-sm text-black">
                        {data.bedrooms || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/60">
                        Baths
                      </label>
                      <div className="rounded-lg border-2 border-black/20 bg-white px-3 py-2.5 text-sm text-black">
                        {data.bathrooms || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Imported Photos Preview */}
              {data.photos.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                    Imported Photos ({data.photos.length})
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {data.photos.slice(0, 8).map((photo, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-black">
                        <img 
                          src={`/api/image-proxy?url=${encodeURIComponent(photo)}`} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                    {data.photos.length > 8 && (
                      <div className="aspect-square rounded-lg border-2 border-black bg-black/5 flex items-center justify-center">
                        <span className="text-xs font-bold text-black/60">+{data.photos.length - 8}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Property Details (shown after import or manual entry) */}
              {(importSuccess || manualEntry) && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                      Property Title *
                    </label>
                    <input
                      type="text"
                      value={data.propertyTitle}
                      onChange={e => updateField("propertyTitle", e.target.value)}
                      placeholder="Cozy Mountain A-Frame"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                      Property Type *
                    </label>
                    <StyledSelect
                      value={data.propertyType}
                      onChange={v => updateField("propertyType", v)}
                      options={propertyTypeOptions}
                      placeholder="Select type..."
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                      Location *
                    </label>
                    <LocationAutocomplete
                      value={data.cityRegion}
                      onChange={val => updateField("cityRegion", val)}
                      placeholder="Lake Tahoe, CA"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        value={data.bedrooms}
                        onChange={e => updateField("bedrooms", e.target.value)}
                        placeholder="3"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={data.bathrooms}
                        onChange={e => updateField("bathrooms", e.target.value)}
                        placeholder="2"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Max Guests
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
                      Amenities
                    </label>
                    <ChipSelector
                      options={AMENITY_OPTIONS}
                      selected={data.amenities}
                      onChange={v => updateField("amenities", v)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Creator Preferences */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Creator Preferences</h2>
                <p className="text-sm text-black/60">What kind of creators are you looking for?</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                  Ideal Creator Types *
                </label>
                <ChipSelector
                  options={CREATOR_TYPES}
                  selected={data.idealCreators}
                  onChange={v => updateField("idealCreators", v)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                  Content Needs *
                </label>
                <ChipSelector
                  options={CONTENT_NEEDS}
                  selected={data.contentNeeds}
                  onChange={v => updateField("contentNeeds", v)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Typical Budget Per Collaboration
                </label>
                <StyledSelect
                  value={data.budget}
                  onChange={v => updateField("budget", v)}
                  options={budgetOptions}
                  placeholder="Select range..."
                />
              </div>

              {/* Summary */}
              <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-black/60">Ready to Launch</p>
                <div className="mt-2 space-y-1 text-sm text-black">
                  <p><strong>{data.propertyTitle || "Your Property"}</strong></p>
                  <p>{data.propertyType} in {data.cityRegion || "Location"}</p>
                  {data.photos.length > 0 && <p>{data.photos.length} photos imported</p>}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border-2 border-red-500 bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border-2 border-black px-5 py-2.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                ← Back
              </button>
            ) : (
              <Link
                href="/dashboard/host"
                className="text-xs font-bold text-black/50 hover:text-black"
              >
                Skip for now
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 2 && !importSuccess && !manualEntry}
                className="rounded-full border-2 border-black bg-black px-6 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-full border-2 border-black bg-[#28D17C] px-6 py-2.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Launch Property ✓"}
              </button>
            )}
          </div>
        </div>

        {/* Progress note */}
        <p className="mt-4 text-center text-xs text-white/40">
          Step {step} of 3 · You can add more properties later
        </p>
      </div>
    </div>
  )
}
