"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CreatorDashboardProfile } from "@/components/creators/creator-dashboard-profile"
import { ActionRequiredBanner } from "@/components/dashboard/action-required-banner"

function DashboardLoading() {
  return (
    <div className="dashboard min-h-screen bg-[hsl(210,20%,98%)] flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        <p className="mt-2 text-sm text-black/60">Loading dashboard...</p>
      </div>
    </div>
  )
}

function BetaHeader() {
  return (
    <div className="border-b-2 border-black bg-white">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded border border-black bg-[#D7B6FF] px-2 py-0.5 text-[10px] font-bold text-black">BETA</span>
          <span className="text-sm font-bold text-black">Creator Dashboard</span>
        </div>
        <Link 
          href="/" 
          className="rounded-full border-2 border-black bg-[#D7B6FF] px-4 py-1.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
        >
          ← Back to site
        </Link>
      </div>
    </div>
  )
}

export default function BetaCreatorDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    async function checkProfile() {
      if (status !== "authenticated") return
      
      try {
        const res = await fetch("/api/creator/profile")
        if (res.status === 404) {
          // No profile, redirect to onboarding
          router.push("/onboarding/creator")
          return
        }
        if (res.ok) {
          const profile = await res.json()
          
          // Check if onboarding is complete
          if (!profile.onboardingComplete) {
            router.push("/onboarding/creator")
            return
          }
          
          // Check for welcome param
          const params = new URLSearchParams(window.location.search)
          if (params.get("welcome") === "true") {
            setShowWelcome(true)
            window.history.replaceState({}, "", "/beta/dashboard/creator")
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
    return <DashboardLoading />
  }

  return (
    <div className="dashboard">
      {/* Beta Header */}
      <BetaHeader />
      
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-[#D7B6FF]">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl tracking-tight text-black">Your profile is live!</h2>
            <p className="mt-2 text-sm text-black/60">
              Hosts can now discover you and send collaboration offers.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/creators"
                className="block rounded-full border-2 border-black bg-[#D7B6FF] px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                See Your Public Profile →
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
      
      <ActionRequiredBanner />
      <Suspense fallback={<DashboardLoading />}>
        <CreatorDashboardProfile />
      </Suspense>
    </div>
  )
}
