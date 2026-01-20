"use client"

import { useState } from "react"

interface TrafficBonusTrackerProps {
  threshold: number
  currentClicks: number
  bonusCents: number
  isActive: boolean // Is the collaboration still active (not completed/cancelled)
  compact?: boolean // For smaller display in offer cards
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
}

// Info tooltip component
function InfoTooltip({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-black/30 text-[10px] font-bold text-black/50 hover:border-black hover:text-black"
      >
        ?
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border-2 border-black bg-white p-3 text-left text-xs text-black shadow-lg">
          {children}
          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-black bg-white" />
        </div>
      )}
    </div>
  )
}

export function TrafficBonusTracker({ 
  threshold, 
  currentClicks, 
  bonusCents, 
  isActive,
  compact = false 
}: TrafficBonusTrackerProps) {
  const progress = Math.min((currentClicks / threshold) * 100, 100)
  const isUnlocked = currentClicks >= threshold
  const remaining = Math.max(threshold - currentClicks, 0)
  
  if (compact) {
    // Compact version for offer cards
    return (
      <div className="flex items-center gap-2 text-[#28D17C]">
        <span className="text-sm">
          +{formatCurrency(bonusCents)} at {threshold.toLocaleString()} clicks
        </span>
        <InfoTooltip>
          <p className="font-bold mb-1">Performance Bonus</p>
          <p className="text-black/70">
            Earn an extra {formatCurrency(bonusCents)} when your tracking link reaches {threshold.toLocaleString()} clicks.
          </p>
          <p className="mt-2 text-black/70">
            <strong>What counts as a click?</strong> Each unique visitor who clicks your CreatorStays tracking link. 
            Multiple clicks from the same person within 24 hours count as one.
          </p>
        </InfoTooltip>
      </div>
    )
  }

  // Full version for collaboration detail page
  return (
    <div className={`rounded-xl border-2 p-4 ${isUnlocked ? 'border-[#28D17C] bg-[#28D17C]/10' : 'border-black bg-white'}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
              Performance Bonus
            </p>
            <InfoTooltip>
              <p className="font-bold mb-1">How the bonus works</p>
              <ul className="space-y-1.5 text-black/70">
                <li><strong>• What counts:</strong> Each unique click on your CreatorStays tracking link</li>
                <li><strong>• Deduplication:</strong> Multiple clicks from the same visitor within 24h count as one</li>
                <li><strong>• Time period:</strong> Clicks count from when you start posting until the collaboration is completed</li>
                <li><strong>• Payout:</strong> Bonus is paid with your base payment once approved by the host</li>
              </ul>
            </InfoTooltip>
          </div>
          <p className="mt-1 text-lg font-black text-black">
            {formatCurrency(bonusCents)}
          </p>
        </div>
        <div className={`rounded-full px-3 py-1 text-[10px] font-bold ${
          isUnlocked 
            ? 'bg-[#28D17C] text-black' 
            : isActive 
              ? 'bg-[#FFD84A] text-black' 
              : 'bg-black/10 text-black/50'
        }`}>
          {isUnlocked ? '✓ UNLOCKED' : isActive ? 'IN PROGRESS' : 'NOT REACHED'}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-black">{currentClicks.toLocaleString()} clicks</span>
          <span className="text-black/60">{threshold.toLocaleString()} goal</span>
        </div>
        <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full border-2 border-black bg-white">
          <div 
            className={`h-full transition-all duration-500 ${isUnlocked ? 'bg-[#28D17C]' : 'bg-[#FFD84A]'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px]">
          <span className={isUnlocked ? 'font-bold text-[#28D17C]' : 'text-black/50'}>
            {isUnlocked 
              ? '🎉 Bonus earned!' 
              : `${remaining.toLocaleString()} more clicks to unlock`
            }
          </span>
          <span className="text-black/40">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Bonus details */}
      {isUnlocked && (
        <div className="mt-3 rounded-lg bg-[#28D17C]/20 p-2 text-center text-xs font-bold text-black">
          You've earned the +{formatCurrency(bonusCents)} bonus! It will be included in your payment.
        </div>
      )}
    </div>
  )
}

// Simplified display for offer modal (before accepting)
export function TrafficBonusExplainer({ 
  threshold, 
  bonusCents 
}: { 
  threshold: number
  bonusCents: number 
}) {
  return (
    <div className="rounded-xl border-2 border-[#28D17C]/50 bg-[#28D17C]/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#28D17C] bg-white text-sm">
          🎯
        </div>
        <div>
          <p className="font-bold text-black">Performance Bonus Available</p>
          <p className="mt-1 text-sm text-black/70">
            Earn an extra <strong className="text-[#28D17C]">{formatCurrency(bonusCents)}</strong> when 
            your tracking link reaches <strong>{threshold.toLocaleString()} clicks</strong>.
          </p>
          <div className="mt-3 space-y-1 text-xs text-black/60">
            <p className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[8px]">1</span>
              Post content with your unique tracking link
            </p>
            <p className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[8px]">2</span>
              Track clicks in real-time on your dashboard
            </p>
            <p className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[8px]">3</span>
              Bonus unlocks when you hit the threshold
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
