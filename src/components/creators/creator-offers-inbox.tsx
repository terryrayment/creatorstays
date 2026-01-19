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
  proposedType: 'affiliate' | 'flat' | 'post-for-stay'
  proposedPercent?: number
  proposedFlatFee?: number
  message: string
  deliverables: string[]
  createdAt: Date
}

// Mock pending offers
const mockOffers: OfferRequest[] = [
  {
    id: 'req-1',
    hostName: 'Mountain View Retreats',
    propertyTitle: 'Cozy A-Frame Cabin',
    propertyLocation: 'Big Bear Lake, CA',
    proposedType: 'affiliate',
    proposedPercent: 10,
    message: "Hi! We love your travel content and think our cabin would be perfect for your audience. We're offering 10% affiliate commission on all bookings from your link.",
    deliverables: ['2 Reels', '5 Stories', '1 Feed Post'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 'req-2',
    hostName: 'Coastal Getaways',
    propertyTitle: 'Modern Beach House',
    propertyLocation: 'Malibu, CA',
    proposedType: 'flat',
    proposedFlatFee: 500,
    message: "We'd like to hire you for a flat fee collaboration. $500 for content showcasing our beach house.",
    deliverables: ['1 Reel', '3 Stories'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
]

export function CreatorOffersInbox() {
  const [offers, setOffers] = useState<OfferRequest[]>(mockOffers)
  const [selectedOffer, setSelectedOffer] = useState<OfferRequest | null>(null)
  const [responding, setResponding] = useState<'approve' | 'counter' | 'decline' | null>(null)
  const [counterPercent, setCounterPercent] = useState('')
  const [counterMessage, setCounterMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleRespond = (action: 'approve' | 'counter' | 'decline') => {
    if (!selectedOffer) return

    if (action === 'approve') {
      setSuccessMessage(`Collaboration approved! Your unique affiliate link has been generated.`)
      setOffers(offers.filter(o => o.id !== selectedOffer.id))
      setSelectedOffer(null)
    } else if (action === 'decline') {
      setOffers(offers.filter(o => o.id !== selectedOffer.id))
      setSelectedOffer(null)
      setSuccessMessage('Offer declined.')
    } else if (action === 'counter') {
      setSuccessMessage(`Counter offer sent: ${counterPercent}% commission.`)
      setOffers(offers.filter(o => o.id !== selectedOffer.id))
      setSelectedOffer(null)
      setCounterPercent('')
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
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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
            <div className="py-8 text-center text-sm text-muted-foreground">
              No pending offers. When hosts reach out, they&apos;ll appear here.
            </div>
          ) : (
            <div className="divide-y divide-foreground/5">
              {offers.map(offer => (
                <button
                  key={offer.id}
                  onClick={() => setSelectedOffer(offer)}
                  className={`w-full px-5 py-4 text-left transition-colors hover:bg-foreground/[0.02] ${
                    selectedOffer?.id === offer.id ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{offer.hostName}</p>
                      <p className="text-sm text-muted-foreground">{offer.propertyTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {offer.proposedType === 'affiliate' && `${offer.proposedPercent}% affiliate`}
                        {offer.proposedType === 'flat' && `$${offer.proposedFlatFee} flat fee`}
                        {offer.proposedType === 'post-for-stay' && 'Post-for-stay'}
                        {' · '}{formatDate(offer.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-700">
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
            {/* Offer terms */}
            <div className="mb-4 rounded-lg bg-foreground/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proposed Terms</p>
              <div className="mt-2 space-y-1 text-sm">
                {selectedOffer.proposedType === 'affiliate' && (
                  <p><strong>{selectedOffer.proposedPercent}%</strong> affiliate commission per booking</p>
                )}
                {selectedOffer.proposedType === 'flat' && (
                  <p><strong>${selectedOffer.proposedFlatFee}</strong> flat fee</p>
                )}
                {selectedOffer.proposedType === 'post-for-stay' && (
                  <p><strong>Post-for-stay</strong> arrangement</p>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deliverables</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedOffer.deliverables.map(d => (
                    <span key={d} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{selectedOffer.message}</p>
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
                <Button variant="ghost" onClick={() => handleRespond('decline')} className="text-muted-foreground">
                  Decline
                </Button>
              </div>
            )}

            {/* Counter form */}
            {responding === 'counter' && (
              <div className="space-y-3 rounded-lg border border-foreground/10 p-4">
                <p className="text-sm font-medium">Make a counter offer</p>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Your affiliate %</label>
                  <Input
                    type="number"
                    placeholder="e.g., 15"
                    value={counterPercent}
                    onChange={e => setCounterPercent(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Message (optional)</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Add a note..."
                    value={counterMessage}
                    onChange={e => setCounterMessage(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleRespond('counter')} disabled={!counterPercent}>
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
