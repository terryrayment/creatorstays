"use client"

import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel"
import { Metric } from "@/components/ui/metric"

interface CollaborationWithAnalytics {
  id: string
  partnerName: string // Creator name for hosts, Host name for creators
  propertyTitle: string
  affiliateUrl: string
  affiliatePercent?: number
  flatFee?: number
  dealType: string
  status: string
  analytics: {
    totalClicks: number
    uniqueClicks: number
    revisits: number
    clicksByDay: { date: string; clicks: number }[]
  }
}

// Mock data
const mockCollaborations: CollaborationWithAnalytics[] = [
  {
    id: 'collab-1',
    partnerName: 'Amy Chen (@wanderlust_amy)',
    propertyTitle: 'Cozy A-Frame Cabin',
    affiliateUrl: 'https://creatorstays.com/r/abc123xy',
    affiliatePercent: 12,
    dealType: 'affiliate',
    status: 'active',
    analytics: {
      totalClicks: 247,
      uniqueClicks: 189,
      revisits: 58,
      clicksByDay: [
        { date: '2024-01-12', clicks: 45 },
        { date: '2024-01-13', clicks: 62 },
        { date: '2024-01-14', clicks: 38 },
        { date: '2024-01-15', clicks: 51 },
        { date: '2024-01-16', clicks: 33 },
        { date: '2024-01-17', clicks: 18 },
      ],
    },
  },
  {
    id: 'collab-2',
    partnerName: 'Marcus Webb (@photo_marcus)',
    propertyTitle: 'Cozy A-Frame Cabin',
    affiliateUrl: 'https://creatorstays.com/r/def456yz',
    affiliatePercent: 15,
    dealType: 'affiliate',
    status: 'active',
    analytics: {
      totalClicks: 156,
      uniqueClicks: 134,
      revisits: 22,
      clicksByDay: [
        { date: '2024-01-14', clicks: 28 },
        { date: '2024-01-15', clicks: 42 },
        { date: '2024-01-16', clicks: 56 },
        { date: '2024-01-17', clicks: 30 },
      ],
    },
  },
]

interface AnalyticsDashboardProps {
  viewAs: 'host' | 'creator'
}

export function AnalyticsDashboard({ viewAs }: AnalyticsDashboardProps) {
  const collaborations = mockCollaborations
  
  const totals = {
    totalClicks: collaborations.reduce((sum, c) => sum + c.analytics.totalClicks, 0),
    uniqueClicks: collaborations.reduce((sum, c) => sum + c.analytics.uniqueClicks, 0),
    activeCollabs: collaborations.filter(c => c.status === 'active').length,
  }

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric value={totals.activeCollabs} label="Active Collaborations" size="md" />
        <Metric value={totals.totalClicks} label="Total Clicks" size="md" />
        <Metric value={totals.uniqueClicks} label="Unique Visitors" size="md" />
        <Metric 
          value={`${Math.round((totals.uniqueClicks / totals.totalClicks) * 100) || 0}%`} 
          label="Unique Rate" 
          size="md" 
        />
      </div>

      {/* Per-collaboration breakdown */}
      <Panel>
        <PanelHeader 
          title="Collaborations" 
          description="Click performance by partner"
        />
        <PanelContent className="p-0">
          <div className="divide-y divide-foreground/5">
            {collaborations.map(collab => (
              <div key={collab.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{collab.partnerName}</p>
                    <p className="text-sm text-muted-foreground">{collab.propertyTitle}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        collab.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {collab.status}
                      </span>
                      {collab.affiliatePercent && (
                        <span className="text-xs text-muted-foreground">{collab.affiliatePercent}% affiliate</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{collab.analytics.totalClicks}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                </div>

                {/* Mini bar chart */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Last 7 days</span>
                    <span>{collab.analytics.uniqueClicks} unique</span>
                  </div>
                  <div className="flex h-8 items-end gap-1">
                    {collab.analytics.clicksByDay.slice(-7).map((day, i) => {
                      const maxClicks = Math.max(...collab.analytics.clicksByDay.map(d => d.clicks))
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
                </div>

                {/* Affiliate link */}
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-foreground/[0.02] px-3 py-2">
                  <svg className="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  <code className="flex-1 truncate text-xs text-muted-foreground">{collab.affiliateUrl}</code>
                  <button 
                    className="text-[10px] font-medium text-primary hover:underline"
                    onClick={() => navigator.clipboard.writeText(collab.affiliateUrl)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelContent>
      </Panel>

      {/* Note about payments */}
      <div className="rounded-lg border border-foreground/5 bg-foreground/[0.02] p-4 text-center text-xs text-muted-foreground">
        <p>
          <strong>Payments are settled off-platform.</strong> CreatorStays tracks clicks and attribution. 
          {viewAs === 'host' 
            ? ' Pay creators directly based on your agreement.' 
            : ' Collect payment from hosts based on your agreement.'}
        </p>
      </div>
    </div>
  )
}
