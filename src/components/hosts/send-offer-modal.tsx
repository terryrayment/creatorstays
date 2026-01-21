"use client"

import { useState, useEffect } from "react"
import { StyledSelect } from "@/components/ui/styled-select"

interface Creator {
  id: string | number
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
  displayName?: string
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
  { value: "post-for-stay", label: "Post-for-Stay", description: "Complimentary stay in exchange for content • $99 platform fee" },
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
  const [step, setStep] = useState(1) // 1: Deal Type, 2: Terms, 3: Review, 4: Confirmation
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [sentOfferId, setSentOfferId] = useState<string | null>(null)
  
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
          // Don't auto-select - require explicit selection unless only one property
          if (data.properties?.length === 1) {
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
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorProfileId: String(creator.id),
          propertyId: selectedProperty,
          offerType: dealType,
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
        const data = await res.json()
        setSentOfferId(data.offer?.id || null)
        setStep(4) // Show confirmation screen
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

  // Get creator name (handle both displayName and name)
  const creatorName = creator.displayName || creator.name

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-[3px] border-black bg-white">
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between border-b-2 border-black p-4 ${step === 4 ? 'bg-[#28D17C]' : 'bg-[#4AA3FF]'}`}>
          <div className="flex items-center gap-3">
            {step === 4 ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white">
                <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-bold">
                {creator.avatar}
              </div>
            )}
            <div>
              <p className="font-bold text-black">{step === 4 ? 'Offer Sent Successfully' : creatorName}</p>
              <p className="text-xs text-black">{step === 4 ? `To @${creator.handle}` : `@${creator.handle} • ${creator.audienceSize} followers`}</p>
            </div>
          </div>
          <button onClick={() => { if (step === 4) { onSuccess(`Offer sent to @${creator.handle}!`); } onClose(); }} className="text-black hover:text-black/70">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress - hide on confirmation */}
        {step < 4 && (
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
        )}

        <div className="p-5">
          {/* Step 1: Deal Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-black text-black">SELECT DEAL TYPE</h2>
              
              <div className="space-y-2">
                {DEAL_TYPES.map(type => {
                  const isSelected = dealType === type.value
                  return (
                    <div
                      key={type.value}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Clicking deal type:', type.value)
                        setDealType(type.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setDealType(type.value)
                        }
                      }}
                      style={{
                        backgroundColor: isSelected ? '#FFD84A' : 'white',
                        borderColor: isSelected ? '#000' : 'rgba(0,0,0,0.2)',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        textAlign: 'left' as const,
                        width: '100%',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#000'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      <p style={{ fontWeight: 'bold', color: '#000', margin: 0 }}>{type.label}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.7)', margin: '4px 0 0 0' }}>{type.description}</p>
                    </div>
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
                  <>
                    <StyledSelect
                      value={selectedProperty}
                      onChange={setSelectedProperty}
                      options={properties.map(p => ({
                        value: p.id,
                        label: `${p.title || "Untitled"} — ${p.cityRegion || "No location"}`
                      }))}
                      placeholder="Select a property..."
                    />
                    {/* Warning when multiple properties but none selected */}
                    {properties.length > 1 && !selectedProperty && (
                      <div className="mt-2 flex items-start gap-2 rounded-lg border-2 border-amber-400 bg-amber-50 px-3 py-2">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <p className="text-xs text-amber-800">
                          <span className="font-bold">Please select which property</span> you want the creator to feature in their content.
                        </p>
                      </div>
                    )}
                    {/* Show selected property preview */}
                    {selectedProperty && selectedPropertyData && (
                      <div className="mt-2 rounded-lg border border-black/20 bg-black/5 px-3 py-2">
                        <p className="text-xs text-black/60">
                          ✓ Content will feature: <span className="font-bold text-black">{selectedPropertyData.title || "Untitled Property"}</span>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Cash Amount (for flat and flat-with-bonus) */}
              {dealType !== "post-for-stay" && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
                    Creator Payment Amount *
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

                  {/* Fee Preview - shows when amount is entered */}
                  {cashAmount && parseFloat(cashAmount) > 0 && (
                    <div className="mt-3 overflow-hidden rounded-lg border-2 border-black">
                      {/* Your Total - Most prominent */}
                      <div className="flex items-center justify-between bg-black px-3 py-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white">Your Total</span>
                        <span className="text-lg font-black text-white">${(hostTotal / 100).toFixed(2)}</span>
                      </div>
                      
                      {/* Breakdown */}
                      <div className="space-y-1.5 bg-black/5 p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-black/70">Creator payment</span>
                          <span className="font-medium text-black">${parseFloat(cashAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black/70">Platform fee (15%)</span>
                          <span className="font-medium text-black/70">+${(hostFee / 100).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-black/10 pt-1.5">
                          <div className="flex justify-between text-[12px] text-black/50">
                            <span>Creator receives (after their 15% fee)</span>
                            <span>${(creatorNet / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stay Nights (for post-for-stay) */}
              {dealType === "post-for-stay" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
                      Complimentary Stay (Nights) *
                    </label>
                    <StyledSelect
                      value={stayNights}
                      onChange={setStayNights}
                      options={[1, 2, 3, 4, 5, 6, 7].map(n => ({
                        value: n.toString(),
                        label: `${n} night${n > 1 ? 's' : ''}`
                      }))}
                      placeholder="Select nights..."
                    />
                  </div>
                  
                  {/* Platform fee notice */}
                  <div className="rounded-lg border-2 border-black bg-[#4AA3FF]/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-black">Platform Fee</span>
                      <span className="text-lg font-black text-black">$99</span>
                    </div>
                    <p className="mt-1 text-[10px] text-black/60">
                      One-time fee for post-for-stay collaborations, charged upon offer acceptance.
                    </p>
                  </div>

                  {/* Date coordination notice */}
                  <div className="rounded-lg border-2 border-[#FFD84A] bg-[#FFD84A]/20 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-black">Important: Coordinate Dates Directly</p>
                    <p className="mt-1 text-xs text-black/80">
                      CreatorStays facilitates the collaboration, but you and the creator are responsible for 
                      coordinating stay dates directly. Book the creator through your preferred platform 
                      (Airbnb, direct booking, etc.) once you have agreed on dates.
                    </p>
                  </div>
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
                <StyledSelect
                  value={contentDeadlineDays}
                  onChange={setContentDeadlineDays}
                  options={[
                    { value: "7", label: "7 days from acceptance" },
                    { value: "14", label: "14 days from acceptance" },
                    { value: "21", label: "21 days from acceptance" },
                    { value: "30", label: "30 days from acceptance" },
                  ]}
                  placeholder="Select deadline..."
                />
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
                    <p className="font-bold text-black">{creatorName} (@{creator.handle})</p>
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
                        <span className="text-black/70">Creator Payment</span>
                        <span className="font-bold text-black">${cashAmount}</span>
                      </div>
                      <div className="flex justify-between text-black/50">
                        <span>Platform Fee (15%)</span>
                        <span>+${(hostFee / 100).toFixed(2)}</span>
                      </div>
                      <div className="-mx-4 mt-2 flex justify-between border-t-2 border-black bg-black px-4 py-2">
                        <span className="font-bold text-white">You Pay</span>
                        <span className="text-lg font-black text-white">${(hostTotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 text-[12px] text-black/50">
                        <span>Creator receives (after their 15% fee)</span>
                        <span>${(creatorNet / 100).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {dealType === "post-for-stay" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-black/70">Complimentary Stay</span>
                        <span className="font-bold text-black">{stayNights} nights</span>
                      </div>
                      <div className="flex justify-between border-t border-black/10 pt-2">
                        <span className="text-black/70">Platform Fee</span>
                        <span className="font-bold text-black">$99</span>
                      </div>
                      <div className="mt-2 rounded bg-[#FFD84A]/30 p-2 text-[10px] text-black/70">
                        You and the creator will coordinate stay dates directly after acceptance.
                      </div>
                    </>
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
                Collaboration Agreement outlining all terms. {dealType === "post-for-stay" 
                  ? "A $99 platform fee will be charged upon acceptance. Stay dates are coordinated directly between you and the creator." 
                  : "Payment is processed via Stripe upon content approval. 15% platform fee applies."}
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

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-5 text-center">
              {/* Success Icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-black bg-[#28D17C]">
                <svg className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              <div>
                <h2 className="font-heading text-2xl font-black text-black">OFFER SENT!</h2>
                <p className="mt-2 text-sm text-black/70">
                  Your offer has been sent to <span className="font-bold">@{creator.handle}</span>
                </p>
              </div>

              {/* What was sent */}
              <div className="mx-auto max-w-sm rounded-xl border-2 border-black bg-[#FFD84A]/20 p-4 text-left">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-black/60">Offer Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/70">To</span>
                    <span className="font-bold text-black">{creatorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/70">Property</span>
                    <span className="font-bold text-black">{selectedPropertyData?.title || "Property"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/70">Deal Type</span>
                    <span className="font-bold text-black">{DEAL_TYPES.find(t => t.value === dealType)?.label}</span>
                  </div>
                  {dealType !== "post-for-stay" && (
                    <div className="flex justify-between">
                      <span className="text-black/70">Amount</span>
                      <span className="font-bold text-black">${cashAmount}</span>
                    </div>
                  )}
                  {dealType === "post-for-stay" && (
                    <div className="flex justify-between">
                      <span className="text-black/70">Stay</span>
                      <span className="font-bold text-black">{stayNights} nights</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-black/70">Deliverables</span>
                    <span className="font-bold text-black">{deliverables.length} items</span>
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="mx-auto max-w-sm rounded-xl border-2 border-black bg-white p-4 text-left">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-black/60">What Happens Next</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4AA3FF] text-[10px] font-bold text-white">1</span>
                    <span className="text-black/80"><span className="font-bold text-black">Email sent</span> — {creatorName} will receive an email notification about your offer</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4AA3FF] text-[10px] font-bold text-white">2</span>
                    <span className="text-black/80"><span className="font-bold text-black">Creator reviews</span> — They can accept, counter, or decline within 7 days</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4AA3FF] text-[10px] font-bold text-white">3</span>
                    <span className="text-black/80"><span className="font-bold text-black">You'll be notified</span> — We'll email you when they respond</span>
                  </li>
                </ul>
              </div>

              {/* Confirmation email notice */}
              <div className="rounded-lg bg-black/5 p-3 text-[11px] text-black/60">
                <span className="font-bold">📧 Confirmation sent to your email</span> with a copy of this offer
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSuccess(`Offer sent to @${creator.handle}!`)
                    onClose()
                  }}
                  className="flex-1 rounded-full bg-black py-3 text-[11px] font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
                >
                  Done
                </button>
                <a
                  href="/dashboard/host/offers"
                  className="flex-1 rounded-full border-2 border-black py-3 text-center text-[11px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
                >
                  View All Offers →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
