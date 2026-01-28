"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
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

// Error messages for OAuth errors
const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  'not_configured': {
    title: 'Not Configured',
    message: "This connection isn't set up yet. We're finishing the integration. Try again soon.",
  },
  'access_denied': {
    title: 'Access Denied',
    message: 'You declined the connection request. You can try again anytime.',
  },
  'oauth_failed': {
    title: 'Connection Failed',
    message: 'We couldn\'t connect your account. Please try again later.',
  },
}

function OAuthErrorBanner({ error, platform, onDismiss }: { error: string; platform: 'instagram' | 'tiktok'; onDismiss: () => void }) {
  const errorInfo = ERROR_MESSAGES[error] || {
    title: 'Connection Error',
    message: 'Something went wrong. Please try again.',
  }
  
  const platformName = platform === 'instagram' ? 'Instagram' : 'TikTok'

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4">
      <div className="rounded-xl border-[3px] border-black bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-black">{platformName}: {errorInfo.title}</p>
            <p className="mt-0.5 text-xs text-black/70">{errorInfo.message}</p>
          </div>
          <button onClick={onDismiss} className="shrink-0 rounded-lg p-1 text-black/40 hover:text-black">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [oauthError, setOauthError] = useState<{ platform: 'instagram' | 'tiktok'; error: string } | null>(null)

  useEffect(() => {
    const igError = searchParams.get('ig_error')
    const ttError = searchParams.get('tt_error')
    const genericError = searchParams.get('error')

    if (igError) {
      setOauthError({ platform: 'instagram', error: igError })
    } else if (ttError) {
      setOauthError({ platform: 'tiktok', error: ttError })
    } else if (genericError) {
      setOauthError({ platform: 'instagram', error: genericError })
    }

    if (igError || ttError || genericError) {
      window.history.replaceState({}, '', '/dashboard/creator')
    }
  }, [searchParams])

  useEffect(() => {
    async function checkProfile() {
      if (status === "loading") return
      
      if (status === "unauthenticated") {
        setLoading(false)
        setHasAccess(false)
        return
      }
      
      try {
        const res = await fetch("/api/creator/profile")
        if (res.status === 404) {
          setHasAccess(false)
          setLoading(false)
          return
        }
        if (res.ok) {
          const profile = await res.json()
          
          if (!profile.onboardingComplete) {
            router.push("/onboarding/creator")
            return
          }
          
          setHasAccess(true)
          
          const welcome = searchParams.get("welcome")
          if (welcome === "true") {
            setShowWelcome(true)
            window.history.replaceState({}, "", "/dashboard/creator")
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
  }, [status, router, searchParams])

  if (status === "loading" || loading) {
    return <DashboardLoading />
  }
  
  if (!hasAccess) {
    return <NoAccessMessage />
  }

  return (
    <div className="dashboard">
      {oauthError && (
        <OAuthErrorBanner
          error={oauthError.error}
          platform={oauthError.platform}
          onDismiss={() => setOauthError(null)}
        />
      )}

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
      <CreatorDashboardProfile />
    </div>
  )
}

export default function CreatorDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
