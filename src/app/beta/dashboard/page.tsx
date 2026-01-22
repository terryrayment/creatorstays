"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function BetaDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    // Redirect based on role
    if (session.user?.role === "creator") {
      router.push("/beta/dashboard/creator")
    } else if (session.user?.role === "host") {
      router.push("/beta/dashboard/host")
    } else {
      // No role yet - go to onboarding
      router.push("/onboarding")
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        <p className="mt-4 text-white text-sm">Loading your dashboard...</p>
      </div>
    </div>
  )
}
