"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SettingsRedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    async function determineSettingsPage() {
      if (status === "loading") return
      
      if (!session) {
        router.push("/login")
        return
      }

      // Check if user has a host profile
      try {
        const hostRes = await fetch("/api/host/profile")
        if (hostRes.ok) {
          router.push("/dashboard/host/settings")
          return
        }
      } catch (e) {
        // Not a host
      }

      // Check if user has a creator profile
      try {
        const creatorRes = await fetch("/api/creator/profile")
        if (creatorRes.ok) {
          router.push("/dashboard/creator/settings")
          return
        }
      } catch (e) {
        // Not a creator
      }

      // Default to host settings (most common)
      router.push("/dashboard/host/settings")
    }

    determineSettingsPage()
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-black border-t-transparent" />
        <p className="mt-4 text-sm text-black/60">Redirecting to settings...</p>
      </div>
    </div>
  )
}
