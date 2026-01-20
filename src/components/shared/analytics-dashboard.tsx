"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel"
import { Metric } from "@/components/ui/metric"

interface ClickData {
  date: string
  clicks: number
  uniqueClicks: number
}

interface LinkAnalytics {
  link: {
    id: string
    token: string
    destinationUrl: string
    campaignName: string | null
    creatorId: string
    hostId: string
    propertyId: string | null
    isActive: boolean
    createdAt: string
  }
  analytics: {
    allTime: {
      totalClicks: number
      uniqueClicks: number
    }
    period: {
      days: number
      totalClicks: number
      uniqueClicks: number
      revisits: number
    }
    daily: ClickData[]
    topSources: { source: string; count: number }[]
    lastClickAt: string | null
  }
}

interface AnalyticsResponse {
  links: LinkAnalytics[]
  totals: {
    totalLinks: number
    activeLinks: number
    allTime: { totalClicks: number; uniqueClicks: number }
    period: { totalClicks: number; uniqueClicks: number }
  }
  period: { days: number; startDate: string; endDate: string }
}

interface AnalyticsDashboardProps {
  viewAs: 'host' | 'creator'
}

function MiniBarChart({ data, maxDays = 7 }: { data: ClickData[]; maxDays?: number }) {
  const recent = data.slice(-maxDays)
  const maxClicks = Math.max(...recent.map(d => d.clicks), 1)
  
  return (
    <div className="flex h-8 items-end gap-1">
      {recent.map((day, i) => {
        const height = (day.clicks / maxClicks) * 100
        return (
          <div
            key={i}
            className="flex-1 rounded-sm bg-primary/20 transition-all hover:bg-primary/40"
            style={{ height: `${Math.max(height, 8)}%` }}
            title={`${day.date}: ${day.clicks} clicks`}
          />
        )
      })}
    </div>
  )
}

export function AnalyticsDashboard({ viewAs }: AnalyticsDashboardProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null)
  const [days, setDays] = useState(30)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      if (!session?.user) return
      
      setLoading(true)
      try {
        // Get user profile ID
        const profileRes = await fetch(
          viewAs === "host" ? "/api/host/profile" : "/api/creator/profile"
        )
        
        if (!profileRes.ok) {
          setLoading(false)
          return
        }

        const profile = await profileRes.json()
        const profileId = profile.id

        if (!profileId) {
          setLoading(false)
          return
        }

        // Fetch analytics
        const analyticsRes = await fetch(
          `/api/analytics?${viewAs === "host" ? "hostId" : "creatorId"}=${profileId}&days=${days}`
        )

        if (analyticsRes.ok) {
          const data = await analyticsRes.json()
          setAnalyticsData(data)
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      }
      setLoading(false)
    }

    fetchAnalytics()
  }, [session, viewAs, days])

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`https://creatorstays.com/r/${token}`)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-black/5" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-black/5" />
      </div>
    )
  }

  const totals = analyticsData?.totals || {
    totalLinks: 0,
    activeLinks: 0,
    allTime: { totalClicks: 0, uniqueClicks: 0 },
    period: { totalClicks: 0, uniqueClicks: 0 },
  }

  const links = analyticsData?.links || []

  if (links.length === 0) {
    return (
      <div className="rounded-2xl border-[3px] border-black bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-[#4AA3FF]">
          <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-black">No Tracking Data Yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-black/60">
          {viewAs === "host"
            ? "Start collaborations with creators to get tracking links and see analytics here."
            : "Once you have active collaborations with tracking links, click data will appear here."}
        </p>
        <a
          href={viewAs === "host" ? "/dashboard/host/search-creators" : "/dashboard/creator/offers"}
          className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-6 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-1"
        >
          {viewAs === "host" ? "Find Creators" : "View Offers"}
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex justify-end">
        <div className="flex rounded-full border-2 border-black bg-white">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 text-xs font-bold transition-colors ${
                days === d ? "bg-black text-white" : "text-black hover:bg-black/5"
              } ${d === 7 ? "rounded-l-full" : d === 30 ? "rounded-r-full" : ""}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric value={totals.activeLinks} label="Active Links" size="md" />
        <Metric value={totals.allTime.totalClicks.toLocaleString()} label="Total Clicks" size="md" />
        <Metric value={totals.allTime.uniqueClicks.toLocaleString()} label="Unique Visitors" size="md" />
        <Metric 
          value={`${totals.period.totalClicks}`} 
          label={`Last ${days} Days`}
          size="md" 
        />
      </div>

      {/* Per-link breakdown */}
      <Panel>
        <PanelHeader 
          title="Tracking Links" 
          description="Click performance by collaboration"
        />
        <PanelContent className="p-0">
          <div className="divide-y divide-foreground/5">
            {links.map(item => (
              <div key={item.link.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.link.campaignName || "Tracking Link"}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        item.link.isActive 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.link.isActive ? "active" : "inactive"}
                      </span>
                      {item.analytics.lastClickAt && (
                        <span className="text-xs text-black/60">
                          Last click: {new Date(item.analytics.lastClickAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.analytics.allTime.totalClicks}</p>
                    <p className="text-xs text-black/60">total clicks</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-3 flex gap-4 text-xs">
                  <div>
                    <span className="text-black/60">Unique: </span>
                    <span className="font-bold">{item.analytics.allTime.uniqueClicks}</span>
                  </div>
                  <div>
                    <span className="text-black/60">Last {days}d: </span>
                    <span className="font-bold">{item.analytics.period.totalClicks}</span>
                  </div>
                  <div>
                    <span className="text-black/60">Revisits: </span>
                    <span className="font-bold">{item.analytics.period.revisits}</span>
                  </div>
                </div>

                {/* Mini bar chart */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[10px] text-black/60">
                    <span>Last 7 days</span>
                    <span>{item.analytics.period.uniqueClicks} unique</span>
                  </div>
                  <MiniBarChart data={item.analytics.daily} maxDays={7} />
                </div>

                {/* Top sources */}
                {item.analytics.topSources.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-medium text-black/60 mb-1">Top Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {item.analytics.topSources.slice(0, 4).map((source, i) => (
                        <span key={i} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-black/70">
                          {source.source}: {source.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracked link */}
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-black/[0.02] px-3 py-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-black/60" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  <code className="flex-1 truncate text-xs text-black/60">
                    https://creatorstays.com/r/{item.link.token}
                  </code>
                  <button 
                    className="text-[10px] font-medium text-primary hover:underline"
                    onClick={() => copyLink(item.link.token)}
                  >
                    {copiedToken === item.link.token ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelContent>
      </Panel>

      {/* Important clarification about clicks vs bookings */}
      {viewAs === 'host' && (
        <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800">📊 Understanding Your Click Data</p>
          <p className="mt-1 text-xs text-amber-700">
            <strong>Clicks measure engagement, not bookings.</strong> CreatorStays tracks how many people 
            clicked through to your Airbnb listing from creator content. We do not have access to your 
            Airbnb booking data, so we cannot track conversions.
          </p>
          <p className="mt-2 text-xs text-amber-700">
            <strong>Why this matters:</strong> High clicks indicate strong creator content and audience interest. 
            Actual booking rates depend on many factors (pricing, availability, listing quality, seasonality) 
            that are outside the creator's control.
          </p>
        </div>
      )}

      {/* Note about tracking */}
      <div className="rounded-lg border border-black/5 bg-black/[0.02] p-4 text-center text-xs text-black/60">
        <p>
          <strong>How tracking works:</strong> Each collaboration gets a unique link. 
          We track clicks and attribute them to the creator for performance bonuses.
          {viewAs === 'host' 
            ? ' Bonuses are based on verified clicks, not booking conversions.' 
            : ' Track your link performance to maximize earnings.'}
        </p>
      </div>
    </div>
  )
}
