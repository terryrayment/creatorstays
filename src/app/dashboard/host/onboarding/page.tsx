"use client"

import { useState, useEffect, useRef } from "react"
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
  // Step 2: Property Details
  propertyTitle: string
  propertyType: string
  cityRegion: string
  priceRange: string
  bedrooms: string
  bathrooms: string
  maxGuests: string
  amenities: string[]
  // Step 3: Photos & Links
  photos: string[]
  heroImageUrl: string
  airbnbUrl: string
  icalUrl: string
  // Step 4: Preferences & Setup
  idealCreators: string[]
  contentNeeds: string[]
  budget: string
  responseTime: string
  contentRightsAgreed: boolean
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

const RESPONSE_TIME_OPTIONS = [
  { value: "within-24h", label: "Within 24 hours" },
  { value: "1-2-days", label: "1-2 days" },
  { value: "3-5-days", label: "3-5 days" },
  { value: "1-week", label: "About a week" },
]

const BUDGET_OPTIONS = [
  { value: "gifted", label: "Gifted stays only (no cash)" },
  { value: "under500", label: "Under $500" },
  { value: "500-1000", label: "$500 - $1,000" },
  { value: "1000-2500", label: "$1,000 - $2,500" },
  { value: "2500-5000", label: "$2,500 - $5,000" },
  { value: "5000+", label: "$5,000+" },
]

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const stepLabels = ["About You", "Property", "Photos", "Finish"]
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-xs font-bold ${
              i + 1 < currentStep ? "bg-[#28D17C] text-black" : 
              i + 1 === currentStep ? "bg-[#FFD84A] text-black" : 
              "bg-white text-black/40"
            }`}>
              {i + 1 < currentStep ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`mt-1 text-[10px] font-bold ${i + 1 <= currentStep ? "text-black" : "text-black/40"}`}>
              {stepLabels[i]}
            </span>
          </div>
          {i < totalSteps - 1 && (
            <div className={`h-0.5 w-8 mx-1 mt-[-12px] ${i + 1 < currentStep ? "bg-[#28D17C]" : "bg-black/20"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// Chip selector for multi-select options
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
              ? "bg-[#FFD84A] text-black"
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
                className={`w-full px-4 py-2.5 text-left text-sm font-bold hover:bg-black/5 ${
                  value === option.value ? "bg-[#FFD84A] text-black" : "text-black"
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
  const router = useRouter()
  const { data: session, status } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [stripeConnecting, setStripeConnecting] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)

  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    contactEmail: "",
    location: "",
    bio: "",
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
    airbnbUrl: "",
    icalUrl: "",
    idealCreators: [],
    contentNeeds: [],
    budget: "",
    responseTime: "",
    contentRightsAgreed: false,
  })

  // Check if user already has a profile
  useEffect(() => {
    async function checkProfile() {
      if (status !== "authenticated" || !session?.user?.email) return
      
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
          }))
          // Check if Stripe is connected
          if (profile.stripeAccountId) {
            setStripeConnected(true)
          }
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

  // Photo upload handler - uploads to Cloudinary
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhotos(true)
    setError("")

    const newPhotos: string[] = []

    for (const file of Array.from(files)) {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      try {
        // Upload to Cloudinary via API
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            file: base64,
            collaborationId: 'onboarding-photos'
          }),
        })

        if (res.ok) {
          const result = await res.json()
          newPhotos.push(result.file.url)
        } else {
          console.error('Photo upload failed')
          setError("Failed to upload some photos. Please try again.")
        }
      } catch (err) {
        console.error('Photo upload error:', err)
        setError("Failed to upload photos. Please try again.")
      }
    }

    if (newPhotos.length > 0) {
      setData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
        heroImageUrl: prev.heroImageUrl || newPhotos[0]
      }))
    }

    setUploadingPhotos(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove photo
  const removePhoto = (index: number) => {
    setData(prev => {
      const newPhotos = [...prev.photos]
      const removed = newPhotos.splice(index, 1)[0]
      return {
        ...prev,
        photos: newPhotos,
        heroImageUrl: prev.heroImageUrl === removed ? newPhotos[0] || "" : prev.heroImageUrl
      }
    })
  }

  // Set cover photo
  const setCoverPhoto = (url: string) => {
    setData(prev => ({ ...prev, heroImageUrl: url }))
  }

  // Connect Stripe
  const handleStripeConnect = async () => {
    setStripeConnecting(true)
    setError("")
    
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href })
      })
      
      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      } else {
        setError("Failed to connect Stripe. Please try again.")
      }
    } catch (err) {
      setError("Failed to connect Stripe. Please try again.")
    }
    
    setStripeConnecting(false)
  }

  // Validate current step
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
        if (data.photos.length < 3) {
          setError("Please upload at least 3 photos")
          return false
        }
        if (!data.icalUrl.trim()) {
          setError("Calendar link is required for availability")
          return false
        }
        return true
      case 4:
        if (data.idealCreators.length === 0) {
          setError("Select at least one creator type")
          return false
        }
        if (data.contentNeeds.length === 0) {
          setError("Select at least one content need")
          return false
        }
        if (!data.responseTime) {
          setError("Please select your typical response time")
          return false
        }
        if (!data.contentRightsAgreed) {
          setError("Please acknowledge the content rights agreement")
          return false
        }
        return true
      default:
        return true
    }
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  // Handle back
  const handleBack = () => {
    setStep(step - 1)
    setError("")
    window.scrollTo(0, 0)
  }

  // Handle final submit
  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setLoading(true)
    setError("")

    try {
      // Save host profile
      const profileRes = await fetch("/api/host/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          contactEmail: data.contactEmail,
          location: data.location,
          bio: data.bio,
          idealCreators: data.idealCreators,
          contentNeeds: data.contentNeeds,
          budget: data.budget,
          responseTime: data.responseTime,
          onboardingComplete: true,
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
          priceNightlyRange: data.priceRange,
          bedrooms: parseInt(data.bedrooms) || null,
          bathrooms: parseFloat(data.bathrooms) || null,
          maxGuests: parseInt(data.maxGuests) || null,
          amenities: data.amenities,
          photos: data.photos,
          heroImageUrl: data.heroImageUrl,
          airbnbUrl: data.airbnbUrl || null,
          icalUrl: data.icalUrl || null,
          isActive: true,
          isDraft: false,
        }),
      })

      if (!propertyRes.ok) {
        const result = await propertyRes.json()
        setError(result.error || "Failed to save property")
        setLoading(false)
        return
      }

      // If iCal URL provided, trigger calendar sync in background (don't wait)
      if (data.icalUrl) {
        const propertyResult = await propertyRes.json()
        if (propertyResult.property?.id) {
          fetch(`/api/properties/${propertyResult.property.id}/calendar`, {
            method: "POST",
          }).catch(() => {
            // Ignore errors - cron will retry
            console.log("Calendar sync will be picked up by cron job")
          })
        }
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
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-black font-bold">Loading...</div>
      </div>
    )
  }

  const inputClass = "w-full rounded-lg border-2 border-black px-4 py-3 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-8">
      {/* Header */}
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6 text-xl font-bold text-black">
            CreatorStays
          </Link>
          <StepIndicator currentStep={step} totalSteps={4} />
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-sm">
          {/* Error display */}
          {error && (
            <div className="mb-4 rounded-lg border-2 border-red-500 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: About You */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">About You</h2>
                <p className="text-sm text-black/60">Tell creators who they'll be working with</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={data.displayName}
                  onChange={e => updateField("displayName", e.target.value)}
                  placeholder="Your name or company name"
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
                  placeholder="you@email.com"
                  className={inputClass}
                />
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
                  placeholder="Tell creators about your hosting style..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Property Details</h2>
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
                  placeholder="Lakefront Cabin with Mountain Views"
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
                  options={PROPERTY_TYPES.map(t => ({ value: t, label: t }))}
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

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Price Per Night
                </label>
                <input
                  type="text"
                  value={data.priceRange}
                  onChange={e => updateField("priceRange", e.target.value)}
                  placeholder="$250-$400"
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
            </div>
          )}

          {/* Step 3: Photos & Links */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Photos & Availability</h2>
                <p className="text-sm text-black/60">Show off your property and sync your calendar</p>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                  Property Photos * (minimum 3)
                </label>
                
                {/* Photo Grid */}
                {data.photos.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {data.photos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-black">
                        <img src={photo} alt="" className="h-full w-full object-cover" />
                        {/* Cover badge */}
                        {photo === data.heroImageUrl && (
                          <div className="absolute bottom-1 left-1 rounded bg-[#FFD84A] px-1.5 py-0.5 text-[10px] font-bold text-black">
                            Cover
                          </div>
                        )}
                        {/* Actions */}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {photo !== data.heroImageUrl && (
                            <button
                              type="button"
                              onClick={() => setCoverPhoto(photo)}
                              className="rounded-full bg-white/90 p-1 hover:bg-white"
                              title="Set as cover"
                            >
                              <svg className="h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="rounded-full bg-red-500 p-1 hover:bg-red-600"
                          >
                            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhotos}
                  className="w-full rounded-xl border-2 border-dashed border-black bg-white p-6 text-center hover:bg-black/5 disabled:opacity-50"
                >
                  {uploadingPhotos ? (
                    <span className="text-sm font-bold text-black">Uploading...</span>
                  ) : (
                    <>
                      <svg className="mx-auto h-8 w-8 text-black/40 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <p className="text-sm font-bold text-black">Click to upload photos</p>
                      <p className="text-xs text-black/60">PNG, JPG up to 10MB each</p>
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-black/60">
                  {data.photos.length}/3 minimum photos uploaded
                </p>
              </div>

              {/* iCal URL */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Calendar Link (iCal URL) *
                </label>
                <input
                  type="url"
                  value={data.icalUrl}
                  onChange={e => updateField("icalUrl", e.target.value)}
                  placeholder="https://www.airbnb.com/calendar/ical/12345.ics"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-black/60">
                  Export your calendar from Airbnb, VRBO, or your booking platform. This helps match you with creators when you're actually available.
                </p>
              </div>

              {/* Airbnb URL */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Airbnb/VRBO Listing URL (optional)
                </label>
                <input
                  type="url"
                  value={data.airbnbUrl}
                  onChange={e => updateField("airbnbUrl", e.target.value)}
                  placeholder="https://airbnb.com/rooms/12345678"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-black/60">
                  Creators can view your listing to see reviews, full details, and verify your property.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Preferences & Setup */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Preferences & Setup</h2>
                <p className="text-sm text-black/60">Final details to get you matched with creators</p>
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
                  options={BUDGET_OPTIONS}
                  placeholder="Select range..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Response Time *
                </label>
                <StyledSelect
                  value={data.responseTime}
                  onChange={v => updateField("responseTime", v)}
                  options={RESPONSE_TIME_OPTIONS}
                  placeholder="How quickly do you typically respond?"
                />
                <p className="mt-1.5 text-xs text-black/60">
                  This helps set expectations for creators reaching out to you.
                </p>
              </div>

              {/* Stripe Connect */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-black">Payout Setup</p>
                    <p className="text-xs text-black/60">Connect Stripe to receive payments from collaborations</p>
                  </div>
                  {stripeConnected ? (
                    <div className="flex items-center gap-2 text-[#28D17C]">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-bold">Connected</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStripeConnect}
                      disabled={stripeConnecting}
                      className="rounded-lg border-2 border-black bg-[#635BFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#635BFF]/90 disabled:opacity-50"
                    >
                      {stripeConnecting ? "Connecting..." : "Connect Stripe"}
                    </button>
                  )}
                </div>
              </div>

              {/* Content Rights Agreement */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.contentRightsAgreed}
                    onChange={e => updateField("contentRightsAgreed", e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-2 border-black text-black focus:ring-black"
                  />
                  <div>
                    <p className="text-sm font-bold text-black">Content Rights Agreement *</p>
                    <p className="text-xs text-black/60 mt-1">
                      I understand that creators retain ownership of their content. Upon completion of a collaboration, 
                      I receive a license to use the delivered content for marketing my property. Full terms are 
                      outlined in each collaboration agreement.
                    </p>
                  </div>
                </label>
              </div>

              {/* Summary */}
              <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-black">Ready to Launch</p>
                <div className="mt-2 space-y-1 text-sm text-black">
                  <p><strong>{data.propertyTitle}</strong></p>
                  <p>{data.propertyType} in {data.cityRegion}</p>
                  <p>{data.photos.length} photos uploaded</p>
                  {stripeConnected && <p className="text-[#28D17C] font-bold">Payouts enabled</p>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black hover:bg-black/5"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-full border-2 border-black bg-black px-6 py-2 text-sm font-bold text-white hover:bg-black/80"
              >
                Continue
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-full border-2 border-black bg-[#28D17C] px-6 py-2 text-sm font-bold text-black hover:bg-[#28D17C]/80 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Launch My Listing"}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Help text */}
        <p className="mt-4 text-center text-xs text-black/40">
          Need help? <Link href="/help" className="underline hover:text-black">Contact support</Link>
        </p>
      </div>
    </div>
  )
}
