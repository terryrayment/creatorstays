"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import LocationAutocomplete from "@/components/ui/location-autocomplete"

interface OnboardingData {
  // Step 1: Basic Info
  displayName: string
  handle: string
  bio: string
  location: string
  // Step 2: Platforms
  instagramHandle: string
  instagramFollowers: string
  tiktokHandle: string
  tiktokFollowers: string
  youtubeHandle: string
  youtubeSubscribers: string
  // Step 3: Content
  niches: string[]
  deliverables: string[]
  // Step 4: Rates
  minimumFlatFee: string
  openToGiftedStays: boolean
}

const NICHE_OPTIONS = [
  "Travel", "Lifestyle", "Photography", "Vlog", "Food", 
  "Adventure", "Fashion", "Wellness", "Family", "Luxury", 
  "Budget", "Digital Nomad", "Couples", "Solo Travel"
]

const DELIVERABLE_OPTIONS = [
  "Instagram Feed Post", "Instagram Reel", "Instagram Stories",
  "TikTok Video", "YouTube Video", "YouTube Short",
  "Blog Post", "Twitter/X Thread"
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

export default function CreatorOnboardingPage() {
  const { status } = useSession()
  const router = useRouter()
  
  // Redirect to the new onboarding flow
  useEffect(() => {
    if (status !== "loading") {
      router.replace("/onboarding/creator")
    }
  }, [status, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
        <p className="text-sm font-medium text-black/60">Redirecting...</p>
      </div>
    </div>
  )
}

// Keep old component code for reference
function OldCreatorOnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingProfile, setCheckingProfile] = useState(true)
  
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    handle: "",
    bio: "",
    location: "",
    instagramHandle: "",
    instagramFollowers: "",
    tiktokHandle: "",
    tiktokFollowers: "",
    youtubeHandle: "",
    youtubeSubscribers: "",
    niches: [],
    deliverables: [],
    minimumFlatFee: "",
    openToGiftedStays: true,
  })

  // Check if user already has a profile
  useEffect(() => {
    async function checkProfile() {
      if (status !== "authenticated") return
      
      try {
        const res = await fetch("/api/creator/profile")
        if (res.ok) {
          const profile = await res.json()
          // If profile is mostly complete, redirect to dashboard
          if (profile.profileComplete >= 80) {
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
            instagramHandle: profile.instagramHandle || "",
            instagramFollowers: profile.instagramFollowers?.toString() || "",
            tiktokHandle: profile.tiktokHandle || "",
            tiktokFollowers: profile.tiktokFollowers?.toString() || "",
            youtubeHandle: profile.youtubeHandle || "",
            youtubeSubscribers: profile.youtubeSubscribers?.toString() || "",
            niches: profile.niches || [],
            deliverables: profile.deliverables || [],
            minimumFlatFee: profile.minimumFlatFee ? (profile.minimumFlatFee / 100).toString() : "",
            openToGiftedStays: profile.openToGiftedStays ?? true,
          }))
        } else {
          // No profile yet, use session name
          setData(prev => ({
            ...prev,
            displayName: session?.user?.name || "",
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
        if (!data.handle.trim()) {
          setError("Handle is required")
          return false
        }
        if (!/^[a-zA-Z0-9_]+$/.test(data.handle)) {
          setError("Handle can only contain letters, numbers, and underscores")
          return false
        }
        return true
      case 2:
        // At least one platform required
        if (!data.instagramHandle && !data.tiktokHandle && !data.youtubeHandle) {
          setError("Connect at least one social platform")
          return false
        }
        return true
      case 3:
        if (data.niches.length === 0) {
          setError("Select at least one content niche")
          return false
        }
        if (data.deliverables.length === 0) {
          setError("Select at least one deliverable type")
          return false
        }
        return true
      case 4:
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
      // Calculate total followers
      const totalFollowers = 
        (parseInt(data.instagramFollowers) || 0) +
        (parseInt(data.tiktokFollowers) || 0) +
        (parseInt(data.youtubeSubscribers) || 0)

      const res = await fetch("/api/creator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          handle: data.handle.toLowerCase(),
          bio: data.bio,
          location: data.location,
          instagramHandle: data.instagramHandle || null,
          instagramFollowers: parseInt(data.instagramFollowers) || null,
          tiktokHandle: data.tiktokHandle || null,
          tiktokFollowers: parseInt(data.tiktokFollowers) || null,
          youtubeHandle: data.youtubeHandle || null,
          youtubeSubscribers: parseInt(data.youtubeSubscribers) || null,
          totalFollowers,
          niches: data.niches,
          deliverables: data.deliverables,
          minimumFlatFee: data.minimumFlatFee ? Math.round(parseFloat(data.minimumFlatFee) * 100) : null,
          openToGiftedStays: data.openToGiftedStays,
          profileComplete: 100,
        }),
      })

      if (res.ok) {
        router.push("/dashboard/creator?onboarded=true")
      } else {
        const result = await res.json()
        setError(result.error || "Failed to save profile")
      }
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
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">Creator Setup</p>
          <h1 className="mt-1 font-heading text-2xl font-black text-white">COMPLETE YOUR PROFILE</h1>
          <div className="mt-4 flex justify-center">
            <StepIndicator currentStep={step} totalSteps={4} />
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border-[3px] border-black bg-white p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Basic Information</h2>
                <p className="text-sm text-black/60">Tell hosts who you are</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={data.displayName}
                  onChange={e => updateField("displayName", e.target.value)}
                  placeholder="Sarah Chen"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Handle *
                </label>
                <div className="flex">
                  <span className="flex items-center rounded-l-lg border-2 border-r-0 border-black bg-black/5 px-3 text-sm text-black/60">@</span>
                  <input
                    type="text"
                    value={data.handle}
                    onChange={e => updateField("handle", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="sarahexplores"
                    className={`${inputClass} rounded-l-none`}
                  />
                </div>
                <p className="mt-1 text-xs text-black/50">This will be your profile URL</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Bio
                </label>
                <textarea
                  value={data.bio}
                  onChange={e => updateField("bio", e.target.value)}
                  placeholder="Travel photographer capturing hidden gems across the West Coast..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Location
                </label>
                <LocationAutocomplete
                  value={data.location}
                  onChange={val => updateField("location", val)}
                  placeholder="Los Angeles, CA"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Step 2: Platforms */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Social Platforms</h2>
                <p className="text-sm text-black/60">Connect at least one platform</p>
              </div>

              {/* Instagram */}
              <div className="rounded-xl border-2 border-black p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <span className="font-bold text-black">Instagram</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={data.instagramHandle}
                    onChange={e => updateField("instagramHandle", e.target.value.replace(/^@/, ""))}
                    placeholder="@username"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={data.instagramFollowers}
                    onChange={e => updateField("instagramFollowers", e.target.value)}
                    placeholder="Followers (e.g. 50000)"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* TikTok */}
              <div className="rounded-xl border-2 border-black p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </div>
                  <span className="font-bold text-black">TikTok</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={data.tiktokHandle}
                    onChange={e => updateField("tiktokHandle", e.target.value.replace(/^@/, ""))}
                    placeholder="@username"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={data.tiktokFollowers}
                    onChange={e => updateField("tiktokFollowers", e.target.value)}
                    placeholder="Followers (e.g. 100000)"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* YouTube */}
              <div className="rounded-xl border-2 border-black p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <span className="font-bold text-black">YouTube</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={data.youtubeHandle}
                    onChange={e => updateField("youtubeHandle", e.target.value.replace(/^@/, ""))}
                    placeholder="@channel or channel name"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={data.youtubeSubscribers}
                    onChange={e => updateField("youtubeSubscribers", e.target.value)}
                    placeholder="Subscribers (e.g. 25000)"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Content */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Content & Deliverables</h2>
                <p className="text-sm text-black/60">What kind of content do you create?</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                  Content Niches * <span className="font-normal text-black/50">(select up to 5)</span>
                </label>
                <ChipSelector
                  options={NICHE_OPTIONS}
                  selected={data.niches}
                  onChange={v => updateField("niches", v)}
                  max={5}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black">
                  Deliverable Types * <span className="font-normal text-black/50">(what you can create)</span>
                </label>
                <ChipSelector
                  options={DELIVERABLE_OPTIONS}
                  selected={data.deliverables}
                  onChange={v => updateField("deliverables", v)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Rates */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-black">Your Rates</h2>
                <p className="text-sm text-black/60">Set your minimum compensation</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                  Minimum Rate Per Post
                </label>
                <div className="flex">
                  <span className="flex items-center rounded-l-lg border-2 border-r-0 border-black bg-black/5 px-3 text-sm font-bold text-black">$</span>
                  <input
                    type="number"
                    value={data.minimumFlatFee}
                    onChange={e => updateField("minimumFlatFee", e.target.value)}
                    placeholder="250"
                    className={`${inputClass} rounded-l-none`}
                  />
                </div>
                <p className="mt-1 text-xs text-black/50">Leave blank if flexible on pricing</p>
              </div>

              <div className="rounded-xl border-2 border-black p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-black">Open to Gifted Stays</p>
                    <p className="text-xs text-black/60">Accept stays in exchange for content</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField("openToGiftedStays", !data.openToGiftedStays)}
                    className={`relative h-7 w-12 rounded-full border-2 border-black transition-colors ${
                      data.openToGiftedStays ? "bg-[#28D17C]" : "bg-white"
                    }`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform ${
                      data.openToGiftedStays ? "left-5" : "left-0.5"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-black/60">Profile Summary</p>
                <div className="mt-2 space-y-1 text-sm text-black">
                  <p><strong>@{data.handle || "yourhandle"}</strong> · {data.location || "Location"}</p>
                  <p>{data.niches.join(", ") || "No niches selected"}</p>
                  <p>
                    {data.minimumFlatFee ? `Starting at $${data.minimumFlatFee}` : "Flexible pricing"}
                    {data.openToGiftedStays && " · Open to gifted stays"}
                  </p>
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
                href="/dashboard/creator"
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
                {loading ? "Saving..." : "Complete Setup ✓"}
              </button>
            )}
          </div>
        </div>

        {/* Progress note */}
        <p className="mt-4 text-center text-xs text-white/40">
          Step {step} of 4 · {step < 4 ? "Complete all steps to save your profile" : "Ready to save!"}
        </p>
      </div>
    </div>
  )
}
