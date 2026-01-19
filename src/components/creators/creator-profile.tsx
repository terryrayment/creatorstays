"use client"

import { useState } from "react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"

export interface CreatorProfile {
  handle: string
  displayName: string
  avatar?: string
  bio: string
  location: string
  niches: string[]
  platforms: {
    instagram?: string
    tiktok?: string
    youtube?: string
  }
  stats: {
    followers: number | null
    engagementRate: number | null
    avgViews: number | null
  }
  dealPreferences: {
    types: ("percent" | "flat" | "post-for-stay")[]
    minimumFlatFee?: number
    minimumPercent?: number
    openToGiftedStays: boolean
  }
  deliverables?: string[]
  mediaKitUrl?: string
  pastCollabs?: string[]
  isSample?: boolean
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`creator-panel rounded-xl border border-foreground/5 bg-white/50 p-4 transition-all ${className}`}>
      {children}
    </div>
  )
}

function MetricTile({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-foreground/[0.02] px-4 py-3">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {note && <p className="text-[9px] text-muted-foreground/50">{note}</p>}
    </div>
  )
}

function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-xl border border-foreground/10 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Host messaging launches soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">Sign up as a host to get early access and be notified when you can invite creators.</p>
        <div className="mt-5 flex gap-3">
          <Button asChild className="flex-1"><Link href="/hosts">Sign Up as Host</Link></Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
        </div>
      </div>
    </div>
  )
}

function CopyLinkButton({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false)
  const copyLink = () => {
    navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/creators/${handle}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="outline" size="sm" onClick={copyLink} className="h-8 gap-1.5 text-xs">
      {copied ? (
        <><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Copied</>
      ) : (
        <><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>Copy link</>
      )}
    </Button>
  )
}

export function CreatorProfileView({ creator }: { creator: CreatorProfile }) {
  const [showInviteModal, setShowInviteModal] = useState(false)

  const dealTypeLabels: Record<string, string> = { percent: "Commission", flat: "Flat fee", "post-for-stay": "Post-for-stay" }
  const defaultDeliverables = [
    { title: "Feed Posts", desc: "High-quality static posts with property tags and booking link" },
    { title: "Reels / Short Video", desc: "Engaging vertical video showcasing the property" },
    { title: "Story Coverage", desc: "Real-time story updates with swipe-up links" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Navbar />
      
      <main className="flex-1 py-6">
        <Container>
          {/* Header Band */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-2xl font-semibold text-primary">
                {creator.displayName.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold">{creator.displayName}</h1>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700">Beta</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-medium text-emerald-700">Open to offers</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">@{creator.handle}</p>
                <p className="mt-1 text-xs text-muted-foreground">{creator.niches.join(" · ")} creator</p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="h-8 text-xs" onClick={() => setShowInviteModal(true)}>Invite</Button>
              <CopyLinkButton handle={creator.handle} />
            </div>
          </div>

          {/* Stats Strip */}
          <div className="mb-6 flex flex-wrap gap-2">
            <MetricTile value={creator.stats.followers ? `${(creator.stats.followers / 1000).toFixed(0)}K` : "—"} label="Followers" note="auto after beta" />
            <MetricTile value={creator.stats.engagementRate ? `${creator.stats.engagementRate}%` : "—"} label="Engagement" note="auto after beta" />
            <MetricTile value={creator.stats.avgViews ? `${(creator.stats.avgViews / 1000).toFixed(0)}K` : "—"} label="Avg Views" note="auto after beta" />
            <MetricTile value={creator.location.split(",")[0]} label="Location" />
          </div>

          {/* Main Grid: 8 + 4 */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Left Column (8) */}
            <div className="space-y-4 lg:col-span-8">
              {/* About */}
              <Panel>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">About</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{creator.bio}</p>
              </Panel>

              {/* Niches */}
              <Panel>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Niches</h2>
                <div className="flex flex-wrap gap-1.5">
                  {creator.niches.map(niche => (
                    <span key={niche} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">{niche}</span>
                  ))}
                </div>
              </Panel>

              {/* Deliverables */}
              <Panel>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Typical Deliverables</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {defaultDeliverables.map(d => (
                    <div key={d.title} className="rounded-lg bg-foreground/[0.02] p-3">
                      <p className="text-xs font-medium">{d.title}</p>
                      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{d.desc}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Deal Preferences */}
              <Panel>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Deal Preferences</h2>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between border-b border-foreground/5 pb-2">
                    <span className="text-muted-foreground">Deal types</span>
                    <span className="font-medium">{creator.dealPreferences.types.map(t => dealTypeLabels[t]).join(", ")}</span>
                  </div>
                  {creator.dealPreferences.minimumFlatFee && (
                    <div className="flex justify-between border-b border-foreground/5 pb-2">
                      <span className="text-muted-foreground">Min flat fee</span>
                      <span className="font-medium">${creator.dealPreferences.minimumFlatFee.toLocaleString()}</span>
                    </div>
                  )}
                  {creator.dealPreferences.minimumPercent && (
                    <div className="flex justify-between border-b border-foreground/5 pb-2">
                      <span className="text-muted-foreground">Min commission</span>
                      <span className="font-medium">{creator.dealPreferences.minimumPercent}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open to gifted stays</span>
                    <span className="font-medium">{creator.dealPreferences.openToGiftedStays ? "Yes" : "No"}</span>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Right Column (4) */}
            <div className="space-y-4 lg:col-span-4">
              {/* Platforms */}
              <Panel>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Platforms</h2>
                <div className="space-y-2">
                  {creator.platforms.instagram && (
                    <a href={`https://instagram.com/${creator.platforms.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-foreground/[0.02] px-3 py-2 text-xs font-medium transition-colors hover:bg-foreground/[0.05]">
                      <svg className="h-4 w-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/></svg>
                      Instagram
                      <span className="ml-auto text-muted-foreground">↗</span>
                    </a>
                  )}
                  {creator.platforms.tiktok && (
                    <a href={`https://tiktok.com/@${creator.platforms.tiktok}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-foreground/[0.02] px-3 py-2 text-xs font-medium transition-colors hover:bg-foreground/[0.05]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
                      TikTok
                      <span className="ml-auto text-muted-foreground">↗</span>
                    </a>
                  )}
                  {creator.platforms.youtube && (
                    <a href={`https://youtube.com/@${creator.platforms.youtube}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-foreground/[0.02] px-3 py-2 text-xs font-medium transition-colors hover:bg-foreground/[0.05]">
                      <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/></svg>
                      YouTube
                      <span className="ml-auto text-muted-foreground">↗</span>
                    </a>
                  )}
                </div>
              </Panel>

              {/* Media Kit */}
              <Panel>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Media Kit</h2>
                <a href={`/api/creators/${creator.handle}/media-kit`} download className="flex items-center gap-2 text-xs font-medium text-primary hover:underline">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  Download media kit
                </a>
              </Panel>

              {/* Response Time */}
              <Panel>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Response</h2>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Avg response</span><span className="font-medium">—</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Last active</span><span className="font-medium">—</span></div>
                </div>
                <p className="mt-2 text-[9px] text-muted-foreground/50">Available after beta</p>
              </Panel>

              {/* CTA */}
              <Panel className="border-primary/10 bg-primary/[0.02]">
                <p className="mb-3 text-xs text-muted-foreground">Ready to work with this creator?</p>
                <Button size="sm" className="w-full text-xs" onClick={() => setShowInviteModal(true)}>Send Invite</Button>
              </Panel>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  )
}
