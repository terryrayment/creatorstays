"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface ReferralStats {
  referralCode: string
  referralLink: string
  totalReferrals: number
  qualifiedReferrals: number
  pendingReferrals: number
  totalEarnings: number
  pendingEarnings: number
  referrals: {
    id: string
    status: string
    commissionCents: number
    createdAt: string
    referredCreator?: {
      displayName: string
      handle: string
    }
  }[]
}

export default function CreatorReferralPage() {
  const { status } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      if (status !== "authenticated") return
      
      try {
        const res = await fetch("/api/creator/referral")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (e) {
        console.error("Failed to fetch referral stats:", e)
      }
      setLoading(false)
    }
    
    fetchStats()
  }, [status])

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/dashboard/creator" className="font-heading text-xl tracking-tight">
            <span className="text-black">CREATOR</span>
            <span className="text-black/40">STAYS</span>
          </Link>
          <Link 
            href="/dashboard/creator"
            className="text-sm font-medium text-black/60 hover:text-black"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl tracking-tight text-black">Referral Program</h1>
          <p className="mt-1 text-sm text-black/60">
            Earn $10 for every creator you refer who completes their profile
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <p className="text-3xl font-bold text-black">{stats?.totalReferrals || 0}</p>
            <p className="text-xs text-black/60">Total Referrals</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-[#28D17C]/20 p-4">
            <p className="text-3xl font-bold text-black">{stats?.qualifiedReferrals || 0}</p>
            <p className="text-xs text-black/60">Qualified</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-[#FFD84A]/20 p-4">
            <p className="text-3xl font-bold text-black">{stats?.pendingReferrals || 0}</p>
            <p className="text-xs text-black/60">Pending</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-[#FF7A00] p-4">
            <p className="text-3xl font-bold text-black">${((stats?.totalEarnings || 0) / 100).toFixed(0)}</p>
            <p className="text-xs text-black/60">Total Earned</p>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="rounded-xl border-2 border-black bg-white p-6 mb-8">
          <h2 className="mb-4 text-lg font-bold text-black">Your Referral Link</h2>
          
          <div className="space-y-4">
            {/* Link */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black/60">
                Share this link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={stats?.referralLink || ""}
                  readOnly
                  className="flex-1 rounded-lg border-2 border-black bg-black/5 px-4 py-2.5 text-sm font-mono text-black"
                />
                <button
                  onClick={copyLink}
                  className="rounded-lg border-2 border-black bg-[#28D17C] px-4 py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Code */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black/60">
                Or share your code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg border-2 border-black bg-[#FFD84A]/20 px-4 py-2.5 text-center font-mono text-xl font-bold text-black">
                  {stats?.referralCode || "---"}
                </div>
                <button
                  onClick={copyCode}
                  className="rounded-lg border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="mt-6 flex gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on CreatorStays and get free stays at amazing properties! Use my link: ${stats?.referralLink}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border-2 border-black bg-black px-4 py-2.5 text-center text-sm font-bold text-white"
            >
              Share on X
            </a>
            <a
              href={`https://www.instagram.com/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border-2 border-black bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-center text-sm font-bold text-white"
            >
              Share on Instagram
            </a>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-xl border-2 border-black bg-[#FF7A00] p-6 mb-8">
          <h2 className="mb-4 text-lg font-bold text-black">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "1", icon: "📤", title: "Share your link", desc: "Send to creator friends" },
              { step: "2", icon: "✅", title: "They sign up", desc: "And complete their profile" },
              { step: "3", icon: "", title: "You earn $10", desc: "For each qualified referral" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-black text-2xl">
                  {item.icon}
                </div>
                <p className="font-bold text-black">{item.title}</p>
                <p className="text-xs text-black/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referrals List */}
        <div className="rounded-xl border-2 border-black bg-white overflow-hidden">
          <div className="border-b-2 border-black bg-black/5 px-4 py-3">
            <h2 className="font-bold text-black">Your Referrals</h2>
          </div>
          
          {!stats?.referrals || stats.referrals.length === 0 ? (
            <div className="p-8 text-center">
              <span className="mb-2 inline-block text-4xl"></span>
              <p className="text-sm text-black/60">No referrals yet. Share your link to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {stats.referrals.map((ref) => (
                <div key={ref.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium text-black">
                      {ref.referredCreator?.displayName || "New Creator"}
                    </p>
                    {ref.referredCreator?.handle && (
                      <p className="text-xs text-black/60">@{ref.referredCreator.handle}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                      ref.status === 'qualified' || ref.status === 'paid'
                        ? 'bg-[#28D17C]/20 text-[#28D17C]'
                        : 'bg-[#FFD84A]/20 text-black'
                    }`}>
                      {ref.status === 'qualified' ? 'Qualified' : ref.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                    <p className="mt-1 text-xs text-black/60">
                      {ref.status !== 'pending' ? `+$${(ref.commissionCents / 100).toFixed(0)}` : 'Awaiting profile completion'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Earnings */}
        {stats && stats.pendingEarnings > 0 && (
          <div className="mt-6 rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-black">Pending Earnings</p>
                <p className="text-xs text-black/60">Ready for payout</p>
              </div>
              <p className="text-2xl font-bold text-black">${(stats.pendingEarnings / 100).toFixed(0)}</p>
            </div>
            <p className="mt-2 text-xs text-black/50">
              Payouts are processed monthly. Set up Stripe Connect in your settings to receive payments.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
