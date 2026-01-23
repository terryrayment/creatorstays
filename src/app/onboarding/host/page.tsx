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
  // Profile (auto-filled from Google)
  displayName: string
  contactEmail: string
  phone: string
  avatarUrl: string
  // Property
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
  // Preferences
  idealCreators: string[]
  contentNeeds: string[]
  budgetRange: string
}

// Reduced to top 8 property types
const PROPERTY_TYPES = [
  { value: "cabin", label: "Cabin" },
  { value: "beach-house", label: "Beach House" },
  { value: "mountain", label: "Mountain Retreat" },
  { value: "city", label: "City Apartment" },
  { value: "villa", label: "Villa" },
  { value: "cottage", label: "Cottage" },
  { value: "tiny-home", label: "Tiny Home" },
  { value: "other", label: "Other" },
]

// Reduced to top 10 amenities
const AMENITIES = [
  "Pool", "Hot Tub", "Ocean View", "Mountain View", 
  "Fireplace", "Chef's Kitchen", "Outdoor Space",
  "Pet Friendly", "Beach Access", "Lake View"
]

// Simplified creator types
const CREATOR_TYPES = [
  { value: "travel", label: "Travel Creators" },
  { value: "lifestyle", label: "Lifestyle Influencers" },
  { value: "photography", label: "Photography Focused" },
  { value: "video", label: "Video/Vlog Creators" },
  { value: "family", label: "Family Content" },
  { value: "luxury", label: "Luxury/High-End" },
]

// Simplified content needs
const CONTENT_NEEDS = [
  { value: "ig-post", label: "Instagram Post" },
  { value: "ig-reel", label: "Instagram Reel" },
  { value: "tiktok", label: "TikTok Video" },
  { value: "youtube", label: "YouTube Video" },
  { value: "photos", label: "Professional Photos" },
]

const BUDGET_RANGES = [
  { value: "post-for-stay", label: "Post-for-Stay Only", desc: "Free stay in exchange for content" },
  { value: "under-250", label: "Under $250", desc: "+ optional free stay" },
  { value: "under-1000", label: "Under $1,000", desc: "+ optional free stay" },
  { value: "over-1000", label: "Over $1,000", desc: "+ optional free stay" },
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
  const stepNames = ["Property", "Preferences", "Review & Pay"]
  
  return (
    <div className="mb-8">
      <div className="mb-3 flex justify-between">
        {stepNames.map((name, i) => (
          <div key={name} className="flex flex-col items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
              i + 1 <= step ? 'border-black bg-black text-white' : 'border-black/30 text-black/30'
            }`}>
              {i + 1}
            </div>
            <span className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${
              i + 1 <= step ? 'text-black' : 'text-black/30'
            }`}>{name}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
        <div 
          className="h-full rounded-full bg-[#28D17C] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function StepIcon({ icon }: { icon: 'home' | 'target' | 'card' }) {
  const icons = {
    home: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    ),
    target: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    ),
    card: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    ),
  }
  
  return (
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#FFD84A]">
      <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        {icons[icon]}
      </svg>
    </div>
  )
}

// Helper to get the correct image src based on URL type
function getImageSrc(photo: string): string {
  // If it's a base64 data URL, use directly
  if (photo.startsWith('data:')) {
    return photo
  }
  // If it's from Airbnb (muscache.com), use the proxy
  if (photo.includes('muscache.com')) {
    return `/api/image-proxy?url=${encodeURIComponent(photo)}`
  }
  // Otherwise use directly (could be from cloud storage, etc.)
  return photo
}

function PhotoGrid({ photos, onRemove }: { photos: string[]; onRemove: (i: number) => void }) {
  if (!photos.length) return null
  
  return (
    <div className="grid grid-cols-4 gap-2">
      {photos.slice(0, 8).map((photo, i) => (
        <div key={i} className="relative aspect-square overflow-hidden rounded-lg border-2 border-black">
          <img 
            src={getImageSrc(photo)} 
            alt="" 
            className="h-full w-full object-cover"
            onError={(e) => {
              // If image fails to load, show placeholder
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement?.classList.add('bg-black/10')
            }}
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
  
  // Checkout state
  const [promoCode, setPromoCode] = useState("")
  const [promoValidating, setPromoValidating] = useState(false)
  const [promoResult, setPromoResult] = useState<{
    valid: boolean
    finalPrice: number
    discountAmount: number
    description: string
    isFree: boolean
  } | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'agency'>('standard')
  
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    contactEmail: "",
    phone: "",
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
    photos: [],
    heroImageUrl: "",
    idealCreators: [],
    contentNeeds: [],
    budgetRange: "",
  })
  
  // Track existing property ID (from registration) to update instead of create
  const [existingPropertyId, setExistingPropertyId] = useState<string | null>(null)

  const totalSteps = 3
  
  // Photo upload state
  const [isUploading, setIsUploading] = useState(false)
  const [draggedPhoto, setDraggedPhoto] = useState<number | null>(null)
  
  // Compute whether Step 1 is complete for visual feedback
  const step1Complete = (importSuccess || manualEntry) && 
    data.propertyTitle.trim() && 
    data.cityRegion.trim() && 
    parseInt(data.bedrooms) >= 1 &&
    parseInt(data.bathrooms) >= 1 &&
    parseInt(data.maxGuests) >= 1 &&
    data.propertyType &&
    data.photos.length >= 6 &&
    data.priceRange
  
  // Compute whether Step 2 is complete
  const step2Complete = data.idealCreators.length > 0 && data.contentNeeds.length > 0
  
  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [field]: value }))
    setError("")
  }
  
  // Auto-save property data when it changes (prevents data loss when navigating away)
  useEffect(() => {
    // Only save if we have meaningful data and not just loading
    if (loading || !importSuccess && !manualEntry) return
    if (!data.propertyTitle && !data.photos.length && !data.cityRegion) return
    
    const saveTimer = setTimeout(async () => {
      try {
        // Save to localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('onboarding_draft', JSON.stringify(data))
        }
        
        // Save to API
        const propertyData = {
          id: existingPropertyId || undefined,
          title: data.propertyTitle || null,
          propertyType: data.propertyType || null,
          cityRegion: data.cityRegion || null,
          airbnbUrl: data.airbnbUrl || null,
          beds: data.bedrooms ? parseInt(data.bedrooms) : null,
          baths: data.bathrooms ? parseInt(data.bathrooms) : null,
          maxGuests: data.maxGuests ? parseInt(data.maxGuests) : null,
          amenities: data.amenities,
          photos: data.photos,
          heroImageUrl: data.photos[0] || null,
          priceNightlyRange: data.priceRange || null,
          isDraft: true,
        }
        
        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(propertyData),
        })
        
        if (res.ok) {
          const result = await res.json()
          if (result.property?.id && !existingPropertyId) {
            setExistingPropertyId(result.property.id)
          }
          console.log('[Onboarding] Auto-saved property data')
        }
      } catch (e) {
        console.error('[Onboarding] Auto-save failed:', e)
      }
    }, 2000) // Debounce by 2 seconds
    
    return () => clearTimeout(saveTimer)
  }, [data.propertyTitle, data.photos, data.cityRegion, data.bedrooms, data.bathrooms, data.maxGuests, data.propertyType, data.amenities, data.priceRange, existingPropertyId, loading, importSuccess, manualEntry])
  
  // Load from localStorage on mount (backup recovery)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding_draft')
      if (saved) {
        try {
          const savedData = JSON.parse(saved)
          // Only restore if current data is empty
          if (!data.propertyTitle && !data.photos.length && savedData.propertyTitle) {
            setData(prev => ({
              ...prev,
              ...savedData,
              // Keep session-based fields
              displayName: prev.displayName || savedData.displayName,
              contactEmail: prev.contactEmail || savedData.contactEmail,
              avatarUrl: prev.avatarUrl || savedData.avatarUrl,
            }))
            if (savedData.airbnbUrl || savedData.propertyTitle) {
              setImportSuccess(true)
            }
            console.log('[Onboarding] Restored from localStorage')
          }
        } catch (e) {
          console.error('[Onboarding] Failed to restore from localStorage')
        }
      }
    }
  }, [])
  
  // Handle photo upload
  // Compress image to reduce size
  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Scale down if too large
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to JPEG with compression
          const compressed = canvas.toDataURL('image/jpeg', quality)
          resolve(compressed)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setIsUploading(true)
    const newPhotos: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Compress image before adding
        const compressed = await compressImage(file, 1200, 0.7)
        
        // Try to upload to Cloudinary
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              file: compressed,
              collaborationId: 'property-photos'
            }),
          })
          
          if (res.ok) {
            const data = await res.json()
            newPhotos.push(data.file.url) // Use Cloudinary URL
          } else {
            newPhotos.push(compressed) // Fallback to base64
          }
        } catch {
          newPhotos.push(compressed) // Fallback to base64
        }
      } catch (err) {
        console.error('Failed to compress image:', err)
        // Fallback to original if compression fails
        const reader = new FileReader()
        await new Promise<void>((resolve) => {
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              newPhotos.push(reader.result)
            }
            resolve()
          }
          reader.readAsDataURL(file)
        })
      }
    }
    
    const updatedPhotos = [...data.photos, ...newPhotos]
    setData(prev => ({
      ...prev,
      photos: updatedPhotos,
      heroImageUrl: prev.heroImageUrl || newPhotos[0]
    }))
    
    // Auto-save photos to API so they persist
    if (existingPropertyId) {
      try {
        await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingPropertyId,
            photos: updatedPhotos,
            heroImageUrl: data.heroImageUrl || newPhotos[0],
          }),
        })
      } catch (e) {
        console.error('Failed to auto-save photos:', e)
      }
    }
    
    setIsUploading(false)
    e.target.value = ''
  }

  // Check auth and existing profile - auto-fill from session
  useEffect(() => {
    async function init() {
      if (status === "loading") return
      
      if (status === "unauthenticated") {
        router.push("/login?callbackUrl=/onboarding/host")
        return
      }
      
      try {
        const res = await fetch("/api/host/profile")
        if (res.ok) {
          const profile = await res.json()
          if (profile.onboardingComplete) {
            router.push("/beta/dashboard/host")
            return
          }
          setData(prev => ({
            ...prev,
            displayName: profile.displayName || session?.user?.name || "",
            contactEmail: profile.contactEmail || session?.user?.email || "",
            avatarUrl: profile.avatarUrl || session?.user?.image || "",
          }))
          
          // Also fetch any existing property (created during registration)
          try {
            const propsRes = await fetch("/api/properties")
            if (propsRes.ok) {
              const propsData = await propsRes.json()
              const properties = propsData.properties || propsData || []
              if (properties.length > 0) {
                const prop = properties[0] // Get the first property
                // Store the existing property ID for updates
                setExistingPropertyId(prop.id)
                setData(prev => ({
                  ...prev,
                  airbnbUrl: prop.airbnbUrl || "",
                  propertyTitle: prop.title || "",
                  propertyType: prop.propertyType || "",
                  cityRegion: prop.cityRegion || "",
                  bedrooms: prop.beds?.toString() || "",
                  bathrooms: prop.baths?.toString() || "",
                  maxGuests: (prop.maxGuests || prop.guests)?.toString() || "",
                  amenities: prop.amenities || [],
                  photos: prop.photos || [],
                  heroImageUrl: prop.heroImageUrl || "",
                }))
                // If property has data, mark as ready to proceed
                if (prop.airbnbUrl || prop.title) {
                  setImportSuccess(true)
                }
              }
            }
          } catch (propError) {
            console.error("Failed to fetch property:", propError)
          }
        } else {
          // No profile yet - auto-fill from Google session
          setData(prev => ({
            ...prev,
            displayName: session?.user?.name || "",
            contactEmail: session?.user?.email || "",
            avatarUrl: session?.user?.image || "",
          }))
        }
      } catch (e) {
        console.error("Failed to check profile:", e)
        setData(prev => ({
          ...prev,
          displayName: session?.user?.name || "",
          contactEmail: session?.user?.email || "",
          avatarUrl: session?.user?.image || "",
        }))
      }
      
      setLoading(false)
    }
    
    init()
  }, [status, session, router])

  // Handle "Import" button - just validates URL and shows manual form
  const handleAirbnbImport = async () => {
    if (!data.airbnbUrl) {
      setError("Please enter your Airbnb listing URL")
      return
    }
    
    // Validate it looks like an Airbnb URL
    if (!data.airbnbUrl.includes('airbnb.com') && !data.airbnbUrl.includes('airbnb.')) {
      setError("Please enter a valid Airbnb listing URL")
      return
    }

    // Just mark as ready for manual entry - we don't scrape Airbnb
    setImportSuccess(true)
    setError("")
  }

  // Handle manual entry click
  const handleManualEntry = () => {
    setManualEntry(true)
    setImportSuccess(true) // Allow them to proceed
  }

  // Validation
  const validateStep = (): boolean => {
    if (step === 1) {
      // Must have property details filled in
      if (!data.propertyTitle.trim()) {
        setError("Please enter your property title")
        return false
      }
      if (!data.cityRegion.trim()) {
        setError("Please select a location from the dropdown")
        return false
      }
      // Validate beds, baths, guests
      const beds = parseInt(data.bedrooms)
      const baths = parseInt(data.bathrooms)
      const guests = parseInt(data.maxGuests)
      
      if (!beds || beds < 1) {
        setError("Please enter the number of bedrooms")
        return false
      }
      if (!baths || baths < 1) {
        setError("Please enter the number of bathrooms")
        return false
      }
      if (!guests || guests < 1) {
        setError("Please enter the maximum number of guests")
        return false
      }
      if (!data.propertyType) {
        setError("Please select a property type")
        return false
      }
    }
    
    if (step === 2) {
      if (!data.idealCreators.length) {
        setError("Please select at least one creator type")
        return false
      }
      if (!data.contentNeeds.length) {
        setError("Please select at least one content type")
        return false
      }
    }
    
    return true
  }

  const nextStep = () => {
    if (!validateStep()) return
    setStep(prev => Math.min(prev + 1, totalSteps))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Save profile and property
  const saveData = async () => {
    try {
      console.log("[SaveData] Saving profile...")
      const profileRes = await fetch("/api/host/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          contactEmail: data.contactEmail,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
          location: data.cityRegion,
          bio: "",
          idealCreatorTypes: data.idealCreators,
          preferredContentTypes: data.contentNeeds,
          budgetRange: data.budgetRange,
        }),
      })

      if (!profileRes.ok) {
        const err = await profileRes.json()
        throw new Error(err.error || "Failed to save profile")
      }
      console.log("[SaveData] Profile saved successfully")

      console.log("[SaveData] Saving property...", existingPropertyId ? `(updating ${existingPropertyId})` : "(creating new)")
      console.log("[SaveData] Property data being sent:", {
        id: existingPropertyId,
        title: data.propertyTitle,
        propertyType: data.propertyType,
        cityRegion: data.cityRegion,
        priceNightlyRange: data.priceRange,
        beds: parseInt(data.bedrooms) || 1,
        isDraft: false,
        isActive: true,
      })
      
      // Only save first photo as hero to speed up checkout
      // Full photo gallery can be managed in dashboard
      const heroPhoto = data.photos[0] || ""
      
      const propertyPayload = {
        id: existingPropertyId, // Pass existing ID to update instead of create
        title: data.propertyTitle,
        propertyType: data.propertyType,
        cityRegion: data.cityRegion,
        priceNightlyRange: data.priceRange,
        beds: parseInt(data.bedrooms) || 1,
        baths: parseInt(data.bathrooms) || 1,
        maxGuests: parseInt(data.maxGuests) || 2,
        amenities: data.amenities,
        vibeTags: [],
        photos: heroPhoto ? [heroPhoto] : [], // Only save hero photo for speed
        heroImageUrl: heroPhoto,
        airbnbUrl: data.airbnbUrl,
        isDraft: false, // Publish the property - THIS IS CRITICAL
        isActive: true,
      }
      
      const propertyRes = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyPayload),
      })

      if (!propertyRes.ok) {
        const err = await propertyRes.json()
        console.error("[SaveData] Property save failed:", err)
        throw new Error(err.error || `Failed to save property (${propertyRes.status})`)
      }
      
      const savedProperty = await propertyRes.json()
      console.log("[SaveData] Property saved successfully:", savedProperty.property?.id, "isDraft:", savedProperty.property?.isDraft)

      return true
    } catch (e) {
      console.error("Save error:", e)
      throw e
    }
  }

  // Promo code validation
  const validatePromo = async () => {
    if (!promoCode.trim()) return
    
    setPromoValidating(true)
    try {
      const res = await fetch(`/api/host/membership/validate-promo?code=${encodeURIComponent(promoCode.trim())}`)
      const result = await res.json()
      setPromoResult(result)
    } catch (e) {
      setPromoResult(null)
    }
    setPromoValidating(false)
  }

  // Handle checkout
  const handleCheckout = async () => {
    console.log("[Checkout] Starting checkout process...")
    setCheckingOut(true)
    setError("")

    try {
      // CRITICAL: Save property data BEFORE checkout
      // This must succeed or we show an error
      console.log("[Checkout] Saving data...")
      console.log("[Checkout] Property data to save:", {
        title: data.propertyTitle,
        cityRegion: data.cityRegion,
        priceRange: data.priceRange,
        photos: data.photos.length,
        existingPropertyId
      })
      
      const saveSuccess = await saveData()
      if (!saveSuccess) {
        throw new Error("Failed to save property data")
      }
      console.log("[Checkout] Data saved successfully")

      if (selectedPlan === 'agency') {
        console.log("[Checkout] Processing agency plan...")
        const res = await fetch("/api/host/agency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
        const result = await res.json()
        console.log("[Checkout] Agency response:", result)
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl
        } else {
          throw new Error(result.error || "Failed to start checkout")
        }
      } else {
        console.log("[Checkout] Processing standard plan with promo:", promoResult?.valid ? promoCode : "none")
        const res = await fetch("/api/host/membership/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            promoCode: promoResult?.valid ? promoCode : undefined,
          }),
        })
        const result = await res.json()
        console.log("[Checkout] Membership response:", result)
        
        if (result.freeAccess || result.free) {
          console.log("[Checkout] Free access granted, redirecting...")
          router.push("/onboarding/host/success")
          return // Don't reset checkingOut - we're navigating away
        } else if (result.checkoutUrl) {
          console.log("[Checkout] Redirecting to Stripe...")
          window.location.href = result.checkoutUrl
          return // Don't reset checkingOut - we're navigating away
        } else {
          throw new Error(result.error || "Failed to start checkout")
        }
      }
    } catch (e: any) {
      console.error("[Checkout] Error:", e)
      setError(e.message || "Something went wrong")
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    )
  }

  const inputClass = "w-full rounded-lg border-2 border-black px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black"

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <span className="font-heading text-xl font-black text-black">CreatorStays</span>
          <div className="flex items-center gap-3">
            {data.avatarUrl && (
              <img src={data.avatarUrl} alt="" className="h-8 w-8 rounded-full border-2 border-black" />
            )}
            <span className="text-sm font-medium text-black">{data.displayName || 'Host'}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <ProgressBar step={step} totalSteps={totalSteps} />

        {error && (
          <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STEP 1: Property */}
        {step === 1 && (
          <div>
            <div className="mb-8 text-center">
              <StepIcon icon="home" />
              <h1 className="font-heading text-3xl tracking-tight text-black">Add your property</h1>
              <p className="mt-2 text-sm text-black/60">Import from Airbnb or enter details manually</p>
            </div>

            <div className="space-y-6">
              {!importSuccess && !manualEntry && (
                <div className="rounded-xl border-2 border-black bg-white p-6">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                    Airbnb Listing URL (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={data.airbnbUrl}
                      onChange={e => updateField("airbnbUrl", e.target.value)}
                      placeholder="https://airbnb.com/rooms/..."
                      className={inputClass}
                    />
                    <button
                      onClick={handleAirbnbImport}
                      className="whitespace-nowrap rounded-lg border-2 border-black bg-black px-4 py-2 text-sm font-bold text-white hover:bg-black/80"
                    >
                      Continue
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-black/50">
                    We'll link to your Airbnb listing. You'll enter property details on the next screen.
                  </p>
                  <button
                    onClick={handleManualEntry}
                    className="mt-3 text-xs font-medium text-black/50 underline hover:text-black"
                  >
                    Or enter details manually
                  </button>
                </div>
              )}

              {(importSuccess || manualEntry) && (
                <>
                  {data.airbnbUrl && (
                    <div className="rounded-lg border-2 border-black bg-[#28D17C] p-3 text-sm font-medium text-black">
                      ✓ Airbnb link saved! Now enter your property details below.
                    </div>
                  )}
                  {!data.airbnbUrl && manualEntry && (
                    <div className="rounded-lg border-2 border-black bg-[#4AA3FF] p-3 text-sm font-medium text-black">
                      Enter your property details below.
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Property Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={data.propertyTitle}
                      onChange={e => updateField("propertyTitle", e.target.value)}
                      placeholder="Beautiful Beach House with Ocean Views"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Location <span className="text-red-500">*</span></label>
                    <LocationAutocomplete
                      value={data.cityRegion}
                      onChange={(val) => updateField("cityRegion", val)}
                      placeholder="City, State or Region"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Beds <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        min="1" 
                        step="1"
                        value={data.bedrooms} 
                        onChange={e => updateField("bedrooms", Math.floor(Math.abs(Number(e.target.value) || 0)).toString())} 
                        onKeyDown={e => { if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault() }}
                        placeholder="3" 
                        className={inputClass} 
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Baths <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        min="1" 
                        step="1"
                        value={data.bathrooms} 
                        onChange={e => updateField("bathrooms", Math.floor(Math.abs(Number(e.target.value) || 0)).toString())} 
                        onKeyDown={e => { if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault() }}
                        placeholder="2" 
                        className={inputClass} 
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Guests <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        min="1" 
                        step="1"
                        value={data.maxGuests} 
                        onChange={e => updateField("maxGuests", Math.floor(Math.abs(Number(e.target.value) || 0)).toString())} 
                        onKeyDown={e => { if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault() }}
                        placeholder="6" 
                        className={inputClass} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">Property Type <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updateField("propertyType", type.value)}
                          className={`rounded-full border-2 border-black px-3 py-1.5 text-xs font-bold transition-all ${
                            data.propertyType === type.value ? "bg-[#FFD84A]" : "bg-white hover:bg-black/5"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map(amenity => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => {
                            const current = data.amenities
                            if (current.includes(amenity)) {
                              updateField("amenities", current.filter(a => a !== amenity))
                            } else {
                              updateField("amenities", [...current, amenity])
                            }
                          }}
                          className={`rounded-full border-2 border-black px-3 py-1.5 text-xs font-bold transition-all ${
                            data.amenities.includes(amenity) ? "bg-[#4AA3FF]" : "bg-white hover:bg-black/5"
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nightly Price */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">Nightly Price Range <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[
                        { value: "$250-$400", label: "$250 - $400" },
                        { value: "$400-$550", label: "$400 - $550" },
                        { value: "$550-$750", label: "$550 - $750" },
                        { value: "$750-$1000", label: "$750 - $1,000" },
                        { value: "$1000-$1250", label: "$1,000 - $1,250" },
                        { value: "$1250-$1500", label: "$1,250 - $1,500" },
                      ].map(price => (
                        <button
                          key={price.value}
                          type="button"
                          onClick={() => updateField("priceRange", price.value)}
                          className={`rounded-lg border-2 border-black px-3 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                            data.priceRange === price.value ? "bg-[#FFD84A]" : "bg-white hover:bg-black/5"
                          }`}
                        >
                          {price.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-black/50">per night</p>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black">
                      Property Photos <span className="text-red-500">*</span>
                      <span className="ml-2 font-normal text-black/50">(minimum 6)</span>
                    </label>
                    <p className="mb-3 text-[11px] text-black/50">Drag and drop to reorder photos. First photo is the cover.</p>
                    
                    {/* Photo Grid with Drag & Drop */}
                    {data.photos.length > 0 && (
                      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {data.photos.map((photo, i) => (
                          <div 
                            key={i} 
                            draggable
                            onDragStart={() => setDraggedPhoto(i)}
                            onDragEnd={() => setDraggedPhoto(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (draggedPhoto !== null && draggedPhoto !== i) {
                                const newPhotos = [...data.photos]
                                const [moved] = newPhotos.splice(draggedPhoto, 1)
                                newPhotos.splice(i, 0, moved)
                                updateField("photos", newPhotos)
                              }
                              setDraggedPhoto(null)
                            }}
                            className={`group relative aspect-square overflow-hidden rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all ${
                              i === 0 ? 'border-[#FFD84A] border-[3px]' : 'border-black'
                            } ${draggedPhoto === i ? 'opacity-50 scale-95' : ''} ${
                              draggedPhoto !== null && draggedPhoto !== i ? 'hover:border-[#4AA3FF] hover:border-[3px]' : ''
                            }`}
                          >
                            <img 
                              src={getImageSrc(photo)} 
                              alt={`Photo ${i + 1}`} 
                              className="h-full w-full object-cover pointer-events-none"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.parentElement?.classList.add('bg-black/10')
                              }}
                            />
                            
                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const newPhotos = [...data.photos]
                                newPhotos.splice(i, 1)
                                updateField("photos", newPhotos)
                              }}
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 z-10"
                            >
                              ×
                            </button>
                            
                            {/* Cover badge */}
                            {i === 0 && (
                              <span className="absolute bottom-1 left-1 rounded-full bg-[#FFD84A] px-1.5 py-0.5 text-[8px] font-bold text-black">
                                Cover
                              </span>
                            )}
                            
                            {/* Drag handle indicator */}
                            <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Upload Button */}
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/30 bg-white p-6 transition-colors hover:border-black hover:bg-black/5">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          <span className="text-sm font-medium text-black">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="mb-2 h-8 w-8 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-bold text-black">Click to upload photos</span>
                          <span className="mt-1 text-xs text-black/50">
                            {data.photos.length}/6 uploaded {data.photos.length >= 6 && "✓"}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  
                  {/* Completion Checklist */}
                  {!step1Complete && (
                    <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-black">Required to continue:</p>
                      <div className="space-y-1.5">
                        {!data.propertyTitle.trim() && (
                          <p className="flex items-center gap-2 text-sm text-black">
                            <span className="text-black">○</span> Property title
                          </p>
                        )}
                        {!data.cityRegion.trim() && (
                          <p className="flex items-center gap-2 text-sm text-black">
                            <span className="text-black">○</span> Location (select from dropdown)
                          </p>
                        )}
                        {(!data.bedrooms || parseInt(data.bedrooms) < 1) && (
                          <p className="flex items-center gap-2 text-sm text-black">
                            <span className="text-black">○</span> Number of bedrooms
                          </p>
                        )}
                        {(!data.bathrooms || parseInt(data.bathrooms) < 1) && (
                          <p className="flex items-center gap-2 text-sm text-black">
                            <span className="text-black">○</span> Number of bathrooms
                          </p>
                        )}
                        {(!data.maxGuests || parseInt(data.maxGuests) < 1) && (
                          <p className="flex items-center gap-2 text-sm text-black">
                            <span className="text-black">○</span> Maximum guests
                          </p>
                        )}
                        {!data.propertyType && (
                          <p className="flex items-center gap-2 text-sm text-black">
                            <span className="text-black">○</span> Property type
                          </p>
                        )}
                        {!data.priceRange && (
                          <p className="flex items-center gap-2 text-sm text-black">
                            <span className="text-black">○</span> Nightly price range
                          </p>
                        )}
                        {data.photos.length < 6 && (
                          <p className="flex items-center gap-2 text-sm text-black">
                            <span className="text-black">○</span> At least 6 photos ({data.photos.length}/6)
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Preferences */}
        {step === 2 && (
          <div>
            <div className="mb-8 text-center">
              <StepIcon icon="target" />
              <h1 className="font-heading text-3xl tracking-tight text-black">What are you looking for?</h1>
              <p className="mt-2 text-sm text-black/60">Help us match you with the right creators</p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-bold text-black">What types of creators interest you?</label>
                <div className="grid gap-2 sm:grid-cols-2">
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
                      className={`rounded-xl border-2 border-black p-3 text-left text-sm font-bold transition-all hover:-translate-y-0.5 ${
                        data.idealCreators.includes(type.value) ? "bg-[#4AA3FF]" : "bg-white hover:bg-black/5"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-black">What content do you need?</label>
                <div className="flex flex-wrap gap-2">
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
                      className={`rounded-full border-2 border-black px-4 py-2 text-xs font-bold transition-all ${
                        data.contentNeeds.includes(content.value) ? "bg-[#28D17C]" : "bg-white hover:bg-black/5"
                      }`}
                    >
                      {content.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-black">What's your budget per collaboration?</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BUDGET_RANGES.map(budget => (
                    <button
                      key={budget.value}
                      type="button"
                      onClick={() => updateField("budgetRange", budget.value)}
                      className={`rounded-xl border-2 border-black p-3 text-left transition-all hover:-translate-y-0.5 ${
                        data.budgetRange === budget.value ? "bg-[#FFD84A]" : "bg-white hover:bg-black/5"
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

        {/* STEP 3: Review & Pay */}
        {step === 3 && (
          <div>
            <div className="mb-8 text-center">
              <StepIcon icon="card" />
              <h1 className="font-heading text-3xl tracking-tight text-black">Review & Launch</h1>
              <p className="mt-2 text-sm text-black/60">Confirm your details and choose your plan</p>
            </div>

            <div className="space-y-6">
              {/* Property Preview */}
              <div className="overflow-hidden rounded-xl border-2 border-black bg-white">
                {data.photos[0] && (
                  <div className="relative aspect-video bg-black/5">
                    <img 
                      src={getImageSrc(data.photos[0])} 
                      alt="" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-black">{data.propertyTitle}</h3>
                  <p className="text-sm text-black/60">{data.cityRegion}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.bedrooms && <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium">{data.bedrooms} bed</span>}
                    {data.bathrooms && <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium">{data.bathrooms} bath</span>}
                    {data.maxGuests && <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium">{data.maxGuests} guests</span>}
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="mb-3 block text-sm font-bold text-black">Choose your plan</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setSelectedPlan('standard')}
                    className={`rounded-xl border-[3px] p-4 text-left transition-all ${
                      selectedPlan === 'standard' ? 'border-black bg-[#FFD84A]' : 'border-black/30 bg-white hover:border-black/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Most Popular</p>
                        <p className="font-heading text-lg font-bold text-black">Standard Host</p>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        selectedPlan === 'standard' ? 'border-black bg-black' : 'border-black/30'
                      }`}>
                        {selectedPlan === 'standard' && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 font-heading text-2xl font-black text-black">$199</p>
                    <p className="text-xs text-black/60">One-time • 1 property • Lifetime access</p>
                  </button>

                  <button
                    onClick={() => setSelectedPlan('agency')}
                    className={`rounded-xl border-[3px] p-4 text-left transition-all ${
                      selectedPlan === 'agency' ? 'border-black bg-[#4AA3FF]' : 'border-black/30 bg-white hover:border-black/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Property Managers</p>
                        <p className="font-heading text-lg font-bold text-black">Agency Pro</p>
                      </div>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        selectedPlan === 'agency' ? 'border-black bg-black' : 'border-black/30'
                      }`}>
                        {selectedPlan === 'agency' && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 font-heading text-2xl font-black text-black">$199<span className="text-sm font-medium">/mo</span></p>
                    <p className="text-xs text-black/60">Unlimited properties • 5 team logins</p>
                  </button>
                </div>
              </div>

              {/* Promo Code */}
              {selectedPlan === 'standard' && (
                <div className="rounded-xl border-2 border-black bg-white p-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null) }}
                      placeholder="LAUNCH2025"
                      className="flex-1 rounded-lg border-2 border-black px-3 py-2 text-sm uppercase"
                    />
                    <button
                      onClick={validatePromo}
                      disabled={promoValidating || !promoCode.trim()}
                      className="rounded-lg border-2 border-black bg-black px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      {promoValidating ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoResult && (
                    <p className={`mt-2 text-xs font-medium ${promoResult.valid ? 'text-green-600' : 'text-red-500'}`}>
                      {promoResult.valid ? (promoResult.isFree ? "Free access activated!" : `$${promoResult.discountAmount} off applied!`) : "Invalid promo code"}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-black/50">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span>Secure checkout powered by Stripe</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <button onClick={prevStep} className="rounded-full border-2 border-black bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5">
              Back
            </button>
          ) : <div />}
          
          {step < totalSteps ? (
            <button 
              onClick={nextStep} 
              disabled={(step === 1 && !step1Complete) || (step === 2 && !step2Complete)}
              className={`rounded-full border-2 border-black px-8 py-2.5 text-xs font-bold uppercase tracking-wider transition-transform ${
                (step === 1 && !step1Complete) || (step === 2 && !step2Complete)
                  ? 'bg-black/30 text-white/60 cursor-not-allowed'
                  : 'bg-black text-white hover:-translate-y-0.5'
              }`}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="rounded-full border-2 border-black bg-[#28D17C] px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {checkingOut ? "Processing..." : selectedPlan === 'agency' ? "Subscribe $199/mo" : promoResult?.isFree ? "Activate Free" : `Pay $${promoResult?.finalPrice || 199}`}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
