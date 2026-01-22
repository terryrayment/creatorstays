"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

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
  collaboration?: {
    id: string
    property?: { title: string; location: string }
    creator?: { displayName: string; handle: string }
    host?: { displayName: string }
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border-[3px] border-black/20 bg-black/5" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl border-[3px] border-black/20 bg-black/5" />
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

  // Calculate aggregated daily data for chart
  const aggregatedDaily: ClickData[] = []
  if (links.length > 0) {
    const dateMap = new Map<string, { clicks: number; uniqueClicks: number }>()
    links.forEach(link => {
      link.analytics.daily.forEach(day => {
        const existing = dateMap.get(day.date) || { clicks: 0, uniqueClicks: 0 }
        dateMap.set(day.date, {
          clicks: existing.clicks + day.clicks,
          uniqueClicks: existing.uniqueClicks + day.uniqueClicks,
        })
      })
    })
    dateMap.forEach((value, key) => {
      aggregatedDaily.push({ date: key, ...value })
    })
    aggregatedDaily.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Empty state
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
        <h3 className="text-xl font-black text-black">No Tracking Data Yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-black/60">
          {viewAs === "host"
            ? "Start collaborations with creators to get tracking links and see analytics here."
            : "Once you have active collaborations with tracking links, click data will appear here."}
        </p>
        <Link
          href={viewAs === "host" ? "/dashboard/host/search-creators" : "/dashboard/creator/offers"}
          className="mt-6 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-black px-6 py-3 text-sm font-black text-white transition-transform hover:-translate-y-1"
        >
          {viewAs === "host" ? "Find Creators" : "View Offers"}
          <span>→</span>
        </Link>
      </div>
    )
  }

  const maxDailyClicks = Math.max(...aggregatedDaily.map(d => d.clicks), 1)

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-black/60">
          Showing data for the last <span className="font-bold text-black">{days} days</span>
        </p>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full border-2 border-black px-4 py-1.5 text-xs font-bold transition-all ${
                days === d
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-black/5"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Total Clicks</p>
          <p className="mt-2 text-4xl font-black text-black">{totals.allTime.totalClicks.toLocaleString()}</p>
          <p className="mt-1 text-xs text-black/70">All time</p>
        </div>
        
        <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Unique Visitors</p>
          <p className="mt-2 text-4xl font-black text-black">{totals.allTime.uniqueClicks.toLocaleString()}</p>
          <p className="mt-1 text-xs text-black/70">All time</p>
        </div>
        
        <div className="rounded-2xl border-[3px] border-black bg-[#28D17C] p-5 sm:col-span-1 col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Last {days} Days</p>
          <p className="mt-2 text-4xl font-black text-black">{totals.period.totalClicks.toLocaleString()}</p>
          <p className="mt-1 text-xs text-black/70">
            {totals.period.uniqueClicks} unique visitors
          </p>
        </div>
      </div>

      {/* Click Chart */}
      {aggregatedDaily.length > 0 && (
        <div className="rounded-2xl border-[3px] border-black bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-black">Clicks Over Time</h2>
              <p className="text-xs text-black/60">Daily click activity</p>
            </div>
          </div>
          
          {/* Bar chart */}
          <div className="flex items-end justify-between gap-1 h-40">
            {aggregatedDaily.slice(-Math.min(days, 30)).map((day, i) => {
              const height = (day.clicks / maxDailyClicks) * 100
              return (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full">
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="rounded-lg border-2 border-black bg-white px-2 py-1 text-xs font-bold shadow-lg whitespace-nowrap">
                        {day.clicks} clicks
                      </div>
                    </div>
                    <div 
                      className="w-full bg-[#4AA3FF] rounded-t border-2 border-black border-b-0 transition-all hover:bg-[#3B8FE8] cursor-pointer"
                      style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* X-axis labels - show every few days */}
          <div className="flex justify-between mt-2 text-[10px] text-black/40">
            {aggregatedDaily.slice(-Math.min(days, 30)).filter((_, i, arr) => i === 0 || i === Math.floor(arr.length / 2) || i === arr.length - 1).map((day, i) => (
              <span key={i}>
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Breakdown */}
      <div className="rounded-2xl border-[3px] border-black bg-white overflow-hidden">
        <div className="p-5 border-b-2 border-black bg-black/5">
          <h2 className="text-lg font-black text-black">Campaign Performance</h2>
          <p className="text-xs text-black/60">Click breakdown by collaboration</p>
        </div>
        
        <div className="divide-y-2 divide-black/10">
          {links.map((item) => {
            const propertyTitle = item.collaboration?.property?.title || item.link.campaignName || "Tracking Link"
            const propertyLocation = item.collaboration?.property?.location
            const creatorHandle = item.collaboration?.creator?.handle
            const recentClicks = item.analytics.daily.slice(-7)
            const maxRecent = Math.max(...recentClicks.map(d => d.clicks), 1)
            
            return (
              <div key={item.link.id} className="p-5 hover:bg-black/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl border-2 border-black bg-gradient-to-br from-[#FFD84A] to-[#FF9500] flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">🏠</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-black truncate">{propertyTitle}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.link.isActive 
                            ? 'bg-[#28D17C] border-black text-black' 
                            : 'bg-gray-200 border-gray-400 text-gray-600'
                        }`}>
                          {item.link.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {propertyLocation && (
                        <p className="text-xs text-black/60 mt-0.5">{propertyLocation}</p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-black/50">
                        {viewAs === 'host' && creatorHandle && (
                          <span>Creator: <span className="font-bold text-black">@{creatorHandle}</span></span>
                        )}
                        {item.analytics.lastClickAt && (
                          <span>Last click: {new Date(item.analytics.lastClickAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-2xl font-black text-black">{item.analytics.allTime.totalClicks.toLocaleString()}</p>
                      <p className="text-[10px] text-black/60 uppercase tracking-wider">Clicks</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-black text-black/60">{item.analytics.allTime.uniqueClicks.toLocaleString()}</p>
                      <p className="text-[10px] text-black/60 uppercase tracking-wider">Unique</p>
                    </div>
                    
                    {/* Mini sparkline */}
                    <div className="w-20 h-8 flex items-end gap-0.5">
                      {recentClicks.map((day, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[#4AA3FF] rounded-sm"
                          style={{ height: `${Math.max((day.clicks / maxRecent) * 100, 8)}%` }}
                          title={`${day.date}: ${day.clicks} clicks`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Tracking link */}
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-black/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  <code className="flex-1 truncate text-xs text-black/60">
                    creatorstays.com/r/{item.link.token}
                  </code>
                  <button 
                    className="rounded-full border border-black/20 bg-white px-3 py-1 text-[10px] font-bold text-black hover:bg-black hover:text-white transition-colors"
                    onClick={() => copyLink(item.link.token)}
                  >
                    {copiedToken === item.link.token ? "Copied!" : "Copy"}
                  </button>
                </div>
                
                {/* Top sources */}
                {item.analytics.topSources.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] text-black/40">Sources:</span>
                    {item.analytics.topSources.slice(0, 3).map((source, i) => (
                      <span key={i} className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-black/60">
                        {source.source} ({source.count})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-2xl border-[3px] border-black bg-[#F5F5F5] p-5">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-bold text-black">Understanding Your Click Data</p>
            <p className="mt-1 text-sm text-black/70">
              Clicks measure how many people tapped through to your listing from creator content. 
              This shows audience engagement and reach. We track clicks only — we don't have access 
              to your Airbnb or booking platform data, so actual bookings aren't shown here.
            </p>
            <p className="mt-2 text-sm text-black/70">
              <strong>High clicks = strong creator content.</strong> Conversion to bookings depends on 
              your listing quality, pricing, availability, and other factors.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
