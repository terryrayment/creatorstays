"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PropertyGallery } from "@/components/properties/property-gallery"
import { TrafficBonusExplainer } from "@/components/shared/traffic-bonus-tracker"

interface Offer {
  id: string
  hostProfileId: string
  creatorProfileId: string
  offerType: string // "flat", "flat-with-bonus", "post-for-stay"
  cashCents: number
  stayNights: number | null
  trafficBonusEnabled: boolean
  trafficBonusThreshold: number | null
  trafficBonusCents: number | null
  deliverables: string[]
  requirements: string | null
  status: string
  createdAt: string
  expiresAt: string | null
  respondedAt: string | null
  hostViewedAt: string | null  // When host viewed creator's response
  // Enriched data
  host?: {
    displayName: string
    contactEmail: string
  }
  property?: {
    id: string
    title: string
    cityRegion: string
    airbnbUrl: string
    heroImageUrl?: string
    photos: string[]
  }
}

interface StripeStatus {
  connected: boolean
  onboardingComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
}

const DEAL_TYPE_LABELS: Record<string, string> = {
  "flat": "Flat Fee",
  "flat-with-bonus": "Flat Fee + Bonus",
  "post-for-stay": "Post-for-Stay",
}

// Modal for Stripe Connect requirement
function StripeConnectModal({ onClose, onConnect }: { onClose: () => void; onConnect: () => void }) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState("")

  const handleConnect = async () => {
    setConnecting(true)
    setError("")
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        console.error('Stripe connect failed:', data)
        setError(data.error || 'Failed to connect to Stripe. Please try again.')
        setConnecting(false)
      }
    } catch (e) {
      console.error('Stripe connect error:', e)
      setError('Network error. Please check your connection and try again.')
      setConnecting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-6 shadow-2xl">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A]">
          <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-black">Set Up Payments First</h3>
        <p className="mt-2 text-sm text-black/70">
          To accept paid offers and receive payments, you need to connect your bank account through Stripe. This only takes a few minutes.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-black">
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#28D17C] text-xs font-bold text-black">✓</span>
            Secure payments via Stripe
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#28D17C] text-xs font-bold text-black">✓</span>
            Direct deposit to your bank
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#28D17C] text-xs font-bold text-black">✓</span>
            Automatic tax documents (1099)
          </li>
        </ul>
        {error && (
          <div className="mt-4 rounded-lg border-2 border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleConnect}
            disabled={connecting}
            className="flex-1 rounded-full border-2 border-black bg-black py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            {connecting ? 'Connecting...' : 'Connect Stripe →'}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-black/60 hover:text-black"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CreatorOffersInbox() {
  const { data: session } = useSession()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [responding, setResponding] = useState<'approve' | 'counter' | 'decline' | null>(null)
  const [counterCashAmount, setCounterCashAmount] = useState('')
  const [counterMessage, setCounterMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' as 'success' | 'error' | '' })
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)
  const [showStripeModal, setShowStripeModal] = useState(false)

  // Fetch Stripe status
  useEffect(() => {
    async function fetchStripeStatus() {
      try {
        const res = await fetch('/api/stripe/connect')
        if (res.ok) {
          const data = await res.json()
          setStripeStatus(data)
        }
      } catch (e) {
        console.error('Failed to fetch Stripe status:', e)
      }
    }
    if (session?.user) {
      fetchStripeStatus()
    }
  }, [session])

  // Helper to check if an offer requires Stripe
  const requiresStripe = (offer: Offer) => offer.cashCents > 0 || offer.trafficBonusEnabled
  
  // Helper to check if Stripe is ready for payments
  const isStripeReady = stripeStatus?.connected && stripeStatus?.onboardingComplete

  // Fetch offers
  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch('/api/offers?status=pending')
        if (res.ok) {
          const data = await res.json()
          setOffers(data.offers || [])
        }
      } catch (e) {
        console.error('Failed to fetch offers:', e)
      }
      setLoading(false)
    }
    
    if (session?.user) {
      fetchOffers()
    }
  }, [session])

  // Handle offer response
  const handleRespond = async (action: 'accept' | 'counter' | 'decline') => {
    if (!selectedOffer) return
    
    // Check if this is a paid offer and Stripe isn't set up
    if (action === 'accept' && requiresStripe(selectedOffer)) {
      // If Stripe status hasn't loaded yet, show loading state briefly then check
      if (stripeStatus === null) {
        setActionLoading(true)
        // Fetch Stripe status and check
        try {
          const res = await fetch('/api/stripe/connect')
          if (res.ok) {
            const data = await res.json()
            setStripeStatus(data)
            if (!data.connected || !data.onboardingComplete) {
              setShowStripeModal(true)
              setActionLoading(false)
              return
            }
          }
        } catch (e) {
          console.error('Failed to check Stripe status:', e)
        }
        setActionLoading(false)
      } else if (!isStripeReady) {
        setShowStripeModal(true)
        return
      }
    }
    
    setActionLoading(true)
    try {
      const res = await fetch(`/api/offers/${selectedOffer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          counterCashCents: action === 'counter' ? Math.round(parseFloat(counterCashAmount) * 100) : undefined,
          counterMessage: action === 'counter' ? counterMessage : undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Remove from list
        setOffers(offers.filter(o => o.id !== selectedOffer.id))
        setSelectedOffer(null)
        setResponding(null)
        setCounterCashAmount('')
        setCounterMessage('')

        // Show success message
        if (action === 'accept') {
          setToast({ 
            message: data.message || 'Offer accepted! Please sign the agreement.', 
            type: 'success' 
          })
        } else if (action === 'counter') {
          setToast({ message: 'Counter offer sent to host.', type: 'success' })
        } else {
          setToast({ message: 'Offer declined.', type: 'success' })
        }
      } else {
        // Check for Stripe not connected error
        if (data.code === 'STRIPE_NOT_CONNECTED') {
          setShowStripeModal(true)
        } else {
          setToast({ message: data.error || 'Failed to respond', type: 'error' })
        }
      }
    } catch (e) {
      console.error('Failed to respond:', e)
      setToast({ message: 'Network error. Please try again.', type: 'error' })
    }
    setActionLoading(false)
    setTimeout(() => setToast({ message: '', type: '' }), 5000)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  if (loading) {
    return (
      <div className="rounded-2xl border-[3px] border-black bg-white p-8 text-center">
        <p className="text-sm text-black/60">Loading offers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stripe Connect Modal */}
      {showStripeModal && (
        <StripeConnectModal
          onClose={() => setShowStripeModal(false)}
          onConnect={() => setShowStripeModal(false)}
        />
      )}

      {/* Toast */}
      {toast.message && (
        <div className={`rounded-xl border-2 border-black px-4 py-3 text-sm font-bold ${
          toast.type === 'success' ? 'bg-[#28D17C] text-black' : 'bg-red-100 text-red-700'
        }`}>
          {toast.type === 'success' && '✓ '}{toast.message}
        </div>
      )}

      {/* Offers list */}
      <div className="rounded-2xl border-[3px] border-black bg-white overflow-hidden">
        <div className="border-b-2 border-black bg-black/5 px-5 py-3">
          <h2 className="text-sm font-bold text-black">Incoming Offers</h2>
          <p className="text-xs text-black/60">{offers.length} pending</p>
        </div>
        
        {offers.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A]">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-black">No offers yet</p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-black/60">
              Complete your profile to get discovered by hosts. The more complete your profile, the more likely you are to receive offers.
            </p>
            <Link
              href="/dashboard/creator/settings"
              className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-6 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-1"
            >
              Complete Your Profile
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-black/10">
            {offers.map(offer => (
              <button
                key={offer.id}
                type="button"
                onClick={() => setSelectedOffer(offer)}
                className={`w-full px-5 py-4 text-left transition-colors hover:bg-black/[0.02] ${
                  selectedOffer?.id === offer.id ? 'bg-[#FFD84A]/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-black">{offer.host?.displayName || 'Host'}</p>
                    <p className="text-sm text-black">{offer.property?.title || 'Property'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-black/30 bg-black/5 px-2 py-0.5 font-bold text-black">
                        {DEAL_TYPE_LABELS[offer.offerType] || offer.offerType}
                      </span>
                      {offer.cashCents > 0 && (
                        <span className="font-bold text-black">{formatCurrency(offer.cashCents)}</span>
                      )}
                      {offer.offerType === 'post-for-stay' && offer.stayNights && (
                        <span className="text-black">{offer.stayNights} nights stay</span>
                      )}
                      {offer.trafficBonusEnabled && offer.trafficBonusCents && (
                        <span className="text-[#28D17C]">
                          +{formatCurrency(offer.trafficBonusCents)} bonus
                        </span>
                      )}
                      <span className="text-black/50">· {formatDate(offer.createdAt)}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A] text-xs font-bold text-black">
                      !
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected offer detail */}
      {selectedOffer && (
        <div className="rounded-2xl border-[3px] border-black bg-white overflow-hidden">
          {/* Property Gallery */}
          {selectedOffer.property && (selectedOffer.property.heroImageUrl || selectedOffer.property.photos?.length > 0) && (
            <div className="border-b-2 border-black">
              <PropertyGallery 
                photos={selectedOffer.property.photos || []}
                heroImage={selectedOffer.property.heroImageUrl}
                title={selectedOffer.property.title}
                size="md"
              />
            </div>
          )}

          {/* Header */}
          <div className="border-b-2 border-black bg-[#4AA3FF] px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-black">{selectedOffer.property?.title || 'Property'}</h2>
                <p className="text-sm text-black">
                  From {selectedOffer.host?.displayName} · {selectedOffer.property?.cityRegion}
                </p>
              </div>
              <button 
                onClick={() => { setSelectedOffer(null); setResponding(null) }}
                className="text-black/60 hover:text-black"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Deal Type Badge */}
            <div className="flex items-center gap-2">
              <span className="rounded-full border-2 border-black bg-[#FFD84A] px-3 py-1 text-xs font-bold text-black">
                {DEAL_TYPE_LABELS[selectedOffer.offerType] || selectedOffer.offerType}
              </span>
            </div>

            {/* Response Status (for offers you've responded to) */}
            {selectedOffer.status !== 'pending' && selectedOffer.respondedAt && (
              <div className={`rounded-lg border-2 p-3 ${
                selectedOffer.hostViewedAt 
                  ? 'border-[#28D17C] bg-[#28D17C]/10' 
                  : 'border-[#FFD84A] bg-[#FFD84A]/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedOffer.hostViewedAt ? (
                      <>
                        <svg className="h-4 w-4 text-[#28D17C]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold text-black">Host viewed your response</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 text-[#FFD84A]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold text-black">Waiting for host to view</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-black/50">
                    {selectedOffer.hostViewedAt 
                      ? formatDate(selectedOffer.hostViewedAt)
                      : `Sent ${formatDate(selectedOffer.respondedAt)}`
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Pay breakdown */}
            <div className="rounded-xl border-2 border-black bg-black/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Compensation</p>
              <div className="mt-3 space-y-2">
                {selectedOffer.cashCents > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black">Base Payment</span>
                    <span className="text-lg font-bold text-black">{formatCurrency(selectedOffer.cashCents)}</span>
                  </div>
                )}
                {selectedOffer.offerType === 'post-for-stay' && selectedOffer.stayNights && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black">Complimentary Stay</span>
                    <span className="text-lg font-bold text-black">{selectedOffer.stayNights} nights</span>
                  </div>
                )}
                {selectedOffer.cashCents > 0 && (
                  <div className="border-t border-black/10 pt-2">
                    <div className="flex items-center justify-between text-xs text-black/50">
                      <span>Platform fee (15%)</span>
                      <span>-{formatCurrency(Math.round(selectedOffer.cashCents * 0.15))}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-black">You Receive</span>
                      <span className="text-lg font-bold text-[#28D17C]">
                        {formatCurrency(Math.round(selectedOffer.cashCents * 0.85))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Traffic Bonus Explainer */}
            {selectedOffer.trafficBonusEnabled && selectedOffer.trafficBonusCents && selectedOffer.trafficBonusThreshold && (
              <TrafficBonusExplainer
                threshold={selectedOffer.trafficBonusThreshold}
                bonusCents={selectedOffer.trafficBonusCents}
              />
            )}

            {/* Deliverables */}
            {selectedOffer.deliverables && selectedOffer.deliverables.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/60 mb-2">Deliverables</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOffer.deliverables.map(d => (
                    <span key={d} className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {selectedOffer.requirements && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/60 mb-1">Message from Host</p>
                <p className="text-sm leading-relaxed text-black bg-black/5 rounded-lg p-3">
                  {selectedOffer.requirements}
                </p>
              </div>
            )}

            {/* Property Link */}
            {selectedOffer.property?.airbnbUrl && (
              <a 
                href={selectedOffer.property.airbnbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border-2 border-black/20 p-3 text-xs font-bold text-black hover:border-black transition-colors"
              >
                🏠 View Property on Airbnb →
              </a>
            )}

            {/* Response actions */}
            {!responding && (
              <div className="space-y-3 pt-2">
                {/* Stripe setup notice for paid offers */}
                {requiresStripe(selectedOffer) && !isStripeReady && stripeStatus !== null && (
                  <div className="flex items-start gap-3 rounded-lg border-2 border-amber-300 bg-amber-50 p-3">
                    <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Payment setup required</p>
                      <p className="mt-0.5 text-xs text-amber-700">
                        Connect your bank account via Stripe to accept this paid offer. You'll be guided through setup when you click Accept.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleRespond('accept')} 
                    disabled={actionLoading}
                    className="flex-1 bg-[#28D17C] hover:bg-[#28D17C]/90"
                  >
                    {actionLoading ? 'Processing...' : (
                      requiresStripe(selectedOffer) && !isStripeReady && stripeStatus !== null
                        ? 'Accept (Setup Payments) →'
                        : 'Accept Offer'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setResponding('counter')} 
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    Counter
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleRespond('decline')}
                    disabled={actionLoading}
                    className="text-black/60 hover:text-red-600"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            )}

            {/* Counter form */}
            {responding === 'counter' && (
              <div className="space-y-3 rounded-xl border-2 border-black bg-[#FFD84A]/10 p-4">
                <p className="text-sm font-bold text-black">Make a Counter Offer</p>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black">
                    Your Rate ($)
                  </label>
                  <Input
                    type="number"
                    placeholder={`e.g., ${Math.round(selectedOffer.cashCents / 100 * 1.25)}`}
                    value={counterCashAmount}
                    onChange={e => setCounterCashAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-black">
                    Message (optional)
                  </label>
                  <textarea
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black focus:outline-none"
                    rows={2}
                    placeholder="Explain your rate or request additional terms..."
                    value={counterMessage}
                    onChange={e => setCounterMessage(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleRespond('counter')} 
                    disabled={!counterCashAmount || actionLoading}
                  >
                    {actionLoading ? 'Sending...' : 'Send Counter'}
                  </Button>
                  <Button variant="ghost" onClick={() => setResponding(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
