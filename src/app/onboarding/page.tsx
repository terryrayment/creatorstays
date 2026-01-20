"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<"host" | "creator" | null>(null)

  // Redirect if already has a profile
  useEffect(() => {
    if (status === "authenticated" && session?.user?.hasProfile) {
      if (session.user.role === "host") {
        router.push("/dashboard/host")
      } else if (session.user.role === "creator") {
        router.push("/dashboard/creator")
      }
    }
  }, [session, status, router])

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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
          router.push("/dashboard/host/onboarding")
        } else {
          // Fallback to settings page
          router.push("/dashboard/host/settings?setup=true")
        }
      } catch (error) {
        console.error("Failed to create host profile:", error)
        router.push("/dashboard/host/settings?setup=true")
      }
    } else {
      // For creators, they need an invite or to join waitlist
      router.push("/waitlist?from=onboarding")
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
            className="block-hover rounded-2xl border-[3px] border-black bg-[#D7B6FF] p-6 text-left transition-transform duration-200 hover:-translate-y-1 disabled:opacity-50"
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
              {loading === "creator" ? "Checking..." : "Join waitlist →"}
            </div>
          </button>

        </div>

        {/* Info */}
        <div className="mt-4 rounded-xl border-[3px] border-black bg-white p-4 text-center">
          <p className="text-[12px] font-medium text-black">
            <strong>Hosts</strong> can start immediately. <strong>Creators</strong> are onboarded from the waitlist.
          </p>
        </div>

      </div>
    </div>
  )
}
