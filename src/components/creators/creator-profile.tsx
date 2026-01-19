"use client"

import { useState } from "react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

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
  mediaKitUrl?: string
  pastCollabs?: string[]
  isSample?: boolean
}

function EdgeBlur() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-1/2 left-1/4 h-[500px] w-[700px] rounded-full bg-primary/5 blur-[100px]" />
      <div className="absolute -top-1/4 right-0 h-[300px] w-[500px] rounded-full bg-accent/5 blur-[80px]" />
    </div>
  )
}

function StatCard({ label, value, note }: { label: string; value: string | number | null; note?: string }) {
  const displayValue = value === null ? "—" : value
  return (
    <div className="text-center">
      <p className="text-2xl font-semibold">{displayValue}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground/70">{note}</p>}
    </div>
  )
}

function DealTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    percent: "% Commission",
    flat: "Flat Fee",
    "post-for-stay": "Post-for-Stay",
  }
  return (
    <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-sm font-medium">
      {labels[type] || type}
    </span>
  )
}

function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <h3 className="text-xl font-semibold">Host messaging launches soon</h3>
        <p className="mt-3 text-muted-foreground">
          Sign up as a host to get early access and be notified when you can invite creators to collaborate.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/hosts">Sign Up as Host</Link>
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CreatorProfileView({ creator }: { creator: CreatorProfile }) {
  const [showInviteModal, setShowInviteModal] = useState(false)

  const initials = creator.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b py-12 md:py-16">
        <EdgeBlur />
        <Container>
          {creator.isSample && (
            <div className="mb-6 opacity-0 reveal">
              <span className="inline-block rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600">
                Sample Profile
              </span>
            </div>
          )}

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8 opacity-0 reveal">
            {/* Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white md:h-32 md:w-32">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold md:text-4xl">{creator.displayName}</h1>
              <p className="mt-1 text-lg text-muted-foreground">@{creator.handle}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {creator.location}
              </p>

              {/* Niches */}
              <div className="mt-4 flex flex-wrap gap-2">
                {creator.niches.map((niche) => (
                  <span
                    key={niche}
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {niche}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 md:items-end">
              <Button size="lg" onClick={() => setShowInviteModal(true)}>
                Invite Creator
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/waitlist">Join waitlist as creator</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Bio */}
      <section className="py-10">
        <Container>
          <div className="max-w-3xl opacity-0 reveal" style={{ animationDelay: "100ms" }}>
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{creator.bio}</p>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-10">
        <Container>
          <div className="opacity-0 reveal" style={{ animationDelay: "150ms" }}>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold">Audience Stats</h2>
              <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Auto-sync after beta</span>
            </div>
            <div className="grid grid-cols-3 gap-8 md:w-fit md:gap-16">
              <StatCard 
                label="Followers" 
                value={creator.stats.followers ? `${(creator.stats.followers / 1000).toFixed(0)}K` : null}
                note="(auto)"
              />
              <StatCard 
                label="Engagement" 
                value={creator.stats.engagementRate ? `${creator.stats.engagementRate}%` : null}
                note="(auto)"
              />
              <StatCard 
                label="Avg. Views" 
                value={creator.stats.avgViews ? `${(creator.stats.avgViews / 1000).toFixed(0)}K` : null}
                note="(auto)"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Platforms */}
      <section className="py-10">
        <Container>
          <div className="opacity-0 reveal" style={{ animationDelay: "200ms" }}>
            <h2 className="text-lg font-semibold">Platforms</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {creator.platforms.instagram && (
                <a
                  href={`https://instagram.com/${creator.platforms.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              )}
              {creator.platforms.tiktok && (
                <a
                  href={`https://tiktok.com/@${creator.platforms.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  TikTok
                </a>
              )}
              {creator.platforms.youtube && (
                <a
                  href={`https://youtube.com/@${creator.platforms.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Deal Preferences */}
      <section className="border-t py-10">
        <Container>
          <div className="opacity-0 reveal" style={{ animationDelay: "250ms" }}>
            <h2 className="text-lg font-semibold">Deal Preferences</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Preferred deal types</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {creator.dealPreferences.types.map((type) => (
                    <DealTypeBadge key={type} type={type} />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {creator.dealPreferences.minimumFlatFee && (
                  <div>
                    <p className="text-sm text-muted-foreground">Minimum flat fee</p>
                    <p className="mt-1 font-medium">${creator.dealPreferences.minimumFlatFee}</p>
                  </div>
                )}
                {creator.dealPreferences.minimumPercent && (
                  <div>
                    <p className="text-sm text-muted-foreground">Minimum commission</p>
                    <p className="mt-1 font-medium">{creator.dealPreferences.minimumPercent}%</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Open to gifted stays</p>
                  <p className="mt-1 font-medium">{creator.dealPreferences.openToGiftedStays ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Media Kit */}
      {creator.mediaKitUrl && (
        <section className="border-t py-10">
          <Container>
            <div className="opacity-0 reveal" style={{ animationDelay: "300ms" }}>
              <h2 className="text-lg font-semibold">Media Kit</h2>
              <a
                href={creator.mediaKitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-primary hover:underline"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                View Media Kit
              </a>
            </div>
          </Container>
        </section>
      )}

      {/* Past Collabs */}
      {creator.pastCollabs && creator.pastCollabs.length > 0 && (
        <section className="border-t py-10">
          <Container>
            <div className="opacity-0 reveal" style={{ animationDelay: "350ms" }}>
              <h2 className="text-lg font-semibold">Past Collaborations</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {creator.pastCollabs.map((collab) => (
                  <span
                    key={collab}
                    className="rounded-full border border-border bg-card px-3 py-1 text-sm"
                  >
                    {collab}
                  </span>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </>
  )
}
