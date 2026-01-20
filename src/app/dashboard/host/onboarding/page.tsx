"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface OnboardingData {
  // Step 1: About You
  displayName: string
  contactEmail: string
  location: string
  bio: string
  // Step 2: Property Basics
  propertyTitle: string
  propertyType: string
  cityRegion: string
  airbnbUrl: string
  // Step 3: Property Details
  bedrooms: string
  bathrooms: string
  maxGuests: string
  amenities: string[]
  // Step 4: Creator Preferences
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

export default function HostOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingProfile, setCheckingProfile] = useState(true)
  
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    contactEmail: "",
    location: "",
    bio: "",
    propertyTitle: "",
    propertyType: "",
    cityRegion: "",
    airbnbUrl: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    amenities: [],
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
          // If they have at least one property, redirect to dashboard
          if (profile.properties && profile.properties.length > 0) {
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
          }))
        } else {
          // No profile yet, use session data
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

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const updateField = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
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
        return true // All optional
      case 4:
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
    if (!validateStep(4)) return
    
    setLoading(true)
    setError("")

    try {
      // Step 1: Create/update host profile
      const profileRes = await fetch("/api/host/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          contactEmail: data.contactEmail,
          location: data.location,
          bio: data.bio,
          idealGuests: data.idealCreators, // Store creator preferences
        }),
      })

      if (!profileRes.ok) {
        const result = await profileRes.json()
        setError(result.error || "Failed to save profile")
        setLoading(false)
        return
      }

      // Step 2: Create property
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
          isActive: true,
        }),
      })

      if (!propertyRes.ok) {
        const result = await propertyRes.json()
        setError(result.error || "Failed to save property")
        setLoading(false)
        return
      }

      // Success - redirect to dashboard
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

  return (
    <div className="min-h-screen bg-black px-4 py-8 pt-20">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">Host Setup</p>
          <h1 className="mt-1 font-heading text-2xl font-black text-white">LIST YOUR PROPERTY</h1>
          <div className="mt-4 flex justify-center">
            <StepIndicator currentStep={step} totalSteps={4} />
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
                <input
                  type="text"
                  value={data.location}
                  onChange={e => updateField("location", e.target.value)}
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
                  placeholder="Tell creators about your hosting style and what makes your property special..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          )}

          {/* Step 2: Property Basics */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Property Basics</h2>
                <p className="text-sm text-black/60">Tell us about your property</p>
              </div>

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
                <select
                  value={data.propertyType}
                  onChange={e => updateField("propertyType", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select type...</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Location *
                </label>
                <input
                  type="text"
                  value={data.cityRegion}
                  onChange={e => updateField("cityRegion", e.target.value)}
                  placeholder="Lake Tahoe, CA"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Airbnb / VRBO URL <span className="font-normal text-black/50">(optional)</span>
                </label>
                <input
                  type="url"
                  value={data.airbnbUrl}
                  onChange={e => updateField("airbnbUrl", e.target.value)}
                  placeholder="https://airbnb.com/rooms/..."
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-black/50">We'll import photos and details automatically</p>
              </div>
            </div>
          )}

          {/* Step 3: Property Details */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Property Details</h2>
                <p className="text-sm text-black/60">Help creators understand your space</p>
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
                  Amenities <span className="font-normal text-black/50">(select all that apply)</span>
                </label>
                <ChipSelector
                  options={AMENITY_OPTIONS}
                  selected={data.amenities}
                  onChange={v => updateField("amenities", v)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Creator Preferences */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Creator Preferences</h2>
                <p className="text-sm text-black/60">What kind of creators are you looking for?</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                  Ideal Creator Types * <span className="font-normal text-black/50">(select all that fit)</span>
                </label>
                <ChipSelector
                  options={CREATOR_TYPES}
                  selected={data.idealCreators}
                  onChange={v => updateField("idealCreators", v)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                  Content Needs * <span className="font-normal text-black/50">(what do you want created?)</span>
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
                <select
                  value={data.budget}
                  onChange={e => updateField("budget", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select range...</option>
                  <option value="gifted">Gifted stays only (no cash)</option>
                  <option value="under500">Under $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500-5000">$2,500 - $5,000</option>
                  <option value="5000+">$5,000+</option>
                </select>
              </div>

              {/* Summary */}
              <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-black/60">Ready to Launch</p>
                <div className="mt-2 space-y-1 text-sm text-black">
                  <p><strong>{data.propertyTitle || "Your Property"}</strong></p>
                  <p>{data.propertyType} in {data.cityRegion || "Location"}</p>
                  <p>Looking for: {data.idealCreators.slice(0, 3).join(", ") || "Creators"}</p>
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

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full border-2 border-black bg-black px-6 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
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
          Step {step} of 4 · You can add more properties later
        </p>
      </div>
    </div>
  )
}
