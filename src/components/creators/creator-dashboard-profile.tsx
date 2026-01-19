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

// Copy link button
function CopyLinkButton({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false)
  const link = `creatorstays.com/c/${handle}`

  const copy = () => {
    navigator.clipboard.writeText(`https://${link}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      <span className="text-[10px] font-medium text-primary">{copied ? "Copied!" : "Copy"}</span>
    </button>
  )
}

// Empty state
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="h-10 w-10 rounded-full bg-muted/50" />
      <p className="mt-3 text-xs font-medium">{title}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
    </div>
  )
}

// Mock data
const creator = {
  displayName: "Your Profile",
  handle: "yourhandle",
  bio: "Add a bio to tell hosts about your content style.",
  niches: ["Travel", "Lifestyle"],
  platforms: { instagram: false, tiktok: false, youtube: false },
  dealPrefs: { flatFee: null as number | null, percent: null as number | null, postForStay: true, gifted: true },
  deliverables: ["Feed posts", "Reels", "Stories"],
  completeness: 35,
}

export function CreatorDashboardProfile() {
  const searchParams = useSearchParams()
  
  // Platform connection state
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatforms>({})
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null)
  const [platformUrlInput, setPlatformUrlInput] = useState('')
  const [connectLoading, setConnectLoading] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  // Check for Instagram OAuth connection on mount and URL params
  useEffect(() => {
    // Check if returning from OAuth
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    
    if (error) {
      console.error('OAuth error:', error, searchParams.get('message'))
      setConnectError(`Connection failed: ${error}`)
    }
    
    // Check for Instagram cookie
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
        }
      } catch (e) {
        console.error('Failed to parse Instagram cookie:', e)
      }
    }
  }, [searchParams])

  // Calculate completeness based on connections
  const connectionCount = Object.keys(connectedPlatforms).length
  const baseCompleteness = creator.completeness
  const adjustedCompleteness = Math.min(100, baseCompleteness + (connectionCount * 10))

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
        setConnectedPlatforms(prev => ({
          ...prev,
          [connectingPlatform]: {
            url: platformUrlInput,
            handle: data.handle,
            connectedAt: new Date(),
          },
        }))
        setConnectingPlatform(null)
        setPlatformUrlInput('')
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
    setConnectingPlatform(null)
  }

  const getPlaceholder = (platform: Platform) => {
    switch (platform) {
      case 'instagram': return 'instagram.com/username'
      case 'tiktok': return 'tiktok.com/@username'
      case 'youtube': return 'youtube.com/@channel'
    }
  }

  return (
    <div className="relative min-h-screen bg-[hsl(210,20%,99%)]">
      <EdgeBlur />

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
                <p className="mt-3 text-xs text-muted-foreground">
                  Follower counts and analytics will sync automatically after beta.
                </p>
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
            ) : connectingPlatform === 'instagram' ? (
              // Instagram OAuth - no URL input needed
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect your Instagram account securely via Meta.
                </p>
                <p className="mt-3 text-[10px] text-muted-foreground">
                  Follower counts and analytics will sync automatically after beta.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => setConnectingPlatform(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={handleInstagramOAuth}
                  >
                    Connect with Meta
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your profile URL to connect.
                </p>
                
                <div className="mt-4">
                  <Input
                    placeholder={getPlaceholder(connectingPlatform)}
                    value={platformUrlInput}
                    onChange={(e) => setPlatformUrlInput(e.target.value)}
                    className="text-sm"
                  />
                  {connectError && (
                    <p className="mt-1 text-xs text-red-600">{connectError}</p>
                  )}
                </div>
                
                <p className="mt-3 text-[10px] text-muted-foreground">
                  Follower counts and analytics will sync automatically after beta.
                </p>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => setConnectingPlatform(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={handleConnectPlatform}
                    disabled={connectLoading || !platformUrlInput}
                  >
                    {connectLoading ? 'Connecting…' : 'Save & Connect'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="border-b border-foreground/5 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">BETA</span>
            <span className="text-xs text-muted-foreground">Creator Dashboard</span>
          </div>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← Back</Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Main grid: Profile + Sidebar */}
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          
          {/* Main column */}
          <div className="space-y-5">
            {/* Profile Panel */}
            <Panel variant="elevated" className="overflow-hidden">
              <div className="grid md:grid-cols-[240px_1fr]">
                {/* Left: Identity */}
                <div className="border-b border-foreground/5 p-5 md:border-b-0 md:border-r">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-white shadow-lg shadow-primary/20">
                      YP
                    </div>
                    <div className="min-w-0">
                      <h1 className="truncate text-base font-semibold">{creator.displayName}</h1>
                      <p className="text-xs text-muted-foreground">@{creator.handle}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <CopyLinkButton handle={creator.handle} />
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
                    <Button size="sm" className="w-full text-xs">Edit Profile</Button>
                    <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                      <Link href="/creators/sample-travel">View Public</Link>
                    </Button>
                  </div>
                </div>

                {/* Right: Editable sections */}
                <div className="p-5">
                  <Panel variant="inset" className="p-4">
                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Bio */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">About</span>
                          <button className="text-[10px] font-medium text-primary hover:underline">Edit</button>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{creator.bio}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {creator.niches.map(n => (
                            <span key={n} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{n}</span>
                          ))}
                        </div>
                      </div>

                      {/* Platforms */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Platforms</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          {(["instagram", "tiktok", "youtube"] as Platform[]).map(p => {
                            const connection = connectedPlatforms[p]
                            const isConnected = !!connection
                            const label = p === 'instagram' ? 'Instagram' : p === 'tiktok' ? 'TikTok' : 'YouTube'
                            
                            return (
                              <div key={p} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {isConnected && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  )}
                                  <span className={isConnected ? "font-medium" : ""}>{label}</span>
                                  {isConnected && (
                                    <span className="text-[10px] text-muted-foreground">{connection.handle}</span>
                                  )}
                                </div>
                                {p === 'instagram' ? (
                                  // Instagram uses OAuth
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
                                  // TikTok/YouTube use manual URL entry
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
                            )
                          })}
                        </div>
                        <p className="mt-2 text-[9px] text-muted-foreground/60">
                          Analytics sync coming after beta.
                        </p>
                      </div>

                      {/* Deal prefs */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Deal Prefs</span>
                          <button className="text-[10px] font-medium text-primary hover:underline">Edit</button>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between"><span className="text-muted-foreground">Min flat</span><span>—</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Min %</span><span>—</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Post-for-stay</span><span>Open</span></div>
                        </div>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Deliverables</span>
                          <button className="text-[10px] font-medium text-primary hover:underline">Edit</button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {creator.deliverables.map(d => (
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
              <Metric value="12%" label="Avg Commission" size="md" />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Offers */}
            <Panel>
              <PanelHeader title="Pending Offers" actions={<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">2 new</span>} />
              <PanelContent className="p-0">
                <Link href="/dashboard/creator/offers" className="block px-4 py-3 transition-colors hover:bg-foreground/[0.02]">
                  <p className="text-sm font-medium">Mountain View Retreats</p>
                  <p className="text-xs text-muted-foreground">10% affiliate · Cozy A-Frame Cabin</p>
                </Link>
                <Link href="/dashboard/creator/offers" className="block border-t border-foreground/5 px-4 py-3 transition-colors hover:bg-foreground/[0.02]">
                  <p className="text-sm font-medium">Coastal Getaways</p>
                  <p className="text-xs text-muted-foreground">$500 flat · Modern Beach House</p>
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
                <Link href="/how-it-works" className="flex items-center justify-between rounded-lg bg-foreground/[0.02] px-3 py-2 text-xs transition-colors hover:bg-foreground/[0.04]">
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
