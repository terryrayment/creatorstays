"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useDashboardPath } from "@/hooks/use-dashboard-path"

interface HostStats {
  offersSent: number
  offersPending: number
  offersAccepted: number
  offersDeclined: number
  activeCollabs: number
  completedCollabs: number
  totalCollabs: number
  totalClicks: number
  totalSpentCents: number
  propertiesCount: number
}

interface CreatorStats {
  offersReceived: number
  offersPending: number
  offersAccepted: number
  activeCollabs: number
  completedCollabs: number
  totalCollabs: number
  totalClicks: number
  totalEarnedCents: number
  pendingPaymentCents: number
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  subValue,
  color = "white",
  href,
  icon,
}: { 
  label: string
  value: string | number
  subValue?: string
  color?: "white" | "yellow" | "green" | "blue" | "purple"
  href?: string
  icon?: React.ReactNode
}) {
  const bgColors = {
    white: "bg-white",
    yellow: "bg-[#FFD84A]",
    green: "bg-[#28D17C]",
    blue: "bg-[#4AA3FF]",
    purple: "bg-[#FF7A00]",
  }

  const content = (
    <div className={`rounded-xl border-2 border-black ${bgColors[color]} p-4 transition-transform ${href ? "hover:-translate-y-1 cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">{label}</p>
          <p className="mt-1 text-2xl font-black text-black">{value}</p>
          {subValue && <p className="mt-0.5 text-xs text-black/60">{subValue}</p>}
        </div>
        {icon && <div className="text-black/40">{icon}</div>}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

// Host Stats Component
export function HostDashboardStats() {
  const [stats, setStats] = useState<HostStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { hostPath, basePath } = useDashboardPath()

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (res.ok) {
          const data = await res.json()
          if (data.role === "host") {
            setStats(data.stats)
          }
        }
      } catch (e) {
        console.error("Failed to fetch stats:", e)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-xl border-2 border-black/20 bg-black/5" />
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Offers Sent"
          value={stats.offersSent}
          subValue={`${stats.offersPending} pending`}
          color="yellow"
          href={`${hostPath}/offers`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />
        <StatCard
          label="Active Collabs"
          value={stats.activeCollabs}
          subValue={`${stats.completedCollabs} completed`}
          color="green"
          href={`${basePath}/collaborations`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          label="Total Clicks"
          value={formatNumber(stats.totalClicks)}
          subValue="from tracking links"
          color="blue"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
            </svg>
          }
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(stats.totalSpentCents)}
          subValue="on collaborations"
          color="purple"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Stats Bar - redesigned */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-white px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-black text-black">{stats.propertiesCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Properties</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-[#28D17C] px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-black text-black">{stats.offersAccepted}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Accepted</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-white px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-red-100">
            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-black text-black">{stats.offersDeclined}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Declined</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Creator Stats Component
export function CreatorDashboardStats() {
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { creatorPath, basePath } = useDashboardPath()

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (res.ok) {
          const data = await res.json()
          if (data.role === "creator") {
            setStats(data.stats)
          }
        }
      } catch (e) {
        console.error("Failed to fetch stats:", e)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-xl border-2 border-black/20 bg-black/5" />
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Offers"
          value={stats.offersReceived}
          subValue={`${stats.offersPending} pending`}
          color="yellow"
          href={`${creatorPath}/offers`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />
        <StatCard
          label="Active Collabs"
          value={stats.activeCollabs}
          subValue={`${stats.completedCollabs} completed`}
          color="green"
          href={`${basePath}/collaborations`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          }
        />
        <StatCard
          label="Total Clicks"
          value={formatNumber(stats.totalClicks)}
          subValue="from your content"
          color="blue"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
            </svg>
          }
        />
        <StatCard
          label="Total Earned"
          value={formatCurrency(stats.totalEarnedCents)}
          subValue={stats.pendingPaymentCents > 0 ? `${formatCurrency(stats.pendingPaymentCents)} pending` : "lifetime earnings"}
          color="purple"
          href={`${creatorPath}/settings`}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
      </div>

      {/* Quick Stats Bar */}
      <div className="flex items-center justify-between rounded-lg border border-black/10 bg-black/5 px-4 py-2 text-xs">
        <span className="text-black/60">
          <span className="font-bold text-[#28D17C]">{stats.offersAccepted}</span> offers accepted
        </span>
        <span className="text-black/30">|</span>
        <span className="text-black/60">
          <span className="font-bold text-black">{stats.totalCollabs}</span> total collaborations
        </span>
      </div>
    </div>
  )
}
