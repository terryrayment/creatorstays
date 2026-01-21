"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Container } from "@/components/layout/container"
import { AnalyticsDashboard } from "@/components/shared/analytics-dashboard"
import Link from "next/link"

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [viewAs, setViewAs] = useState<'host' | 'creator'>('host')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function detectRole() {
      if (status !== "authenticated") return
      
      try {
        const [hostRes, creatorRes] = await Promise.all([
          fetch("/api/host/profile"),
          fetch("/api/creator/profile"),
        ])

        if (hostRes.ok) {
          const hostData = await hostRes.json()
          if (hostData.id) {
            setViewAs("host")
            setLoading(false)
            return
          }
        }
        
        if (creatorRes.ok) {
          const creatorData = await creatorRes.json()
          if (creatorData.id) {
            setViewAs("creator")
          }
        }
      } catch (e) {
        console.error("Failed to detect role:", e)
      }
      setLoading(false)
    }

    detectRole()
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-sm text-black/60">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full border-2 border-black bg-[#4AA3FF] px-2 py-0.5 text-[10px] font-bold text-black">ANALYTICS</span>
            <span className="text-xs text-black/60">Track click performance</span>
          </div>
          <Link 
            href={viewAs === "host" ? "/dashboard/host" : "/dashboard/creator"} 
            className="text-xs font-medium text-black/60 hover:text-black"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <Container className="py-8 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-black">Link Analytics</h1>
          <p className="mt-1 text-sm text-black/60">
            Track clicks and visitor activity across all your collaborations.
          </p>
        </div>

        <AnalyticsDashboard viewAs={viewAs} />
      </Container>
    </div>
  )
}
