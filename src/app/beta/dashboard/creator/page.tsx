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
        <p className="mt-2 text-sm text-black">Loading dashboard...</p>
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
          <p className="mt-2 text-sm text-black">
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
              className="block text-sm font-medium text-black hover:text-black"
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
  // Instagram errors
  'not_configured': {
    title: 'Instagram Not Configured',
    message: "Instagram connect isn't set up yet. We're finishing the integration. Try again soon.",
  },
  'access_denied': {
    title: 'Access Denied',
    message: 'You declined the connection request. You can try again anytime.',
  },
  'token_exchange_failed': {
    title: 'Connection Failed',
    message: 'We couldn\'t complete the Instagram connection. Please try again.',
  },
  'invalid_state': {
    title: 'Session Expired',
    message: 'Your connection session expired. Please try connecting again.',
  },
  'expired_state': {
    title: 'Session Expired',
    message: 'The connection took too long. Please try again.',
  },
  'callback_failed': {
    title: 'Connection Error',
    message: 'Something went wrong during the connection. Please try again.',
  },
  // Generic errors
  'oauth_failed': {
    title: 'Connection Failed',
    message: 'We couldn\'t connect your account. Please try again later.',
  },
  'no_profile': {
    title: 'Profile Required',
    message: 'Please complete your creator profile before connecting social accounts.',
  },
}

function OAuthErrorBanner({ error, platform, onDismiss }: { error: string; platform: 'instagram' | 'tiktok'; onDismiss: () => void }) {
  const errorInfo = ERROR_MESSAGES[error] || {
    title: 'Connection Error',
    message: 'Something went wrong. Please try again.',
  }
  
  const platformName = platform === 'instagram' ? 'Instagram' : 'TikTok'
  const bgColor = platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-black'

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4">
      <div className="rounded-xl border-[3px] border-black bg-white p-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgColor}`}>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-black">{platformName}: {errorInfo.title}</p>
            <p className="mt-0.5 text-xs text-black">{errorInfo.message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 text-black hover:bg-white hover:text-black"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessBanner({ platform, onDismiss }: { platform: 'instagram' | 'tiktok'; onDismiss: () => void }) {
  const platformName = platform === 'instagram' ? 'Instagram' : 'TikTok'

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4">
      <div className="rounded-xl border-[3px] border-black bg-[#28D17C] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white">
            <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-black">{platformName} Connected</p>
            <p className="text-xs text-black">Your account is now linked and verified.</p>
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 text-black hover:bg-black hover:text-black"
          >
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
  const [oauthSuccess, setOauthSuccess] = useState<'instagram' | 'tiktok' | null>(null)

  useEffect(() => {
    // Check for OAuth errors/success in URL params
    const igError = searchParams.get('ig_error')
    const ttError = searchParams.get('tt_error')
    const igConnected = searchParams.get('ig_connected')
    const ttConnected = searchParams.get('tt_connected')
    const genericError = searchParams.get('error')

    if (igError) {
      setOauthError({ platform: 'instagram', error: igError })
    } else if (ttError) {
      setOauthError({ platform: 'tiktok', error: ttError })
    } else if (genericError) {
      setOauthError({ platform: 'instagram', error: genericError })
    }

    if (igConnected === 'true') {
      setOauthSuccess('instagram')
    } else if (ttConnected === 'true') {
      setOauthSuccess('tiktok')
    }

    // Clean up URL params after reading
    if (igError || ttError || igConnected || ttConnected || genericError) {
      window.history.replaceState({}, '', '/beta/dashboard/creator')
    }
  }, [searchParams])

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
          const welcome = searchParams.get("welcome")
          const test = searchParams.get("test")
          if (welcome === "true" || test === "true") {
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
  }, [status, router, searchParams])

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
      {/* OAuth Error Banner */}
      {oauthError && (
        <OAuthErrorBanner
          error={oauthError.error}
          platform={oauthError.platform}
          onDismiss={() => setOauthError(null)}
        />
      )}

      {/* OAuth Success Banner */}
      {oauthSuccess && (
        <SuccessBanner
          platform={oauthSuccess}
          onDismiss={() => setOauthSuccess(null)}
        />
      )}

      {/* Welcome Modal - Beta appropriate copy */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white0 p-4">
          <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-[#28D17C]">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl tracking-tight text-black">You're approved for beta!</h2>
            <p className="mt-2 text-sm text-black">
              Your profile is visible to beta hosts. When they want to collaborate, you'll receive offers here.
            </p>
            <div className="mt-4 rounded-lg border border-black bg-white p-3">
              <p className="text-xs text-black">
                <strong>What's next:</strong> Hosts can browse your profile and send collaboration offers. You'll be notified by email when you receive one.
              </p>
            </div>
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
