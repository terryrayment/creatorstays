"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useDashboardPath } from "@/hooks/use-dashboard-path"

// Section wrapper
function Section({ title, children, badge }: { title: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-black bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-sm font-black uppercase tracking-wider text-black">{title}</h2>
        {badge}
      </div>
      {children}
    </div>
  )
}

// Preparation checklist item
function PrepItem({ 
  done, 
  title, 
  description, 
  href, 
  priority 
}: { 
  done: boolean
  title: string
  description: string
  href: string
  priority?: boolean
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl border-2 p-4 transition-all hover:-translate-y-0.5 ${
        done 
          ? 'border-[#28D17C] bg-[#28D17C]/10' 
          : priority 
            ? 'border-[#FFD84A] bg-[#FFD84A]/10' 
            : 'border-black bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          done 
            ? 'border-[#28D17C] bg-[#28D17C] text-white' 
            : 'border-black bg-white'
        }`}>
          {done ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="h-2 w-2 rounded-full bg-black" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${done ? 'text-black/50' : 'text-black'}`}>
            {title}
            {priority && !done && (
              <span className="ml-2 rounded-full bg-[#FFD84A] px-2 py-0.5 text-[9px] font-bold uppercase">
                Next Step
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-black/60">{description}</p>
        </div>
        {!done && (
          <span className="text-black/30">→</span>
        )}
      </div>
    </Link>
  )
}

// Coming soon feature item - using SVG icons instead of emojis
function ComingSoonItem({ iconType, title, description }: { iconType: string; title: string; description: string }) {
  const icons: Record<string, React.ReactNode> = {
    search: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    target: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
    message: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    document: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    payment: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    chart: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  }

  return (
    <div className="flex items-start gap-3 rounded-lg bg-[#FAFAFA] p-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/20 text-black/60">
        {icons[iconType] || icons.search}
      </div>
      <div>
        <p className="text-xs font-bold text-black">{title}</p>
        <p className="text-[10px] text-black/60">{description}</p>
      </div>
    </div>
  )
}

// Feedback form
function FeedbackSection() {
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!feedback.trim()) return
    setSubmitting(true)
    
    try {
      // Send feedback to API (or just log for now)
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'feedback@beta.host',
          type: 'beta_feedback',
          message: feedback 
        })
      })
      setSubmitted(true)
      setFeedback("")
    } catch (e) {
      console.error('Failed to submit feedback:', e)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-5 text-center">
        <span className="text-2xl">💚</span>
        <p className="mt-2 text-sm font-bold text-black">Thanks for your feedback!</p>
        <p className="mt-1 text-xs text-black/60">It helps us build what you actually need.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-3 text-xs font-bold text-[#28D17C] hover:underline"
        >
          Share more feedback
        </button>
      </div>
    )
  }

  return (
    <Section title="Share Your Thoughts">
      <p className="text-xs text-black/60 mb-3">
        What feature would make CreatorStays most useful for you?
      </p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="I wish CreatorStays could..."
        className="w-full rounded-lg border-2 border-black p-3 text-sm placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#FFD84A] resize-none"
        rows={3}
      />
      <button
        onClick={handleSubmit}
        disabled={!feedback.trim() || submitting}
        className="mt-3 w-full rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {submitting ? 'Sending...' : 'Send Feedback'}
      </button>
    </Section>
  )
}

export function BetaHostDashboard() {
  const { data: session } = useSession()
  const { hostPath } = useDashboardPath()
  const [prepStatus, setPrepStatus] = useState({
    hasProperty: false,
    hasProfile: false,
    hasPreferences: false,
    hasContentGoals: false,
  })
  const [loading, setLoading] = useState(true)

  // Fetch preparation status
  useEffect(() => {
    async function fetchStatus() {
      try {
        // Fetch properties
        const propsRes = await fetch('/api/properties')
        const propsData = await propsRes.json()
        const properties = propsData.properties || propsData || []
        const hasProperty = Array.isArray(properties) && properties.length > 0

        // Fetch profile
        const profileRes = await fetch('/api/host/profile')
        const profileData = await profileRes.json()
        const profile = profileData.profile || profileData
        
        // Profile complete = has displayName that's not the default "Host"
        const hasProfile = Boolean(profile?.displayName && profile.displayName !== 'Host' && profile.displayName.trim() !== '')
        
        // Preferences complete = has completed the creator preferences quiz
        const hasPreferences = Boolean(profile?.creatorPrefs?.completedAt)
        
        // Content goals complete = has completed the content goals quiz
        const hasContentGoals = Boolean(profile?.contentGoals?.completedAt)

        setPrepStatus({
          hasProperty,
          hasProfile,
          hasPreferences,
          hasContentGoals,
        })
      } catch (e) {
        console.error('Failed to fetch prep status:', e)
      }
      setLoading(false)
    }
    fetchStatus()
  }, [])

  const completedCount = Object.values(prepStatus).filter(Boolean).length
  const totalSteps = Object.keys(prepStatus).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold text-black">
            Welcome{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h1>
          <span className="rounded-full border border-[#4AA3FF] bg-[#4AA3FF]/10 px-2 py-0.5 text-[10px] font-bold text-[#4AA3FF]">
            Beta Host
          </span>
        </div>
        <p className="text-sm text-black/60">
          Get your property ready. When creators join, you&apos;ll be first in line to connect.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Prepare for Launch */}
          <Section 
            title="Prepare for Launch" 
            badge={
              <span className="rounded-full border-2 border-black bg-[#FFD84A] px-2.5 py-0.5 text-[10px] font-bold">
                {completedCount}/{totalSteps}
              </span>
            }
          >
            <p className="text-xs text-black/60 mb-4">
              Complete these steps now. Hosts with complete profiles get matched with creators first.
            </p>
            
            {loading ? (
              <div className="text-center py-8 text-sm text-black/40">Loading...</div>
            ) : (
              <div className="space-y-3">
                <PrepItem
                  done={prepStatus.hasProperty}
                  title="Add your property"
                  description="Import from Airbnb or add manually. Include great photos."
                  href={`${hostPath}/properties`}
                  priority={!prepStatus.hasProperty}
                />
                <PrepItem
                  done={prepStatus.hasProfile}
                  title="Complete your host profile"
                  description="Add your name, bio, and contact info. Creators see this when you reach out."
                  href={`${hostPath}/settings`}
                  priority={prepStatus.hasProperty && !prepStatus.hasProfile}
                />
                <PrepItem
                  done={prepStatus.hasPreferences}
                  title="Set creator preferences"
                  description="Location, niche, audience size, content style, budget — a 2-minute quiz."
                  href={`${hostPath}/preferences`}
                  priority={prepStatus.hasProfile && !prepStatus.hasPreferences}
                />
                <PrepItem
                  done={prepStatus.hasContentGoals}
                  title="Define your content goals"
                  description="What content do you want? How will you use it? What's your #1 goal?"
                  href={`${hostPath}/content-goals`}
                  priority={prepStatus.hasPreferences && !prepStatus.hasContentGoals}
                />
              </div>
            )}

            {/* All complete message */}
            {completedCount === totalSteps && (
              <div className="mt-4 rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4 text-center">
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full border-2 border-[#28D17C] bg-[#28D17C]">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-2 text-sm font-bold text-black">You&apos;re ready!</p>
                <p className="mt-1 text-xs text-black/60">
                  We&apos;ll email you at <span className="font-bold">{session?.user?.email}</span> as soon as creators are live.
                </p>
              </div>
            )}

            {/* Auto-notify callout for incomplete users too */}
            {completedCount < totalSteps && completedCount > 0 && (
              <div className="mt-4 rounded-lg border border-black/10 bg-[#4AA3FF]/5 p-3 flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0 text-[#4AA3FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-[11px] text-black/60">
                  <span className="font-medium">You&apos;ll be notified automatically</span> when creators launch — no action needed.
                </p>
              </div>
            )}
          </Section>

          {/* What to Expect */}
          <Section title="What Happens Next">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A] text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="text-sm font-bold text-black">You prepare (now)</p>
                  <p className="text-xs text-black/60">Add your property, complete your profile, set preferences</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Creators join (coming soon)</p>
                  <p className="text-xs text-black/60">We&apos;re onboarding travel & lifestyle creators now</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="text-sm font-bold text-black">You get matched</p>
                  <p className="text-xs text-black/60">We&apos;ll suggest creators based on your property & preferences</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="text-sm font-bold text-black">Send offers & collaborate</p>
                  <p className="text-xs text-black/60">Reach out, negotiate, create content, track results</p>
                </div>
              </div>
            </div>
            
            {/* Notification confirmation */}
            <div className="mt-5 rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#28D17C]">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-black">You&apos;re on the list!</p>
                  <p className="text-xs text-black/60">We&apos;ll email you at <span className="font-medium">{session?.user?.email}</span> when creators are ready.</p>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Coming Soon */}
          <Section title="Coming Soon">
            <div className="space-y-2">
              <ComingSoonItem
                iconType="search"
                title="Creator Discovery"
                description="Browse real creator profiles with verified stats"
              />
              <ComingSoonItem
                iconType="target"
                title="Smart Matching"
                description="Get creator recommendations based on your property"
              />
              <ComingSoonItem
                iconType="message"
                title="Direct Messaging"
                description="Chat with creators before sending offers"
              />
              <ComingSoonItem
                iconType="document"
                title="Easy Agreements"
                description="One-click contracts and deliverable tracking"
              />
              <ComingSoonItem
                iconType="payment"
                title="Secure Payments"
                description="Pay creators safely through the platform"
              />
              <ComingSoonItem
                iconType="chart"
                title="Performance Analytics"
                description="Track clicks and engagement from creator content"
              />
            </div>
          </Section>

          {/* Quick Links */}
          <Section title="Quick Links">
            <div className="space-y-1.5">
              <Link href={`${hostPath}/properties`} className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:-translate-y-0.5">
                My Properties
                <span className="text-black/40">→</span>
              </Link>
              <Link href={`${hostPath}/settings`} className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:-translate-y-0.5">
                Settings
                <span className="text-black/40">→</span>
              </Link>
              <Link href="/how-to/hosts" className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:-translate-y-0.5">
                Host Guide
                <span className="text-black/40">→</span>
              </Link>
              <Link href="/help" className="flex items-center justify-between rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-bold text-black transition-all hover:-translate-y-0.5">
                Help Center
                <span className="text-black/40">→</span>
              </Link>
            </div>
          </Section>

          {/* Feedback */}
          <FeedbackSection />

          {/* Contact */}
          <div className="rounded-xl border-2 border-dashed border-black/20 bg-[#FAFAFA] p-4 text-center">
            <p className="text-xs text-black/60">Questions about the beta?</p>
            <a 
              href="mailto:hello@creatorstays.com" 
              className="mt-1 inline-block text-sm font-bold text-black hover:underline"
            >
              hello@creatorstays.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
