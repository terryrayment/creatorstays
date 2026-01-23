"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { DashboardFooter } from "@/components/navigation/dashboard-footer"

// Demo analytics data
const DEMO_STATS = {
  totalClicks: 3188,
  totalCollaborations: 3,
  activeCollaborations: 2,
  completedCollaborations: 1,
  totalInvested: 1250,
  avgCostPerClick: 0.39,
  topPerformer: {
    name: "Emma Williams",
    handle: "emmawanders",
    clicks: 2341,
    property: "Downtown Loft",
  },
  clicksByMonth: [
    { month: "Oct", clicks: 456 },
    { month: "Nov", clicks: 891 },
    { month: "Dec", clicks: 1841 },
  ],
  clicksByProperty: [
    { property: "Downtown Loft", clicks: 2341, collaborations: 1 },
    { property: "Oceanfront Beach House", clicks: 847, collaborations: 1 },
    { property: "Mountain View Cabin", clicks: 0, collaborations: 1 },
  ],
}

function StatCard({ label, value, subtext, color = "bg-white" }: { label: string; value: string | number; subtext?: string; color?: string }) {
  return (
    <div className={`rounded-xl border-2 border-black ${color} p-4`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">{label}</p>
      <p className="mt-1 text-2xl font-black text-black">{value}</p>
      {subtext && <p className="text-xs text-black/60">{subtext}</p>}
    </div>
  )
}

export default function BetaAnalyticsPage() {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "all">("all")

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded border border-black bg-[#FFD84A] px-2 py-0.5 text-[10px] font-bold text-black">BETA</span>
            <Link href="/beta/dashboard/host" className="text-sm font-bold text-black hover:text-[#28D17C]">Host Dashboard</Link>
          </div>
          <Link 
            href="/" 
            className="text-xs text-black/60 hover:text-black"
          >
            ← Back to site
          </Link>
        </div>
      </div>
      
      {/* Navigation Strip */}
      <div className="border-b-2 border-black bg-[#FFD84A]">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/beta/dashboard/host/properties"
              className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              My Properties
            </Link>
            <Link 
              href="/beta/dashboard/collaborations"
              className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              Collaborations
              <span className="ml-1 text-[8px] uppercase opacity-60">(Demo)</span>
            </Link>
            <Link 
              href="/beta/dashboard/host/analytics"
              className="rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-bold text-white"
            >
              Analytics
              <span className="ml-1 text-[8px] uppercase opacity-60">(Demo)</span>
            </Link>
            <Link 
              href="/beta/dashboard/host/settings"
              className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              Settings
            </Link>
            <Link 
              href="/beta/dashboard/host/search-creators"
              className="rounded-full border-2 border-black bg-white/60 px-3 py-1 text-[10px] font-bold text-black/60 transition-transform hover:-translate-y-0.5"
            >
              Find Creators
              <span className="ml-1 text-[8px] uppercase opacity-60">(Preview)</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-4"><Link href="/beta/dashboard/host" className="text-xs font-bold text-black/60 hover:text-black">← Dashboard</Link></div>
        
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-heading text-[2rem] font-black tracking-tight text-black">
              ANALYTICS
            </h1>
            <p className="mt-1 text-sm text-black/70">
              Track performance across all your collaborations.
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex rounded-full border-2 border-black overflow-hidden">
            {(["30d", "90d", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs font-bold ${
                  timeRange === range 
                    ? "bg-black text-white" 
                    : "bg-white text-black hover:bg-black/5"
                }`}
              >
                {range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "All Time"}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Banner */}
        <div className="mb-6 rounded-xl border-2 border-[#4AA3FF] bg-[#4AA3FF]/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#4AA3FF] bg-white">
              <svg className="h-5 w-5 text-[#4AA3FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-black">This is demo data</p>
              <p className="text-sm text-black/70 mt-1">
                These metrics show example performance from sample collaborations. Your real analytics will appear here once you start working with creators.
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard 
            label="Total Clicks" 
            value={DEMO_STATS.totalClicks.toLocaleString()} 
            color="bg-[#FFD84A]"
          />
          <StatCard 
            label="Collaborations" 
            value={DEMO_STATS.totalCollaborations}
            subtext={`${DEMO_STATS.activeCollaborations} active`}
          />
          <StatCard 
            label="Total Invested" 
            value={`$${DEMO_STATS.totalInvested}`}
            subtext="Cash to creators"
          />
          <StatCard 
            label="Avg Cost/Click" 
            value={`$${DEMO_STATS.avgCostPerClick.toFixed(2)}`}
            color="bg-[#28D17C]"
          />
        </div>

        {/* Charts Row */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {/* Clicks Over Time */}
          <div className="rounded-xl border-2 border-black bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">Clicks Over Time</h3>
            <div className="mt-4 flex items-end justify-around gap-2 h-32">
              {DEMO_STATS.clicksByMonth.map((month, i) => (
                <div key={month.month} className="flex flex-col items-center gap-1">
                  <div 
                    className="w-12 bg-[#4AA3FF] rounded-t transition-all"
                    style={{ height: `${(month.clicks / 2000) * 100}%`, minHeight: '20px' }}
                  />
                  <span className="text-xs font-bold text-black">{month.month}</span>
                  <span className="text-[10px] text-black/60">{month.clicks}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-black/5 p-3 text-center">
              <p className="text-xs text-black/60">
                Monthly click trends from your creator collaborations
              </p>
            </div>
          </div>

          {/* Top Performer */}
          <div className="rounded-xl border-2 border-black bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">Top Performer</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-[#28D17C] text-xl font-bold">
                EW
              </div>
              <div className="flex-1">
                <p className="font-bold text-black">{DEMO_STATS.topPerformer.name}</p>
                <p className="text-sm text-black/60">@{DEMO_STATS.topPerformer.handle}</p>
                <p className="mt-1 text-xs text-black/50">{DEMO_STATS.topPerformer.property}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-black">{DEMO_STATS.topPerformer.clicks.toLocaleString()}</p>
                <p className="text-xs text-black/60">clicks</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-[#28D17C]/20 p-3">
              <p className="text-xs font-bold text-black">
                73% of your total clicks came from this collaboration
              </p>
            </div>
          </div>
        </div>

        {/* Performance by Property */}
        <div className="rounded-xl border-2 border-black bg-white p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">Performance by Property</h3>
          <div className="mt-4 space-y-3">
            {DEMO_STATS.clicksByProperty.map((prop) => (
              <div key={prop.property} className="flex items-center gap-4 rounded-lg border border-black/10 bg-black/5 p-3">
                <div className="flex-1">
                  <p className="font-bold text-black">{prop.property}</p>
                  <p className="text-xs text-black/60">{prop.collaborations} collaboration{prop.collaborations !== 1 ? 's' : ''}</p>
                </div>
                <div className="w-32">
                  <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                    <div 
                      className="h-full bg-[#4AA3FF] rounded-full transition-all"
                      style={{ width: `${(prop.clicks / DEMO_STATS.totalClicks) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right w-20">
                  <p className="font-bold text-black">{prop.clicks.toLocaleString()}</p>
                  <p className="text-[10px] text-black/60">clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-8 rounded-xl border-2 border-dashed border-black/20 bg-white p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-black/20 bg-black/5">
            <svg className="h-6 w-6 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="mt-3 font-bold text-black">More analytics coming soon</p>
          <p className="text-sm text-black/60 mt-1">
            Conversion tracking, ROI calculator, and detailed engagement metrics are in development.
          </p>
        </div>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  )
}
