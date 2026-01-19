"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel"
import { Input } from "@/components/ui/input"

interface OfferRequest {
  id: string
  hostName: string
  propertyTitle: string
  propertyLocation: string
  basePay: number
  deliverables: string[]
  trafficBonus?: {
    amount: number
    threshold: number
    metric: 'clicks'
  }
  message: string
  createdAt: Date
}

// Mock pending offers
const mockOffers: OfferRequest[] = [
  {
    id: 'req-1',
    hostName: 'Mountain View Retreats',
    propertyTitle: 'Cozy A-Frame Cabin',
    propertyLocation: 'Big Bear Lake, CA',
    basePay: 400,
    trafficBonus: { amount: 50, threshold: 1000, metric: 'clicks' },
    message: "Hi! We love your travel content and think our cabin would be perfect for your audience. We're offering $400 for the deliverables plus a $50 bonus if your link hits 1,000 clicks.",
    deliverables: ['2 Reels', '5 Stories', '1 Feed Post'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'req-2',
    hostName: 'Coastal Getaways',
    propertyTitle: 'Modern Beach House',
    propertyLocation: 'Malibu, CA',
    basePay: 500,
    message: "We'd like to hire you for content showcasing our beach house. $500 flat rate for the deliverables listed.",
    deliverables: ['1 Reel', '3 Stories'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
]

export function CreatorOffersInbox() {
  const [offers, setOffers] = useState<OfferRequest[]>(mockOffers)
  const [selectedOffer, setSelectedOffer] = useState<OfferRequest | null>(null)
  const [responding, setResponding] = useState<'approve' | 'counter' | 'decline' | null>(null)
  const [counterBasePay, setCounterBasePay] = useState('')
  const [counterMessage, setCounterMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleRespond = (action: 'approve' | 'counter' | 'decline') => {
    if (!selectedOffer) return

    if (action === 'approve') {
      setSuccessMessage(`Collaboration approved! Your tracked link has been generated.`)
      setOffers(offers.filter(o => o.id !== selectedOffer.id))
      setSelectedOffer(null)
    } else if (action === 'decline') {
      setOffers(offers.filter(o => o.id !== selectedOffer.id))
      setSelectedOffer(null)
      setSuccessMessage('Offer declined.')
    } else if (action === 'counter') {
      setSuccessMessage(`Counter offer sent: $${counterBasePay} base pay.`)
      setOffers(offers.filter(o => o.id !== selectedOffer.id))
      setSelectedOffer(null)
      setCounterBasePay('')
      setCounterMessage('')
    }
    
    setResponding(null)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  const formatDate = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="rounded-lg border-2 border-black bg-[#28D17C] px-4 py-3 text-sm font-bold text-black">
          {successMessage}
        </div>
      )}

      {/* Offers list */}
      <Panel>
        <PanelHeader 
          title="Incoming Offers" 
          description={`${offers.length} pending`}
        />
        <PanelContent className="p-0">
          {offers.length === 0 ? (
            <div className="py-8 text-center text-sm text-black/60">
              No pending offers. When hosts reach out, they&apos;ll appear here.
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {offers.map(offer => (
                <button
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className={`w-full px-5 py-4 text-left transition-colors hover:bg-black/[0.02] ${
                    selectedOffer?.id === offer.id ? 'bg-[#FFD84A]/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-black">{offer.hostName}</p>
                      <p className="text-sm text-black">{offer.propertyTitle}</p>
                      <p className="mt-1 text-xs text-black/60">
                        <span className="font-bold text-black">${offer.basePay}</span> base
                        {offer.trafficBonus && (
                          <span className="text-black"> + ${offer.trafficBonus.amount} at {offer.trafficBonus.threshold.toLocaleString()} clicks</span>
                        )}
                        {' · '}{formatDate(offer.createdAt)}
                      </p>
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
        </PanelContent>
      </Panel>

      {/* Selected offer detail */}
      {selectedOffer && (
        <Panel variant="elevated">
          <PanelHeader 
            title={selectedOffer.propertyTitle}
            description={`From ${selectedOffer.hostName} · ${selectedOffer.propertyLocation}`}
          />
          <PanelContent>
            {/* Pay breakdown */}
            <div className="mb-4 rounded-lg border-2 border-black bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black">Pay Breakdown</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black">Base pay (per deliverable set)</span>
                  <span className="text-sm font-bold text-black">${selectedOffer.basePay}</span>
                </div>
                {selectedOffer.trafficBonus && (
                  <div className="flex items-center justify-between border-t border-black/10 pt-2">
                    <span className="text-sm text-black">Traffic bonus at {selectedOffer.trafficBonus.threshold.toLocaleString()} clicks</span>
                    <span className="text-sm font-bold text-black">+${selectedOffer.trafficBonus.amount}</span>
                  </div>
                )}
              </div>
              {selectedOffer.trafficBonus && (
                <p className="mt-3 text-[10px] text-black/60">
                  Traffic bonus is based on tracked link clicks (not booking data).
                </p>
              )}
            </div>

            {/* Deliverables */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black">Deliverables</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedOffer.deliverables.map(d => (
                  <span key={d} className="rounded-full border-2 border-black bg-[#4AA3FF]/20 px-2 py-0.5 text-xs font-bold text-black">{d}</span>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black">Message</p>
              <p className="mt-1 text-sm leading-relaxed text-black">{selectedOffer.message}</p>
            </div>

            {/* Response actions */}
            {!responding && (
              <div className="flex gap-2">
                <Button onClick={() => handleRespond('approve')} className="flex-1">
                  Approve
                </Button>
                <Button variant="outline" onClick={() => setResponding('counter')} className="flex-1">
                  Counter
                </Button>
                <Button variant="ghost" onClick={() => handleRespond('decline')} className="text-black/60">
                  Decline
                </Button>
              </div>
            )}

            {/* Counter form */}
            {responding === 'counter' && (
              <div className="space-y-3 rounded-lg border-2 border-black p-4">
                <p className="text-sm font-bold text-black">Make a counter offer</p>
                <div>
                  <label className="mb-1 block text-xs font-bold text-black">Your base pay request ($)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 600"
                    value={counterBasePay}
                    onChange={e => setCounterBasePay(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-black">Message (optional)</label>
                  <textarea
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black focus:outline-none"
                    rows={2}
                    placeholder="Add a note..."
                    value={counterMessage}
                    onChange={e => setCounterMessage(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleRespond('counter')} disabled={!counterBasePay}>
                    Send Counter
                  </Button>
                  <Button variant="ghost" onClick={() => setResponding(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </PanelContent>
        </Panel>
      )}
    </div>
  )
}
