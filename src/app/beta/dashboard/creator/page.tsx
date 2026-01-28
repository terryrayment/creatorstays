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

function NoAccessMessage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border-[3px] border-black bg-[#FFD84A] p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-white">
            <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-black text-black">Creator Access Required</h2>
          <p className="mt-2 text-sm text-black/70">
            CreatorStays is currently in private beta. You need an invite to access the creator dashboard.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/waitlist"
              className="block rounded-full border-[3px] border-black bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Join the Creator Waitlist
            </Link>
            <Link
              href="/"
              className="block text-sm font-medium text-black/60 hover:text-black"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreatorDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    async function checkProfile() {
      // Wait for session to load
      if (status === "loading") return
      
      // Not authenticated - show no access message
      if (status === "unauthenticated") {
        setLoading(false)
        setHasAccess(false)
        return
      }
      
      try {
        const res = await fetch("/api/creator/profile")
        if (res.status === 404) {
          // No creator profile - they need an invite
          setHasAccess(false)
          setLoading(false)
          return
        }
        if (res.ok) {
          const profile = await res.json()
          
          // Check if onboarding is complete
          if (!profile.onboardingComplete) {
            router.push("/onboarding/creator")
            return
          }
          
          // Has valid profile - grant access
          setHasAccess(true)
          
          // Check for welcome param
          const params = new URLSearchParams(window.location.search)
          if (params.get("welcome") === "true" || params.get("test") === "true") {
            setShowWelcome(true)
            window.history.replaceState({}, "", "/beta/dashboard/creator")
          }
        } else {
          setHasAccess(false)
        }
      } catch (e) {
        console.error("Failed to check profile:", e)
        setHasAccess(false)
      }
      setLoading(false)
    }
    
    checkProfile()
  }, [status, router])

  // Loading state
  if (status === "loading" || loading) {
    return <DashboardLoading />
  }
  
  // No access - show message with waitlist link
  if (!hasAccess) {
    return <NoAccessMessage />
  }

  return (
    <div className="dashboard">
      {/* Welcome Modal - Beta appropriate copy */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-[#28D17C]">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl tracking-tight text-black">Your profile is ready</h2>
            <p className="mt-2 text-sm text-black/70">
              You're set up for the CreatorStays beta. When hosts invite you to collaborate, you'll see offers here.
            </p>
            <p className="mt-3 text-xs text-black/50">
              Creator discovery is rolling out in phases during beta.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full rounded-full border-[3px] border-black bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Go to Dashboard
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
