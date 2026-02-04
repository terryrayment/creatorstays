"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import LocationAutocomplete from "@/components/ui/location-autocomplete"

interface OnboardingData {
  displayName: string
  handle: string
  bio: string
  location: string
  avatarUrl: string
  instagramHandle: string
  instagramFollowers: string
  tiktokHandle: string
  tiktokFollowers: string
  youtubeHandle: string
  youtubeSubscribers: string
  niches: string[]
  deliverables: string[]
  minimumFlatFee: string
  openToGiftedStays: boolean
  travelRadius: string
}

const NICHES = [
  { value: "travel", label: "Travel" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "photography", label: "Photography" },
  { value: "adventure", label: "Adventure" },
  { value: "food", label: "Food & Culinary" },
  { value: "wellness", label: "Wellness" },
  { value: "luxury", label: "Luxury" },
  { value: "family", label: "Family" },
]

const DELIVERABLES = [
  { value: "ig-post", label: "Instagram Post" },
  { value: "ig-reel", label: "Instagram Reel" },
  { value: "ig-story", label: "Instagram Story" },
  { value: "tiktok", label: "TikTok Video" },
  { value: "youtube", label: "YouTube Video" },
  { value: "photos-raw", label: "Raw Photos" },
]

const TRAVEL_RADIUS = [
  { value: "local", label: "Local Only" },
  { value: "regional", label: "Regional" },
  { value: "national", label: "National" },
  { value: "international", label: "International" },
]

function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100
  const stepNames = ["About You", "Platforms & Niche", "What You Offer", "Review"]
  
  return (
    <div className="mb-8">
      <div className="mb-3 flex justify-between">
        {stepNames.map((name, i) => (
          <div key={name} className="flex flex-col items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
              i + 1 <= step ? 'border-black bg-black text-white' : 'border-black text-black'
            }`}>
              {i + 1}
            </div>
            <span className={`mt-1 hidden text-[10px] font-bold uppercase tracking-wider sm:block ${
              i + 1 <= step ? 'text-black' : 'text-black'
            }`}>{name}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white border border-black">
        <div className="h-full rounded-full bg-[#FF7A00] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function StepIcon({ icon }: { icon: 'user' | 'share' | 'package' | 'check' }) {
  const icons = {
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
    share: <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />,
    package: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  }
  
  return (
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#FF7A00]">
      <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        {icons[icon]}
      </svg>
    </div>
  )
}

function formatFollowers(count: string): string {
  const num = parseInt(count.replace(/,/g, ''))
  if (isNaN(num)) return count
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${Math.round(num / 1000)}K`
  return count
}

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
    niches: [],
    deliverables: [],
    minimumFlatFee: "",
    openToGiftedStays: true,
    travelRadius: "national",
  })

  const totalSteps = 4
  
  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  // Handle OAuth callback and refresh profile data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const igConnected = params.get('ig_connected')
    const igError = params.get('ig_error')
    
    if (igConnected === 'true') {
      // Instagram was just connected - refresh profile data
      fetch("/api/creator/profile")
        .then(res => res.json())
        .then(profile => {
          if (profile.instagramHandle && profile.instagramFollowers) {
            setData(prev => ({
              ...prev,
              instagramHandle: profile.instagramHandle,
              instagramFollowers: profile.instagramFollowers.toString(),
              avatarUrl: profile.avatarUrl || prev.avatarUrl,
            }))
            // Go to step 2 if we were on step 2
            setStep(2)
          }
        })
        .catch(console.error)
      
      // Clean URL
      window.history.replaceState({}, '', '/onboarding/creator')
    }
    
    if (igError) {
      // Show appropriate error message
      const errorMessages: Record<string, string> = {
        'no_pages': 'No Facebook Pages found. Create a Facebook Page and link your Instagram Business account to it.',
        'no_instagram_business': 'No Instagram Business account found. Switch your Instagram to a Business or Creator account and link it to a Facebook Page.',
        'access_denied': 'You denied access. Please try again and accept the permissions.',
        'token_exchange_failed': 'Connection failed. Please try again.',
        'callback_failed': 'Something went wrong. Please try again.',
      }
      setError(errorMessages[igError] || 'Failed to connect Instagram. Please try again.')
      window.history.replaceState({}, '', '/onboarding/creator')
    }
  }, [])

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
            niches: profile.niches || [],
            deliverables: profile.deliverables || [],
            minimumFlatFee: profile.minimumFlatFee?.toString() || "",
            openToGiftedStays: profile.openToGiftedStays ?? true,
            travelRadius: profile.travelRadius || "national",
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
        setData(prev => ({
          ...prev,
          displayName: session?.user?.name || "",
          avatarUrl: session?.user?.image || "",
        }))
      }
      
      setLoading(false)
    }
    
    init()
  }, [status, session, router])

  const checkHandle = async (handle: string) => {
    if (!handle || handle.length < 3) {
      setHandleAvailable(null)
      return
    }
    setCheckingHandle(true)
    try {
      const res = await fetch(`/api/creator/check-handle?handle=${encodeURIComponent(handle)}`)
      const result = await res.json()
      setHandleAvailable(result.available)
    } catch (e) {
      setHandleAvailable(null)
    }
    setCheckingHandle(false)
  }

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!data.displayName.trim()) {
        setError("Please enter your display name")
        return false
      }
      if (!data.handle.trim() || data.handle.length < 3) {
        setError("Please enter a handle (at least 3 characters)")
        return false
      }
      if (handleAvailable === false) {
        setError("This handle is already taken")
        return false
      }
    }
    
    if (step === 2) {
      // Instagram connection is optional until Meta app is approved
      // At minimum, require niche selection
      if (!data.niches.length) {
        setError("Please select at least one niche")
        return false
      }
    }
    
    if (step === 3) {
      if (!data.deliverables.length) {
        setError("Please select at least one deliverable")
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

  const handleLaunch = async () => {
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/creator/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          handle: data.handle.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          bio: data.bio,
          location: data.location,
          avatarUrl: data.avatarUrl,
          instagramHandle: data.instagramHandle,
          instagramFollowers: parseInt(data.instagramFollowers.replace(/,/g, '')) || 0,
          tiktokHandle: data.tiktokHandle,
          tiktokFollowers: parseInt(data.tiktokFollowers.replace(/,/g, '')) || 0,
          youtubeHandle: data.youtubeHandle,
          youtubeSubscribers: parseInt(data.youtubeSubscribers.replace(/,/g, '')) || 0,
          niches: data.niches,
          deliverables: data.deliverables,
          minimumFlatFee: parseInt(data.minimumFlatFee.replace(/,/g, '')) || 0,
          openToGiftedStays: data.openToGiftedStays,
          travelRadius: data.travelRadius,
          onboardingComplete: true,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save profile")
      }

      router.push("/dashboard/creator")
    } catch (e: any) {
      setError(e.message || "Something went wrong")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    )
  }

  const inputClass = "w-full rounded-lg border-2 border-black px-4 py-3 text-sm text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-black"

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <span className="font-heading text-xl font-black text-black">CreatorStays</span>
          <div className="flex items-center gap-3">
            {data.avatarUrl && (
              <img src={data.avatarUrl} alt="" className="h-8 w-8 rounded-full border-2 border-black" />
            )}
            <span className="text-sm font-medium text-black">{data.displayName || 'Creator'}</span>
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

        {/* STEP 1: About You */}
        {step === 1 && (
          <div>
            <div className="mb-8 text-center">
              <StepIcon icon="user" />
              <h1 className="font-heading text-3xl tracking-tight text-black">Let's build your profile</h1>
              <p className="mt-2 text-sm text-black">This info helps hosts understand who you are</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-black bg-white border border-black">
                    {data.avatarUrl ? (
                      <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-black">
                        {data.displayName?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Display Name</label>
                <input
                  type="text"
                  value={data.displayName}
                  onChange={e => updateField("displayName", e.target.value)}
                  placeholder="Your name or brand"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Handle</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black">@</span>
                  <input
                    type="text"
                    value={data.handle}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                      updateField("handle", val)
                      checkHandle(val)
                    }}
                    placeholder="yourhandle"
                    className={`${inputClass} pl-8`}
                  />
                  {data.handle.length >= 3 && (
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${
                      checkingHandle ? 'text-black' : handleAvailable ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {checkingHandle ? '...' : handleAvailable ? 'Available' : 'Taken'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Bio</label>
                <textarea
                  value={data.bio}
                  onChange={e => updateField("bio", e.target.value)}
                  placeholder="Tell hosts about yourself and your content style..."
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Location</label>
                <LocationAutocomplete
                  value={data.location}
                  onChange={(val) => updateField("location", val)}
                  placeholder="City, State"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Connect Instagram - Verified Only */}
        {step === 2 && (
          <div>
            <div className="mb-8 text-center">
              <StepIcon icon="share" />
              <h1 className="font-heading text-3xl tracking-tight text-black">Connect your Instagram</h1>
              <p className="mt-2 text-sm text-black">Verify your presence with one click. No manual entry.</p>
            </div>

            <div className="space-y-6">
              {/* Instagram Connection - Required */}
              <div className="rounded-xl border-2 border-black bg-white overflow-hidden">
                {data.instagramHandle && data.instagramFollowers ? (
                  // Connected State
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                        <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-black">@{data.instagramHandle}</p>
                          <span className="flex items-center gap-1 rounded-full bg-[#28D17C] px-2 py-0.5 text-[10px] font-bold text-black">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Verified
                          </span>
                        </div>
                        <p className="text-2xl font-black text-black">{parseInt(data.instagramFollowers).toLocaleString()} followers</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Not Connected State
                  <div className="p-6">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                        <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-black">Connect Instagram</h3>
                      <p className="mt-1 text-sm text-black">
                        Your follower count is pulled directly from Instagram. Zero manual entry.
                      </p>
                      
                      <button
                        onClick={() => window.location.href = '/api/oauth/instagram/start'}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                        </svg>
                        Connect with Instagram
                      </button>
                    </div>
                    
                    <div className="mt-6 rounded-lg border border-black bg-white p-3">
                      <p className="text-xs font-bold text-black">Requirements:</p>
                      <ul className="mt-2 space-y-1 text-xs text-black">
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-black" />
                          Instagram Business or Creator account
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-black" />
                          Linked to a Facebook Page
                        </li>
                      </ul>
                      <p className="mt-3 text-[10px] text-black">
                        Personal accounts cannot be verified. <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener" className="underline">How to switch to a Business account →</a>
                      </p>
                    </div>

                    {/* Manual entry fallback */}
                    <div className="mt-4 border-t border-black pt-4">
                      <p className="text-xs font-bold text-black mb-3">Or enter manually (unverified):</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={data.instagramHandle}
                          onChange={e => updateField("instagramHandle", e.target.value.replace(/^@/, ""))}
                          placeholder="@username"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={data.instagramFollowers}
                          onChange={e => updateField("instagramFollowers", e.target.value.replace(/[^0-9,]/g, ''))}
                          placeholder="Follower count"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Niche Selection */}
              <div>
                <label className="mb-3 block text-sm font-bold text-black">What's your niche?</label>
                <div className="flex flex-wrap gap-2">
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
                      className={`rounded-full border-2 border-black px-4 py-2 text-xs font-bold transition-all ${
                        data.niches.includes(niche.value) ? "bg-[#FF7A00]" : "bg-white hover:bg-white"
                      }`}
                    >
                      {niche.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: What You Offer */}
        {step === 3 && (
          <div>
            <div className="mb-8 text-center">
              <StepIcon icon="package" />
              <h1 className="font-heading text-3xl tracking-tight text-black">What can you deliver?</h1>
              <p className="mt-2 text-sm text-black">Set your rates and content offerings</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-bold text-black">Content deliverables</label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERABLES.map(item => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        const current = data.deliverables
                        if (current.includes(item.value)) {
                          updateField("deliverables", current.filter(v => v !== item.value))
                        } else {
                          updateField("deliverables", [...current, item.value])
                        }
                      }}
                      className={`rounded-full border-2 border-black px-4 py-2 text-xs font-bold transition-all ${
                        data.deliverables.includes(item.value) ? "bg-[#28D17C]" : "bg-white hover:bg-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Minimum Flat Fee</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black">$</span>
                    <input
                      type="text"
                      value={data.minimumFlatFee}
                      onChange={e => updateField("minimumFlatFee", e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="500"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Travel Radius</label>
                  <select
                    value={data.travelRadius}
                    onChange={e => updateField("travelRadius", e.target.value)}
                    className={inputClass}
                  >
                    {TRAVEL_RADIUS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl border-2 border-black bg-white p-4">
                <label className="flex cursor-pointer items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-black">Open to Post-for-Stay</p>
                    <p className="text-xs text-black">Accept free stays in exchange for content</p>
                  </div>
                  <div className={`relative h-6 w-11 rounded-full transition-colors ${data.openToGiftedStays ? 'bg-[#28D17C]' : 'bg-black'}`}>
                    <input
                      type="checkbox"
                      checked={data.openToGiftedStays}
                      onChange={e => updateField("openToGiftedStays", e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full border-2 border-black bg-white transition-all ${data.openToGiftedStays ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Complete */}
        {step === 4 && (
          <div>
            <div className="mb-8 text-center">
              <StepIcon icon="check" />
              <h1 className="font-heading text-3xl tracking-tight text-black">You're approved for beta!</h1>
              <p className="mt-2 text-sm text-black">Review your profile before completing setup</p>
            </div>

            <div className="space-y-6">
              {/* Profile Preview */}
              <div className="overflow-hidden rounded-xl border-2 border-black bg-white">
                <div className="bg-gradient-to-r from-[#FF7A00] to-[#4AA3FF] p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full border-[3px] border-black bg-white">
                      {data.avatarUrl ? (
                        <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
                          {data.displayName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">{data.displayName}</h3>
                      <p className="text-sm font-medium text-black">@{data.handle}</p>
                      {data.location && <p className="text-xs text-black">{data.location}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  {data.bio && <p className="text-sm text-black">{data.bio}</p>}
                  
                  <div className="flex flex-wrap gap-2">
                    {data.instagramHandle && (
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white">
                        @{data.instagramHandle} • {formatFollowers(data.instagramFollowers)} <span className="opacity-70">(self-reported)</span>
                      </span>
                    )}
                    {data.tiktokHandle && (
                      <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                        @{data.tiktokHandle} • {formatFollowers(data.tiktokFollowers)} <span className="opacity-70">(self-reported)</span>
                      </span>
                    )}
                    {data.youtubeHandle && (
                      <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                        {data.youtubeHandle} • {formatFollowers(data.youtubeSubscribers)} <span className="opacity-70">(self-reported)</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {data.niches.map(n => (
                      <span key={n} className="rounded-full border-2 border-[#FF7A00] bg-[#FF7A00] px-2 py-0.5 text-xs font-bold text-black">
                        {NICHES.find(x => x.value === n)?.label}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-black pt-4">
                    <div>
                      <p className="text-xs text-black">Starting at</p>
                      <p className="text-lg font-bold text-black">${data.minimumFlatFee || '0'}</p>
                    </div>
                    {data.openToGiftedStays && (
                      <span className="rounded-full bg-[#28D17C]/20 px-3 py-1 text-xs font-bold text-black">
                        Open to Post-for-Stay
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#28D17C]">
                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">Visible to beta hosts</p>
                    <p className="mt-0.5 text-xs text-black">
                      Beta hosts can view your profile and send collaboration offers. You'll be notified by email.
                    </p>
                  </div>
                </div>
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
            <button onClick={nextStep} className="rounded-full border-2 border-black bg-black px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5">
              Continue
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              disabled={saving}
              className="rounded-full border-2 border-black bg-[#28D17C] px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Complete Setup"}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
