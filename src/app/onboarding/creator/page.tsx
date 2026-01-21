"use client"

import { useState, useEffect, useRef } from "react"
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
  twitterHandle: string
  twitterFollowers: string
  websiteUrl: string
  niches: string[]
  contentStyle: string[]
  languages: string[]
  deliverables: string[]
  turnaroundTime: string
  equipmentLevel: string
  minimumFlatFee: string
  openToGiftedStays: boolean
  preferredDealTypes: string[]
  availability: string
  travelRadius: string
  portfolioImages: string[]
  sampleContentUrls: string[]
  mediaKitUrl: string
}

const NICHES = [
  { value: "travel", label: "✈️ Travel", desc: "Destinations & getaways" },
  { value: "lifestyle", label: "🌟 Lifestyle", desc: "Daily life & aesthetics" },
  { value: "photography", label: "📸 Photography", desc: "Visual storytelling" },
  { value: "adventure", label: "🏔️ Adventure", desc: "Outdoor & active" },
  { value: "food", label: "🍜 Food & Culinary", desc: "Dining & cooking" },
  { value: "wellness", label: "🧘 Wellness", desc: "Health & self-care" },
  { value: "luxury", label: "💎 Luxury", desc: "High-end experiences" },
  { value: "budget", label: "💰 Budget Travel", desc: "Value-focused" },
  { value: "family", label: "👨‍👩‍👧 Family", desc: "Traveling with kids" },
  { value: "couples", label: "💑 Couples", desc: "Romantic getaways" },
  { value: "solo", label: "🎒 Solo Travel", desc: "Independent adventures" },
  { value: "digital-nomad", label: "💻 Digital Nomad", desc: "Work & travel" },
]

const CONTENT_STYLES = [
  { value: "cinematic", label: "🎬 Cinematic" },
  { value: "authentic", label: "🤳 Casual/Authentic" },
  { value: "editorial", label: "📰 Polished/Editorial" },
  { value: "vlog", label: "🎥 Vlog-style" },
  { value: "moody", label: "🌙 Aesthetic/Moody" },
  { value: "bright", label: "☀️ Bright & Airy" },
  { value: "storytelling", label: "📖 Storytelling" },
  { value: "educational", label: "🎓 Informative/Guide" },
]

const DELIVERABLES = [
  { value: "ig-post", label: "Instagram Post", icon: "📷" },
  { value: "ig-reel", label: "Instagram Reel", icon: "🎬" },
  { value: "ig-story", label: "Instagram Story", icon: "⭕" },
  { value: "ig-carousel", label: "Instagram Carousel", icon: "🎠" },
  { value: "tiktok", label: "TikTok Video", icon: "🎵" },
  { value: "youtube", label: "YouTube Video", icon: "▶️" },
  { value: "youtube-short", label: "YouTube Short", icon: "📱" },
  { value: "blog", label: "Blog Post", icon: "📝" },
  { value: "photos-raw", label: "Raw Photos", icon: "🖼️" },
  { value: "drone", label: "Drone Footage", icon: "🚁" },
]

const DEAL_TYPES = [
  { value: "paid", label: "💵 Paid Collaborations", desc: "Flat fee + free stay" },
  { value: "gifted", label: "🎁 Post-for-Stay", desc: "Content in exchange for stay" },
  { value: "hybrid", label: "🤝 Hybrid Deals", desc: "Reduced rate + stay" },
]

const TRAVEL_RADIUS = [
  { value: "local", label: "🚗 Local Only" },
  { value: "regional", label: "✈️ Regional" },
  { value: "national", label: "🇺🇸 National" },
  { value: "international", label: "🌎 International" },
]

function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-black/60">
        <span>Step {step} of {totalSteps}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full bg-[#D7B6FF] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function StepHeader({ title, subtitle, emoji }: { title: string; subtitle: string; emoji: string }) {
  return (
    <div className="mb-8 text-center">
      <span className="mb-2 inline-block text-5xl">{emoji}</span>
      <h1 className="font-heading text-3xl tracking-tight text-black sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-black/60">{subtitle}</p>
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null)
  const [checkingHandle, setCheckingHandle] = useState(false)
  
  const [data, setData] = useState<OnboardingData>({
    displayName: "", handle: "", bio: "", location: "", avatarUrl: "",
    instagramHandle: "", instagramFollowers: "",
    tiktokHandle: "", tiktokFollowers: "",
    youtubeHandle: "", youtubeSubscribers: "",
    twitterHandle: "", twitterFollowers: "",
    websiteUrl: "",
    niches: [], contentStyle: [], languages: ["English"],
    deliverables: [], turnaroundTime: "1week", equipmentLevel: "prosumer",
    minimumFlatFee: "", openToGiftedStays: true,
    preferredDealTypes: ["paid", "gifted"],
    availability: "flexible", travelRadius: "national",
    portfolioImages: [], sampleContentUrls: ["", "", ""], mediaKitUrl: "",
  })

  const totalSteps = 7
  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  useEffect(() => {
    async function init() {
      if (status === "loading") return
      if (status === "unauthenticated") { router.push("/login?callbackUrl=/onboarding/creator"); return }
      
      // Check for referral code in URL or localStorage
      const params = new URLSearchParams(window.location.search)
      const refCode = params.get("ref") || localStorage.getItem("referralCode")
      if (refCode) {
        localStorage.setItem("referralCode", refCode.toUpperCase())
      }
      
      try {
        const res = await fetch("/api/creator/profile")
        if (res.ok) {
          const profile = await res.json()
          if (profile.onboardingComplete) { router.push("/dashboard/creator"); return }
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
          setData(prev => ({ ...prev, displayName: session?.user?.name || "", avatarUrl: session?.user?.image || "" }))
        }
      } catch (e) { console.error("Failed to check profile:", e) }
      setLoading(false)
    }
    init()
  }, [status, session, router])

  useEffect(() => {
    const checkHandle = async () => {
      if (!data.handle || data.handle.length < 3) { setHandleAvailable(null); return }
      setCheckingHandle(true)
      try {
        const res = await fetch(`/api/creator/check-handle?handle=${encodeURIComponent(data.handle)}`)
        const result = await res.json()
        setHandleAvailable(result.available)
      } catch { setHandleAvailable(null) }
      setCheckingHandle(false)
    }
    const timeout = setTimeout(checkHandle, 500)
    return () => clearTimeout(timeout)
  }, [data.handle])

  const totalFollowers = () => {
    let total = 0
    if (data.instagramFollowers) total += parseInt(data.instagramFollowers.replace(/,/g, '')) || 0
    if (data.tiktokFollowers) total += parseInt(data.tiktokFollowers.replace(/,/g, '')) || 0
    if (data.youtubeSubscribers) total += parseInt(data.youtubeSubscribers.replace(/,/g, '')) || 0
    if (data.twitterFollowers) total += parseInt(data.twitterFollowers.replace(/,/g, '')) || 0
    return total
  }

  const validateStep = (s: number): boolean => {
    setError("")
    if (s === 1) {
      if (!data.displayName.trim()) { setError("Please enter your name"); return false }
      if (!data.handle.trim() || data.handle.length < 3) { setError("Handle must be at least 3 characters"); return false }
      if (handleAvailable === false) { setError("This handle is already taken"); return false }
    }
    if (s === 2 && !data.instagramHandle && !data.tiktokHandle && !data.youtubeHandle) { setError("Please connect at least one platform"); return false }
    if (s === 3 && data.niches.length === 0) { setError("Please select at least one niche"); return false }
    if (s === 4 && data.deliverables.length === 0) { setError("Please select at least one deliverable"); return false }
    return true
  }

  const nextStep = () => { if (validateStep(step)) { setStep(prev => Math.min(prev + 1, totalSteps)); window.scrollTo(0, 0) } }
  const prevStep = () => { setStep(prev => Math.max(prev - 1, 1)); window.scrollTo(0, 0) }

  const handleComplete = async () => {
    if (!validateStep(step)) return
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/creator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName, handle: data.handle.toLowerCase(), bio: data.bio,
          location: data.location, avatarUrl: data.avatarUrl,
          instagramHandle: data.instagramHandle,
          instagramFollowers: data.instagramFollowers ? parseInt(data.instagramFollowers.replace(/,/g, '')) : null,
          tiktokHandle: data.tiktokHandle,
          tiktokFollowers: data.tiktokFollowers ? parseInt(data.tiktokFollowers.replace(/,/g, '')) : null,
          youtubeHandle: data.youtubeHandle,
          youtubeSubscribers: data.youtubeSubscribers ? parseInt(data.youtubeSubscribers.replace(/,/g, '')) : null,
          websiteUrl: data.websiteUrl, niches: data.niches, deliverables: data.deliverables,
          minimumFlatFee: data.minimumFlatFee ? parseInt(data.minimumFlatFee.replace(/[^0-9]/g, '')) : null,
          openToGiftedStays: data.openToGiftedStays, dealTypes: data.preferredDealTypes,
          mediaKitUrl: data.mediaKitUrl, totalFollowers: totalFollowers(), onboardingComplete: true,
        }),
      })
      if (!res.ok) throw new Error("Failed to save profile")
      
      // Apply referral code if present
      const referralCode = localStorage.getItem("referralCode")
      if (referralCode) {
        try {
          await fetch("/api/creator/referral", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ referralCode }),
          })
          localStorage.removeItem("referralCode")
        } catch (e) {
          console.error("Failed to apply referral code:", e)
        }
      }
      
      router.push("/dashboard/creator?welcome=true")
    } catch (e) { setError("Something went wrong. Please try again."); setSaving(false) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const newImages: string[] = []
    for (let i = 0; i < files.length && data.portfolioImages.length + newImages.length < 9; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        const dataUrl = await new Promise<string>((resolve) => { reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(file) })
        newImages.push(dataUrl)
      }
    }
    updateField("portfolioImages", [...data.portfolioImages, ...newImages])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading || status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]"><div className="text-center"><div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" /><p className="text-sm font-medium text-black/60">Setting things up...</p></div></div>
  }

  const inputClass = "w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="font-heading text-xl tracking-tight"><span className="text-black">CREATOR</span><span className="text-black/40">STAYS</span></div>
          <span className="rounded-full bg-[#D7B6FF] px-3 py-1 text-xs font-bold text-black">Creator Setup</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <ProgressBar step={step} totalSteps={totalSteps} />

        {step === 1 && (
          <div>
            <StepHeader emoji="✨" title="Let's build your profile" subtitle="This is how hosts will discover you" />
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-black bg-black/10">
                  {data.avatarUrl ? <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-black/30">{data.displayName?.[0]?.toUpperCase() || "?"}</div>}
                </div>
              </div>
              <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Your Name *</label><input type="text" value={data.displayName} onChange={e => updateField("displayName", e.target.value)} placeholder="How hosts will see you" className={inputClass} /></div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Choose Your Handle *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-black/40">@</span>
                  <input type="text" value={data.handle} onChange={e => updateField("handle", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="yourhandle" className={`${inputClass} pl-8`} />
                  {data.handle.length >= 3 && <span className="absolute right-4 top-1/2 -translate-y-1/2">{checkingHandle ? "..." : handleAvailable ? <span className="text-[#28D17C] font-bold">✓</span> : <span className="text-red-500 font-bold">✕</span>}</span>}
                </div>
                <p className="mt-1 text-xs text-black/50">creatorstays.com/c/{data.handle || "yourhandle"}</p>
              </div>
              <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Your Location</label><LocationAutocomplete value={data.location} onChange={val => updateField("location", val)} placeholder="Where are you based?" className={inputClass} /></div>
              <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Bio</label><textarea value={data.bio} onChange={e => updateField("bio", e.target.value)} placeholder="Tell hosts what makes you unique..." rows={4} maxLength={500} className={`${inputClass} resize-none`} /><p className="mt-1 text-right text-xs text-black/50">{data.bio.length}/500</p></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepHeader emoji="📱" title="Connect your platforms" subtitle="Show hosts your reach" />
            <div className="space-y-4">
              {[
                { platform: "Instagram", icon: "📸", handle: data.instagramHandle, followers: data.instagramFollowers, setHandle: (v: string) => updateField("instagramHandle", v), setFollowers: (v: string) => updateField("instagramFollowers", v) },
                { platform: "TikTok", icon: "🎵", handle: data.tiktokHandle, followers: data.tiktokFollowers, setHandle: (v: string) => updateField("tiktokHandle", v), setFollowers: (v: string) => updateField("tiktokFollowers", v) },
                { platform: "YouTube", icon: "▶️", handle: data.youtubeHandle, followers: data.youtubeSubscribers, setHandle: (v: string) => updateField("youtubeHandle", v), setFollowers: (v: string) => updateField("youtubeSubscribers", v), label: "Subscribers" },
                { platform: "Twitter/X", icon: "🐦", handle: data.twitterHandle, followers: data.twitterFollowers, setHandle: (v: string) => updateField("twitterHandle", v), setFollowers: (v: string) => updateField("twitterFollowers", v) },
              ].map(p => (
                <div key={p.platform} className={`rounded-xl border-2 border-black p-4 ${p.handle ? 'bg-[#D7B6FF]/10' : 'bg-white'}`}>
                  <div className="mb-3 flex items-center gap-2"><span className="text-xl">{p.icon}</span><span className="text-sm font-bold text-black">{p.platform}</span>{p.handle && <span className="ml-auto text-xs text-[#28D17C] font-bold">✓ Added</span>}</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/60">Handle</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/40">@</span><input type="text" value={p.handle} onChange={e => p.setHandle(e.target.value.replace('@', '').toLowerCase())} placeholder="yourhandle" className="w-full rounded-lg border-2 border-black bg-white py-2 pl-8 pr-3 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none" /></div></div>
                    <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black/60">{p.label || "Followers"}</label><input type="text" value={p.followers} onChange={e => p.setFollowers(e.target.value.replace(/[^0-9,]/g, ''))} placeholder="e.g., 25,000" className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none" /></div>
                  </div>
                </div>
              ))}
              {totalFollowers() > 0 && <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4 text-center"><p className="text-xs font-bold uppercase tracking-wider text-black/60">Total Reach</p><p className="text-4xl font-bold text-black">{formatFollowers(totalFollowers().toString())}</p></div>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <StepHeader emoji="🎨" title="Your niche & style" subtitle="Help hosts understand what you create" />
            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-bold text-black">What niches do you cover? *</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {NICHES.map(n => (
                    <button key={n.value} type="button" onClick={() => { const c = data.niches; updateField("niches", c.includes(n.value) ? c.filter(v => v !== n.value) : [...c, n.value]) }} className={`rounded-lg border-2 border-black p-3 text-left transition-all hover:-translate-y-0.5 ${data.niches.includes(n.value) ? "bg-[#D7B6FF] ring-2 ring-black ring-offset-2" : "bg-white hover:bg-black/5"}`}>
                      <p className="text-sm font-bold text-black">{n.label}</p><p className="text-xs text-black/60">{n.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-3 block text-sm font-bold text-black">Content style</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_STYLES.map(s => (
                    <button key={s.value} type="button" onClick={() => { const c = data.contentStyle; updateField("contentStyle", c.includes(s.value) ? c.filter(v => v !== s.value) : [...c, s.value]) }} className={`rounded-full border-2 border-black px-3 py-1.5 text-xs font-bold transition-all hover:-translate-y-0.5 ${data.contentStyle.includes(s.value) ? "bg-[#FFD84A]" : "bg-white hover:bg-black/5"}`}>{s.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <StepHeader emoji="📦" title="What can you deliver?" subtitle="Select the content types you offer" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DELIVERABLES.map(d => (
                <button key={d.value} type="button" onClick={() => { const c = data.deliverables; updateField("deliverables", c.includes(d.value) ? c.filter(v => v !== d.value) : [...c, d.value]) }} className={`flex items-center gap-2 rounded-lg border-2 border-black px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 ${data.deliverables.includes(d.value) ? "bg-[#28D17C]" : "bg-white hover:bg-black/5"}`}>
                  <span>{d.icon}</span><span className="text-xs font-bold text-black">{d.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <StepHeader emoji="💰" title="Rates & availability" subtitle="Let hosts know your pricing" />
            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-bold text-black">Deal types you're open to</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DEAL_TYPES.map(d => (
                    <button key={d.value} type="button" onClick={() => { const c = data.preferredDealTypes; updateField("preferredDealTypes", c.includes(d.value) ? (c.length > 1 ? c.filter(v => v !== d.value) : c) : [...c, d.value]) }} className={`rounded-xl border-2 border-black p-4 text-left transition-all hover:-translate-y-0.5 ${data.preferredDealTypes.includes(d.value) ? "bg-[#FFD84A] ring-2 ring-black ring-offset-2" : "bg-white hover:bg-black/5"}`}>
                      <p className="text-sm font-bold text-black">{d.label}</p><p className="text-xs text-black/60">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {data.preferredDealTypes.includes("paid") && (
                <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Minimum Rate (paid collabs)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-black/40">$</span><input type="text" value={data.minimumFlatFee} onChange={e => updateField("minimumFlatFee", e.target.value.replace(/[^0-9]/g, ''))} placeholder="500" className={`${inputClass} pl-8`} /></div><p className="mt-1 text-xs text-black/50">Your starting rate + free stay</p></div>
              )}
              <div>
                <label className="mb-3 block text-sm font-bold text-black">Travel radius</label>
                <div className="grid grid-cols-2 gap-2">
                  {TRAVEL_RADIUS.map(t => (
                    <button key={t.value} type="button" onClick={() => updateField("travelRadius", t.value)} className={`rounded-lg border-2 border-black px-3 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 ${data.travelRadius === t.value ? "bg-[#4AA3FF]" : "bg-white hover:bg-black/5"}`}>{t.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <StepHeader emoji="🖼️" title="Show off your work" subtitle="Upload samples and link to your best content" />
            <div className="space-y-8">
              <div>
                <label className="mb-3 block text-sm font-bold text-black">Portfolio Images</label>
                <div className="grid grid-cols-3 gap-2">
                  {data.portfolioImages.map((img, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-lg border-2 border-black">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => updateField("portfolioImages", data.portfolioImages.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white hover:bg-red-600">✕</button>
                      {i === 0 && <span className="absolute bottom-1 left-1 rounded-full bg-[#D7B6FF] px-2 py-0.5 text-[8px] font-bold text-black">Featured</span>}
                    </div>
                  ))}
                  {data.portfolioImages.length < 9 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-black/30 bg-black/5 text-black/40 hover:border-black hover:bg-black/10 hover:text-black"><span className="text-2xl">+</span><span className="text-[10px] font-bold">Add Photo</span></button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                <p className="mt-2 text-xs text-black/50">Upload up to 9 photos showcasing your best work</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-black">Link to your best content</label>
                <div className="space-y-3">
                  {data.sampleContentUrls.map((url, i) => (
                    <input key={i} type="url" value={url} onChange={e => { const n = [...data.sampleContentUrls]; n[i] = e.target.value; updateField("sampleContentUrls", n) }} placeholder={`Content link ${i + 1}`} className={inputClass} />
                  ))}
                </div>
              </div>
              <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Media Kit URL (optional)</label><input type="url" value={data.mediaKitUrl} onChange={e => updateField("mediaKitUrl", e.target.value)} placeholder="Link to your media kit" className={inputClass} /></div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <StepHeader emoji="🚀" title="You're ready to launch!" subtitle="Review your profile and go live" />
            <div className="space-y-6">
              <div className="overflow-hidden rounded-xl border-2 border-black bg-white">
                {data.portfolioImages[0] ? <div className="aspect-video"><img src={data.portfolioImages[0]} alt="" className="h-full w-full object-cover" /></div> : <div className="aspect-video bg-gradient-to-br from-[#D7B6FF] to-[#4AA3FF]" />}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 -mt-12 overflow-hidden rounded-full border-4 border-white bg-black/10 shadow-lg">
                      {data.avatarUrl ? <img src={data.avatarUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl font-bold bg-[#D7B6FF]">{data.displayName?.[0]?.toUpperCase()}</div>}
                    </div>
                    <div className="flex-1 pt-1"><h3 className="text-lg font-bold text-black">{data.displayName}</h3><p className="text-sm text-black/60">@{data.handle}</p></div>
                    {totalFollowers() > 0 && <div className="rounded-full bg-[#D7B6FF]/30 px-3 py-1 text-xs font-bold text-black">{formatFollowers(totalFollowers().toString())} followers</div>}
                  </div>
                  {data.bio && <p className="mt-4 text-sm text-black/80">{data.bio}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">{data.niches.slice(0, 4).map(n => <span key={n} className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black">{NICHES.find(x => x.value === n)?.label}</span>)}</div>
                  {data.minimumFlatFee && <p className="mt-4 text-sm">Starting at <span className="font-bold text-black">${data.minimumFlatFee}</span> + free stay</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border-2 border-black bg-white p-4 text-center"><p className="text-2xl font-bold text-black">{data.deliverables.length}</p><p className="text-xs text-black/60">Deliverables</p></div>
                <div className="rounded-xl border-2 border-black bg-white p-4 text-center"><p className="text-2xl font-bold text-black">{data.niches.length}</p><p className="text-xs text-black/60">Niches</p></div>
                <div className="rounded-xl border-2 border-black bg-white p-4 text-center"><p className="text-2xl font-bold text-black">{[data.instagramHandle, data.tiktokHandle, data.youtubeHandle, data.twitterHandle].filter(Boolean).length}</p><p className="text-xs text-black/60">Platforms</p></div>
              </div>
              <div className="rounded-xl border-2 border-black bg-[#FFD84A]/20 p-4">
                <h4 className="mb-3 text-sm font-bold text-black">What happens next?</h4>
                <div className="space-y-2">
                  {[{ emoji: "✅", text: "Your profile goes live in the creator directory" }, { emoji: "📬", text: "Hosts can discover and send you offers" }, { emoji: "💬", text: "You'll get notified when you receive messages" }, { emoji: "🏡", text: "Accept offers and book amazing stays!" }].map((item, i) => <div key={i} className="flex items-center gap-3"><span className="text-lg">{item.emoji}</span><span className="text-sm text-black">{item.text}</span></div>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <div className="mt-6 rounded-lg border-2 border-red-500 bg-red-50 p-3"><p className="text-sm font-medium text-red-600">{error}</p></div>}

        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? <button onClick={prevStep} className="rounded-full border-2 border-black bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5">← Back</button> : <div />}
          {step < totalSteps ? (
            <button onClick={nextStep} className="rounded-full border-2 border-black bg-black px-8 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">Continue →</button>
          ) : (
            <button onClick={handleComplete} disabled={saving} className="rounded-full border-2 border-black bg-[#D7B6FF] px-8 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50">{saving ? "Launching..." : "Launch My Profile 🚀"}</button>
          )}
        </div>
      </main>
    </div>
  )
}
