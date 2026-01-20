"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

// Mock collaboration data
const mockCollaboration = {
  id: "collab-123",
  creator: {
    name: "Amy Chen",
    handle: "wanderlust_amy",
    initials: "AC",
  },
  property: {
    title: "Cozy A-Frame Cabin",
    location: "Big Bear Lake, CA",
  },
  deliverables: ["2 Instagram Reels", "5 Stories", "1 Feed Post"],
  agreedAmount: 500,
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function HostApprovePay() {
  const [agreedAmount, setAgreedAmount] = useState(mockCollaboration.agreedAmount)
  const [showModal, setShowModal] = useState(false)

  // Fee calculations
  const hostPlatformFee = agreedAmount * 0.15
  const hostTotalCharged = agreedAmount * 1.15
  const creatorPlatformFee = agreedAmount * 0.15
  const creatorNetPayout = agreedAmount * 0.85
  const platformEarnsTotal = agreedAmount * 0.30

  return (
    <div className="space-y-4">
      {/* Creator & Campaign Summary */}
      <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Campaign</p>
        
        <div className="mt-3 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-white text-lg font-black text-black">
            {mockCollaboration.creator.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-black">{mockCollaboration.creator.name}</h3>
            <p className="text-sm text-black">@{mockCollaboration.creator.handle}</p>
            <div className="mt-2 rounded-lg border-2 border-black bg-white/50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Property</p>
              <p className="font-bold text-black">{mockCollaboration.property.title}</p>
              <p className="text-xs text-black">{mockCollaboration.property.location}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t-2 border-black/20 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Deliverables</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {mockCollaboration.deliverables.map((d) => (
              <span
                key={d}
                className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Agreed Amount Input */}
      <div className="rounded-2xl border-[3px] border-black bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Agreed Creator Payout</p>
        <p className="text-xs text-black/60">The amount you agreed to pay the creator</p>
        
        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-black text-black">$</span>
          <input
            type="number"
            min="1"
            step="1"
            value={agreedAmount}
            onChange={(e) => setAgreedAmount(Math.max(0, Number(e.target.value)))}
            className="w-32 rounded-xl border-[3px] border-black px-4 py-3 text-2xl font-black text-black focus:outline-none focus:ring-2 focus:ring-black/20"
          />
          <span className="text-sm font-bold text-black/60">USD</span>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="rounded-2xl border-[3px] border-black bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Fee Breakdown</p>
        <p className="text-xs text-black/60">Platform fees are 15% from each party</p>

        <div className="mt-4 space-y-4">
          {/* Host side */}
          <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black">You Pay</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Creator payout (gross)</span>
                <span className="font-bold text-black">{formatCurrency(agreedAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Host platform fee (15%)</span>
                <span className="font-bold text-black">+ {formatCurrency(hostPlatformFee)}</span>
              </div>
              <div className="border-t-2 border-black/20 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black">Your total</span>
                  <span className="text-2xl font-black text-black">{formatCurrency(hostTotalCharged)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Creator side */}
          <div className="rounded-xl border-2 border-black bg-[#28D17C] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black">Creator Receives</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Creator payout (gross)</span>
                <span className="font-bold text-black">{formatCurrency(agreedAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black">Creator platform fee (15%)</span>
                <span className="font-bold text-black">− {formatCurrency(creatorPlatformFee)}</span>
              </div>
              <div className="border-t-2 border-black/20 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black">Creator net payout</span>
                  <span className="text-2xl font-black text-black">{formatCurrency(creatorNetPayout)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform summary */}
          <div className="rounded-xl border-2 border-dashed border-black/30 p-3 text-center">
            <p className="text-xs text-black/60">
              Platform revenue: <span className="font-bold text-black">{formatCurrency(platformEarnsTotal)}</span>
              <span className="text-black/40"> (15% + 15%)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Pay CTA */}
      <Button 
        size="lg" 
        className="w-full rounded-full border-[3px] border-black bg-black py-6 text-base font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-1 hover:bg-black/90"
        onClick={() => setShowModal(true)}
      >
        Pay {formatCurrency(hostTotalCharged)} Now
      </Button>

      <p className="text-center text-xs text-black/60">
        🔒 Secure payment via Stripe
      </p>

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border-[3px] border-black bg-white p-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#4AA3FF]">
              <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-black">Stripe Checkout</h3>
            <p className="mt-2 text-sm text-black/70">
              Stripe Connect integration coming soon. This preview shows what the payment flow will look like.
            </p>
            <div className="mt-4 rounded-xl border-2 border-black bg-[#FFD84A] p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">You would be charged</p>
              <p className="mt-1 text-3xl font-black text-black">{formatCurrency(hostTotalCharged)}</p>
            </div>
            <Button 
              className="mt-4 w-full rounded-full border-2 border-black bg-black py-3 font-bold text-white hover:bg-black/90" 
              onClick={() => setShowModal(false)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
