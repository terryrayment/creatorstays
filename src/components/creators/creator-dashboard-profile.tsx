"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel"
import { Metric } from "@/components/ui/metric"
import { EdgeBlur } from "@/components/ui/edge-blur"

// Platform connection types
type Platform = 'instagram' | 'tiktok' | 'youtube'

interface PlatformConnection {
  url: string
  handle: string
  connectedAt: Date
  viaOAuth?: boolean
}

type ConnectedPlatforms = Partial<Record<Platform, PlatformConnection>>

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue ? decodeURIComponent(cookieValue) : null
  }
  return null
}

// Helper to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

// Toast notification component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="rounded-lg border border-foreground/10 bg-white px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    </div>
  )
}

// Modal wrapper component
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  )
}

// Status indicator
function StatusDot({ active, color }: { active: boolean; color: string }) {
  return <div className={`h-2 w-2 rounded-full ${active ? color : "bg-gray-200"}`} />
}

// Completeness bar
function CompletenessBar({ percent }: { percent: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Profile complete</span>
        <span className="font-semibold">{percent}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/5">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// Copy link button with toast
function CopyLinkButton({ handle, onCopy }: { handle: string; onCopy: () => void }) {
  const link = `creatorstays.com/c/${handle}`

  const copy = () => {
    navigator.clipboard.writeText(`https://${link}`)
    onCopy()
  }

  return (
    <button 
      onClick={copy}
      className="flex w-full items-center gap-2 rounded-lg border border-foreground/5 bg-foreground/[0.02] px-3 py-2 text-left transition-colors hover:bg-foreground/[0.04]"
    >
      <svg className="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
      <span className="flex-1 truncate text-xs text-muted-foreground">{link}</span>
      <span className="text-[10px] font-medium text-primary">Copy</span>
    </button>
  )
}

// Mock campaign data
const mockCampaigns = [
  {
    id: 1,
    property: "Cozy A-Frame Cabin",
    host: "Mountain View Retreats",
    linkLabel: "cabin-winter-stay",
    dateRange: "Jan 5 – Jan 19",
    postDate: 3,
    totalClicks: 127,
    uniqueClicks: 98,
    revisitRate: 23,
    activity: [1, 2, 8, 10, 9, 7, 5, 4, 3, 3, 2, 2, 1, 1],
  },
  {
    id: 2,
    property: "Modern Beach House",
    host: "Coastal Getaways",
    linkLabel: "beach-escape-2024",
    dateRange: "Dec 20 – Jan 3",
    postDate: 2,
    totalClicks: 89,
    uniqueClicks: 71,
    revisitRate: 18,
    activity: [1, 7, 10, 8, 6, 4, 3, 2, 2, 2, 1, 1, 1, 1],
  },
  {
    id: 3,
    property: "Downtown Loft",
    host: "Urban Stays Co",
    linkLabel: "city-vibes",
    dateRange: "Dec 10 – Dec 24",
    postDate: 4,
    totalClicks: 31,
    uniqueClicks: 28,
    revisitRate: 10,
    activity: [0, 1, 1, 2, 6, 8, 5, 3, 2, 1, 1, 1, 0, 0],
  },
]

// Campaign Timeline Component
function CampaignTimeline() {
  const [timeRange, setTimeRange] = useState<'14' | '30'>('14')
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <Panel variant="elevated">
      <PanelHeader 
        title="Campaign timeline" 
        actions={
          <div className="flex rounded-full border border-foreground/10 bg-foreground/[0.02] p-0.5">
            <button
              onClick={() => setTimeRange('14')}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                timeRange === '14' 
                  ? 'bg-white text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last 14 days
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                timeRange === '30' 
                  ? 'bg-white text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last 30 days
            </button>
          </div>
        }
      />
      <PanelContent className="p-0">
        <div className="divide-y divide-foreground/5">
          {mockCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              onMouseEnter={() => setHoveredId(campaign.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`px-4 py-3 transition-all duration-200 ${
                hoveredId !== null && hoveredId !== campaign.id 
                  ? 'opacity-40' 
                  : 'opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{campaign.property}</p>
                  <p className="text-[10px] text-muted-foreground">{campaign.host} · /{campaign.linkLabel}</p>
                  <p className="text-[10px] text-muted-foreground/60">{campaign.dateRange}</p>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-sm font-semibold">{campaign.totalClicks}</p>
                    <p className="text-[9px] text-muted-foreground">clicks</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{campaign.uniqueClicks}</p>
                    <p className="text-[9px] text-muted-foreground">unique</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{campaign.revisitRate}%</p>
                    <p className="text-[9px] text-muted-foreground">revisit</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex h-6 items-end gap-px">
                {campaign.activity.map((level, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-all ${
                      i === campaign.postDate 
                        ? 'bg-primary' 
                        : hoveredId === campaign.id 
                          ? 'bg-primary/40' 
                          : 'bg-foreground/10'
                    }`}
                    style={{ 
                      height: `${Math.max(level * 10, 4)}%`,
                      opacity: hoveredId === campaign.id ? 1 : 0.6
                    }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[8px] text-muted-foreground/40">
                <span>Start</span>
                <span>Post ↑</span>
                <span>End</span>
              </div>
            </div>
          ))}
        </div>
      </PanelContent>
    </Panel>
  )
}

// Mock tax data
const mockTaxData = {
  ytdGross: 2450.00,
  platformFees: 367.50,
  netPaidOut: 1870.00,
  pendingBalance: 212.50,
  stripeConnected: false,
  checklist: {
    legalName: false,
    address: false,
    stripeConnected: false,
    payoutSchedule: false,
  }
}

// Earnings Panel Component
function EarningsPanel({ onComingSoon }: { onComingSoon: (feature: string) => void }) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  
  return (
    <Panel className="border-emerald-200/50 bg-gradient-to-b from-emerald-50/30 to-transparent">
      <PanelHeader 
        title="Earnings" 
        actions={<span className="text-[10px] text-emerald-600">2025</span>}
      />
      <PanelContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/60 p-2.5">
            <p className="text-[10px] text-muted-foreground">Net Paid Out</p>
            <p className="text-base font-semibold text-emerald-600">${mockTaxData.netPaidOut.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-white/60 p-2.5">
            <p className="text-[10px] text-muted-foreground">Pending</p>
            <p className="text-base font-semibold text-amber-600">${mockTaxData.pendingBalance.toFixed(2)}</p>
          </div>
        </div>

        <button 
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-[10px] font-medium text-primary hover:underline"
        >
          {showBreakdown ? 'Hide breakdown' : 'View breakdown'}
        </button>
        
        {showBreakdown && (
          <div className="rounded-lg bg-foreground/[0.02] p-2.5 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross earnings</span>
              <span>${mockTaxData.ytdGross.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform fees (15%)</span>
              <span>-${mockTaxData.platformFees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-foreground/5 pt-1">
              <span className="font-medium">Net</span>
              <span className="font-medium">${mockTaxData.netPaidOut.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-dashed border-foreground/10 bg-white/40 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Payout account</p>
              <p className="text-[10px] text-muted-foreground">
                {mockTaxData.stripeConnected ? 'Bank account connected' : 'Payouts are deposited to your bank account.'}
              </p>
            </div>
            <Button 
              size="sm" 
              variant={mockTaxData.stripeConnected ? "outline" : "default"} 
              className="text-[10px]"
              onClick={() => onComingSoon('Bank account connection')}
            >
              {mockTaxData.stripeConnected ? 'Manage' : 'Connect bank'}
            </Button>
          </div>
          <p className="mt-2 text-[9px] text-muted-foreground/60">Bank connection powered by Stripe</p>
        </div>

        <div className="text-[10px] text-muted-foreground leading-relaxed">
          <p>Tax forms are issued automatically for eligible US creators.</p>
          <button 
            onClick={() => onComingSoon('Tax documentation')}
            className="mt-0.5 font-medium text-primary hover:underline"
          >
            Learn more
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Setup checklist</p>
          {[
            { key: 'legalName', label: 'Add legal name', done: mockTaxData.checklist.legalName },
            { key: 'address', label: 'Add address', done: mockTaxData.checklist.address },
            { key: 'bankAccount', label: 'Connect bank account', done: mockTaxData.checklist.stripeConnected },
            { key: 'payoutSchedule', label: 'Choose payout schedule', done: mockTaxData.checklist.payoutSchedule },
          ].map((item) => (
            <button 
              key={item.key} 
              onClick={() => !item.done && onComingSoon(item.label)}
              className="flex w-full items-center gap-2 text-xs hover:bg-foreground/[0.02] rounded p-1 -ml-1"
            >
              <div className={`flex h-4 w-4 items-center justify-center rounded-full ${
                item.done 
                  ? 'bg-emerald-500 text-white' 
                  : 'border border-foreground/20 bg-white'
              }`}>
                {item.done && (
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <span className={item.done ? 'text-muted-foreground line-through' : ''}>{item.label}</span>
            </button>
          ))}
        </div>
      </PanelContent>
    </Panel>
  )
}

// Platform sync data type
interface PlatformSyncData {
  count: number
  lastSynced: Date
}

// Available niches
const AVAILABLE_NICHES = ['Travel', 'Lifestyle', 'Luxury', 'Adventure', 'Food', 'Photography', 'Family', 'Wellness', 'Budget', 'Solo']

// Available deliverables
const AVAILABLE_DELIVERABLES = ['Feed posts', 'Reels', 'Stories', 'TikTok', 'YouTube', 'Blog post', 'Photography', 'Drone footage']

export function CreatorDashboardProfile() {
  const searchParams = useSearchParams()
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // Profile state (editable)
  const [profile, setProfile] = useState({
    displayName: "Your Profile",
    handle: "yourhandle",
    bio: "Add a bio to tell hosts about your content style.",
    niches: ["Travel", "Lifestyle"],
    deliverables: ["Feed posts", "Reels", "Stories"],
    dealPrefs: {
      minFlat: null as number | null,
      minPercent: null as number | null,
      postForStay: true,
    },
  })
  
  // Modal states
  const [editAboutOpen, setEditAboutOpen] = useState(false)
  const [editDealPrefsOpen, setEditDealPrefsOpen] = useState(false)
  const [editDeliverablesOpen, setEditDeliverablesOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [comingSoonModal, setComingSoonModal] = useState<string | null>(null)
  const [oauthNotConfigured, setOauthNotConfigured] = useState<Platform | null>(null)
  
  // Form state for modals
  const [editBio, setEditBio] = useState(profile.bio)
  const [editNiches, setEditNiches] = useState<string[]>(profile.niches)
  const [editMinFlat, setEditMinFlat] = useState(profile.dealPrefs.minFlat?.toString() || '')
  const [editMinPercent, setEditMinPercent] = useState(profile.dealPrefs.minPercent?.toString() || '')
  const [editPostForStay, setEditPostForStay] = useState(profile.dealPrefs.postForStay)
  const [editDeliverables, setEditDeliverables] = useState<string[]>(profile.deliverables)
  const [editDisplayName, setEditDisplayName] = useState(profile.displayName)
  const [editHandle, setEditHandle] = useState(profile.handle)
  
  // Platform connection state
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatforms>({})
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null)
  const [platformUrlInput, setPlatformUrlInput] = useState('')
  const [connectLoading, setConnectLoading] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [platformSyncData, setPlatformSyncData] = useState<Partial<Record<Platform, PlatformSyncData>>>({})

  // Check for Instagram OAuth connection on mount
  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    const igError = searchParams.get('ig_error')
    
    if (igError === 'not_configured') {
      setOauthNotConfigured('instagram')
    }
    
    if (error) {
      setConnectError(`Connection failed: ${error}`)
    }
    
    const igCookie = getCookie('cs_ig_connected')
    if (igCookie) {
      try {
        const igData = JSON.parse(igCookie)
        if (igData.connected) {
          setConnectedPlatforms(prev => ({
            ...prev,
            instagram: {
              url: 'oauth',
              handle: igData.userName || '@connected',
              connectedAt: new Date(igData.connectedAt),
              viaOAuth: true,
            },
          }))
          if (!platformSyncData.instagram) {
            setPlatformSyncData(prev => ({
              ...prev,
              instagram: { count: 12400, lastSynced: new Date() }
            }))
          }
        }
      } catch (e) {
        console.error('Failed to parse Instagram cookie:', e)
      }
    }
  }, [searchParams])
  
  // Handle sync for a platform
  const handleSyncPlatform = (platform: Platform) => {
    const baseCounts: Record<Platform, number> = {
      instagram: 12400,
      tiktok: 8700,
      youtube: 3200,
    }
    const currentCount = platformSyncData[platform]?.count || baseCounts[platform]
    const variation = Math.floor(currentCount * (Math.random() * 0.05 - 0.02))
    const newCount = currentCount + variation
    
    setPlatformSyncData(prev => ({
      ...prev,
      [platform]: { count: newCount, lastSynced: new Date() }
    }))
    setToastMessage(`${platform.charAt(0).toUpperCase() + platform.slice(1)} synced`)
  }

  // Calculate completeness
  const connectionCount = Object.keys(connectedPlatforms).length
  const baseCompleteness = 35
  const adjustedCompleteness = Math.min(100, baseCompleteness + (connectionCount * 10) + (profile.bio.length > 50 ? 15 : 0) + (profile.dealPrefs.minFlat ? 10 : 0))

  // Handle Instagram OAuth connect
  const handleInstagramOAuth = () => {
    window.location.href = '/api/instagram/auth'
  }

  // Handle Instagram disconnect
  const handleInstagramDisconnect = () => {
    deleteCookie('cs_ig_connected')
    deleteCookie('cs_ig_token')
    setConnectedPlatforms(prev => {
      const updated = { ...prev }
      delete updated.instagram
      return updated
    })
    setConnectingPlatform(null)
    setToastMessage('Instagram disconnected')
  }

  const handleConnectPlatform = async () => {
    if (!connectingPlatform || !platformUrlInput) return
    
    setConnectLoading(true)
    setConnectError(null)
    
    try {
      const res = await fetch('/api/creator/connect-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: connectingPlatform,
          url: platformUrlInput,
        }),
      })
      
      const data = await res.json()
      
      if (data.ok) {
        const baseCounts: Record<Platform, number> = {
          instagram: 12400,
          tiktok: 8700,
          youtube: 3200,
        }
        setConnectedPlatforms(prev => ({
          ...prev,
          [connectingPlatform]: {
            url: platformUrlInput,
            handle: data.handle,
            connectedAt: new Date(),
          },
        }))
        setPlatformSyncData(prev => ({
          ...prev,
          [connectingPlatform]: {
            count: baseCounts[connectingPlatform],
            lastSynced: new Date(),
          }
        }))
        setConnectingPlatform(null)
        setPlatformUrlInput('')
        setToastMessage(`${connectingPlatform.charAt(0).toUpperCase() + connectingPlatform.slice(1)} connected`)
      } else {
        setConnectError(data.error || 'Failed to connect')
      }
    } catch {
      setConnectError('Connection failed. Try again.')
    } finally {
      setConnectLoading(false)
    }
  }

  const handleDisconnect = (platform: Platform) => {
    setConnectedPlatforms(prev => {
      const updated = { ...prev }
      delete updated[platform]
      return updated
    })
    setPlatformSyncData(prev => {
      const updated = { ...prev }
      delete updated[platform]
      return updated
    })
    setConnectingPlatform(null)
    setToastMessage(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`)
  }

  const getPlaceholder = (platform: Platform) => {
    switch (platform) {
      case 'instagram': return 'instagram.com/username'
      case 'tiktok': return 'tiktok.com/@username'
      case 'youtube': return 'youtube.com/@channel'
    }
  }

  // Save handlers
  const saveAbout = () => {
    setProfile(prev => ({ ...prev, bio: editBio, niches: editNiches }))
    setEditAboutOpen(false)
    setToastMessage('About updated')
  }

  const saveDealPrefs = () => {
    setProfile(prev => ({
      ...prev,
      dealPrefs: {
        minFlat: editMinFlat ? parseInt(editMinFlat) : null,
        minPercent: editMinPercent ? parseInt(editMinPercent) : null,
        postForStay: editPostForStay,
      }
    }))
    setEditDealPrefsOpen(false)
    setToastMessage('Deal preferences updated')
  }

  const saveDeliverables = () => {
    setProfile(prev => ({ ...prev, deliverables: editDeliverables }))
    setEditDeliverablesOpen(false)
    setToastMessage('Deliverables updated')
  }

  const saveProfile = () => {
    setProfile(prev => ({ ...prev, displayName: editDisplayName, handle: editHandle }))
    setEditProfileOpen(false)
    setToastMessage('Profile updated')
  }

  const toggleNiche = (niche: string) => {
    setEditNiches(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    )
  }

  const toggleDeliverable = (d: string) => {
    setEditDeliverables(prev => 
      prev.includes(d) 
        ? prev.filter(x => x !== d)
        : [...prev, d]
    )
  }

  return (
    <div className="relative min-h-screen bg-[hsl(210,20%,99%)]">
      <EdgeBlur />

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Edit About Modal */}
      {editAboutOpen && (
        <Modal onClose={() => setEditAboutOpen(false)}>
          <h3 className="text-lg font-semibold">Edit About</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="mt-1 w-full rounded-lg border border-foreground/10 p-3 text-sm"
                rows={3}
                placeholder="Tell hosts about your content style..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Niches</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVAILABLE_NICHES.map(niche => (
                  <button
                    key={niche}
                    onClick={() => toggleNiche(niche)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      editNiches.includes(niche)
                        ? 'bg-primary text-white'
                        : 'border border-foreground/10 bg-white hover:bg-foreground/5'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditAboutOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={saveAbout}>Save</Button>
          </div>
        </Modal>
      )}

      {/* Edit Deal Prefs Modal */}
      {editDealPrefsOpen && (
        <Modal onClose={() => setEditDealPrefsOpen(false)}>
          <h3 className="text-lg font-semibold">Edit Rates</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Base rate per post ($)</label>
              <Input
                type="number"
                value={editMinFlat}
                onChange={(e) => setEditMinFlat(e.target.value)}
                placeholder="e.g. 500"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Traffic bonus (%)</label>
              <Input
                type="number"
                value={editMinPercent}
                onChange={(e) => setEditMinPercent(e.target.value)}
                placeholder="e.g. 10"
                className="mt-1"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Optional bonus based on tracked link traffic</p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Open to post-for-stay</label>
              <button
                onClick={() => setEditPostForStay(!editPostForStay)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  editPostForStay ? 'bg-primary' : 'bg-foreground/20'
                }`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  editPostForStay ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditDealPrefsOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={saveDealPrefs}>Save</Button>
          </div>
        </Modal>
      )}

      {/* Edit Deliverables Modal */}
      {editDeliverablesOpen && (
        <Modal onClose={() => setEditDeliverablesOpen(false)}>
          <h3 className="text-lg font-semibold">Edit Deliverables</h3>
          <p className="mt-1 text-sm text-muted-foreground">Select the content types you offer.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {AVAILABLE_DELIVERABLES.map(d => (
              <button
                key={d}
                onClick={() => toggleDeliverable(d)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  editDeliverables.includes(d)
                    ? 'bg-primary text-white'
                    : 'border border-foreground/10 bg-white hover:bg-foreground/5'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditDeliverablesOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={saveDeliverables}>Save</Button>
          </div>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <Modal onClose={() => setEditProfileOpen(false)}>
          <h3 className="text-lg font-semibold">Edit Profile</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Display Name</label>
              <Input
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Handle</label>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm text-muted-foreground">@</span>
                <Input
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={saveProfile}>Save</Button>
          </div>
        </Modal>
      )}

      {/* Coming Soon Modal */}
      {comingSoonModal && (
        <Modal onClose={() => setComingSoonModal(null)}>
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {comingSoonModal} is not available yet. We're working on it!
          </p>
          <div className="mt-6">
            <Button className="w-full" onClick={() => setComingSoonModal(null)}>Got it</Button>
          </div>
        </Modal>
      )}

      {/* OAuth Not Configured Modal */}
      {oauthNotConfigured && (
        <Modal onClose={() => setOauthNotConfigured(null)}>
          <h3 className="text-lg font-semibold">Instagram Connect Not Configured</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Instagram OAuth requires environment variables to be set up.
          </p>
          <div className="mt-3 rounded-lg bg-foreground/5 p-3">
            <p className="text-xs font-medium text-foreground">Required:</p>
            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground font-mono">
              <li>META_APP_ID</li>
              <li>META_APP_SECRET</li>
              <li>META_REDIRECT_URI</li>
            </ul>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Create a Meta App at developers.facebook.com and add the Instagram Basic Display product.
          </p>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOauthNotConfigured(null)}>Close</Button>
            <Button className="flex-1" onClick={() => {
              setOauthNotConfigured(null)
              setConnectingPlatform(oauthNotConfigured)
              setPlatformUrlInput('')
            }}>Connect Manually</Button>
          </div>
        </Modal>
      )}

      {/* Connect Platform Modal */}
      {connectingPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">
              {connectedPlatforms[connectingPlatform] ? 'Manage' : 'Connect'} {connectingPlatform === 'instagram' ? 'Instagram' : connectingPlatform === 'tiktok' ? 'TikTok' : 'YouTube'}
            </h3>
            
            {connectedPlatforms[connectingPlatform] ? (
              <>
                <div className="mt-4 rounded-lg bg-emerald-50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">Connected</span>
                  </div>
                  <p className="mt-1 text-sm text-emerald-600">{connectedPlatforms[connectingPlatform]?.handle}</p>
                  <p className="mt-0.5 text-[10px] text-emerald-600/60">
                    Since {connectedPlatforms[connectingPlatform]?.connectedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (connectingPlatform === 'instagram') {
                        handleInstagramDisconnect()
                      } else {
                        handleDisconnect(connectingPlatform)
                      }
                    }}
                  >
                    Disconnect
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => setConnectingPlatform(null)}
                  >
                    Done
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your {connectingPlatform} profile URL to connect.
                </p>
                <Input
                  value={platformUrlInput}
                  onChange={(e) => setPlatformUrlInput(e.target.value)}
                  placeholder={getPlaceholder(connectingPlatform)}
                  className="mt-4"
                />
                {connectError && (
                  <p className="mt-2 text-xs text-red-600">{connectError}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => {
                      setConnectingPlatform(null)
                      setConnectError(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={handleConnectPlatform}
                    disabled={connectLoading || !platformUrlInput}
                  >
                    {connectLoading ? 'Connecting...' : 'Connect'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Creator Dashboard</h1>
          <Link 
            href="/dashboard/creator/offers"
            className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90"
          >
            View Offers
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {/* Profile Card */}
            <Panel variant="elevated" className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Left: Avatar + actions */}
                <div className="border-b border-foreground/5 bg-foreground/[0.01] p-5 md:w-56 md:border-b-0 md:border-r">
                  <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-0">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 md:h-20 md:w-20" />
                      <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-amber-500" />
                    </div>
                    <div className="md:mt-3">
                      <p className="text-lg font-semibold">{profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{profile.handle}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <CopyLinkButton 
                      handle={profile.handle} 
                      onCopy={() => setToastMessage('Profile link copied!')} 
                    />
                  </div>

                  <div className="mt-4">
                    <CompletenessBar percent={adjustedCompleteness} />
                  </div>

                  {/* Status indicators */}
                  <div className="mt-4 flex flex-col gap-2 border-t border-foreground/5 pt-4">
                    <div className="flex items-center gap-2 text-xs">
                      <StatusDot active color="bg-amber-500" />
                      <span>Beta access</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <StatusDot active color="bg-emerald-500" />
                      <span>Open to offers</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
                      <StatusDot active={false} color="bg-gray-300" />
                      <span>Verified</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button size="sm" className="w-full text-xs" onClick={() => {
                      setEditDisplayName(profile.displayName)
                      setEditHandle(profile.handle)
                      setEditProfileOpen(true)
                    }}>Edit Profile</Button>
                    <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                      <Link href={`/creators/${profile.handle}`}>View Public</Link>
                    </Button>
                  </div>
                </div>

                {/* Right: Editable sections */}
                <div className="p-5 flex-1">
                  <Panel variant="inset" className="p-4">
                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Bio */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">About</span>
                          <button 
                            onClick={() => {
                              setEditBio(profile.bio)
                              setEditNiches(profile.niches)
                              setEditAboutOpen(true)
                            }}
                            className="text-[10px] font-medium text-primary hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{profile.bio}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {profile.niches.map(n => (
                            <span key={n} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{n}</span>
                          ))}
                        </div>
                      </div>

                      {/* Platforms */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Platforms</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {(["instagram", "tiktok", "youtube"] as Platform[]).map(p => {
                            const connection = connectedPlatforms[p]
                            const isConnected = !!connection
                            const label = p === 'instagram' ? 'Instagram' : p === 'tiktok' ? 'TikTok' : 'YouTube'
                            const countLabel = p === 'youtube' ? 'subscribers' : 'followers'
                            
                            const mockCounts: Record<Platform, number> = {
                              instagram: platformSyncData.instagram?.count || 12400,
                              tiktok: platformSyncData.tiktok?.count || 8700,
                              youtube: platformSyncData.youtube?.count || 3200,
                            }
                            const followerCount = isConnected ? mockCounts[p] : null
                            const lastSynced = platformSyncData[p]?.lastSynced
                            
                            const formatCount = (n: number) => {
                              if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
                              if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
                              return n.toString()
                            }
                            
                            const formatSyncTime = (date: Date) => {
                              const diff = Date.now() - date.getTime()
                              if (diff < 60000) return 'just now'
                              if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
                              if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
                              return date.toLocaleDateString()
                            }
                            
                            return (
                              <div key={p} className="rounded-lg bg-foreground/[0.02] p-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    {isConnected && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    )}
                                    <span className={isConnected ? "font-medium" : "text-muted-foreground"}>{label}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isConnected && (
                                      <button 
                                        onClick={() => handleSyncPlatform(p)}
                                        className="text-[9px] text-muted-foreground hover:text-primary"
                                      >
                                        Sync
                                      </button>
                                    )}
                                    {p === 'instagram' ? (
                                      isConnected ? (
                                        <button 
                                          onClick={() => {
                                            setConnectingPlatform(p)
                                            setConnectError(null)
                                          }}
                                          className="text-[10px] font-medium text-primary hover:underline"
                                        >
                                          Manage
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={handleInstagramOAuth}
                                          className="text-[10px] font-medium text-primary hover:underline"
                                        >
                                          Connect
                                        </button>
                                      )
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          setConnectingPlatform(p)
                                          setPlatformUrlInput('')
                                          setConnectError(null)
                                        }}
                                        className="text-[10px] font-medium text-primary hover:underline"
                                      >
                                        {isConnected ? "Manage" : "Connect"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[10px]">
                                  <span className={isConnected ? "font-medium" : "text-muted-foreground/50"}>
                                    {followerCount ? formatCount(followerCount) : "—"} {countLabel}
                                  </span>
                                  <span className="text-muted-foreground/50">
                                    {isConnected && lastSynced ? `Synced ${formatSyncTime(lastSynced)}` : isConnected ? "Not synced" : "Not connected"}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Deal prefs */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rates</span>
                          <button 
                            onClick={() => {
                              setEditMinFlat(profile.dealPrefs.minFlat?.toString() || '')
                              setEditMinPercent(profile.dealPrefs.minPercent?.toString() || '')
                              setEditPostForStay(profile.dealPrefs.postForStay)
                              setEditDealPrefsOpen(true)
                            }}
                            className="text-[10px] font-medium text-primary hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base rate</span>
                            <span>{profile.dealPrefs.minFlat ? `$${profile.dealPrefs.minFlat}` : '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Traffic bonus</span>
                            <span>{profile.dealPrefs.minPercent ? `${profile.dealPrefs.minPercent}%` : '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Post-for-stay</span>
                            <span>{profile.dealPrefs.postForStay ? 'Open' : 'Closed'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Deliverables</span>
                          <button 
                            onClick={() => {
                              setEditDeliverables(profile.deliverables)
                              setEditDeliverablesOpen(true)
                            }}
                            className="text-[10px] font-medium text-primary hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {profile.deliverables.map(d => (
                            <span key={d} className="rounded-full border border-foreground/10 bg-white px-2 py-0.5 text-[10px]">{d}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Panel>
                </div>
              </div>
            </Panel>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric value="247" label="Total Clicks" caption="This month" size="md" />
              <Metric value="189" label="Unique Visitors" size="md" />
              <Metric value="2" label="Active Collabs" size="md" />
              <Metric value="$850" label="Pending Payout" size="md" />
            </div>

            {/* Campaign Timeline */}
            <CampaignTimeline />
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Earnings */}
            <EarningsPanel onComingSoon={(feature) => setComingSoonModal(feature)} />

            {/* Offers */}
            <Panel>
              <PanelHeader title="Pending Offers" actions={<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">2 new</span>} />
              <PanelContent className="p-0">
                <Link href="/dashboard/creator/offers" className="block px-4 py-3 transition-colors hover:bg-foreground/[0.02]">
                  <p className="text-sm font-medium">Mountain View Retreats</p>
                  <p className="text-xs text-muted-foreground">$400/post + bonus · Cozy A-Frame Cabin</p>
                </Link>
                <Link href="/dashboard/creator/offers" className="block border-t border-foreground/5 px-4 py-3 transition-colors hover:bg-foreground/[0.02]">
                  <p className="text-sm font-medium">Coastal Getaways</p>
                  <p className="text-xs text-muted-foreground">$500/post · Modern Beach House</p>
                </Link>
              </PanelContent>
            </Panel>

            {/* Quick links */}
            <Panel>
              <PanelContent className="space-y-1.5 py-3">
                <Link href="/dashboard/creator/offers" className="flex items-center justify-between rounded-lg bg-foreground/[0.02] px-3 py-2 text-xs transition-colors hover:bg-foreground/[0.04]">
                  View all offers
                  <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
                <Link href="/dashboard/analytics" className="flex items-center justify-between rounded-lg bg-foreground/[0.02] px-3 py-2 text-xs transition-colors hover:bg-foreground/[0.04]">
                  Link analytics
                  <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
                <Link href="/how-to/creators" className="flex items-center justify-between rounded-lg bg-foreground/[0.02] px-3 py-2 text-xs transition-colors hover:bg-foreground/[0.04]">
                  How it works
                  <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </PanelContent>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}
