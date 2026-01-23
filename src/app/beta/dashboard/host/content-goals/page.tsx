"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Multi-select option
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
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
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

export default function ContentGoalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Goals state
  const [contentTypes, setContentTypes] = useState<string[]>([])
  const [usageRights, setUsageRights] = useState<string>("")
  const [postingGoal, setPostingGoal] = useState<string>("")
  const [primaryGoal, setPrimaryGoal] = useState<string>("")

  // Load existing goals
  useEffect(() => {
    async function loadGoals() {
      try {
        const res = await fetch('/api/host/profile')
        if (res.ok) {
          const data = await res.json()
          const profile = data.profile || data
          
          if (profile.contentGoals) {
            const goals = profile.contentGoals
            setContentTypes(goals.contentTypes || [])
            setUsageRights(goals.usageRights || "")
            setPostingGoal(goals.postingGoal || "")
            setPrimaryGoal(goals.primaryGoal || "")
          }
        }
      } catch (e) {
        console.error('Failed to load goals:', e)
      }
      setLoading(false)
    }
    if (status === 'authenticated') {
      loadGoals()
    }
  }, [status])

  const toggleContentType = (type: string) => {
    setContentTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/host/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentGoals: {
            contentTypes,
            usageRights,
            postingGoal,
            primaryGoal,
            completedAt: new Date().toISOString()
          }
        })
      })
      
      if (res.ok) {
        router.push('/beta/dashboard/host?goalsComplete=true')
      }
    } catch (e) {
      console.error('Failed to save goals:', e)
    }
    setSaving(false)
  }

  const totalSteps = 4
  const canProceed = () => {
    switch(step) {
      case 1: return contentTypes.length > 0
      case 2: return usageRights !== ""
      case 3: return postingGoal !== ""
      case 4: return primaryGoal !== ""
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
      <div className="bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <Link href="/beta/dashboard/host" className="text-xs text-black/50 hover:text-black">
              ← Back to Dashboard
            </Link>
            <h1 className="mt-1 text-lg font-bold text-black">Content Goals</h1>
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
        {/* Step 1: Content Types */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">What type of content do you want?</h2>
              <p className="mt-2 text-sm text-black/60">
                Select all that apply. Creators will know what you're looking for.
              </p>
            </div>
            <div className="space-y-3">
              <Option 
                selected={contentTypes.includes("property-tour")} 
                onClick={() => toggleContentType("property-tour")}

                description="Walkthrough video showing off your space"
              >
                Property Tour
              </Option>
              <Option 
                selected={contentTypes.includes("local-guide")} 
                onClick={() => toggleContentType("local-guide")}

                description="Nearby restaurants, attractions, hidden gems"
              >
                Local Area Guide
              </Option>
              <Option 
                selected={contentTypes.includes("day-in-life")} 
                onClick={() => toggleContentType("day-in-life")}

                description="Morning coffee to evening sunset"
              >
                Day-in-the-Life
              </Option>
              <Option 
                selected={contentTypes.includes("review")} 
                onClick={() => toggleContentType("review")}

                description="Honest review and recommendation"
              >
                Review / Testimonial
              </Option>
              <Option 
                selected={contentTypes.includes("reels-tiktok")} 
                onClick={() => toggleContentType("reels-tiktok")}

                description="Short-form vertical video (15-60 seconds)"
              >
                Reels / TikToks
              </Option>
              <Option 
                selected={contentTypes.includes("photos")} 
                onClick={() => toggleContentType("photos")}

                description="High-quality still images for your feed"
              >
                Photo Set
              </Option>
              <Option 
                selected={contentTypes.includes("stories")} 
                onClick={() => toggleContentType("stories")}

                description="Behind-the-scenes, casual content"
              >
                Instagram Stories
              </Option>
            </div>
          </div>
        )}

        {/* Step 2: Usage Rights */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">How do you want to use the content?</h2>
              <p className="mt-2 text-sm text-black/60">
                This affects pricing and what creators agree to.
              </p>
            </div>
            <div className="space-y-3">
              <Option 
                selected={usageRights === "creator-only"} 
                onClick={() => setUsageRights("creator-only")}

                description="Creator posts on their channels, tags you"
              >
                Creator's social media only
              </Option>
              <Option 
                selected={usageRights === "shared"} 
                onClick={() => setUsageRights("shared")}

                description="You can repost and share on your socials"
              >
                Shared usage (repost rights)
              </Option>
              <Option 
                selected={usageRights === "full"} 
                onClick={() => setUsageRights("full")}

                description="Website, Airbnb listing, social media"
              >
                Full usage rights (all platforms)
              </Option>
              <Option 
                selected={usageRights === "ads"} 
                onClick={() => setUsageRights("ads")}

                description="Paid advertising, boosted posts (premium)"
              >
                Advertising rights included
              </Option>
            </div>
            <p className="text-xs text-black/40">
              Tip: More rights = higher cost. Most hosts start with "Shared usage".
            </p>
          </div>
        )}

        {/* Step 3: Posting Goal */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">How often do you want creator content?</h2>
              <p className="mt-2 text-sm text-black/60">
                This helps us understand your marketing cadence.
              </p>
            </div>
            <div className="space-y-3">
              <Option 
                selected={postingGoal === "once"} 
                onClick={() => setPostingGoal("once")}
                description="Just testing the waters"
              >
                One-time collaboration
              </Option>
              <Option 
                selected={postingGoal === "quarterly"} 
                onClick={() => setPostingGoal("quarterly")}
                description="1-2 creators every few months"
              >
                A few times per year
              </Option>
              <Option 
                selected={postingGoal === "monthly"} 
                onClick={() => setPostingGoal("monthly")}
                description="Building steady awareness"
              >
                Monthly collaborations
              </Option>
              <Option 
                selected={postingGoal === "ongoing"} 
                onClick={() => setPostingGoal("ongoing")}
                description="Multiple creators, consistent presence"
              >
                Ongoing / always recruiting
              </Option>
            </div>
          </div>
        )}

        {/* Step 4: Primary Goal */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">What's your #1 goal with creator content?</h2>
              <p className="mt-2 text-sm text-black/60">
                This helps us match you with the right creators.
              </p>
            </div>
            <div className="space-y-3">
              <Option 
                selected={primaryGoal === "bookings"} 
                onClick={() => setPrimaryGoal("bookings")}

                description="Drive direct or platform bookings"
              >
                Get more bookings
              </Option>
              <Option 
                selected={primaryGoal === "awareness"} 
                onClick={() => setPrimaryGoal("awareness")}

                description="More people knowing about your property"
              >
                Build brand awareness
              </Option>
              <Option 
                selected={primaryGoal === "content-library"} 
                onClick={() => setPrimaryGoal("content-library")}

                description="Quality photos/videos for your own marketing"
              >
                Build content library
              </Option>
              <Option 
                selected={primaryGoal === "social-proof"} 
                onClick={() => setPrimaryGoal("social-proof")}

                description="Reviews and recommendations from trusted voices"
              >
                Social proof & credibility
              </Option>
              <Option 
                selected={primaryGoal === "seo"} 
                onClick={() => setPrimaryGoal("seo")}

                description="Backlinks and mentions to improve search"
              >
                Improve SEO / search visibility
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
              {saving ? 'Saving...' : 'Save Goals ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
