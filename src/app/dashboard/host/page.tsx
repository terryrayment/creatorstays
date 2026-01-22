"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HostDashboard } from "@/components/hosts/host-dashboard"
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
            href="/dashboard/host/onboarding"
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
            href="/dashboard/host/properties"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Add / Manage Properties
          </Link>
          <Link 
            href="/dashboard/host/search-creators"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Find Creators
          </Link>
          <Link 
            href="/dashboard/host/offers"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Sent Offers
          </Link>
          <Link 
            href="/dashboard/messages"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Messages
          </Link>
          <Link 
            href="/dashboard/collaborations"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            Collaborations
          </Link>
          <Link 
            href="/dashboard/analytics"
            className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
          >
             Analytics
          </Link>
          {isAgency && (
            <Link 
              href="/dashboard/host/team"
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
    <div className="border-b-2 border-black bg-white">
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
          { label: "Save 1 property", done: hasPublishedProperty, href: "/dashboard/host/properties" },
          { label: "Invite 1 creator", done: hasInvitedCreator, href: "/dashboard/host/search-creators" },
          { label: "Create 1 tracked link", done: hasTrackedLink, href: "/dashboard/host/collaborations" },
          { label: "Pay 1 creator", done: hasPaidCreator, href: "/dashboard/host/pay" },
        ])
      } catch (error) {
        console.error("Error fetching checklist data:", error)
        setChecklist([
          { label: "Save 1 property", done: false, href: "/dashboard/host/properties" },
          { label: "Invite 1 creator", done: false, href: "/dashboard/host/search-creators" },
          { label: "Create 1 tracked link", done: false, href: "/dashboard/host/collaborations" },
          { label: "Pay 1 creator", done: false, href: "/dashboard/host/pay" },
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

export default function HostDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showAgencyWelcome, setShowAgencyWelcome] = useState(false)
  const [isAgency, setIsAgency] = useState(false)

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
            router.push("/dashboard/host/welcome")
            return
          }
          
          // No properties yet, show banner
          if (!profile.properties || profile.properties.length === 0) {
            setShowOnboardingBanner(true)
          }
          
          // Check URL params
          
          // Check for welcome param (just completed onboarding)
          if (params.get("welcome") === "true") {
            setShowWelcome(true)
            window.history.replaceState({}, "", "/dashboard/host")
          }
          
          // Check for team welcome (just joined a team)
          if (params.get("welcome") === "team") {
            setShowWelcome(true)
            window.history.replaceState({}, "", "/dashboard/host")
          }
          
          // Check for agency success (just upgraded to agency)
          if (params.get("agency") === "success") {
            setShowAgencyWelcome(true)
            localStorage.setItem('creatorstays_agency', 'true')
            setIsAgency(true)
            window.history.replaceState({}, "", "/dashboard/host")
          }
          
          // Check for agency param (for testing)
          if (params.get("agency") === "true") {
            localStorage.setItem('creatorstays_agency', 'true')
            setIsAgency(true)
            window.history.replaceState({}, "", "/dashboard/host")
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
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-8 text-center">
            <span className="mb-4 inline-block text-6xl"></span>
            <h2 className="font-heading text-2xl tracking-tight text-black">Welcome to CreatorStays!</h2>
            <p className="mt-2 text-sm text-black/60">
              Your profile is live and your property is ready to attract creators.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/dashboard/host/search-creators"
                className="block rounded-full border-2 border-black bg-[#28D17C] px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                Browse Creators →
              </Link>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-sm font-medium text-black/60 hover:text-black"
              >
                Explore my dashboard
              </button>
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
                href="/dashboard/host/team"
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
      <HostDashboard />
    </div>
  )
}
