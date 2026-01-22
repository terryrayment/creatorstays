"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Quiz option component
function Option({ 
  selected, 
  onClick, 
  children,
  description
}: { 
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  description?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 ${
        selected 
          ? 'border-[#28D17C] bg-[#28D17C]/10' 
          : 'border-black bg-white hover:bg-[#FAFAFA]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-black">{children}</p>
          {description && <p className="mt-1 text-xs text-black/60">{description}</p>}
        </div>
        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? 'border-[#28D17C] bg-[#28D17C]' : 'border-black/30'
        }`}>
          {selected && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}

// Multi-select option
function MultiOption({ 
  selected, 
  onClick, 
  children
}: { 
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 px-4 py-3 text-left transition-all hover:-translate-y-0.5 ${
        selected 
          ? 'border-[#28D17C] bg-[#28D17C]/10' 
          : 'border-black bg-white hover:bg-[#FAFAFA]'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-black">{children}</span>
        {selected && (
          <svg className="h-4 w-4 text-[#28D17C] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  )
}

// Multi-select option with description
function MultiOptionWithDesc({ 
  selected, 
  onClick, 
  children,
  description
}: { 
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  description?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 px-4 py-4 text-left transition-all hover:-translate-y-0.5 ${
        selected 
          ? 'border-[#28D17C] bg-[#28D17C]/10' 
          : 'border-black bg-white hover:bg-[#FAFAFA]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-bold text-black">{children}</span>
          {description && <p className="mt-1 text-xs text-black/60">{description}</p>}
        </div>
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 mt-0.5 ${
          selected ? 'border-[#28D17C] bg-[#28D17C]' : 'border-black/30 bg-white'
        }`}>
          {selected && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}

export default function CreatorPreferencesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Preferences state
  const [locationPref, setLocationPref] = useState<string>("")
  const [niches, setNiches] = useState<string[]>([])
  const [audienceSize, setAudienceSize] = useState<string[]>([])
  const [contentStyle, setContentStyle] = useState<string[]>([])
  const [budgetRange, setBudgetRange] = useState<string>("")

  // Load existing preferences
  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch('/api/host/profile')
        if (res.ok) {
          const data = await res.json()
          const profile = data.profile || data
          
          // Load existing prefs if they exist
          if (profile.creatorPrefs) {
            const prefs = profile.creatorPrefs
            setLocationPref(prefs.locationPref || "")
            setNiches(prefs.niches || [])
            setAudienceSize(prefs.audienceSize || [])
            setContentStyle(prefs.contentStyle || [])
            setBudgetRange(prefs.budgetRange || "")
          }
        }
      } catch (e) {
        console.error('Failed to load preferences:', e)
      }
      setLoading(false)
    }
    if (status === 'authenticated') {
      loadPrefs()
    }
  }, [status])

  const toggleNiche = (niche: string) => {
    setNiches(prev => 
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    )
  }

  const toggleAudienceSize = (size: string) => {
    setAudienceSize(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const toggleContentStyle = (style: string) => {
    setContentStyle(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/host/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorPrefs: {
            locationPref,
            niches,
            audienceSize,
            contentStyle,
            budgetRange,
            completedAt: new Date().toISOString()
          }
        })
      })
      
      if (res.ok) {
        router.push('/dashboard/host?prefsComplete=true')
      }
    } catch (e) {
      console.error('Failed to save preferences:', e)
    }
    setSaving(false)
  }

  const totalSteps = 5
  const canProceed = () => {
    switch(step) {
      case 1: return locationPref !== ""
      case 2: return niches.length > 0
      case 3: return audienceSize.length > 0
      case 4: return contentStyle.length > 0
      case 5: return budgetRange !== ""
      default: return false
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-sm text-black/60">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <Link href="/dashboard/host" className="text-xs text-black/50 hover:text-black">
              ← Back to Dashboard
            </Link>
            <h1 className="mt-1 text-lg font-bold text-black">Creator Preferences</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-black/50">Step {step} of {totalSteps}</span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 w-6 rounded-full ${
                    i < step ? 'bg-[#28D17C]' : 'bg-black/10'
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">Where should creators be based?</h2>
              <p className="mt-2 text-sm text-black/60">
                Location matters for authentic local content and easier logistics.
              </p>
            </div>
            <div className="space-y-3">
              <Option 
                selected={locationPref === "local"} 
                onClick={() => setLocationPref("local")}
                description="Best for authentic local content, easy meetups"
              >
                Same city/region as my property
              </Option>
              <Option 
                selected={locationPref === "regional"} 
                onClick={() => setLocationPref("regional")}
                description="Good balance of local knowledge and variety"
              >
                Same state/country
              </Option>
              <Option 
                selected={locationPref === "travel"} 
                onClick={() => setLocationPref("travel")}
                description="Great for travel content, they'll visit specifically"
              >
                Willing to travel (I&apos;ll cover travel costs)
              </Option>
              <Option 
                selected={locationPref === "anywhere"} 
                onClick={() => setLocationPref("anywhere")}
                description="Maximum flexibility, focus on content quality"
              >
                Anywhere (remote content or any location)
              </Option>
            </div>
          </div>
        )}

        {/* Step 2: Niches */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">What type of creators fit your property?</h2>
              <p className="mt-2 text-sm text-black/60">
                Select all that apply. We'll match you with creators in these niches.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MultiOption selected={niches.includes("travel")} onClick={() => toggleNiche("travel")}>
                Travel
              </MultiOption>
              <MultiOption selected={niches.includes("lifestyle")} onClick={() => toggleNiche("lifestyle")}>
                Lifestyle
              </MultiOption>
              <MultiOption selected={niches.includes("luxury")} onClick={() => toggleNiche("luxury")}>
                Luxury
              </MultiOption>
              <MultiOption selected={niches.includes("family")} onClick={() => toggleNiche("family")}>
                Family
              </MultiOption>
              <MultiOption selected={niches.includes("adventure")} onClick={() => toggleNiche("adventure")}>
                Adventure
              </MultiOption>
              <MultiOption selected={niches.includes("food")} onClick={() => toggleNiche("food")}>
                Food & Dining
              </MultiOption>
              <MultiOption selected={niches.includes("wellness")} onClick={() => toggleNiche("wellness")}>
                Wellness
              </MultiOption>
              <MultiOption selected={niches.includes("photography")} onClick={() => toggleNiche("photography")}>
                Photography
              </MultiOption>
              <MultiOption selected={niches.includes("couples")} onClick={() => toggleNiche("couples")}>
                Couples
              </MultiOption>
              <MultiOption selected={niches.includes("digital-nomad")} onClick={() => toggleNiche("digital-nomad")}>
                Digital Nomad
              </MultiOption>
              <MultiOption selected={niches.includes("pet")} onClick={() => toggleNiche("pet")}>
                Pet-Friendly
              </MultiOption>
              <MultiOption selected={niches.includes("budget")} onClick={() => toggleNiche("budget")}>
                Budget Travel
              </MultiOption>
            </div>
          </div>
        )}

        {/* Step 3: Audience Size */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">What audience size works for you?</h2>
              <p className="mt-2 text-sm text-black/60">
                Select all that apply. Larger isn't always better—micro-influencers often have higher engagement.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MultiOptionWithDesc 
                selected={audienceSize.includes("micro")} 
                onClick={() => toggleAudienceSize("micro")}
                description="1K-10K followers"
              >
                Micro-creators
              </MultiOptionWithDesc>
              <MultiOptionWithDesc 
                selected={audienceSize.includes("small")} 
                onClick={() => toggleAudienceSize("small")}
                description="10K-50K followers"
              >
                Small creators
              </MultiOptionWithDesc>
              <MultiOptionWithDesc 
                selected={audienceSize.includes("medium")} 
                onClick={() => toggleAudienceSize("medium")}
                description="50K-100K followers"
              >
                Medium creators
              </MultiOptionWithDesc>
              <MultiOptionWithDesc 
                selected={audienceSize.includes("large")} 
                onClick={() => toggleAudienceSize("large")}
                description="100K+ followers"
              >
                Large creators
              </MultiOptionWithDesc>
            </div>
            <p className="text-xs text-black/40 italic">
              Tip: Most successful hosts work with a mix of micro and small creators for best ROI.
            </p>
          </div>
        )}

        {/* Step 4: Content Style */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">What content style do you prefer?</h2>
              <p className="mt-2 text-sm text-black/60">
                Select all that apply. Different styles resonate with different audiences.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MultiOptionWithDesc 
                selected={contentStyle.includes("polished")} 
                onClick={() => toggleContentStyle("polished")}
                description="Professional, edited"
              >
                Polished &amp; Editorial
              </MultiOptionWithDesc>
              <MultiOptionWithDesc 
                selected={contentStyle.includes("authentic")} 
                onClick={() => toggleContentStyle("authentic")}
                description="Real, unfiltered"
              >
                Authentic &amp; Raw
              </MultiOptionWithDesc>
              <MultiOptionWithDesc 
                selected={contentStyle.includes("cinematic")} 
                onClick={() => toggleContentStyle("cinematic")}
                description="Drone shots, storytelling"
              >
                Cinematic
              </MultiOptionWithDesc>
              <MultiOptionWithDesc 
                selected={contentStyle.includes("casual")} 
                onClick={() => toggleContentStyle("casual")}
                description="Day-in-the-life, vlogs"
              >
                Casual &amp; Everyday
              </MultiOptionWithDesc>
            </div>
          </div>
        )}

        {/* Step 5: Budget */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">What's your typical budget per collaboration?</h2>
              <p className="mt-2 text-sm text-black/60">
                This helps us match you with creators in your price range.
              </p>
            </div>
            <div className="space-y-3">
              <Option 
                selected={budgetRange === "post-for-stay"} 
                onClick={() => setBudgetRange("post-for-stay")}
                description="Free stay in exchange for content"
              >
                Post-for-Stay Only
              </Option>
              <Option 
                selected={budgetRange === "under-250"} 
                onClick={() => setBudgetRange("under-250")}
                description="+ optional free stay"
              >
                Under $250
              </Option>
              <Option 
                selected={budgetRange === "under-1000"} 
                onClick={() => setBudgetRange("under-1000")}
                description="+ optional free stay"
              >
                Under $1,000
              </Option>
              <Option 
                selected={budgetRange === "over-1000"} 
                onClick={() => setBudgetRange("over-1000")}
                description="+ optional free stay"
              >
                Over $1,000
              </Option>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="rounded-full border-2 border-black px-6 py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          
          {step < totalSteps ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="rounded-full border-2 border-black bg-[#FFD84A] px-6 py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!canProceed() || saving}
              className="rounded-full border-2 border-black bg-[#28D17C] px-6 py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving ? 'Saving...' : 'Save Preferences ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
