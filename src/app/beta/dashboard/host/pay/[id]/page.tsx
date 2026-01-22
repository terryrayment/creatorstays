"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

interface Collaboration {
  id: string
  status: string
  clicksGenerated: number
  creator: {
    displayName: string
    handle: string
    stripeAccountId: string | null
  }
  property: {
    title: string
    cityRegion: string
  }
  offer: {
    offerType: string
    cashCents: number
    deliverables: string[]
    trafficBonusEnabled: boolean
    trafficBonusThreshold: number | null
    trafficBonusCents: number | null
  }
  agreement: {
    isFullyExecuted: boolean
  } | null
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
}

export default function PayCollaborationPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const collaborationId = params.id as string

  const [collaboration, setCollaboration] = useState<Collaboration | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  // Fetch collaboration
  useEffect(() => {
    async function fetchCollaboration() {
      try {
        const res = await fetch(`/api/collaborations/${collaborationId}/agreement`)
        if (res.ok) {
          const data = await res.json()
          setCollaboration(data.collaboration)
        } else {
          setError("Collaboration not found")
        }
      } catch (e) {
        console.error("Failed to fetch:", e)
        setError("Failed to load collaboration")
      }
      setLoading(false)
    }

    if (session?.user && collaborationId) {
      fetchCollaboration()
    }
  }, [session, collaborationId])

  // Handle payment
  const handlePayment = async () => {
    if (!collaboration) return

    setProcessing(true)
    setError("")

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaborationId }),
      })

      const data = await res.json()

      if (res.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        setError(data.error || "Failed to create checkout session")
      }
    } catch (e) {
      console.error("Payment error:", e)
      setError("Network error. Please try again.")
    }
    setProcessing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Container className="py-12">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm text-black/60">Loading...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (!collaboration) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Container className="py-12">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm text-black/60">{error || "Collaboration not found"}</p>
            <Link href="/beta/dashboard/host" className="mt-4 inline-block text-sm font-bold text-black underline">
              Back to Dashboard
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  const cashCents = collaboration.offer.cashCents
  
  // Check if traffic bonus is earned
  const bonusEnabled = collaboration.offer.trafficBonusEnabled
  const bonusThreshold = collaboration.offer.trafficBonusThreshold || 0
  const bonusCents = collaboration.offer.trafficBonusCents || 0
  const bonusEarned = bonusEnabled && collaboration.clicksGenerated >= bonusThreshold
  const earnedBonusCents = bonusEarned ? bonusCents : 0
  
  // Total payment including bonus
  const totalCreatorPayment = cashCents + earnedBonusCents
  const hostFeeCents = Math.round(totalCreatorPayment * 0.15)
  const hostTotalCents = totalCreatorPayment + hostFeeCents
  const creatorFeeCents = Math.round(totalCreatorPayment * 0.15)
  const creatorNetCents = totalCreatorPayment - creatorFeeCents

  const canPay = collaboration.agreement?.isFullyExecuted && cashCents > 0
  const creatorInitials = collaboration.creator.displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="border-b-2 border-black bg-[#FFD84A]">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full border-2 border-black bg-white px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
              Payment
            </span>
          </div>
          <Link 
            href={`/dashboard/collaborations/${collaborationId}`}
            className="rounded-full border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
          >
            ← Back
          </Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-heading text-[2rem] font-black tracking-tight text-black">
              PAY CREATOR
            </h1>
            <p className="mt-1 text-sm text-black/70">
              Complete payment for this collaboration.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
               {error}
            </div>
          )}

          {/* Creator & Campaign Summary */}
          <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Campaign</p>
            
            <div className="mt-3 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-black bg-white text-lg font-black text-black">
                {creatorInitials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-black">{collaboration.creator.displayName}</h3>
                <p className="text-sm text-black">@{collaboration.creator.handle}</p>
                <div className="mt-2 rounded-lg border-2 border-black bg-white/50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Property</p>
                  <p className="font-bold text-black">{collaboration.property.title}</p>
                  <p className="text-xs text-black">{collaboration.property.cityRegion}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t-2 border-black/20 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Deliverables</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {collaboration.offer.deliverables.map((d) => (
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

          {/* Fee Breakdown */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Payment Summary</p>

            <div className="mt-4 space-y-4">
              {/* What you pay */}
              <div className="rounded-xl border-2 border-black bg-[#FFD84A] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black">What You Pay</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black">Creator base payment</span>
                    <span className="font-bold text-black">{formatCurrency(cashCents)}</span>
                  </div>
                  {bonusEarned && (
                    <div className="flex items-center justify-between text-sm text-[#28D17C]">
                      <span className="flex items-center gap-1">
                        <span></span>
                        Performance bonus ({collaboration.clicksGenerated.toLocaleString()} clicks)
                      </span>
                      <span className="font-bold">+ {formatCurrency(earnedBonusCents)}</span>
                    </div>
                  )}
                  {bonusEnabled && !bonusEarned && (
                    <div className="flex items-center justify-between text-sm text-black/50">
                      <span className="flex items-center gap-1">
                        <span></span>
                        Performance bonus (not reached)
                      </span>
                      <span className="font-bold">$0.00</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black">Service fee (15%)</span>
                    <span className="font-bold text-black">+ {formatCurrency(hostFeeCents)}</span>
                  </div>
                  <div className="border-t-2 border-black/20 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black">Total charge</span>
                      <span className="text-2xl font-black text-black">{formatCurrency(hostTotalCents)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What creator receives */}
              <div className="rounded-xl border-2 border-black bg-[#28D17C] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black">Creator Receives</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black">Net payout</span>
                    <span className="text-2xl font-black text-black">{formatCurrency(creatorNetCents)}</span>
                  </div>
                  <p className="mt-2 text-xs text-black/70">
                    After their 15% service fee is deducted
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <div className="rounded-xl border border-black/20 bg-black/5 p-3">
                <p className="text-xs text-black/70">
                  <strong className="text-black">How fees work:</strong> You pay a 15% service fee on top of the creator payment. 
                  The creator separately pays their own 15% fee. Each party's fee covers payment processing, 
                  fraud protection, and platform services.
                </p>
              </div>

              {/* Creator Stripe warning */}
              {!collaboration.creator.stripeAccountId && (
                <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                  <p className="text-sm font-bold text-amber-800"> Creator hasn't connected Stripe</p>
                  <p className="mt-1 text-xs text-amber-700">
                    Payment will be held until they complete Stripe onboarding. They'll receive an email.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Agreement check */}
          {!collaboration.agreement?.isFullyExecuted && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-center">
              <p className="font-bold text-red-700">Agreement not signed</p>
              <p className="mt-1 text-sm text-red-600">
                Both parties must sign the agreement before payment can be processed.
              </p>
              <Link
                href={`/dashboard/collaborations/${collaborationId}`}
                className="mt-3 inline-block text-sm font-bold text-red-700 underline"
              >
                View Agreement →
              </Link>
            </div>
          )}

          {/* Pay CTA */}
          <Button 
            size="lg" 
            className="w-full rounded-full border-[3px] border-black bg-black py-6 text-base font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-1 hover:bg-black/90 disabled:opacity-50"
            onClick={handlePayment}
            disabled={!canPay || processing}
          >
            {processing ? "Redirecting to Stripe..." : `Pay ${formatCurrency(hostTotalCents)} Now`}
          </Button>

          <p className="text-center text-xs text-black/60">
            🔒 Secure payment via Stripe
          </p>

          {/* Payment Flow Explanation */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5">
            <p className="font-bold text-black">How payments work:</p>
            <ul className="mt-3 space-y-3 text-xs text-black/70">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black bg-[#28D17C] text-[8px] font-bold text-black">1</span>
                <span>You pay via Stripe's secure checkout</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black bg-[#28D17C] text-[8px] font-bold text-black">2</span>
                <span><strong className="text-black">Immediate transfer</strong> — Funds go directly to the creator's Stripe account (no holding period)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black bg-[#28D17C] text-[8px] font-bold text-black">3</span>
                <span>Creator receives payout to their bank within 2-3 business days</span>
              </li>
            </ul>

            {/* Important: Direct Transfer Disclosure */}
            <div className="mt-4 rounded-lg border-2 border-[#FFD84A] bg-[#FFD84A]/10 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-black"> Direct Payment — No Escrow</p>
              <p className="mt-1 text-xs text-black/70">
                This is <strong className="text-black">not an escrow payment</strong>. Funds transfer immediately to the creator upon checkout completion. 
                Only pay after you've reviewed and approved the submitted content.
              </p>
            </div>

            {/* Dispute Info */}
            <div className="mt-3 rounded-lg border border-black/10 bg-black/5 p-3">
              <p className="text-[11px] font-bold text-black">If there's a dispute:</p>
              <p className="mt-1 text-xs text-black/70">
                Contact us at{' '}
                <a href="mailto:support@creatorstays.com" className="font-bold text-black underline">
                  support@creatorstays.com
                </a>
                {' '}— we'll mediate between both parties. As this is a direct transfer, refunds require creator agreement.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
