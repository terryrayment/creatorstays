"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ReviewCard, RatingSummary } from "@/components/reviews/review-modal"

interface CreatorProfile {
  id: string
  handle: string
  displayName: string
  bio: string | null
  location: string | null
  avatarUrl: string | null
  niches: string[]
  platforms: {
    instagram: string | null
    tiktok: string | null
    youtube: string | null
  }
  stats: {
    followers: number | null
    engagementRate: number | null
  }
  dealPreferences: {
    baseRate: number | null
    openToGiftedStays: boolean
  }
  deliverables: string[]
  pastCollabs: {
    id: string
    propertyTitle: string
    location: string
  }[]
  portfolioUrls: string[]
}

interface Review {
  id: string
  rating: number
  title: string | null
  body: string | null
  communicationRating: number | null
  professionalismRating: number | null
  qualityRating: number | null
  createdAt: string
  collaboration: {
    host: { displayName: string }
    property: { title: string | null }
  }
}

function formatFollowers(count: number | null): string {
  if (!count) return "—"
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M"
  if (count >= 1000) return (count / 1000).toFixed(1) + "K"
  return count.toString()
}

function formatRate(cents: number | null): string {
  if (!cents) return "Contact for rates"
  return `$${(cents / 100).toLocaleString()}/post`
}

// Platform icons
function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

export function CreatorPublicProfile({ creator }: { creator: CreatorProfile }) {
  const { data: session } = useSession()
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<{ count: number; avgRating: number | null }>({ count: 0, avgRating: null })

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?creatorId=${creator.id}`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
          setReviewStats(data.stats || { count: 0, avgRating: null })
        }
      } catch (e) {
        console.error("Failed to fetch reviews:", e)
      }
    }
    fetchReviews()
  }, [creator.id])

  const hasPlatforms = creator.platforms.instagram || creator.platforms.tiktok || creator.platforms.youtube

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4AA3FF] to-[#28D17C] pb-24 pt-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-4xl px-4">
          <Link 
            href="/creators" 
            className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-4 py-1.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            ← Back to Creators
          </Link>
        </div>
      </div>

      {/* Profile Card - overlapping hero */}
      <div className="mx-auto -mt-16 max-w-4xl px-4 pb-12">
        <div className="rounded-2xl border-[3px] border-black bg-white p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-[#FFD84A] text-2xl font-black text-black md:h-24 md:w-24">
                {creator.avatarUrl ? (
                  <img src={creator.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  creator.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                )}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-black text-black md:text-3xl">
                  {creator.displayName}
                </h1>
                <p className="text-sm text-black/60">@{creator.handle}</p>
                {creator.location && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-black/60">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {creator.location}
                  </p>
                )}
              </div>
            </div>

            {/* CTA Button */}
            {session ? (
              <Link
                href={`/dashboard/host/search-creators?creator=${creator.id}`}
                className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#28D17C] px-6 py-3 text-sm font-black text-black transition-transform hover:-translate-y-1"
              >
                Send Offer
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/login/host"
                className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#28D17C] px-6 py-3 text-sm font-black text-black transition-transform hover:-translate-y-1"
              >
                Login to Send Offer
              </Link>
            )}
          </div>

          {/* Bio */}
          {creator.bio && (
            <div className="mt-6 rounded-xl border-2 border-black/10 bg-black/5 p-4">
              <p className="text-sm leading-relaxed text-black">{creator.bio}</p>
            </div>
          )}

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-4 text-center">
              <p className="text-2xl font-black text-black">{formatFollowers(creator.stats.followers)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Followers</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#4AA3FF] p-4 text-center">
              <p className="text-2xl font-black text-black">
                {creator.stats.engagementRate ? `${creator.stats.engagementRate}%` : "—"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Engagement</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#28D17C] p-4 text-center">
              <p className="text-2xl font-black text-black">{creator.pastCollabs.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Collabs</p>
            </div>
            <div className="rounded-xl border-2 border-black bg-[#D7B6FF] p-4 text-center">
              <p className="text-lg font-black text-black">{formatRate(creator.dealPreferences.baseRate)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Base Rate</p>
            </div>
          </div>

          {/* Niches */}
          {creator.niches.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-black/60">Niches</p>
              <div className="flex flex-wrap gap-2">
                {creator.niches.map(niche => (
                  <span key={niche} className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black">
                    {niche}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {creator.deliverables.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-black/60">Deliverables</p>
              <div className="flex flex-wrap gap-2">
                {creator.deliverables.map(item => (
                  <span key={item} className="rounded-full border-2 border-black/30 bg-black/5 px-3 py-1 text-xs font-medium text-black">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Platforms */}
          {hasPlatforms && (
            <div className="mt-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-black/60">Platforms</p>
              <div className="flex gap-3">
                {creator.platforms.instagram && (
                  <a 
                    href={`https://instagram.com/${creator.platforms.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 text-black transition-transform hover:-translate-y-0.5"
                  >
                    <InstagramIcon />
                    <span className="text-sm font-bold">@{creator.platforms.instagram}</span>
                  </a>
                )}
                {creator.platforms.tiktok && (
                  <a 
                    href={`https://tiktok.com/@${creator.platforms.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 text-black transition-transform hover:-translate-y-0.5"
                  >
                    <TikTokIcon />
                    <span className="text-sm font-bold">@{creator.platforms.tiktok}</span>
                  </a>
                )}
                {creator.platforms.youtube && (
                  <a 
                    href={`https://youtube.com/@${creator.platforms.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border-2 border-black bg-white px-4 py-2 text-black transition-transform hover:-translate-y-0.5"
                  >
                    <YouTubeIcon />
                    <span className="text-sm font-bold">@{creator.platforms.youtube}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Deal Preferences */}
          <div className="mt-6 rounded-xl border-2 border-black bg-black/5 p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-black/60">Deal Preferences</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {creator.dealPreferences.baseRate && (
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-black bg-white text-xs">💵</span>
                  <span className="text-black">Starting at <strong>${(creator.dealPreferences.baseRate / 100).toLocaleString()}</strong></span>
                </div>
              )}
              {creator.dealPreferences.openToGiftedStays && (
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-black bg-[#28D17C] text-xs">✓</span>
                  <span className="text-black">Open to <strong>gifted stays</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Past Collaborations */}
          {creator.pastCollabs.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-black/60">Past Collaborations</p>
              <div className="space-y-2">
                {creator.pastCollabs.map(collab => (
                  <div key={collab.id} className="flex items-center gap-3 rounded-lg border border-black/10 bg-white p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/20 bg-black/5 text-lg">
                      
                    </div>
                    <div>
                      <p className="font-bold text-black">{collab.propertyTitle}</p>
                      <p className="text-xs text-black/60">{collab.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Reviews</p>
                <RatingSummary avgRating={reviewStats.avgRating} count={reviewStats.count} />
              </div>
              <div className="space-y-3">
                {reviews.slice(0, 3).map(review => (
                  <ReviewCard 
                    key={review.id}
                    review={review}
                    reviewerName={review.collaboration.host.displayName}
                    propertyTitle={review.collaboration.property.title || undefined}
                  />
                ))}
                {reviews.length > 3 && (
                  <p className="text-center text-xs text-black/50">
                    + {reviews.length - 3} more reviews
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {creator.portfolioUrls.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-black/60">Portfolio</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {creator.portfolioUrls.slice(0, 4).map((url, i) => (
                  <a 
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-xl border-2 border-black bg-black/5 transition-transform hover:-translate-y-1"
                  >
                    <div className="flex h-full items-center justify-center text-black/40">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 rounded-2xl border-[3px] border-black bg-[#FFD84A] p-6 text-center">
          <h2 className="font-heading text-xl font-black text-black">Want to work with {creator.displayName}?</h2>
          <p className="mt-2 text-sm text-black/70">
            Send them an offer and start your collaboration today.
          </p>
          {session ? (
            <Link
              href={`/dashboard/host/search-creators?creator=${creator.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-black px-8 py-3 text-sm font-black text-white transition-transform hover:-translate-y-1"
            >
              Send Offer →
            </Link>
          ) : (
            <Link
              href="/login/host"
              className="mt-4 inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-black px-8 py-3 text-sm font-black text-white transition-transform hover:-translate-y-1"
            >
              Login as Host →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
