"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HostDashboard } from "@/components/hosts/host-dashboard"
import { HostDashboardStats } from "@/components/dashboard/dashboard-stats"
import { ActionRequiredBanner } from "@/components/dashboard/action-required-banner"
import { HostDashboardSkeleton } from "@/components/ui/loading-skeleton"

function OnboardingBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="border-b-2 border-black bg-[#4AA3FF]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏠</span>
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

function NextStepStrip() {
  return (
    <div className="border-b-2 border-black bg-[#FFD84A]">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-black">Next Steps:</span>
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
            📊 Analytics
          </Link>
        </div>
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
  const [checklist] = useState([
    { label: "Save 1 property", done: false, href: "/dashboard/host/properties" },
    { label: "Invite 1 creator", done: false, href: "/dashboard/host/search-creators" },
    { label: "Create 1 tracked link", done: false, href: "/dashboard/host/collaborations" },
    { label: "Pay 1 creator", done: false, href: "/dashboard/host/pay" },
  ])

  const completedCount = checklist.filter(c => c.done).length

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
              className={`flex items-center gap-2 rounded-lg border-2 border-black p-3 transition-all hover:-translate-y-0.5 ${
                item.done ? "bg-[#28D17C]" : "bg-white hover:bg-black/5"
              }`}
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

  useEffect(() => {
    async function checkProfile() {
      if (status !== "authenticated") return
      
      try {
        const res = await fetch("/api/host/profile")
        if (res.status === 404) {
          // No profile, redirect to onboarding
          router.push("/dashboard/host/onboarding")
          return
        }
        if (res.ok) {
          const profile = await res.json()
          // No properties yet, show banner
          if (!profile.properties || profile.properties.length === 0) {
            setShowOnboardingBanner(true)
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
    return <HostDashboardSkeleton />
  }

  return (
    <div className="dashboard min-h-screen bg-[#FAFAFA]">
      <ActionRequiredBanner />
      {showOnboardingBanner && (
        <OnboardingBanner onDismiss={() => setShowOnboardingBanner(false)} />
      )}
      <NextStepStrip />
      <StatsSection />
      <SetupChecklist />
      <HostDashboard />
    </div>
  )
}
