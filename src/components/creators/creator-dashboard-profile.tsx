"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel"
import { Metric } from "@/components/ui/metric"
import { EdgeBlur } from "@/components/ui/edge-blur"

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
  return (
    <div className="relative min-h-screen bg-[hsl(210,20%,99%)]">
      <EdgeBlur />

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
                    <CompletenessBar percent={creator.completeness} />
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
                          <button className="text-[10px] font-medium text-primary hover:underline">Manage</button>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          {["Instagram", "TikTok", "YouTube"].map(p => (
                            <div key={p} className="flex items-center justify-between">
                              <span>{p}</span>
                              <button className="text-[10px] font-medium text-primary">Connect</button>
                            </div>
                          ))}
                        </div>
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
