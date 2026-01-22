"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Container } from "@/components/layout/container"
import { PropertyGallery } from "@/components/properties/property-gallery"
import { getOfferStatusDisplay } from "@/lib/status-display"

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
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [resending, setResending] = useState<string | null>(null)
  const [showReCounter, setShowReCounter] = useState(false)
  const [reCounterAmount, setReCounterAmount] = useState("")
  const [reCounterMessage, setReCounterMessage] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: "resend" | "withdraw"; offerId: string } | null>(null)

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Mark offer as viewed when host selects a responded offer
  const handleSelectOffer = async (offer: Offer | null) => {
    setSelectedOffer(offer)
    setShowReCounter(false) // Reset re-counter form when switching offers
    setReCounterAmount("")
    setReCounterMessage("")
    
    // If selecting an offer that has been responded to, mark it as viewed
    if (offer && offer.status !== 'pending' && offer.respondedAt) {
      try {
        await fetch(`/api/offers/${offer.id}/view`, { method: 'POST' })
      } catch (e) {
        // Silent fail - view tracking is not critical
        console.error('Failed to mark offer as viewed:', e)
      }
    }
  }

  // Handle resend offer (called after modal confirmation)
  const handleResend = async (offerId: string) => {
    setResending(offerId)
    setConfirmAction(null)
    try {
      const res = await fetch(`/api/offers/${offerId}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // Refresh offers to show the new one
        const refreshRes = await fetch("/api/offers/sent")
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          setOffers(refreshData.offers || [])
        }
        setSelectedOffer(null)
        setToast({ message: "Offer resent! The creator has been notified.", type: "success" })
      } else {
        setToast({ message: data.error || "Failed to resend offer", type: "error" })
      }
    } catch (e) {
      setToast({ message: "Network error. Please try again.", type: "error" })
    }
    setResending(null)
  }

  // Handle withdraw offer (called after modal confirmation)
  const handleWithdraw = async (offerId: string) => {
    setWithdrawing(offerId)
    setConfirmAction(null)
    try {
      const res = await fetch(`/api/offers/${offerId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // Update the offer in state
        setOffers(prev => prev.map(o => 
          o.id === offerId ? { ...o, status: "withdrawn" } : o
        ))
        setSelectedOffer(null)
        setToast({ message: "Offer withdrawn successfully.", type: "success" })
      } else {
        setToast({ message: data.error || "Failed to withdraw offer", type: "error" })
      }
    } catch (e) {
      setToast({ message: "Network error. Please try again.", type: "error" })
    }
    setWithdrawing(null)
  }

  // Handle counter offer response (accept, decline, or re-counter)
  const handleCounterResponse = async (offerId: string, action: "accept" | "decline" | "re-counter") => {
    // Validate re-counter amount if that's the action
    if (action === "re-counter") {
      const amount = parseFloat(reCounterAmount)
      if (!amount || amount <= 0) {
        setToast({ message: "Please enter a valid counter amount", type: "error" })
        return
      }
    }
    
    setResponding(offerId)
    try {
      const res = await fetch(`/api/offers/${offerId}/respond-counter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action,
          ...(action === "re-counter" ? {
            reCounterCashCents: Math.round(parseFloat(reCounterAmount) * 100),
            reCounterMessage: reCounterMessage || undefined,
          } : {}),
        }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        if (action === "re-counter") {
          // Update offer back to pending with new amount
          setOffers(prev => prev.map(o => 
            o.id === offerId 
              ? { ...o, status: "pending", cashCents: Math.round(parseFloat(reCounterAmount) * 100), counterCashCents: null, counterMessage: null }
              : o
          ))
          setSelectedOffer(null)
          setShowReCounter(false)
          setReCounterAmount("")
          setReCounterMessage("")
          setToast({ message: "Re-counter sent! The creator has 7 days to respond.", type: "success" })
        } else {
          // Update the offer in state
          setOffers(prev => prev.map(o => 
            o.id === offerId 
              ? { ...o, status: action === "accept" ? "accepted" : "declined" }
              : o
          ))
          setSelectedOffer(null)
          
          // Show success message
          if (action === "accept") {
            setToast({ message: "Counter accepted! Setting up collaboration...", type: "success" })
            // Redirect to collaborations if accepted
            if (data.collaborationId) {
              setTimeout(() => { window.location.href = "/dashboard/collaborations" }, 1500)
            }
          } else {
            setToast({ message: "Counter offer declined.", type: "success" })
          }
        }
      } else {
        setToast({ message: data.error || "Failed to respond to counter offer", type: "error" })
      }
    } catch (e) {
      setToast({ message: "Network error. Please try again.", type: "error" })
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
            href="/beta/dashboard/host"
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
                href="/beta/dashboard/host/search-creators"
                className="mt-4 inline-block rounded-full border-2 border-black bg-black px-6 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-1"
              >
                Find Creators
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOffers.map((offer) => {
                const statusDisplay = getOfferStatusDisplay(offer.status, "host")
                const isSelected = selectedOffer?.id === offer.id

                return (
                  <div key={offer.id}>
                    <button
                      onClick={() => handleSelectOffer(isSelected ? null : offer)}
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
                              <span className={`rounded-full border border-black px-2 py-0.5 text-[9px] font-bold ${statusDisplay.color} ${statusDisplay.textColor}`}>
                                {statusDisplay.label}
                              </span>
                              {statusDisplay.actionRequired && (
                                <span className="rounded-full bg-[#FF6B6B] px-2 py-0.5 text-[9px] font-bold text-white">
                                  Action Required
                                </span>
                              )}
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
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Counter Offer from Creator</p>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#4AA3FF] text-white font-bold">Negotiation Open</span>
                            </div>
                            <p className="text-xl font-black text-black">{formatCurrency(offer.counterCashCents)}</p>
                            <p className="text-xs text-black/60 mt-1">
                              Your original offer: {formatCurrency(offer.cashCents)}
                            </p>
                            {offer.counterMessage && (
                              <p className="mt-2 text-sm text-black/80 bg-white/50 rounded-lg p-2 border border-black/10">&ldquo;{offer.counterMessage}&rdquo;</p>
                            )}
                            
                            {/* Re-counter form */}
                            {showReCounter ? (
                              <div className="mt-4 space-y-3 rounded-lg border-2 border-[#FFD84A] bg-[#FFD84A]/20 p-3">
                                <p className="text-xs font-bold text-black">Make a Counter Offer</p>
                                <div>
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-black/60 block mb-1">
                                    Your Amount ($)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder={`e.g., ${Math.round((offer.cashCents + offer.counterCashCents) / 2 / 100)}`}
                                    value={reCounterAmount}
                                    onChange={e => setReCounterAmount(e.target.value)}
                                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-black/60 block mb-1">
                                    Message (optional)
                                  </label>
                                  <textarea
                                    rows={2}
                                    placeholder="Explain your offer..."
                                    value={reCounterMessage}
                                    onChange={e => setReCounterMessage(e.target.value)}
                                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleCounterResponse(offer.id, "re-counter")}
                                    disabled={responding === offer.id || !reCounterAmount}
                                    className="flex-1 rounded-full border-2 border-black bg-[#FFD84A] py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                                  >
                                    {responding === offer.id ? "Sending..." : "Send Counter"}
                                  </button>
                                  <button
                                    onClick={() => { setShowReCounter(false); setReCounterAmount(""); setReCounterMessage(""); }}
                                    className="rounded-full border-2 border-black/30 px-4 py-2 text-xs font-bold text-black/60 hover:border-black"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="mt-3 flex gap-2">
                                  <button 
                                    onClick={() => handleCounterResponse(offer.id, "accept")}
                                    disabled={responding === offer.id}
                                    className="flex-1 rounded-full border-2 border-black bg-[#28D17C] py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                                  >
                                    {responding === offer.id ? "Processing..." : "Accept Counter"}
                                  </button>
                                  <button 
                                    onClick={() => setShowReCounter(true)}
                                    disabled={responding === offer.id}
                                    className="flex-1 rounded-full border-2 border-black bg-[#FFD84A] py-2 text-xs font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                                  >
                                    Counter Back
                                  </button>
                                  <button 
                                    onClick={() => handleCounterResponse(offer.id, "decline")}
                                    disabled={responding === offer.id}
                                    className="rounded-full border-2 border-black/30 px-4 py-2 text-xs font-bold text-black/60 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                                  >
                                    Decline
                                  </button>
                                </div>
                                <p className="mt-2 text-[10px] text-black/50 text-center">
                                   You can negotiate back and forth until you reach an agreement
                                </p>
                              </>
                            )}
                          </div>
                        )}

                        {/* Status Actions */}
                        {offer.status === "accepted" && (
                          <Link
                            href="/beta/dashboard/host/collaborations"
                            className="block rounded-full border-2 border-black bg-[#28D17C] py-3 text-center text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
                          >
                            View Collaboration →
                          </Link>
                        )}

                        {offer.status === "pending" && (
                          <div className="space-y-2">
                            <p className="text-center text-xs text-black/60">
                              Sent {timeAgo(offer.createdAt)} · Expires {offer.expiresAt ? formatDate(offer.expiresAt) : "in 14 days"}
                            </p>
                            <button
                              onClick={() => setConfirmAction({ type: "withdraw", offerId: offer.id })}
                              disabled={withdrawing === offer.id}
                              className="w-full rounded-full border-2 border-black/30 bg-white py-2 text-xs font-bold text-black/60 transition-all hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                            >
                              {withdrawing === offer.id ? "Withdrawing..." : "Withdraw Offer"}
                            </button>
                          </div>
                        )}

                        {/* Withdraw option for countered offers too */}
                        {offer.status === "countered" && (
                          <button
                            onClick={() => setConfirmAction({ type: "withdraw", offerId: offer.id })}
                            disabled={withdrawing === offer.id}
                            className="w-full rounded-full border-2 border-black/30 bg-white py-2 text-xs font-bold text-black/60 transition-all hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                          >
                            {withdrawing === offer.id ? "Withdrawing..." : "Withdraw Offer"}
                          </button>
                        )}

                        {/* Resend option for expired offers */}
                        {offer.status === "expired" && (
                          <div className="space-y-3">
                            <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-3">
                              <p className="text-xs text-black/60 text-center">
                                This offer expired on {offer.expiresAt ? formatDate(offer.expiresAt) : "N/A"}
                              </p>
                              <p className="mt-1 text-xs text-black/50 text-center">
                                The creator didn't respond in time.
                              </p>
                            </div>
                            
                            {/* Primary action: Resend */}
                            <div className="rounded-lg border-2 border-[#FFD84A] bg-[#FFD84A]/10 p-3">
                              <p className="text-xs font-bold text-black mb-2">Want to try again?</p>
                              <button
                                onClick={() => setConfirmAction({ type: "resend", offerId: offer.id })}
                                disabled={resending === offer.id}
                                className="w-full rounded-full border-2 border-black bg-[#FFD84A] py-2.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                              >
                                {resending === offer.id ? "Resending..." : "🔄 Resend to This Creator"}
                              </button>
                              <p className="mt-1 text-center text-[10px] text-black/50">
                                Same terms, fresh 14-day window
                              </p>
                            </div>

                            {/* Alternative action: Find other creators */}
                            <div className="text-center">
                              <p className="text-[10px] text-black/40 mb-2">or</p>
                              <a
                                href="/beta/dashboard/host/search-creators"
                                className="inline-flex items-center gap-1 rounded-full border border-black/20 bg-white px-4 py-2 text-[10px] font-bold text-black/60 transition-all hover:border-black hover:text-black"
                              >
                                Browse Other Creators →
                              </a>
                              <p className="mt-1 text-[10px] text-black/40">
                                Find someone who's a better fit
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Resend option for declined offers */}
                        {offer.status === "declined" && (
                          <div className="space-y-3">
                            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3 text-center">
                              <p className="text-xs text-red-600">
                                This offer was declined by the creator.
                              </p>
                            </div>
                            
                            {/* Options for declined */}
                            <div className="rounded-lg border border-black/10 bg-black/5 p-3">
                              <p className="text-xs font-bold text-black mb-2">Your options:</p>
                              <div className="space-y-2">
                                <button
                                  onClick={() => setConfirmAction({ type: "resend", offerId: offer.id })}
                                  disabled={resending === offer.id}
                                  className="w-full rounded-full border-2 border-black bg-white py-2 text-xs font-bold text-black transition-all hover:bg-[#FFD84A] disabled:opacity-50"
                                >
                                  {resending === offer.id ? "Resending..." : "Try Again with Better Terms"}
                                </button>
                                <a
                                  href="/beta/dashboard/host/search-creators"
                                  className="block w-full rounded-full border border-black/20 bg-white py-2 text-center text-xs font-bold text-black/60 transition-all hover:border-black hover:text-black"
                                >
                                  Find Similar Creators →
                                </a>
                              </div>
                              <p className="mt-2 text-[10px] text-black/40 text-center">
                                Tip: Consider adjusting your offer amount or deliverables
                              </p>
                            </div>
                          </div>
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

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className={`rounded-xl border-2 border-black px-4 py-3 shadow-lg ${
            toast.type === "error" ? "bg-red-50" : "bg-[#28D17C]"
          }`}>
            <div className="flex items-center gap-2">
              {toast.type === "error" ? (
                <span className="text-red-600"></span>
              ) : (
                <span>✓</span>
              )}
              <span className="text-sm font-bold text-black">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 text-black/60 hover:text-black">×</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-6">
            <h3 className="text-xl font-black text-black">
              {confirmAction.type === "resend" ? "Resend Offer?" : "Withdraw Offer?"}
            </h3>
            <p className="mt-2 text-sm text-black/70">
              {confirmAction.type === "resend" 
                ? "The creator will receive a new notification and have 14 days to respond."
                : "This action cannot be undone. The creator will no longer see this offer."
              }
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 rounded-full border-2 border-black bg-white py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === "resend") {
                    handleResend(confirmAction.offerId)
                  } else {
                    handleWithdraw(confirmAction.offerId)
                  }
                }}
                className={`flex-1 rounded-full border-2 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 ${
                  confirmAction.type === "withdraw" 
                    ? "border-red-500 bg-red-500 text-white" 
                    : "border-black bg-[#FFD84A] text-black"
                }`}
              >
                {confirmAction.type === "resend" ? "Yes, Resend" : "Yes, Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
