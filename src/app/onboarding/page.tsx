"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"

function OnboardingContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get("role")
  const isBeta = searchParams.get("beta") === "true"
  
  const [loading, setLoading] = useState<"host" | "creator" | null>(null)
  const [creatorForm, setCreatorForm] = useState({
    handle: "",
    instagramHandle: "",
    tiktokHandle: "",
  })
  const [showCreatorForm, setShowCreatorForm] = useState(false)
  const [creatorError, setCreatorError] = useState("")

  // Redirect if already has a profile
  useEffect(() => {
    if (status === "authenticated" && session?.user?.hasProfile) {
      if (session.user.role === "host") {
        router.push("/beta/dashboard/host")
      } else if (session.user.role === "creator") {
        router.push("/beta/dashboard/creator")
      }
    }
  }, [session, status, router])

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // If coming from beta invite with Google OAuth, show creator form
  useEffect(() => {
    if (roleParam === "creator" && isBeta && status === "authenticated" && !session?.user?.hasProfile) {
      setShowCreatorForm(true)
    }
  }, [roleParam, isBeta, status, session])

  const handleSelectRole = async (role: "host" | "creator") => {
    setLoading(role)
    
    if (role === "host") {
      try {
        // Create the host profile immediately
        const res = await fetch("/api/host/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: session?.user?.name || "Host",
            contactEmail: session?.user?.email,
          }),
        })
        
        if (res.ok) {
          // Profile created, redirect to host onboarding to add property
          router.push("/beta/dashboard/host/onboarding")
        } else {
          // Fallback to settings page
          router.push("/beta/dashboard/host/settings?setup=true")
        }
      } catch (error) {
        console.error("Failed to create host profile:", error)
        router.push("/beta/dashboard/host/settings?setup=true")
      }
    } else {
      // Check if user has a beta invite stored
      const betaCode = typeof window !== 'undefined' ? localStorage.getItem("betaInviteCode") : null
      if (betaCode || isBeta) {
        // Show creator profile form
        setShowCreatorForm(true)
        setLoading(null)
      } else {
        // For creators without invite, redirect to waitlist
        router.push("/waitlist?from=onboarding")
      }
    }
  }

  const handleCreateCreatorProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("creator")
    setCreatorError("")

    // Validate
    if (!creatorForm.handle) {
      setCreatorError("Handle is required")
      setLoading(null)
      return
    }

    if (!creatorForm.instagramHandle && !creatorForm.tiktokHandle) {
      setCreatorError("Please add at least one social platform")
      setLoading(null)
      return
    }

    try {
      // Get beta code from localStorage
      const betaCode = typeof window !== 'undefined' ? localStorage.getItem("betaInviteCode") : null

      const res = await fetch("/api/creator/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: session?.user?.name || "Creator",
          handle: creatorForm.handle.toLowerCase().replace(/[^a-z0-9_]/g, ""),
          instagramHandle: creatorForm.instagramHandle,
          tiktokHandle: creatorForm.tiktokHandle,
          isBeta: true,
          inviteTokenUsed: betaCode,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Clear the beta code from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem("betaInviteCode")
        }
        // Redirect to creator dashboard
        router.push("/beta/dashboard/creator")
      } else {
        setCreatorError(data.error || "Failed to create profile")
        setLoading(null)
      }
    } catch (error) {
      console.error("Failed to create creator profile:", error)
      setCreatorError("Network error. Please try again.")
      setLoading(null)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black px-3 py-20 lg:px-4">
        <div className="mx-auto max-w-md text-center">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  const inputClass = "h-11 w-full rounded-lg border-[2px] border-black bg-white px-4 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  // Show creator profile form for beta users
  if (showCreatorForm) {
    return (
      <div className="min-h-screen bg-black px-3 py-20 lg:px-4">
        <div className="mx-auto max-w-md">
          {/* Beta Badge */}
          <div className="mb-4 rounded-2xl border-[3px] border-black bg-[#28D17C] p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border-[2px] border-black bg-white">
              <span className="text-lg"></span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-wider text-black">Welcome to Beta</p>
            <p className="mt-1 text-[12px] font-medium text-black">
              Complete your creator profile to get started.
            </p>
          </div>

          {/* Creator Profile Form */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-6">
            <p className="text-[9px] font-black uppercase tracking-wider text-black">Creator Profile</p>
            <h1 className="mt-1 font-heading text-[2rem] leading-[0.85] tracking-[-0.02em]" style={{ fontWeight: 900 }}>
              <span className="block text-black">COMPLETE YOUR</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>PROFILE</span>
            </h1>

            <form onSubmit={handleCreateCreatorProfile} className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">
                  Your Handle *
                </label>
                <div className="flex items-center">
                  <span className="mr-1 text-sm font-medium text-black">@</span>
                  <input
                    required
                    placeholder="yourhandle"
                    value={creatorForm.handle}
                    onChange={e => setCreatorForm({ ...creatorForm, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    className={inputClass}
                  />
                </div>
                <p className="mt-1 text-[9px] text-black/50">Letters, numbers, underscores only</p>
              </div>

              <div className="border-t-2 border-black/10 pt-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-black">
                  Social Platforms (at least one) *
                </p>
                
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-[9px] font-medium text-black/60">Instagram</label>
                    <input
                      placeholder="@yourinstagram"
                      value={creatorForm.instagramHandle}
                      onChange={e => setCreatorForm({ ...creatorForm, instagramHandle: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[9px] font-medium text-black/60">TikTok</label>
                    <input
                      placeholder="@yourtiktok"
                      value={creatorForm.tiktokHandle}
                      onChange={e => setCreatorForm({ ...creatorForm, tiktokHandle: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {creatorError && (
                <div className="rounded-lg border-2 border-red-500 bg-red-50 p-3 text-center">
                  <p className="text-[11px] font-medium text-red-600">{creatorError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading === "creator"}
                className="w-full h-11 rounded-full bg-black text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading === "creator" ? "Creating Profile..." : "Complete Profile"}
              </button>
            </form>
          </div>

          <button
            onClick={() => setShowCreatorForm(false)}
            className="mt-4 block w-full text-center text-[10px] font-medium text-white/60 hover:text-white"
          >
            ← Back to role selection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-3 py-20 lg:px-4">
      <div className="mx-auto max-w-xl">
        
        {/* Hero */}
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-wider text-black">
            Welcome to CreatorStays
          </p>
          <h1 className="mt-2 font-heading text-[2.5rem] leading-[0.85] tracking-[-0.03em] text-black" style={{ fontWeight: 900 }}>
            <span className="block">HOW WILL</span>
            <span className="block" style={{ fontWeight: 400 }}>YOU USE IT?</span>
          </h1>
          <p className="mt-3 text-[14px] font-medium text-black">
            Choose your role to get started. You can always add the other later.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          
          {/* Host Option */}
          <button
            onClick={() => handleSelectRole("host")}
            disabled={loading !== null}
            className="block-hover rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-6 text-left transition-transform duration-200 hover:-translate-y-1 disabled:opacity-50"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border-[2px] border-black bg-white">
              <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <h2 className="font-heading text-[1.5rem] leading-[0.85] text-black" style={{ fontWeight: 900 }}>
              I'M A HOST
            </h2>
            <p className="mt-2 text-[13px] font-medium text-black">
              I own vacation rentals and want creators to promote my properties.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-black">
              {loading === "host" ? "Setting up..." : "Get started →"}
            </div>
          </button>

          {/* Creator Option */}
          <button
            onClick={() => handleSelectRole("creator")}
            disabled={loading !== null}
            className="block-hover rounded-2xl border-[3px] border-black bg-[#FF7A00] p-6 text-left transition-transform duration-200 hover:-translate-y-1 disabled:opacity-50"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border-[2px] border-black bg-white">
              <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <h2 className="font-heading text-[1.5rem] leading-[0.85] text-black" style={{ fontWeight: 900 }}>
              I'M A CREATOR
            </h2>
            <p className="mt-2 text-[13px] font-medium text-black">
              I create content and want to work with vacation rental hosts.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-black">
              {loading === "creator" ? "Checking..." : "Continue →"}
            </div>
          </button>

        </div>

        {/* Info */}
        <div className="mt-4 rounded-xl border-[3px] border-black bg-white p-4 text-center">
          <p className="text-[12px] font-medium text-black">
            <strong>Hosts</strong> can start immediately. <strong>Creators</strong> need a beta invite.
          </p>
        </div>

      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black px-3 py-20 lg:px-4">
      <div className="mx-auto max-w-md text-center">
        <p className="text-white">Loading...</p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OnboardingContent />
    </Suspense>
  )
}
