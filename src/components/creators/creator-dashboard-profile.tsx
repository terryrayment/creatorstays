"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Refined edge blur - fewer, more intentional
function RefinedEdgeBlur() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Primary blur - top right, cyan tint */}
      <div className="absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full bg-[hsl(199,89%,48%)]/6 blur-[200px]" />
      {/* Secondary blur - bottom left, blue tint */}
      <div className="absolute -bottom-60 -left-40 h-[600px] w-[600px] rounded-full bg-[hsl(213,94%,45%)]/5 blur-[180px]" />
    </div>
  )
}

// Panel-specific subtle blur
function PanelBlur() {
  return (
    <div className="pointer-events-none absolute -inset-4 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/3 blur-[100px]" />
    </div>
  )
}

// Status Rail - vertical indicator strip
function StatusRail() {
  const statuses = [
    { label: "Beta", color: "bg-amber-500", active: true },
    { label: "Open to offers", color: "bg-emerald-500", active: true },
    { label: "Verified", color: "bg-gray-300", active: false },
  ]
  
  return (
    <div className="flex flex-col gap-3">
      {statuses.map((status) => (
        <div key={status.label} className="flex items-center gap-2.5">
          <div className={`h-2 w-2 rounded-full ${status.active ? status.color : "bg-gray-200"}`} />
          <span className={`text-xs font-medium ${status.active ? "text-foreground" : "text-muted-foreground/50"}`}>
            {status.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// Profile completeness bar
function CompletenessBar({ percent }: { percent: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Profile</span>
        <span className="font-medium">{percent}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/5">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

// Copy button for creator link
function CreatorLinkField({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false)
  const link = `creatorstays.com/c/${handle}`

  const copy = () => {
    navigator.clipboard.writeText(`https://${link}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      <div className="flex items-center gap-2 rounded-lg border border-foreground/5 bg-foreground/[0.02] px-3 py-2 transition-all duration-200 group-hover:border-foreground/10 group-hover:bg-foreground/[0.04]">
        <svg className="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        <span className="flex-1 truncate text-xs text-muted-foreground">{link}</span>
        <button 
          onClick={copy}
          className="shrink-0 rounded px-2 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  )
}

// Refined section panel with hover effects
function Section({ 
  title, 
  children, 
  action
}: { 
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-xl transition-all duration-200">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

// Field display
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={!value ? "text-muted-foreground/40" : "font-medium"}>{value || "—"}</span>
    </div>
  )
}

// Social platform row
function SocialPlatform({ name, connected }: { name: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm">{name}</span>
      {connected ? (
        <span className="text-[10px] font-medium text-emerald-600">Connected</span>
      ) : (
        <button className="text-[10px] font-medium text-primary hover:underline">Connect</button>
      )}
    </div>
  )
}

// Compact metric
function Metric({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {note && <p className="text-[9px] text-muted-foreground/50">{note}</p>}
    </div>
  )
}

// Empty state for sidebar
function EmptySlot({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-foreground/10 bg-foreground/[0.01] p-4 text-center">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-[10px] text-muted-foreground/60">{description}</p>
    </div>
  )
}

// Mock data
const creator = {
  displayName: "Your Profile",
  handle: "yourhandle",
  bio: "Add a bio to tell hosts about your content style and audience.",
  niches: ["Travel", "Lifestyle"],
  platforms: { instagram: false, tiktok: false, youtube: false },
  dealPrefs: { flatFee: null as number | null, percent: null as number | null, postForStay: true, gifted: true },
  deliverables: ["Feed posts", "Reels", "Stories"],
  completeness: 35,
}

export function CreatorDashboardProfile() {
  return (
    <div className="relative min-h-screen bg-[hsl(210,20%,99%)]">
      <RefinedEdgeBlur />

      {/* Minimal top bar */}
      <div className="border-b border-foreground/5 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">BETA</span>
            <span className="text-xs text-muted-foreground">Creator Dashboard</span>
          </div>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Main Panel with Asymmetric Layout */}
        <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white/60 shadow-xl shadow-black/[0.03] backdrop-blur-sm">
          <PanelBlur />
          
          <div className="grid lg:grid-cols-[280px_1fr]">
            {/* Left Column - Identity */}
            <div className="border-b border-foreground/5 p-6 lg:border-b-0 lg:border-r">
              {/* Avatar + Name */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-white shadow-lg shadow-primary/20">
                  YP
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-lg font-semibold">{creator.displayName}</h1>
                  <p className="text-sm text-muted-foreground">@{creator.handle}</p>
                </div>
              </div>

              {/* Creator Link */}
              <div className="mt-5">
                <CreatorLinkField handle={creator.handle} />
              </div>

              {/* Completeness */}
              <div className="mt-5">
                <CompletenessBar percent={creator.completeness} />
              </div>

              {/* Status Rail */}
              <div className="mt-6 border-t border-foreground/5 pt-5">
                <StatusRail />
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <Button className="w-full justify-center rounded-lg text-xs" size="sm">
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-center rounded-lg text-xs" size="sm" asChild>
                  <Link href="/creators/sample-travel">View Public Page</Link>
                </Button>
              </div>

              {/* Metrics (Compact) */}
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-foreground/5 pt-5">
                <Metric value="—" label="Followers" note="auto" />
                <Metric value="—" label="Views" note="auto" />
                <Metric value="—" label="Rate" note="auto" />
              </div>
            </div>

            {/* Right Column - Editable Sections */}
            <div className="p-6">
              {/* Inset Panel for main content */}
              <div className="rounded-xl bg-foreground/[0.01] p-5">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Bio */}
                  <Section title="About" action={<button className="text-[10px] font-medium text-primary hover:underline">Edit</button>}>
                    <p className="text-sm leading-relaxed text-muted-foreground">{creator.bio}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {creator.niches.map((n) => (
                        <span key={n} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">{n}</span>
                      ))}
                      <button className="rounded-full border border-dashed border-foreground/15 px-2.5 py-0.5 text-[10px] text-muted-foreground hover:border-foreground/30">+ Add</button>
                    </div>
                  </Section>

                  {/* Socials */}
                  <Section title="Platforms" action={<button className="text-[10px] font-medium text-primary hover:underline">Manage</button>}>
                    <div className="space-y-1">
                      <SocialPlatform name="Instagram" connected={creator.platforms.instagram} />
                      <SocialPlatform name="TikTok" connected={creator.platforms.tiktok} />
                      <SocialPlatform name="YouTube" connected={creator.platforms.youtube} />
                    </div>
                    <p className="mt-3 text-[10px] text-muted-foreground/60">Connect to auto-sync stats after beta.</p>
                  </Section>

                  {/* Deal Preferences */}
                  <Section title="Deal Preferences" action={<button className="text-[10px] font-medium text-primary hover:underline">Edit</button>}>
                    <div className="divide-y divide-foreground/5 text-sm">
                      <Field label="Min flat fee" value={creator.dealPrefs.flatFee ? `$${creator.dealPrefs.flatFee}` : undefined} />
                      <Field label="Min commission" value={creator.dealPrefs.percent ? `${creator.dealPrefs.percent}%` : undefined} />
                      <Field label="Post-for-stay" value={creator.dealPrefs.postForStay ? "Open" : "No"} />
                      <Field label="Gifted stays" value={creator.dealPrefs.gifted ? "Open" : "No"} />
                    </div>
                  </Section>

                  {/* Deliverables */}
                  <Section title="Deliverables" action={<button className="text-[10px] font-medium text-primary hover:underline">Edit</button>}>
                    <div className="flex flex-wrap gap-1.5">
                      {creator.deliverables.map((d) => (
                        <span key={d} className="rounded-full border border-foreground/10 bg-white px-3 py-1 text-xs">{d}</span>
                      ))}
                      <button className="rounded-full border border-dashed border-foreground/15 px-3 py-1 text-xs text-muted-foreground hover:border-foreground/30">+ Add</button>
                    </div>
                  </Section>
                </div>
              </div>

              {/* Bottom Row - Inbox + Offers */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-foreground/5 bg-white/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inbox</h3>
                    <span className="text-[10px] text-muted-foreground/50">0 messages</span>
                  </div>
                  <EmptySlot title="No messages" description="Host messaging launches after beta" />
                </div>

                <div className="rounded-xl border border-foreground/5 bg-white/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Offers</h3>
                    <span className="text-[10px] text-muted-foreground/50">0 active</span>
                  </div>
                  <EmptySlot title="No offers yet" description="Offers from hosts appear here" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <Link href="/how-it-works" className="hover:text-foreground">How it works</Link>
          <span className="text-foreground/20">•</span>
          <Link href="/hosts" className="hover:text-foreground">For hosts</Link>
          <span className="text-foreground/20">•</span>
          <Link href="/waitlist" className="hover:text-foreground">Creator Waitlist</Link>
        </div>
      </div>
    </div>
  )
}
