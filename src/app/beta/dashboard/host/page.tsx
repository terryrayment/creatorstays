"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HostDashboard } from "@/components/hosts/host-dashboard"
import { BetaHostDashboard } from "@/components/hosts/beta-host-dashboard"
import { HostDashboardStats } from "@/components/dashboard/dashboard-stats"
import { ActionRequiredBanner } from "@/components/dashboard/action-required-banner"

function OnboardingBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="border-b-2 border-black bg-[#4AA3FF]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-xl"></span>
          <div>
            <p className="text-sm font-bold text-black">Complete your setup to start finding creators!</p>
            <p className="text-xs text-black/70">Add your first property to get started</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/beta/dashboard/host/onboarding"
            className="rounded-full border-2 border-black bg-black px-4 py-1.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Complete Setup →
          </Link>
          <button
            onClick={onDismiss}
            className="p-1 text-black/60 hover:text-black"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function NextStepStrip({ isAgency }: { isAgency?: boolean }) {
  return (
    <div className="border-b-2 border-black bg-[#FFD84A]">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap gap-2">
          <Link 
            href="/beta/dashboard/host/properties"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            My Properties
          </Link>
          <Link 
            href="/beta/dashboard/collaborations"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Collaborations
            <span className="ml-1 text-[8px] uppercase opacity-60">(Preview)</span>
          </Link>
          <Link 
            href="/beta/dashboard/host/analytics"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Analytics
            <span className="ml-1 text-[8px] uppercase opacity-60">(Preview)</span>
          </Link>
          <Link 
            href="/beta/dashboard/host/search-creators"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Find Creators
            <span className="ml-1 text-[8px] uppercase opacity-60">(Preview)</span>
          </Link>
          <Link 
            href="/beta/dashboard/host/settings"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Settings
          </Link>
          {isAgency && (
            <Link 
              href="/beta/dashboard/host/team"
              className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              Manage Team
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function BetaHeader({ isAgency }: { isAgency?: boolean }) {
  return (
    <div className="bg-white">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded border border-black bg-[#FFD84A] px-2 py-0.5 text-[10px] font-bold text-black">BETA</span>
          <span className="text-sm font-bold text-black">Host Dashboard</span>
          {isAgency && (
            <span className="rounded-full border-2 border-black bg-[#28D17C] px-2.5 py-0.5 text-[10px] font-bold text-black">AGENCY</span>
          )}
        </div>
        <Link 
          href="/" 
          className="rounded-full border-2 border-black bg-[#FFD84A] px-4 py-1.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
        >
          ← Back to site
        </Link>
      </div>
    </div>
  )
}

function StatsSection() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
      <HostDashboardStats />
    </div>
  )
}

function SetupChecklist() {
  const [checklist, setChecklist] = useState<Array<{ label: string; done: boolean; href: string }> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChecklistData() {
      try {
        // Fetch properties count
        const propsRes = await fetch("/api/properties")
        const propsJson = await propsRes.json()
        const propsData = propsJson.properties || propsJson || []
        const hasPublishedProperty = Array.isArray(propsData) && propsData.some((p: any) => !p.isDraft)

        // Fetch offers sent count
        const offersRes = await fetch("/api/offers/sent")
        const offersData = await offersRes.json()
        const hasInvitedCreator = Array.isArray(offersData) && offersData.length > 0

        // Fetch collaborations (for tracked links and payments)
        const collabsRes = await fetch("/api/collaborations/list?role=host")
        const collabsData = await collabsRes.json()
        const collabsList = Array.isArray(collabsData) ? collabsData : []
        const hasTrackedLink = collabsList.some((c: any) => c.status !== "pending" && c.status !== "declined")
        const hasPaidCreator = collabsList.some((c: any) => c.status === "completed" || c.hostPaidAt)

        setChecklist([
          { label: "Save 1 property", done: hasPublishedProperty, href: "/beta/dashboard/host/properties" },
          { label: "Invite 1 creator", done: hasInvitedCreator, href: "/beta/dashboard/host/search-creators" },
          { label: "Create 1 tracked link", done: hasTrackedLink, href: "/beta/dashboard/host/collaborations" },
          { label: "Pay 1 creator", done: hasPaidCreator, href: "/beta/dashboard/host/pay" },
        ])
      } catch (error) {
        console.error("Error fetching checklist data:", error)
        setChecklist([
          { label: "Save 1 property", done: false, href: "/beta/dashboard/host/properties" },
          { label: "Invite 1 creator", done: false, href: "/beta/dashboard/host/search-creators" },
          { label: "Create 1 tracked link", done: false, href: "/beta/dashboard/host/collaborations" },
          { label: "Pay 1 creator", done: false, href: "/beta/dashboard/host/pay" },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchChecklistData()
  }, [])

  if (loading || !checklist) {
    return null // Don't show while loading
  }

  const completedCount = checklist.filter(c => c.done).length

  // Hide checklist when all items are complete
  if (completedCount === checklist.length) {
    return null
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
      <div className="rounded-xl border-2 border-black bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black">Setup Checklist</h3>
          <span className="rounded-full border-2 border-black bg-[#28D17C] px-2 py-0.5 text-[10px] font-bold text-black">
            {completedCount}/{checklist.length}
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {checklist.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-2 rounded-lg border-2 border-black p-3 transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: item.done ? '#28D17C' : '#ffffff' }}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-black text-[10px] font-bold ${
                item.done ? "bg-black text-white" : "bg-white text-black"
              }`}>
                {item.done ? "✓" : i + 1}
              </span>
              <span className="text-xs font-bold text-black">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReferralSection() {
  const { data: session } = useSession()
  const [referralLink, setReferralLink] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    // Generate a referral code based on user ID
    if (session?.user?.id) {
      const code = btoa(session.user.id).slice(0, 8).toUpperCase()
      setReferralLink(`https://creatorstays.com/join/ref/${code}`)
    }
  }, [session])

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) return
    setSending(true)
    // Simulate sending invite (in production, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSending(false)
    setSent(true)
    setInviteEmail("")
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
      <div className="rounded-xl border-2 border-black bg-white overflow-hidden">
        {/* Collapsed view */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD84A] border-2 border-black">
              <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-black">Know another host? Share the love!</p>
              <p className="text-xs text-black">Both get priority creator matching when they join</p>
            </div>
          </div>
          <svg 
            className={`h-5 w-5 text-black transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-4 pt-0 border-t border-black">
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              {/* Share Link */}
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-black">
                  Your referral link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 h-10 rounded-lg border-2 border-black bg-white px-3 text-xs font-bold text-black selection:bg-[#FFD84A]"
                  />
                  <button
                    onClick={copyLink}
                    className={`h-10 rounded-lg border-2 border-black px-4 text-xs font-bold transition-all ${
                      copied 
                        ? 'bg-[#28D17C] text-black' 
                        : 'bg-black text-white hover:bg-black/80'
                    }`}
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Invite by Email */}
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-black">
                  Or invite by email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@email.com"
                    className="flex-1 h-10 rounded-lg border-2 border-black bg-white px-3 text-xs font-medium text-black placeholder:text-black/40"
                  />
                  <button
                    onClick={sendInvite}
                    disabled={sending || !inviteEmail}
                    className={`h-10 rounded-lg border-2 border-black px-4 text-xs font-bold transition-all disabled:opacity-50 ${
                      sent 
                        ? 'bg-[#28D17C] text-black' 
                        : 'bg-[#FFD84A] text-black hover:bg-[#FFD84A]/80'
                    }`}
                  >
                    {sending ? '...' : sent ? '✓ Sent!' : 'Invite'}
                  </button>
                </div>
              </div>
            </div>

            {/* Incentive info */}
            <div className="mt-3 flex items-center gap-2 rounded-lg border-2 border-black bg-white p-2">
              <svg className="h-4 w-4 text-black shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <p className="text-[11px] text-black">
                <span className="font-bold">You both get priority creator matching</span> when they add their first property.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HostDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showAgencyWelcome, setShowAgencyWelcome] = useState(false)
  const [isAgency, setIsAgency] = useState(false)
  const [showBetaWelcome, setShowBetaWelcome] = useState(false)

  useEffect(() => {
    async function checkProfile() {
      if (status !== "authenticated") return
      
      try {
        const res = await fetch("/api/host/profile")
        if (res.status === 404) {
          // No profile, redirect to onboarding
          router.push("/onboarding/host")
          return
        }
        if (res.ok) {
          const profile = await res.json()
          
          // Check if agency from profile (database is source of truth)
          // Also check localStorage for testing
          const isAgencyFromStorage = localStorage.getItem('creatorstays_agency') === 'true'
          const isAgencyUser = profile.isAgency || isAgencyFromStorage
          setIsAgency(isAgencyUser)
          
          // If database says they're an agency, also set localStorage for consistency
          if (profile.isAgency) {
            localStorage.setItem('creatorstays_agency', 'true')
          }
          
          // Check if onboarding is complete AND membership is paid
          if (!profile.onboardingComplete || !profile.membershipPaid) {
            router.push("/onboarding/host")
            return
          }
          
          // Check if this is a new host who hasn't seen the welcome guide
          const hasSeenWelcomeGuide = localStorage.getItem('hostOnboardingComplete') === 'true'
          const params = new URLSearchParams(window.location.search)
          const justCompletedOnboarding = params.get("welcome") === "true"
          
          // If just completed payment onboarding and haven't seen the guide, redirect to welcome
          if (justCompletedOnboarding && !hasSeenWelcomeGuide) {
            router.push("/beta/dashboard/host/welcome")
            return
          }
          
          // No properties yet, show banner
          if (!profile.properties || profile.properties.length === 0) {
            setShowOnboardingBanner(true)
          }
          
          // Check URL params
          
          // Check for welcome param (just completed onboarding)
          if (params.get("welcome") === "true") {
            // Check if they've seen the beta welcome before
            const hasSeenBetaWelcome = localStorage.getItem('hasSeenBetaWelcome') === 'true'
            if (!hasSeenBetaWelcome) {
              setShowWelcome(true)
              localStorage.setItem('hasSeenBetaWelcome', 'true')
            }
            window.history.replaceState({}, "", "/beta/dashboard/host")
          }
          
          // Check for team welcome (just joined a team)
          if (params.get("welcome") === "team") {
            setShowWelcome(true)
            window.history.replaceState({}, "", "/beta/dashboard/host")
          }
          
          // Check for agency success (just upgraded to agency)
          if (params.get("agency") === "success") {
            setShowAgencyWelcome(true)
            localStorage.setItem('creatorstays_agency', 'true')
            setIsAgency(true)
            window.history.replaceState({}, "", "/beta/dashboard/host")
          }
          
          // Check for agency param (for testing)
          if (params.get("agency") === "true") {
            localStorage.setItem('creatorstays_agency', 'true')
            setIsAgency(true)
            window.history.replaceState({}, "", "/beta/dashboard/host")
          }
        }
      } catch (e) {
        console.error("Failed to check profile:", e)
      }
      setLoading(false)
    }
    
    checkProfile()
  }, [status, router])

  if (status === "loading" || loading) {
    return (
      <div className="dashboard min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-sm text-black/60">Loading...</p>
      </div>
    )
  }

  return (
    <div className="dashboard min-h-screen bg-[#FAFAFA]">
      {/* Beta Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border-4 border-black bg-white p-6 sm:p-8 my-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-[#FFD84A] px-4 py-1 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider">Beta Access</span>
              </div>
              <h2 className="font-heading text-2xl tracking-tight text-black">Welcome to CreatorStays!</h2>
              <p className="mt-2 text-sm text-black/60">
                You&apos;re one of our first hosts. Here&apos;s what that means.
              </p>
            </div>

            {/* What's working now */}
            <div className="rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4 mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#28D17C] mb-2">✓ What you can do now</p>
              <ul className="space-y-1.5 text-sm text-black">
                <li className="flex items-start gap-2">
                  <span className="text-[#28D17C] mt-0.5">•</span>
                  <span>Add your properties with photos & details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#28D17C] mt-0.5">•</span>
                  <span>Set up your host profile & preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#28D17C] mt-0.5">•</span>
                  <span>Define what kind of creators you want to work with</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#28D17C] mt-0.5">•</span>
                  <span>Preview how the platform works</span>
                </li>
              </ul>
            </div>

            {/* What's coming */}
            <div className="rounded-xl border-2 border-[#4AA3FF] bg-[#4AA3FF]/10 p-4 mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#4AA3FF] mb-2">🚀 Coming soon</p>
              <ul className="space-y-1.5 text-sm text-black">
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA3FF] mt-0.5">•</span>
                  <span>Real creator profiles you can browse & contact</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA3FF] mt-0.5">•</span>
                  <span>Smart matching based on your property & preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#4AA3FF] mt-0.5">•</span>
                  <span>Secure payments & agreements</span>
                </li>
              </ul>
            </div>

            {/* What we need */}
            <div className="rounded-xl border-2 border-black bg-[#FAFAFA] p-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2">🤝 How you can help</p>
              <p className="text-sm text-black/70">
                Get your property ready now. When creators join, hosts with complete profiles get matched first. Your early feedback shapes what we build.
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full rounded-full border-2 border-black bg-[#FFD84A] px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                Let&apos;s Get Started →
              </button>
              <p className="text-center text-xs text-black/40">
                Questions? Email us at hello@creatorstays.com
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agency Upgrade Success Modal */}
      {showAgencyWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-[#28D17C]">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl tracking-tight text-black">Welcome to Agency Pro!</h2>
            <p className="mt-2 text-sm text-black/60">
              Your upgrade is complete. You now have access to unlimited properties, team management, and more.
            </p>
            <div className="mt-4 rounded-xl border-2 border-black bg-[#FAFAFA] p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2">What's new:</p>
              <ul className="space-y-1 text-sm text-black">
                <li>✓ Unlimited properties</li>
                <li>✓ 5 team member seats</li>
                <li>✓ Priority creator matching</li>
                <li>✓ Advanced analytics</li>
              </ul>
            </div>
            <div className="mt-6 space-y-3">
              <Link
                href="/beta/dashboard/host/team"
                className="block rounded-full border-2 border-black bg-[#28D17C] px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                Invite Team Members →
              </Link>
              <button
                onClick={() => setShowAgencyWelcome(false)}
                className="text-sm font-medium text-black/60 hover:text-black"
              >
                Explore my dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BetaHeader isAgency={isAgency} />
      <ActionRequiredBanner />
      {showOnboardingBanner && (
        <OnboardingBanner onDismiss={() => setShowOnboardingBanner(false)} />
      )}
      <NextStepStrip isAgency={isAgency} />
      <StatsSection />
      <SetupChecklist />
      <ReferralSection />
      <BetaHostDashboard />
    </div>
  )
}
