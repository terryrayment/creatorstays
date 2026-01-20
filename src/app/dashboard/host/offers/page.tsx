"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Container } from "@/components/layout/container"
import { PropertyGallery } from "@/components/properties/property-gallery"

interface Offer {
  id: string
  offerType: string
  cashCents: number
  stayNights: number | null
  trafficBonusEnabled: boolean
  trafficBonusCents: number | null
  deliverables: string[]
  status: string
  createdAt: string
  expiresAt: string | null
  respondedAt: string | null
  counterCashCents: number | null
  counterMessage: string | null
  creator: {
    id: string
    displayName: string
    handle: string
    avatarUrl: string | null
  }
  property: {
    id: string
    title: string | null
    cityRegion: string | null
    heroImageUrl: string | null
    photos: string[]
  } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pending", color: "text-black", bgColor: "bg-[#FFD84A]" },
  accepted: { label: "Accepted", color: "text-black", bgColor: "bg-[#28D17C]" },
  declined: { label: "Declined", color: "text-white", bgColor: "bg-red-500" },
  countered: { label: "Countered", color: "text-black", bgColor: "bg-[#4AA3FF]" },
  expired: { label: "Expired", color: "text-white", bgColor: "bg-gray-500" },
}

const DEAL_TYPE_LABELS: Record<string, string> = {
  flat: "Flat Fee",
  "flat-with-bonus": "Flat + Bonus",
  "post-for-stay": "Post-for-Stay",
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(dateStr)
}

export default function HostSentOffersPage() {
  const { data: session } = useSession()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [responding, setResponding] = useState<string | null>(null)

  // Handle counter offer response
  const handleCounterResponse = async (offerId: string, action: "accept" | "decline") => {
    setResponding(offerId)
    try {
      const res = await fetch(`/api/offers/${offerId}/respond-counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // Update the offer in state
        setOffers(prev => prev.map(o => 
          o.id === offerId 
            ? { ...o, status: action === "accept" ? "accepted" : "declined" }
            : o
        ))
        setSelectedOffer(null)
        
        // Redirect to collaborations if accepted
        if (action === "accept" && data.collaborationId) {
          window.location.href = "/dashboard/collaborations"
        }
      } else {
        alert(data.error || "Failed to respond to counter offer")
      }
    } catch (e) {
      alert("Network error. Please try again.")
    }
    setResponding(null)
  }

  // Fetch offers
  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch("/api/offers/sent")
        if (res.ok) {
          const data = await res.json()
          setOffers(data.offers || [])
        }
      } catch (e) {
        console.error("Failed to fetch offers:", e)
      }
      setLoading(false)
    }

    if (session?.user) {
      fetchOffers()
    }
  }, [session])

  // Filter offers
  const filteredOffers = filter === "all" 
    ? offers 
    : offers.filter(o => o.status === filter)

  // Stats
  const stats = {
    total: offers.length,
    pending: offers.filter(o => o.status === "pending").length,
    accepted: offers.filter(o => o.status === "accepted").length,
    countered: offers.filter(o => o.status === "countered").length,
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full border-2 border-black bg-[#FFD84A] px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
              Sent Offers
            </span>
          </div>
          <Link 
            href="/dashboard/host"
            className="rounded-full border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading text-[2rem] font-black tracking-tight text-black">
              SENT OFFERS
            </h1>
            <p className="mt-1 text-sm text-black/70">
              Track all offers you've sent to creators.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-4 gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-xl border-2 border-black p-3 text-center transition-transform hover:-translate-y-0.5 ${filter === "all" ? "bg-black text-white" : "bg-white text-black"}`}
            >
              <p className="text-2xl font-black">{stats.total}</p>
              <p className="text-[10px] font-bold">Total</p>
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`rounded-xl border-2 border-black p-3 text-center transition-transform hover:-translate-y-0.5 ${filter === "pending" ? "bg-[#FFD84A]" : "bg-white"}`}
            >
              <p className="text-2xl font-black text-black">{stats.pending}</p>
              <p className="text-[10px] font-bold text-black">Pending</p>
            </button>
            <button
              onClick={() => setFilter("accepted")}
              className={`rounded-xl border-2 border-black p-3 text-center transition-transform hover:-translate-y-0.5 ${filter === "accepted" ? "bg-[#28D17C]" : "bg-white"}`}
            >
              <p className="text-2xl font-black text-black">{stats.accepted}</p>
              <p className="text-[10px] font-bold text-black">Accepted</p>
            </button>
            <button
              onClick={() => setFilter("countered")}
              className={`rounded-xl border-2 border-black p-3 text-center transition-transform hover:-translate-y-0.5 ${filter === "countered" ? "bg-[#4AA3FF]" : "bg-white"}`}
            >
              <p className="text-2xl font-black text-black">{stats.countered}</p>
              <p className="text-[10px] font-bold text-black">Countered</p>
            </button>
          </div>

          {/* Offers List */}
          {loading ? (
            <div className="rounded-2xl border-[3px] border-black bg-white p-8 text-center">
              <p className="text-sm text-black/60">Loading offers...</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="rounded-2xl border-[3px] border-black bg-white p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black/20 bg-black/5">
                <svg className="h-6 w-6 text-black/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className="font-bold text-black">
                {filter === "all" ? "No offers sent yet" : `No ${filter} offers`}
              </p>
              <p className="mt-1 text-sm text-black/60">
                Find creators and send your first offer to get started.
              </p>
              <Link
                href="/dashboard/host/search-creators"
                className="mt-4 inline-block rounded-full border-2 border-black bg-black px-6 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-1"
              >
                Find Creators
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOffers.map((offer) => {
                const statusConfig = STATUS_CONFIG[offer.status] || STATUS_CONFIG.pending
                const isSelected = selectedOffer?.id === offer.id

                return (
                  <div key={offer.id}>
                    <button
                      onClick={() => setSelectedOffer(isSelected ? null : offer)}
                      className={`w-full rounded-2xl border-[3px] border-black bg-white p-4 text-left transition-transform hover:-translate-y-0.5 ${isSelected ? "ring-2 ring-black ring-offset-2" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#4AA3FF] text-sm font-black text-black">
                            {offer.creator.avatarUrl ? (
                              <img src={offer.creator.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                            ) : (
                              offer.creator.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-black">{offer.creator.displayName}</p>
                              <span className={`rounded-full border border-black px-2 py-0.5 text-[9px] font-bold ${statusConfig.bgColor} ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-xs text-black/60">@{offer.creator.handle}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-bold text-black">
                                {offer.cashCents > 0 ? formatCurrency(offer.cashCents) : `${offer.stayNights} nights`}
                              </span>
                              <span className="text-black/40">·</span>
                              <span className="text-black/60">{DEAL_TYPE_LABELS[offer.offerType]}</span>
                              {offer.property && (
                                <>
                                  <span className="text-black/40">·</span>
                                  <span className="text-black/60">{offer.property.title || offer.property.cityRegion || 'Property'}</span>
                                </>
                              )}
                              <span className="text-black/40">·</span>
                              <span className="text-black/60">{timeAgo(offer.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <svg className={`h-5 w-5 text-black/40 transition-transform ${isSelected ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isSelected && (
                      <div className="mt-2 rounded-xl border-2 border-black bg-black/5 p-4 space-y-4">
                        {/* Property Gallery */}
                        {offer.property && (offer.property.heroImageUrl || offer.property.photos?.length > 0) && (
                          <div className="rounded-lg overflow-hidden">
                            <PropertyGallery 
                              photos={offer.property.photos || []}
                              heroImage={offer.property.heroImageUrl || undefined}
                              title={offer.property.title || undefined}
                              size="sm"
                            />
                          </div>
                        )}

                        {/* Deliverables */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-black/60 mb-2">Deliverables</p>
                          <div className="flex flex-wrap gap-2">
                            {offer.deliverables.map(d => (
                              <span key={d} className="rounded-full border border-black bg-white px-3 py-1 text-xs font-bold text-black">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Compensation Details */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-black bg-white p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Your Offer</p>
                            <p className="text-lg font-black text-black">
                              {offer.cashCents > 0 ? formatCurrency(offer.cashCents) : `${offer.stayNights} nights stay`}
                            </p>
                          </div>
                          {offer.trafficBonusEnabled && offer.trafficBonusCents && (
                            <div className="rounded-lg border border-black bg-white p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Bonus</p>
                              <p className="text-lg font-black text-[#28D17C]">+{formatCurrency(offer.trafficBonusCents)}</p>
                            </div>
                          )}
                        </div>

                        {/* Counter Offer */}
                        {offer.status === "countered" && offer.counterCashCents && (
                          <div className="rounded-xl border-2 border-[#4AA3FF] bg-[#4AA3FF]/10 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60 mb-1">Counter Offer</p>
                            <p className="text-xl font-black text-black">{formatCurrency(offer.counterCashCents)}</p>
                            {offer.counterMessage && (
                              <p className="mt-2 text-sm text-black/80">&ldquo;{offer.counterMessage}&rdquo;</p>
                            )}
                            <div className="mt-3 flex gap-2">
                              <button 
                                onClick={() => handleCounterResponse(offer.id, "accept")}
                                disabled={responding === offer.id}
                                className="flex-1 rounded-full border-2 border-black bg-[#28D17C] py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                              >
                                {responding === offer.id ? "Processing..." : "Accept Counter"}
                              </button>
                              <button 
                                onClick={() => handleCounterResponse(offer.id, "decline")}
                                disabled={responding === offer.id}
                                className="flex-1 rounded-full border-2 border-black bg-white py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Status Actions */}
                        {offer.status === "accepted" && (
                          <Link
                            href="/dashboard/collaborations"
                            className="block rounded-full border-2 border-black bg-[#28D17C] py-3 text-center text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
                          >
                            View Collaboration →
                          </Link>
                        )}

                        {offer.status === "pending" && (
                          <p className="text-center text-xs text-black/60">
                            Sent {timeAgo(offer.createdAt)} · Expires {offer.expiresAt ? formatDate(offer.expiresAt) : "in 14 days"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
