"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AdminStats {
  overview: {
    totalUsers: number
    totalCreators: number
    totalHosts: number
    totalProperties: number
    totalOffers: number
    totalCollaborations: number
    totalMessages: number
    totalReviews: number
    recentUsers: number
    recentOffers: number
    paymentVolume: number
  }
  offerStats: Record<string, number>
  collabStats: Record<string, number>
  recentCreators: {
    id: string
    displayName: string
    handle: string
    email: string
    location: string | null
    createdAt: string
  }[]
  recentHosts: {
    id: string
    displayName: string
    email: string
    propertyCount: number
    createdAt: string
  }[]
  recentCollaborations: {
    id: string
    creatorName: string
    hostName: string
    propertyTitle: string | null
    status: string
    createdAt: string
  }[]
  recentOffers: {
    id: string
    creatorName: string
    hostName: string
    status: string
    cashCents: number
    createdAt: string
  }[]
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

function StatCard({ label, value, subValue, color }: { label: string; value: string | number; subValue?: string; color: string }) {
  return (
    <div className={`rounded-xl border-2 border-black ${color} p-4`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">{label}</p>
      <p className="mt-1 text-2xl font-black text-black">{value}</p>
      {subValue && <p className="mt-0.5 text-xs text-black/60">{subValue}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-[#FFD84A]",
    accepted: "bg-[#28D17C]",
    declined: "bg-red-400",
    countered: "bg-[#4AA3FF]",
    completed: "bg-[#28D17C]",
    active: "bg-[#4AA3FF]",
    "pending-agreement": "bg-[#FFD84A]",
    "content-submitted": "bg-[#D7B6FF]",
  }
  return (
    <span className={`rounded-full border border-black px-2 py-0.5 text-[9px] font-bold text-black ${colors[status] || "bg-gray-200"}`}>
      {status}
    </span>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "creators" | "hosts" | "offers" | "collabs">("overview")

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (res.status === 401) {
          // Not authenticated, redirect to login
          router.push("/admin/login")
          return
        }
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        } else {
          setError("Failed to load admin data")
        }
      } catch (e) {
        setError("Network error")
      }
      setLoading(false)
    }

    fetchStats()
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="rounded-2xl border-2 border-black bg-white p-8 text-center">
          <p className="text-lg font-bold text-red-500">{error}</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-black px-6 py-2 text-sm font-bold text-white">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Header */}
      <div className="border-b-2 border-white/20 bg-black px-4 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-black text-white">ADMIN DASHBOARD</h1>
            <p className="mt-1 text-sm text-white/60">Platform overview and management</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border-2 border-white/30 px-4 py-2 text-xs font-bold text-white/70 transition-colors hover:border-white hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-white/20 bg-black px-4">
        <div className="mx-auto flex max-w-7xl gap-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "creators", label: "Creators" },
            { id: "hosts", label: "Hosts" },
            { id: "offers", label: "Offers" },
            { id: "collabs", label: "Collaborations" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? "border-[#28D17C] text-white"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              <StatCard label="Total Users" value={stats.overview.totalUsers} subValue={`+${stats.overview.recentUsers} this week`} color="bg-white" />
              <StatCard label="Creators" value={stats.overview.totalCreators} color="bg-[#4AA3FF]" />
              <StatCard label="Hosts" value={stats.overview.totalHosts} color="bg-[#FFD84A]" />
              <StatCard label="Properties" value={stats.overview.totalProperties} color="bg-[#28D17C]" />
              <StatCard label="Payment Volume" value={formatCurrency(stats.overview.paymentVolume)} color="bg-[#D7B6FF]" />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Total Offers" value={stats.overview.totalOffers} subValue={`+${stats.overview.recentOffers} this week`} color="bg-white" />
              <StatCard label="Collaborations" value={stats.overview.totalCollaborations} color="bg-white" />
              <StatCard label="Messages" value={stats.overview.totalMessages} color="bg-white" />
              <StatCard label="Reviews" value={stats.overview.totalReviews} color="bg-white" />
            </div>

            {/* Offer Status Breakdown */}
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <h3 className="mb-3 text-sm font-bold text-black">Offer Status Breakdown</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.offerStats).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-sm font-bold text-black">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaboration Status Breakdown */}
            <div className="rounded-xl border-2 border-black bg-white p-4">
              <h3 className="mb-3 text-sm font-bold text-black">Collaboration Status Breakdown</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.collabStats).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <span className="text-sm font-bold text-black">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "creators" && (
          <div className="rounded-xl border-2 border-black bg-white">
            <div className="border-b border-black/10 p-4">
              <h3 className="font-bold text-black">Recent Creators</h3>
            </div>
            <div className="divide-y divide-black/10">
              {stats.recentCreators.map(creator => (
                <div key={creator.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold text-black">{creator.displayName}</p>
                    <p className="text-xs text-black/60">@{creator.handle} · {creator.email}</p>
                    {creator.location && <p className="text-xs text-black/40">{creator.location}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-black/60">{formatDate(creator.createdAt)}</p>
                    <Link href={`/creators/${creator.handle}`} className="text-xs font-bold text-[#4AA3FF]">View Profile →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "hosts" && (
          <div className="rounded-xl border-2 border-black bg-white">
            <div className="border-b border-black/10 p-4">
              <h3 className="font-bold text-black">Recent Hosts</h3>
            </div>
            <div className="divide-y divide-black/10">
              {stats.recentHosts.map(host => (
                <div key={host.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold text-black">{host.displayName}</p>
                    <p className="text-xs text-black/60">{host.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-black">{host.propertyCount} properties</p>
                    <p className="text-xs text-black/60">{formatDate(host.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "offers" && (
          <div className="rounded-xl border-2 border-black bg-white">
            <div className="border-b border-black/10 p-4">
              <h3 className="font-bold text-black">Recent Offers</h3>
            </div>
            <div className="divide-y divide-black/10">
              {stats.recentOffers.map(offer => (
                <div key={offer.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold text-black">{offer.hostName} → {offer.creatorName}</p>
                    <p className="text-xs text-black/60">{formatCurrency(offer.cashCents)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={offer.status} />
                    <p className="text-xs text-black/60">{formatDate(offer.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "collabs" && (
          <div className="rounded-xl border-2 border-black bg-white">
            <div className="border-b border-black/10 p-4">
              <h3 className="font-bold text-black">Recent Collaborations</h3>
            </div>
            <div className="divide-y divide-black/10">
              {stats.recentCollaborations.map(collab => (
                <div key={collab.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold text-black">{collab.creatorName} × {collab.hostName}</p>
                    <p className="text-xs text-black/60">{collab.propertyTitle || "Property"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={collab.status} />
                    <p className="text-xs text-black/60">{formatDate(collab.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
