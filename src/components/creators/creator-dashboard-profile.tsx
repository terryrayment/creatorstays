"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Soft pastel edge gradients like IEG4
function PastelEdgeGradients() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Top right - cyan/sky gradient */}
      <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-[hsl(199,89%,48%)]/8 blur-[180px]" />
      {/* Bottom left - blue gradient */}
      <div className="absolute -bottom-48 -left-48 h-[700px] w-[700px] rounded-full bg-[hsl(213,94%,45%)]/6 blur-[200px]" />
      {/* Center accent */}
      <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[hsl(199,89%,48%)]/4 blur-[150px]" />
      {/* Subtle warm accent bottom right */}
      <div className="absolute -bottom-20 -right-20 h-[300px] w-[400px] rounded-full bg-amber-400/5 blur-[120px]" />
    </div>
  )
}

// Floating chip/quote element
function FloatingChip({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={`absolute hidden rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-medium shadow-lg shadow-black/5 backdrop-blur-sm md:flex items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}

// Modern stat tile with variants
function MetricTile({ 
  value, 
  label, 
  note,
  size = "medium",
  accent = false
}: { 
  value: string
  label: string
  note?: string
  size?: "large" | "medium" | "compact"
  accent?: boolean
}) {
  const sizeClasses = {
    large: "col-span-2 row-span-2 p-8",
    medium: "col-span-1 row-span-1 p-5",
    compact: "col-span-1 row-span-1 p-4"
  }
  const valueClasses = {
    large: "text-6xl md:text-7xl",
    medium: "text-3xl md:text-4xl",
    compact: "text-xl"
  }
  
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 ${sizeClasses[size]} ${accent ? "bg-gradient-to-br from-primary/5 to-accent/5" : ""}`}>
      <p className={`font-bold tracking-tight text-foreground ${valueClasses[size]}`}>{value}</p>
      <p className={`mt-1 font-medium text-muted-foreground ${size === "large" ? "text-base" : "text-xs"}`}>{label}</p>
      {note && <p className={`mt-0.5 text-muted-foreground/60 ${size === "large" ? "text-sm" : "text-[10px]"}`}>{note}</p>}
    </div>
  )
}

// Status tile (for Open to offers)
function StatusTile({ status, label }: { status: boolean; label: string }) {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={`h-3 w-3 rounded-full ${status ? "bg-emerald-500" : "bg-gray-300"}`} />
      <div>
        <p className="text-sm font-semibold">{status ? "Yes" : "No"}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

// Modern panel card
function Panel({ 
  title, 
  children, 
  action,
  className = ""
}: { 
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-foreground/5 px-5 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

// Empty state
function EmptyState({ icon, title, description, cta }: { 
  icon: React.ReactNode
  title: string
  description: string
  cta?: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      {cta && (
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </div>
  )
}

// Field row
function FieldRow({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right font-medium ${!value ? "text-muted-foreground/50" : ""}`}>
        {value || placeholder || "—"}
      </span>
    </div>
  )
}

// Social row
function SocialRow({ platform, connected }: { platform: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="font-medium">{platform}</span>
      {connected ? (
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">Connected</span>
      ) : (
        <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs">
          Connect
        </Button>
      )}
    </div>
  )
}

// Copy link button
function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/creators/yourhandle`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" onClick={copyLink} className="rounded-full">
      {copied ? (
        <>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          Copy link
        </>
      )}
    </Button>
  )
}

// Mock data
const mockCreator = {
  displayName: "Your Profile",
  handle: "yourhandle",
  bio: "Add a bio to tell hosts about your content style and what makes you unique.",
  niches: ["Travel", "Lifestyle"],
  dealPreferences: {
    minimumFlatFee: null,
    minimumPercent: null,
    postForStay: true,
    giftedStays: true,
  },
  deliverables: ["Feed posts", "Reels", "Story coverage"],
  openToOffers: true,
}

export function CreatorDashboardProfile() {
  const [creator] = useState(mockCreator)

  return (
    <div className="relative min-h-screen">
      <PastelEdgeGradients />

      {/* Beta banner */}
      <div className="border-b border-amber-200/50 bg-amber-50/80 px-4 py-2 text-center text-xs backdrop-blur-sm">
        <span className="mr-2 inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-700">BETA</span>
        <span className="text-amber-700">Dashboard preview — auth coming soon</span>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Panel */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-black/5 backdrop-blur-sm md:p-8">
          {/* Floating chips */}
          <FloatingChip className="top-4 right-4 lg:top-6 lg:right-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Open to offers
          </FloatingChip>
          <FloatingChip className="bottom-4 right-24 lg:bottom-6 lg:right-32">
            Preferred: Reels + Stories
          </FloatingChip>
          <FloatingChip className="top-16 right-8 lg:top-20 lg:right-12 opacity-80">
            Min flat: $—
          </FloatingChip>

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Avatar + Info */}
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white shadow-lg shadow-primary/20 md:h-20 md:w-20">
                YP
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{creator.displayName}</h1>
                <p className="mt-0.5 text-muted-foreground">@{creator.handle}</p>
              </div>
            </div>

            {/* Right: CTAs */}
            <div className="flex gap-3">
              <Button className="rounded-full px-6">
                Edit profile
              </Button>
              <CopyLinkButton />
            </div>
          </div>
        </div>

        {/* Metrics Mosaic Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
          {/* Large tile - Followers */}
          <MetricTile 
            value="—" 
            label="Followers" 
            note="Auto-sync after beta"
            size="large"
            accent
          />
          {/* Medium tiles */}
          <MetricTile 
            value="—" 
            label="Avg. Views" 
            note="Auto-sync"
            size="medium"
          />
          <MetricTile 
            value="—" 
            label="Engagement" 
            note="Auto-sync"
            size="medium"
          />
          {/* Status tile */}
          <StatusTile status={creator.openToOffers} label="Open to offers" />
          {/* Response rate */}
          <MetricTile 
            value="—" 
            label="Response Rate" 
            note="After first offer"
            size="compact"
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-4 lg:col-span-8">
            {/* Bio + Niches */}
            <Panel 
              title="Bio & Niches" 
              action={<Button variant="ghost" size="sm" className="h-7 rounded-full text-xs">Edit</Button>}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">{creator.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {creator.niches.map((niche) => (
                  <span key={niche} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {niche}
                  </span>
                ))}
                <button className="rounded-full border border-dashed border-foreground/20 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground">
                  + Add niche
                </button>
              </div>
            </Panel>

            {/* Social Links */}
            <Panel 
              title="Social Links" 
              action={<Button variant="ghost" size="sm" className="h-7 rounded-full text-xs">Manage</Button>}
            >
              <div className="divide-y divide-foreground/5">
                <SocialRow platform="Instagram" connected={false} />
                <SocialRow platform="TikTok" connected={false} />
                <SocialRow platform="YouTube" connected={false} />
              </div>
              <p className="mt-4 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                Connect accounts to auto-sync follower counts after beta launch.
              </p>
            </Panel>

            {/* Deal Preferences */}
            <Panel 
              title="Deal Preferences" 
              action={<Button variant="ghost" size="sm" className="h-7 rounded-full text-xs">Edit</Button>}
            >
              <div className="divide-y divide-foreground/5">
                <FieldRow label="Minimum flat fee" placeholder="Not set" />
                <FieldRow label="Minimum commission" placeholder="Not set" />
                <FieldRow label="Post-for-stay" value={creator.dealPreferences.postForStay ? "Open" : "Not open"} />
                <FieldRow label="Gifted stays" value={creator.dealPreferences.giftedStays ? "Open" : "Not open"} />
              </div>
            </Panel>

            {/* Deliverables */}
            <Panel 
              title="Deliverables" 
              action={<Button variant="ghost" size="sm" className="h-7 rounded-full text-xs">Edit</Button>}
            >
              <div className="flex flex-wrap gap-2">
                {creator.deliverables.map((item) => (
                  <span key={item} className="rounded-full border border-foreground/10 bg-muted/30 px-4 py-1.5 text-xs font-medium">
                    {item}
                  </span>
                ))}
                <button className="rounded-full border border-dashed border-foreground/20 px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground">
                  + Add
                </button>
              </div>
            </Panel>
          </div>

          {/* Right Column */}
          <div className="space-y-4 lg:col-span-4">
            {/* Inbox */}
            <Panel title="Inbox">
              <EmptyState
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
                title="No messages yet"
                description="Host messaging launches after beta."
                cta={{ label: "Learn more", href: "/how-it-works" }}
              />
            </Panel>

            {/* Active Offers */}
            <Panel title="Active Offers">
              <EmptyState
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                }
                title="No active offers"
                description="Offers from hosts will appear here."
                cta={{ label: "Browse hosts", href: "/hosts" }}
              />
            </Panel>

            {/* Quick Links */}
            <Panel>
              <div className="space-y-2">
                <Link href="/creators/sample-travel" className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50">
                  View public profile
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </Link>
                <Link href="/how-it-works" className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50">
                  How it works
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </Link>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}
