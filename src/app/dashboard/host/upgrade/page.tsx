"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AgencyUpgradePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [agencyStatus, setAgencyStatus] = useState<any>(null)
  const [agencyName, setAgencyName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchStatus() {
      if (status !== "authenticated") return
      
      // Check localStorage for agency status (for testing)
      const isAgencyFromStorage = localStorage.getItem('creatorstays_agency') === 'true'
      
      try {
        const res = await fetch("/api/host/agency")
        if (res.ok) {
          const data = await res.json()
          setAgencyStatus(data)
          if (data.isAgency || isAgencyFromStorage) {
            router.push("/dashboard/host")
          }
        }
      } catch (e) {
        console.error("Failed to fetch agency status:", e)
      }
      setLoading(false)
    }
    
    fetchStatus()
  }, [status, router])

  const handleSubscribe = async () => {
    setSubscribing(true)
    setError("")
    
    try {
      const res = await fetch("/api/host/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName }),
      })
      
      const data = await res.json()
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError(data.error || "Failed to start subscription")
        setSubscribing(false)
      }
    } catch (e) {
      setError("Something went wrong")
      setSubscribing(false)
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
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black text-black">
              <span className="text-[13px] font-bold">CS</span>
            </Link>
            <span className="text-sm font-bold text-black">Upgrade to Agency</span>
          </div>
          <Link 
            href="/dashboard/host"
            className="rounded-full border-2 border-black bg-[#FFD84A] px-4 py-1.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-10">
          <span className="mb-4 inline-block rounded-full border-2 border-black bg-[#28D17C] px-4 py-1 text-xs font-bold text-black">
            FOR PROFESSIONAL HOSTS
          </span>
          <h1 className="font-heading text-4xl tracking-tight text-black sm:text-5xl">
            Agency Plan
          </h1>
          <p className="mt-3 text-lg text-black/60 max-w-xl mx-auto">
            Manage multiple properties, invite your team, and scale your hosting business.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left - Features */}
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-black bg-white p-6">
              <h3 className="text-lg font-bold text-black mb-4">Everything in Agency:</h3>
              <div className="space-y-4">
                {[
                  { title: "Unlimited Properties", desc: "Add and manage as many listings as you need" },
                  { title: "Team Member Accounts (up to 5)", desc: "Invite your team to help manage properties" },
                  { title: "Property Owner Read-Only Access", desc: "Give owners visibility into their listings" },
                  { title: "Priority Creator Matching", desc: "Get matched with top creators first" },
                  { title: "Advanced Analytics Dashboard", desc: "Track performance across all properties" },
                  { title: "Bulk Offer Sending", desc: "Send offers to multiple creators at once" },
                ].map((feature, i) => (
                  <div key={i} className="grid grid-cols-[24px_1fr] gap-3 items-start">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#28D17C] text-xs font-bold text-black">✓</span>
                    <div className="min-w-0">
                      <p className="font-bold text-black leading-6">{feature.title}</p>
                      <p className="text-sm text-black/60 mt-0.5">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison */}
            <div className="rounded-2xl border-2 border-black bg-white overflow-hidden">
              <div className="grid grid-cols-3 border-b-2 border-black bg-black">
                <div className="p-3 text-xs font-bold text-white">Feature</div>
                <div className="p-3 text-center text-xs font-bold text-white border-l border-white/20">Standard</div>
                <div className="p-3 text-center text-xs font-bold text-white border-l border-white/20">Agency</div>
              </div>
              {[
                { feature: "Properties", standard: "1", agency: "Unlimited" },
                { feature: "Team Logins", standard: "1", agency: "5" },
                { feature: "Owner Portals", standard: "—", agency: "✓" },
                { feature: "Priority Matching", standard: "—", agency: "✓" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-black/10 last:border-b-0">
                  <div className="p-3 text-sm font-medium text-black">{row.feature}</div>
                  <div className="p-3 text-center text-sm text-black/50 border-l border-black/10">{row.standard}</div>
                  <div className="p-3 text-center text-sm font-bold text-black border-l border-black/10 bg-[#28D17C]/10">{row.agency}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Pricing Card */}
          <div>
            <div className="sticky top-24 rounded-2xl border-[3px] border-black bg-white p-6">
              <div className="text-center mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-black/50">Monthly Subscription</p>
                <p className="text-5xl font-black text-black mt-2">$149</p>
                <p className="text-sm text-black/60 mt-1">/month · Cancel anytime</p>
              </div>

              {/* Agency Name Input */}
              <div className="mb-6">
                <label className="mb-1.5 block text-xs font-bold text-black">
                  Agency / Company Name
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                  placeholder="Your Agency Name"
                  className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              {error && (
                <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubscribe}
                disabled={subscribing || !agencyName}
                className="w-full rounded-full border-2 border-black bg-[#28D17C] py-4 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscribing ? "Starting subscription..." : "Upgrade to Agency →"}
              </button>

              <p className="mt-4 text-center text-xs text-black/50">
                Secure payment via Stripe
              </p>

              <div className="mt-6 pt-6 border-t border-black/10">
                <p className="text-xs text-black/50 text-center">
                  Need more team seats? Contact us for custom pricing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-black">Frequently Asked Questions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { q: "Can I cancel anytime?", a: "Yes! Cancel anytime and your subscription ends at the billing period." },
              { q: "What happens if I cancel?", a: "Your properties stay active. You just lose agency features like team seats." },
              { q: "Can I add more team seats?", a: "Contact us to add additional team seats at $29/seat/month." },
              { q: "Is there a free trial?", a: "We offer a 14-day money-back guarantee if you're not satisfied." },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border-2 border-black bg-white p-4">
                <p className="font-bold text-black">{faq.q}</p>
                <p className="mt-1 text-sm text-black/60">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
