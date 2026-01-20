"use client"

import { useState, useEffect } from "react"

interface PayoutStatus {
  status: 'pending' | 'processing' | 'in_transit' | 'paid' | 'failed' | 'not_started'
  statusLabel: string
  statusDescription: string
  timeline: TimelineStep[]
  estimatedArrival: string | null
  amountCents: number | null
  paidAt: string | null
}

interface TimelineStep {
  label: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
  date?: string
}

interface PayoutTrackerProps {
  collaborationId: string
  compact?: boolean
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  not_started: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  pending: { bg: 'bg-[#FFD84A]', text: 'text-black', border: 'border-black' },
  processing: { bg: 'bg-[#4AA3FF]', text: 'text-black', border: 'border-black' },
  in_transit: { bg: 'bg-[#4AA3FF]', text: 'text-black', border: 'border-black' },
  paid: { bg: 'bg-[#28D17C]', text: 'text-black', border: 'border-black' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
}

export function PayoutTracker({ collaborationId, compact = false }: PayoutTrackerProps) {
  const [payoutStatus, setPayoutStatus] = useState<PayoutStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPayoutStatus() {
      try {
        const res = await fetch(`/api/payments/payout-status?collaborationId=${collaborationId}`)
        if (res.ok) {
          const data = await res.json()
          setPayoutStatus(data)
        } else {
          const data = await res.json()
          setError(data.error || 'Failed to load payout status')
        }
      } catch (e) {
        console.error('Failed to fetch payout status:', e)
        setError('Network error')
      }
      setLoading(false)
    }

    fetchPayoutStatus()
  }, [collaborationId])

  if (loading) {
    return (
      <div className="rounded-xl border-2 border-black/20 bg-white p-4 animate-pulse">
        <div className="h-4 bg-black/10 rounded w-1/3 mb-2"></div>
        <div className="h-6 bg-black/10 rounded w-1/2"></div>
      </div>
    )
  }

  if (error || !payoutStatus) {
    return null // Silently fail, don't show error to user
  }

  const colors = STATUS_COLORS[payoutStatus.status] || STATUS_COLORS.pending

  if (compact) {
    return (
      <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} px-3 py-2`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${colors.text}`}>
            {payoutStatus.statusLabel}
          </span>
          {payoutStatus.amountCents && (
            <span className={`text-sm font-black ${colors.text}`}>
              {formatCurrency(payoutStatus.amountCents)}
            </span>
          )}
        </div>
        {payoutStatus.estimatedArrival && payoutStatus.status === 'in_transit' && (
          <p className="text-[10px] text-black/60 mt-1">
            Expected {new Date(payoutStatus.estimatedArrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border-[3px] ${colors.border} ${colors.bg} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
            Payout Status
          </p>
          <p className="mt-1 text-lg font-black text-black">
            {payoutStatus.statusLabel}
          </p>
          <p className="text-sm text-black/70">
            {payoutStatus.statusDescription}
          </p>
        </div>
        {payoutStatus.amountCents && (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
              Your Payout
            </p>
            <p className="text-xl font-black text-black">
              {formatCurrency(payoutStatus.amountCents)}
            </p>
            <p className="text-[10px] text-black/50">after 15% fee</p>
          </div>
        )}
      </div>

      {/* Prominent timeline message for in_transit or processing */}
      {(payoutStatus.status === 'in_transit' || payoutStatus.status === 'processing') && (
        <div className="mt-4 rounded-lg border-2 border-black bg-white p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4AA3FF]">
              <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-black">Funds typically arrive in 2-5 business days</p>
              <p className="text-xs text-black/60">Payouts are processed through Stripe to your connected bank account.</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {payoutStatus.timeline.length > 0 && (
        <div className="mt-5">
          <div className="relative">
            {payoutStatus.timeline.map((step, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 last:pb-0">
                {/* Connector line */}
                {index < payoutStatus.timeline.length - 1 && (
                  <div 
                    className={`absolute left-[11px] top-6 w-0.5 h-[calc(100%-24px)] ${
                      step.status === 'completed' ? 'bg-[#28D17C]' : 'bg-black/20'
                    }`}
                    style={{ 
                      top: `${24 + index * 56}px`,
                      height: '32px'
                    }}
                  />
                )}
                
                {/* Status dot */}
                <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  step.status === 'completed' 
                    ? 'border-[#28D17C] bg-[#28D17C]' 
                    : step.status === 'current'
                      ? 'border-black bg-[#FFD84A]'
                      : 'border-black/30 bg-white'
                }`}>
                  {step.status === 'completed' ? (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : step.status === 'current' ? (
                    <div className="h-2 w-2 rounded-full bg-black animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-black/20" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-bold ${
                    step.status === 'upcoming' ? 'text-black/50' : 'text-black'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${
                    step.status === 'upcoming' ? 'text-black/40' : 'text-black/60'
                  }`}>
                    {step.description}
                    {step.date && <span className="ml-1 font-medium">• {step.date}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated arrival callout */}
      {payoutStatus.estimatedArrival && payoutStatus.status === 'in_transit' && (
        <div className="mt-4 rounded-lg border-2 border-black bg-white p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
            Estimated Arrival
          </p>
          <p className="text-lg font-black text-black">
            {new Date(payoutStatus.estimatedArrival).toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>
      )}

      {/* Setup CTA for not_started */}
      {payoutStatus.status === 'not_started' && (
        <a
          href="/dashboard/creator/settings"
          className="mt-4 block rounded-full border-2 border-black bg-black py-3 text-center text-sm font-bold text-white transition-transform hover:-translate-y-1"
        >
          Connect Stripe to Get Paid →
        </a>
      )}
    </div>
  )
}
