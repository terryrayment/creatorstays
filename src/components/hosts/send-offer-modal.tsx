"use client"

import { useState, useEffect } from "react"
import { Select } from "@/components/ui/select"

interface Creator {
  id: number
  name: string
  handle: string
  avatar: string
  niches: string[]
  audienceSize: string
  location: string
  platforms: string[]
  rate: string
  bio: string
  engagementRate: string
}

interface Property {
  id: string
  title: string
  cityRegion: string
  airbnbUrl?: string
}

interface SendOfferModalProps {
  creator: Creator
  onClose: () => void
  onSuccess: (message: string) => void
}

const DEAL_TYPES = [
  { value: "flat", label: "Flat Fee", description: "One-time payment for content" },
  { value: "flat-with-bonus", label: "Flat Fee + Performance Bonus", description: "Base pay + bonus when clicks hit threshold" },
  { value: "post-for-stay", label: "Post-for-Stay", description: "Complimentary stay in exchange for content" },
]

const DELIVERABLE_OPTIONS = [
  "1 Instagram Reel",
  "2 Instagram Reels",
  "3 Instagram Reels",
  "5 Instagram Stories",
  "10 Instagram Stories",
  "1 TikTok Video",
  "2 TikTok Videos",
  "3 TikTok Videos",
  "1 YouTube Video",
  "1 Feed Post",
  "2 Feed Posts",
  "Blog Post",
]

export function SendOfferModal({ creator, onClose, onSuccess }: SendOfferModalProps) {
  const [step, setStep] = useState(1) // 1: Deal Type, 2: Terms, 3: Review
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  
  // Form state
  const [dealType, setDealType] = useState("flat")
  const [selectedProperty, setSelectedProperty] = useState("")
  const [cashAmount, setCashAmount] = useState("")
  const [stayNights, setStayNights] = useState("3")
  const [bonusEnabled, setBonusEnabled] = useState(false)
  const [bonusAmount, setBonusAmount] = useState("100")
  const [bonusThreshold, setBonusThreshold] = useState("1000")
  const [deliverables, setDeliverables] = useState<string[]>(["2 Instagram Reels", "5 Instagram Stories"])
  const [message, setMessage] = useState("")
  const [contentDeadlineDays, setContentDeadlineDays] = useState("14")

  // Load host's properties
  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch('/api/properties')
        if (res.ok) {
          const data = await res.json()
          setProperties(data.properties || [])
          if (data.properties?.length > 0) {
            setSelectedProperty(data.properties[0].id)
          }
        }
      } catch (e) {
        console.error('Failed to load properties:', e)
      }
      setLoadingProperties(false)
    }
    loadProperties()
  }, [])

  // Calculate fees
  const cashCents = Math.round(parseFloat(cashAmount || "0") * 100)
  const hostFee = Math.round(cashCents * 0.15)
  const hostTotal = cashCents + hostFee
  const creatorFee = Math.round(cashCents * 0.15)
  const creatorNet = cashCents - creatorFee
  const bonusCents = Math.round(parseFloat(bonusAmount || "0") * 100)

  // Toggle deliverable
  const toggleDeliverable = (item: string) => {
    if (deliverables.includes(item)) {
      setDeliverables(deliverables.filter(d => d !== item))
    } else {
      setDeliverables([...deliverables, item])
    }
  }

  // Submit offer
  const handleSubmit = async () => {
    if (!selectedProperty) {
      alert("Please select a property")
      return
    }
    if (deliverables.length === 0) {
      alert("Please select at least one deliverable")
      return
    }

    setLoading(true)
    try {
      // For now, we'll use the mock API
      // In production, this would create a real offer in the database
      const res = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: 'current-host', // Will be replaced with session
          creatorId: creator.id.toString(),
          propertyId: selectedProperty,
          proposedType: dealType,
          cashCents: dealType === 'post-for-stay' ? 0 : cashCents,
          stayNights: dealType === 'post-for-stay' ? parseInt(stayNights) : null,
          trafficBonusEnabled: bonusEnabled,
          trafficBonusThreshold: bonusEnabled ? parseInt(bonusThreshold) : null,
          trafficBonusCents: bonusEnabled ? bonusCents : null,
          deliverables,
          message,
        }),
      })

      if (res.ok) {
        onSuccess(`Offer sent to @${creator.handle}! They'll review and respond.`)
        onClose()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to send offer')
      }
    } catch (e) {
      console.error('Failed to send offer:', e)
      alert('Failed to send offer. Please try again.')
    }
    setLoading(false)
  }

  const selectedPropertyData = properties.find(p => p.id === selectedProperty)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-[3px] border-black bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-black bg-[#4AA3FF] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-bold">
              {creator.avatar}
            </div>
            <div>
              <p className="font-bold text-black">{creator.name}</p>
              <p className="text-xs text-black">@{creator.handle} • {creator.audienceSize} followers</p>
            </div>
          </div>
          <button onClick={onClose} className="text-black hover:text-black/70">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="flex border-b border-black/10 bg-black/5">
          {["Deal Type", "Terms", "Review"].map((label, i) => (
            <button
              key={label}
              onClick={() => setStep(i + 1)}
              className={`flex-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider transition-colors ${
                step === i + 1 
                  ? "bg-black text-white" 
                  : step > i + 1 
                  ? "bg-[#28D17C] text-black"
                  : "text-black/50"
              }`}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Step 1: Deal Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-black text-black">SELECT DEAL TYPE</h2>
              
              <div className="space-y-2">
                {DEAL_TYPES.map(type => {
                  const isSelected = dealType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setDealType(type.value)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? "border-black bg-[#FFD84A]"
                          : "border-black/20 hover:border-black"
                      }`}
                    >
                      <p className="font-bold text-black">{type.label}</p>
                      <p className="text-xs text-black/70">{type.description}</p>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full rounded-full bg-black py-3 text-[11px] font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Terms */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-black text-black">SET TERMS</h2>

              {/* Property Selection */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
                  Select Property *
                </label>
                {loadingProperties ? (
                  <p className="text-sm text-black/50">Loading properties...</p>
                ) : properties.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-black/30 p-4 text-center">
                    <p className="text-sm text-black/70">No properties yet</p>
                    <a href="/dashboard/host/properties" className="text-xs font-bold text-[#4AA3FF] underline">
                      Add a property first →
                    </a>
                  </div>
                ) : (
                  <select
                    value={selectedProperty}
                    onChange={e => setSelectedProperty(e.target.value)}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm font-medium text-black"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title || "Untitled"} — {p.cityRegion || "No location"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Cash Amount (for flat and flat-with-bonus) */}
              {dealType !== "post-for-stay" && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
                    Payment Amount *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-black">$</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      placeholder="500"
                      value={cashAmount}
                      onChange={e => setCashAmount(e.target.value)}
                      className="w-full rounded-lg border-2 border-black px-3 py-2 text-lg font-bold text-black placeholder:text-black/30"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-black/50">
                    Creator's suggested rate: {creator.rate}
                  </p>
                </div>
              )}

              {/* Stay Nights (for post-for-stay) */}
              {dealType === "post-for-stay" && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
                    Complimentary Stay (Nights) *
                  </label>
                  <select
                    value={stayNights}
                    onChange={e => setStayNights(e.target.value)}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm font-medium text-black"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(n => (
                      <option key={n} value={n}>{n} night{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bonus (for flat-with-bonus) */}
              {dealType === "flat-with-bonus" && (
                <div className="rounded-lg border-2 border-black bg-[#28D17C]/10 p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-black">
                      Performance Bonus
                    </label>
                    <button
                      onClick={() => setBonusEnabled(!bonusEnabled)}
                      className={`h-6 w-11 rounded-full border-2 border-black transition-colors ${
                        bonusEnabled ? "bg-[#28D17C]" : "bg-white"
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full border border-black bg-white transition-transform ${
                        bonusEnabled ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                  {bonusEnabled && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-black">Bonus Amount</label>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold">$</span>
                          <input
                            type="number"
                            min="0"
                            value={bonusAmount}
                            onChange={e => setBonusAmount(e.target.value)}
                            className="w-full rounded border-2 border-black px-2 py-1 text-sm font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-black">At Click Threshold</label>
                        <input
                          type="number"
                          min="100"
                          step="100"
                          value={bonusThreshold}
                          onChange={e => setBonusThreshold(e.target.value)}
                          className="w-full rounded border-2 border-black px-2 py-1 text-sm font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Deliverables */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
                  Deliverables *
                </label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERABLE_OPTIONS.map(item => (
                    <button
                      key={item}
                      onClick={() => toggleDeliverable(item)}
                      className={`rounded-full border-2 px-3 py-1 text-[11px] font-bold transition-colors ${
                        deliverables.includes(item)
                          ? "border-black bg-black text-white"
                          : "border-black/30 text-black hover:border-black"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Deadline */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
                  Content Deadline
                </label>
                <select
                  value={contentDeadlineDays}
                  onChange={e => setContentDeadlineDays(e.target.value)}
                  className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm font-medium text-black"
                >
                  <option value="7">7 days from acceptance</option>
                  <option value="14">14 days from acceptance</option>
                  <option value="21">21 days from acceptance</option>
                  <option value="30">30 days from acceptance</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
                  Personal Message (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell them about your property and what you're looking for..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm text-black placeholder:text-black/40"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-full border-2 border-black py-3 text-[11px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedProperty || deliverables.length === 0 || (dealType !== 'post-for-stay' && !cashAmount)}
                  className="flex-1 rounded-full bg-black py-3 text-[11px] font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  Review →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-black text-black">REVIEW OFFER</h2>

              {/* Summary Card */}
              <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Sending to</p>
                    <p className="font-bold text-black">{creator.name} (@{creator.handle})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Property</p>
                    <p className="font-bold text-black">{selectedPropertyData?.title || "Property"}</p>
                  </div>
                </div>
              </div>

              {/* Deal Terms */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-black/60">Deal Terms</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/70">Deal Type</span>
                    <span className="font-bold text-black">
                      {DEAL_TYPES.find(t => t.value === dealType)?.label}
                    </span>
                  </div>

                  {dealType !== "post-for-stay" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-black/70">Base Payment</span>
                        <span className="font-bold text-black">${cashAmount}</span>
                      </div>
                      <div className="flex justify-between text-[#4AA3FF]">
                        <span>+ Platform Fee (15%)</span>
                        <span className="font-bold">${(hostFee / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-black/10 pt-2">
                        <span className="font-bold text-black">You Pay</span>
                        <span className="font-bold text-black">${(hostTotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-black/50">
                        <span>Creator Receives</span>
                        <span>${(creatorNet / 100).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {dealType === "post-for-stay" && (
                    <div className="flex justify-between">
                      <span className="text-black/70">Complimentary Stay</span>
                      <span className="font-bold text-black">{stayNights} nights</span>
                    </div>
                  )}

                  {bonusEnabled && (
                    <div className="flex justify-between text-[#28D17C]">
                      <span>Performance Bonus</span>
                      <span className="font-bold">+${bonusAmount} at {parseInt(bonusThreshold).toLocaleString()} clicks</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deliverables */}
              <div className="rounded-xl border-2 border-black bg-white p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-black/60">Deliverables</p>
                <ul className="space-y-1">
                  {deliverables.map(d => (
                    <li key={d} className="flex items-center gap-2 text-sm text-black">
                      <span className="text-[#28D17C]">✓</span> {d}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-black/50">
                  Deadline: {contentDeadlineDays} days from acceptance
                </p>
              </div>

              {/* Message Preview */}
              {message && (
                <div className="rounded-xl border-2 border-black bg-white p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-black/60">Your Message</p>
                  <p className="text-sm text-black">{message}</p>
                </div>
              )}

              {/* Legal Notice */}
              <div className="rounded-lg bg-black/5 p-3 text-[10px] text-black/60">
                By sending this offer, you agree that if accepted, both parties will sign a 
                Collaboration Agreement outlining all terms. Payment is processed via Stripe 
                upon content approval. 15% platform fee applies.
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-full border-2 border-black py-3 text-[11px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
                >
                  ← Edit
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 rounded-full bg-[#28D17C] py-3 text-[11px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Offer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
