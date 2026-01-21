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
  const stepNames = ["About You", "Platforms & Niche", "What You Offer", "Launch"]
  
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
            <span className={`mt-1 hidden text-[10px] font-bold uppercase tracking-wider sm:block ${
              i + 1 <= step ? 'text-black' : 'text-black/30'
            }`}>{name}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full bg-[#D7B6FF] transition-all duration-500" style={{ width: `${progress}%` }} />
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
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#D7B6FF]">
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
      const hasAtLeastOnePlatform = data.instagramHandle || data.tiktokHandle || data.youtubeHandle
      if (!hasAtLeastOnePlatform) {
        setError("Please add at least one social platform")
        return false
      }
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

  const inputClass = "w-full rounded-lg border-2 border-black px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black"

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
              <p className="mt-2 text-sm text-black/60">This is how hosts will discover you</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-black bg-black/10">
                    {data.avatarUrl ? (
                      <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-black/30">
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
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black/40">@</span>
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
                      checkingHandle ? 'text-black/40' : handleAvailable ? 'text-green-600' : 'text-red-500'
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

        {/* STEP 2: Platforms & Niche */}
        {step === 2 && (
          <div>
            <div className="mb-8 text-center">
              <StepIcon icon="share" />
              <h1 className="font-heading text-3xl tracking-tight text-black">Your platforms & niche</h1>
              <p className="mt-2 text-sm text-black/60">Connect your socials and define your content focus</p>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-black">Social Platforms</label>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-black bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                      <span className="text-sm font-bold text-white">IG</span>
                    </div>
                    <input
                      type="text"
                      value={data.instagramHandle}
                      onChange={e => updateField("instagramHandle", e.target.value.replace('@', ''))}
                      placeholder="username"
                      className="flex-1 rounded-lg border-2 border-black px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={data.instagramFollowers}
                      onChange={e => updateField("instagramFollowers", e.target.value)}
                      placeholder="followers"
                      className="w-24 rounded-lg border-2 border-black px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-black bg-black">
                      <span className="text-sm font-bold text-white">TT</span>
                    </div>
                    <input
                      type="text"
                      value={data.tiktokHandle}
                      onChange={e => updateField("tiktokHandle", e.target.value.replace('@', ''))}
                      placeholder="username"
                      className="flex-1 rounded-lg border-2 border-black px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={data.tiktokFollowers}
                      onChange={e => updateField("tiktokFollowers", e.target.value)}
                      placeholder="followers"
                      className="w-24 rounded-lg border-2 border-black px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-black bg-red-600">
                      <span className="text-sm font-bold text-white">YT</span>
                    </div>
                    <input
                      type="text"
                      value={data.youtubeHandle}
                      onChange={e => updateField("youtubeHandle", e.target.value.replace('@', ''))}
                      placeholder="channel"
                      className="flex-1 rounded-lg border-2 border-black px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={data.youtubeSubscribers}
                      onChange={e => updateField("youtubeSubscribers", e.target.value)}
                      placeholder="subs"
                      className="w-24 rounded-lg border-2 border-black px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

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
                        data.niches.includes(niche.value) ? "bg-[#D7B6FF]" : "bg-white hover:bg-black/5"
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
              <p className="mt-2 text-sm text-black/60">Set your rates and content offerings</p>
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
                        data.deliverables.includes(item.value) ? "bg-[#28D17C]" : "bg-white hover:bg-black/5"
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
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black/40">$</span>
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
                    <p className="text-xs text-black/60">Accept free stays in exchange for content</p>
                  </div>
                  <div className={`relative h-6 w-11 rounded-full transition-colors ${data.openToGiftedStays ? 'bg-[#28D17C]' : 'bg-black/20'}`}>
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

        {/* STEP 4: Review & Launch */}
        {step === 4 && (
          <div>
            <div className="mb-8 text-center">
              <StepIcon icon="check" />
              <h1 className="font-heading text-3xl tracking-tight text-black">You're ready to launch!</h1>
              <p className="mt-2 text-sm text-black/60">Review your profile and go live</p>
            </div>

            <div className="space-y-6">
              {/* Profile Preview */}
              <div className="overflow-hidden rounded-xl border-2 border-black bg-white">
                <div className="bg-gradient-to-r from-[#D7B6FF] to-[#4AA3FF] p-6">
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
                      <p className="text-sm font-medium text-black/70">@{data.handle}</p>
                      {data.location && <p className="text-xs text-black/60">{data.location}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  {data.bio && <p className="text-sm text-black/70">{data.bio}</p>}
                  
                  <div className="flex flex-wrap gap-2">
                    {data.instagramHandle && (
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white">
                        @{data.instagramHandle} • {formatFollowers(data.instagramFollowers)}
                      </span>
                    )}
                    {data.tiktokHandle && (
                      <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                        @{data.tiktokHandle} • {formatFollowers(data.tiktokFollowers)}
                      </span>
                    )}
                    {data.youtubeHandle && (
                      <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                        {data.youtubeHandle} • {formatFollowers(data.youtubeSubscribers)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {data.niches.map(n => (
                      <span key={n} className="rounded-full bg-[#D7B6FF]/30 px-2 py-0.5 text-xs font-medium text-black">
                        {NICHES.find(x => x.value === n)?.label}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-black/10 pt-4">
                    <div>
                      <p className="text-xs text-black/50">Starting at</p>
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

              <p className="text-center text-xs text-black/50">
                Your profile will be visible to hosts looking for creators
              </p>
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
              className="rounded-full border-2 border-black bg-[#28D17C] px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? "Launching..." : "Launch Profile"}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
