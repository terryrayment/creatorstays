"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel, PanelHeader, PanelContent } from "@/components/ui/panel"

// Mock collaboration data
const mockCollaboration = {
  id: "collab-123",
  creator: {
    name: "Amy Chen",
    handle: "@wanderlust_amy",
    avatar: null,
  },
  property: {
    title: "Cozy A-Frame Cabin",
    location: "Big Bear Lake, CA",
  },
  deliverables: ["2 Reels", "5 Stories", "1 Feed Post"],
  agreedAmount: 500, // Default agreed amount
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
    <div className="space-y-6">
      {/* Creator & Campaign Summary */}
      <Panel variant="elevated">
        <PanelHeader title="Campaign Summary" />
        <PanelContent>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
              AC
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">{mockCollaboration.creator.name}</h3>
              <p className="text-sm text-black/60">{mockCollaboration.creator.handle}</p>
              <div className="mt-2">
                <p className="text-xs text-black/60">Property</p>
                <p className="text-sm">{mockCollaboration.property.title}</p>
                <p className="text-xs text-black/60">{mockCollaboration.property.location}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-black/5 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Deliverables</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mockCollaboration.deliverables.map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </PanelContent>
      </Panel>

      {/* Agreed Amount Input */}
      <Panel>
        <PanelHeader 
          title="Agreed Creator Payout" 
          description="The amount you agreed to pay the creator"
        />
        <PanelContent>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-black/60">$</span>
            <Input
              type="number"
              min="1"
              step="1"
              value={agreedAmount}
              onChange={(e) => setAgreedAmount(Math.max(0, Number(e.target.value)))}
              className="max-w-[150px] text-lg font-semibold"
            />
            <span className="text-sm text-black/60">USD</span>
          </div>
        </PanelContent>
      </Panel>

      {/* Fee Breakdown */}
      <Panel>
        <PanelHeader 
          title="Fee Breakdown" 
          description="Platform fees are 15% from each party"
        />
        <PanelContent className="space-y-4">
          {/* Host side */}
          <div className="rounded-lg bg-black/[0.02] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/60">You pay</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">Creator payout (gross)</span>
                <span>{formatCurrency(agreedAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">Host platform fee (15%)</span>
                <span>+ {formatCurrency(hostPlatformFee)}</span>
              </div>
              <div className="border-t border-black/10 pt-2">
                <div className="flex items-center justify-between font-semibold">
                  <span>Your total</span>
                  <span className="text-lg">{formatCurrency(hostTotalCharged)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Creator side */}
          <div className="rounded-lg bg-black/[0.02] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-black/60">Creator receives</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">Creator payout (gross)</span>
                <span>{formatCurrency(agreedAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">Creator platform fee (15%)</span>
                <span className="text-red-600">- {formatCurrency(creatorPlatformFee)}</span>
              </div>
              <div className="border-t border-black/10 pt-2">
                <div className="flex items-center justify-between font-semibold">
                  <span>Creator net payout</span>
                  <span className="text-lg text-emerald-600">{formatCurrency(creatorNetPayout)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform summary */}
          <div className="rounded-lg border border-dashed border-black/10 p-3 text-center">
            <p className="text-xs text-black/60">
              Platform earns: <span className="font-semibold text-black">{formatCurrency(platformEarnsTotal)}</span>
              <span className="text-black/60/60"> (15% + 15% = 30%)</span>
            </p>
          </div>
        </PanelContent>
      </Panel>

      {/* Pay CTA */}
      <Button 
        size="lg" 
        className="w-full text-base"
        onClick={() => setShowModal(true)}
      >
        Pay {formatCurrency(hostTotalCharged)} now (test)
      </Button>

      <p className="text-center text-xs text-black/60">
        You&apos;ll be redirected to Stripe for secure payment processing.
      </p>

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Stripe checkout coming soon</h3>
            <p className="mt-2 text-sm text-black/60">
              This is a preview of the payment flow. Stripe Connect integration will enable secure payments to creators.
            </p>
            <div className="mt-4 rounded-lg bg-black/[0.02] p-3 text-sm">
              <p className="font-medium">You would be charged:</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(hostTotalCharged)}</p>
            </div>
            <Button className="mt-4 w-full" onClick={() => setShowModal(false)}>
              Close preview
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
