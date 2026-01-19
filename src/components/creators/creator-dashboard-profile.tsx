"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Heavy edge blur for dashboard
function DashboardEdgeBlur({ intensity = "normal" }: { intensity?: "light" | "normal" | "heavy" }) {
  const opacityMap = { light: "3", normal: "5", heavy: "8" }
  const op = opacityMap[intensity]
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className={`absolute -top-1/3 left-1/4 h-[500px] w-[700px] rounded-full bg-primary/${op} blur-[150px]`} />
      <div className={`absolute top-1/4 -right-1/4 h-[400px] w-[500px] rounded-full bg-accent/${op} blur-[120px]`} />
      <div className={`absolute -bottom-1/4 left-1/2 h-[300px] w-[400px] rounded-full bg-primary/${op} blur-[100px]`} />
    </div>
  )
}

function CardBlur() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl" aria-hidden="true">
      <div className="absolute -top-1/2 left-1/2 h-[200px] w-[300px] -translate-x-1/2 rounded-full bg-accent/3 blur-[80px]" />
    </div>
  )
}

// Stat tile for dashboard (compact)
function StatTile({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-xl border border-foreground/5 bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      {note && <p className="mt-0.5 text-[10px] text-muted-foreground/60">{note}</p>}
    </div>
  )
}

// Dashboard card wrapper
function DashCard({ 
  title, 
  children, 
  action,
  className = ""
}: { 
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative rounded-xl border border-foreground/5 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}>
      <CardBlur />
      <div className="flex items-center justify-between border-b border-foreground/5 px-5 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// Status chip
function StatusChip({ label, variant = "default" }: { label: string; variant?: "default" | "success" | "warning" }) {
  const variants = {
    default: "border-foreground/10 bg-muted/50 text-foreground",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}

// Editable field row
function FieldRow({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right font-medium ${!value ? "text-muted-foreground/50" : ""}`}>
        {value || placeholder || "Not set"}
      </span>
    </div>
  )
}

// Social link row
function SocialRow({ platform, handle, connected }: { platform: string; handle?: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium">{platform}</span>
        {handle && <span className="text-muted-foreground">@{handle}</span>}
      </div>
      {connected ? (
        <span className="text-xs text-emerald-600">Connected</span>
      ) : (
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          Connect
        </Button>
      )}
    </div>
  )
}

// Empty state
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
        {icon}
      </div>
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

// Mock creator data
const mockCreator = {
  displayName: "Your Profile",
  handle: "yourhandle",
  bio: "Add a bio to tell hosts about your content style and what makes you unique.",
  location: "Not set",
  niches: ["Travel", "Lifestyle"],
  platforms: {
    instagram: { handle: "", connected: false },
    tiktok: { handle: "", connected: false },
    youtube: { handle: "", connected: false },
  },
  stats: {
    followers: null,
    avgViews: null,
    engagementRate: null,
    responseRate: null,
  },
  dealPreferences: {
    minimumFlatFee: null,
    minimumPercent: null,
    postForStay: true,
    giftedStays: true,
  },
  deliverables: ["Feed posts", "Reels", "Story coverage"],
  profileStrength: 40,
}

export function CreatorDashboardProfile() {
  const [creator] = useState(mockCreator)

  return (
    <div className="relative min-h-screen">
      <DashboardEdgeBlur intensity="heavy" />

      {/* Auth placeholder */}
      <div className="border-b border-foreground/5 bg-amber-500/5 px-4 py-2 text-center text-xs text-amber-600">
        <span className="font-medium">Beta Preview:</span> Logged in as creator (auth coming soon)
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Band */}
        <div className="relative mb-6 rounded-xl border border-foreground/5 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
          <CardBlur />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Avatar + Info */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-white">
                {creator.displayName.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h1 className="text-lg font-semibold">{creator.displayName}</h1>
                <p className="text-sm text-muted-foreground">@{creator.handle}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-2 h-8 text-xs">
                Edit
              </Button>
            </div>

            {/* Right: Status Chips */}
            <div className="flex flex-wrap gap-2">
              <StatusChip label="Beta" variant="warning" />
              <StatusChip label="Open to offers" variant="success" />
              <StatusChip label={`Profile ${creator.profileStrength}%`} variant="default" />
            </div>
          </div>
        </div>

        {/* Stat Tiles */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile value="—" label="Followers" note="Auto after beta" />
          <StatTile value="—" label="Avg. Views" note="Auto after beta" />
          <StatTile value="—" label="Engagement" note="Auto after beta" />
          <StatTile value="—" label="Response Rate" note="Manual" />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Profile Sections */}
          <div className="space-y-4 lg:col-span-8">
            {/* Bio + Niches */}
            <DashCard 
              title="Bio & Niches" 
              action={<Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>}
            >
              <p className="text-sm text-muted-foreground">{creator.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {creator.niches.map((niche) => (
                  <span key={niche} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {niche}
                  </span>
                ))}
                <button className="rounded-full border border-dashed border-foreground/20 px-2.5 py-0.5 text-xs text-muted-foreground hover:border-foreground/40">
                  + Add
                </button>
              </div>
            </DashCard>

            {/* Social Links */}
            <DashCard 
              title="Social Links" 
              action={<Button variant="ghost" size="sm" className="h-7 text-xs">Manage</Button>}
            >
              <div className="divide-y divide-foreground/5">
                <SocialRow platform="Instagram" connected={false} />
                <SocialRow platform="TikTok" connected={false} />
                <SocialRow platform="YouTube" connected={false} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Connect your accounts to auto-sync follower counts after beta.
              </p>
            </DashCard>

            {/* Deal Preferences */}
            <DashCard 
              title="Deal Preferences" 
              action={<Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>}
            >
              <div className="divide-y divide-foreground/5">
                <FieldRow label="Minimum flat fee" value={creator.dealPreferences.minimumFlatFee ? `$${creator.dealPreferences.minimumFlatFee}` : undefined} placeholder="Not set" />
                <FieldRow label="Minimum commission" value={creator.dealPreferences.minimumPercent ? `${creator.dealPreferences.minimumPercent}%` : undefined} placeholder="Not set" />
                <FieldRow label="Post-for-stay" value={creator.dealPreferences.postForStay ? "Open" : "Not open"} />
                <FieldRow label="Gifted stays" value={creator.dealPreferences.giftedStays ? "Open" : "Not open"} />
              </div>
            </DashCard>

            {/* Deliverables */}
            <DashCard 
              title="Deliverables" 
              action={<Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>}
            >
              <div className="flex flex-wrap gap-2">
                {creator.deliverables.map((item) => (
                  <span key={item} className="rounded-lg border border-foreground/10 bg-muted/30 px-3 py-1.5 text-xs font-medium">
                    {item}
                  </span>
                ))}
                <button className="rounded-lg border border-dashed border-foreground/20 px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground/40">
                  + Add
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Describe what hosts can expect when working with you.
              </p>
            </DashCard>
          </div>

          {/* Right Column: Inbox + Offers */}
          <div className="space-y-4 lg:col-span-4">
            {/* Inbox Preview */}
            <DashCard title="Inbox">
              <EmptyState
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
                title="No messages yet"
                description="Host messaging launches after beta."
              />
            </DashCard>

            {/* Active Offers */}
            <DashCard title="Active Offers">
              <EmptyState
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                }
                title="No active offers"
                description="Offers from hosts will appear here."
              />
            </DashCard>

            {/* Quick Links */}
            <DashCard title="Quick Links">
              <div className="space-y-2">
                <Link href="/creators/sample-travel" className="flex items-center justify-between rounded-lg border border-foreground/5 bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/50">
                  <span>View public profile</span>
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </Link>
                <Link href="/how-it-works" className="flex items-center justify-between rounded-lg border border-foreground/5 bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/50">
                  <span>How it works</span>
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </Link>
              </div>
            </DashCard>
          </div>
        </div>
      </div>
    </div>
  )
}
