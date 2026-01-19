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
  deliverables?: string[]
  mediaKitUrl?: string
  pastCollabs?: string[]
  isSample?: boolean
}

function EdgeBlur() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-1/2 left-1/4 h-[600px] w-[800px] rounded-full bg-primary/4 blur-[120px]" />
      <div className="absolute top-0 right-0 h-[400px] w-[600px] rounded-full bg-accent/3 blur-[100px]" />
    </div>
  )
}

function StatTile({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-foreground/5 bg-card p-6 shadow-sm md:p-8">
      <p className="text-4xl font-bold tracking-tight md:text-5xl">{value}</p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground/60">{note}</p>}
    </div>
  )
}

function DeliverableCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-foreground/5 bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold leading-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function PreferenceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-foreground/5 py-4 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-foreground/10 bg-card p-8 shadow-xl">
        <h3 className="text-xl font-semibold">Host messaging launches soon</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">
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

function CopyLinkButton({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/creators/${handle}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="lg" onClick={copyLink} className="gap-2">
      {copied ? (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          Copy profile link
        </>
      )}
    </Button>
  )
}

export function CreatorProfileView({ creator }: { creator: CreatorProfile }) {
  const [showInviteModal, setShowInviteModal] = useState(false)

  const dealTypeLabels: Record<string, string> = {
    percent: "Commission-based",
    flat: "Flat fee",
    "post-for-stay": "Post-for-stay",
  }

  const defaultDeliverables = [
    { title: "Feed Posts", description: "High-quality static posts for Instagram or TikTok feed with property tags and booking link." },
    { title: "Reels / Short Video", description: "Engaging vertical video content showcasing the property experience and amenities." },
    { title: "Story Coverage", description: "Real-time story updates during the stay with swipe-up links to your listing." },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-8 pt-12 md:pb-12 md:pt-20">
        <EdgeBlur />
        <Container>
          {/* Beta Badge */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-600">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Beta profile preview
            </span>
          </div>

          {/* Title + Subhead */}
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              {creator.displayName}
            </h1>
            <p className="mt-4 text-xl leading-relaxed text-muted-foreground md:text-2xl">
              {creator.niches.join(" & ")} creator helping vacation rentals drive bookings through authentic content.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" onClick={() => setShowInviteModal(true)} className="px-8">
              Invite creator
            </Button>
            <CopyLinkButton handle={creator.handle} />
          </div>
        </Container>
      </section>

      {/* Stat Tiles */}
      <section className="py-8 md:py-12">
        <Container>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            <StatTile 
              value={creator.stats.followers ? `${(creator.stats.followers / 1000).toFixed(0)}K` : "—"} 
              label="Followers" 
              note="Auto after beta" 
            />
            <StatTile 
              value={creator.stats.avgViews ? `${(creator.stats.avgViews / 1000).toFixed(0)}K` : "—"} 
              label="Avg. Views" 
              note="Auto after beta" 
            />
            <StatTile 
              value={creator.stats.engagementRate ? `${creator.stats.engagementRate}%` : "—"} 
              label="Engagement" 
              note="Auto after beta" 
            />
            <StatTile 
              value={creator.location.split(",")[0]} 
              label="Based in" 
            />
          </div>
        </Container>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">About</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {creator.bio}
            </p>

            {/* Platforms */}
            <div className="mt-8 flex flex-wrap gap-3">
              {creator.platforms.instagram && (
                <a
                  href={`https://instagram.com/${creator.platforms.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
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
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
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
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </a>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* What You Get Section */}
      <section className="border-y border-foreground/5 bg-muted/30 py-12 md:py-16">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What you get</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Typical deliverables when working with this creator. Final scope is negotiated per collaboration.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {defaultDeliverables.map((item) => (
              <DeliverableCard key={item.title} title={item.title} description={item.description} />
            ))}
          </div>
        </Container>
      </section>

      {/* Deal Preferences Section */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Explanation */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Deal preferences</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Every creator has different preferences for how they like to work with hosts. 
                Review the options below and propose a deal that works for both parties.
              </p>
              <p className="mt-4 text-muted-foreground">
                Compensation can be commission-based (percentage of bookings), a flat fee, 
                or a post-for-stay arrangement where the creator receives a complimentary stay 
                in exchange for content.
              </p>
            </div>

            {/* Right: Preferences Card */}
            <div className="rounded-2xl border border-foreground/5 bg-card p-6 shadow-sm md:p-8">
              <PreferenceItem 
                label="Preferred deal types" 
                value={creator.dealPreferences.types.map(t => dealTypeLabels[t]).join(", ")} 
              />
              {creator.dealPreferences.minimumFlatFee && (
                <PreferenceItem 
                  label="Minimum flat fee" 
                  value={`$${creator.dealPreferences.minimumFlatFee.toLocaleString()}`} 
                />
              )}
              {creator.dealPreferences.minimumPercent && (
                <PreferenceItem 
                  label="Minimum commission" 
                  value={`${creator.dealPreferences.minimumPercent}%`} 
                />
              )}
              <PreferenceItem 
                label="Open to gifted stays" 
                value={creator.dealPreferences.openToGiftedStays ? "Yes" : "No"} 
              />
              {creator.mediaKitUrl && (
                <div className="mt-6 pt-2">
                  <a
                    href={creator.mediaKitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Download media kit
                  </a>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-foreground/5 bg-muted/30 py-12 md:py-16">
        <Container>
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ready to collaborate?</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Send an invite to start the conversation. You&apos;ll be notified when messaging launches.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => setShowInviteModal(true)} className="px-8">
                Invite creator
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/hosts">Sign up as host</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </>
  )
}
