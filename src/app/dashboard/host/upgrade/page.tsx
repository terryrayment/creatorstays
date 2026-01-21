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
      
      try {
        const res = await fetch("/api/host/agency")
        if (res.ok) {
          const data = await res.json()
          setAgencyStatus(data)
          if (data.isAgency) {
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
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/dashboard/host" className="font-heading text-xl tracking-tight">
            <span className="text-black">CREATOR</span>
            <span className="text-black/40">STAYS</span>
          </Link>
          <Link 
            href="/dashboard/host"
            className="text-sm font-medium text-black/60 hover:text-black"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="mb-4 inline-block text-6xl">🏢</span>
          <h1 className="font-heading text-4xl tracking-tight text-black sm:text-5xl">
            Agency Pro
          </h1>
          <p className="mt-3 text-lg text-black/60">
            Multi-property management for professional hosts and agencies
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto max-w-lg rounded-2xl border-4 border-black bg-white p-8">
          <div className="text-center mb-8">
            <p className="text-sm font-bold uppercase tracking-wider text-black/60">Monthly</p>
            <p className="text-5xl font-black text-black">$199</p>
            <p className="text-sm text-black/60">/month • Cancel anytime</p>
          </div>

          <div className="space-y-4 mb-8">
            {[
              { icon: "🏠", title: "Unlimited Properties", desc: "Manage as many listings as you need" },
              { icon: "👥", title: "5 Team Logins", desc: "Invite your team to help manage ($29/extra seat)" },
              { icon: "📁", title: "Organize by Owner", desc: "Group properties by owner or portfolio" },
              { icon: "🔑", title: "Owner Access Portals", desc: "Give owners view-only access to their properties" },
              { icon: "📊", title: "Multi-Property Dashboard", desc: "See all properties at a glance, filter by owner" },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl">{feature.icon}</span>
                <div>
                  <p className="font-bold text-black">{feature.title}</p>
                  <p className="text-sm text-black/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Agency Name Input */}
          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
              Agency / Company Name
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={e => setAgencyName(e.target.value)}
              placeholder="Your Agency Name"
              className="w-full rounded-lg border-2 border-black bg-white px-4 py-3 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg border-2 border-red-500 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="w-full rounded-full border-2 border-black bg-[#28D17C] py-4 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {subscribing ? "Starting subscription..." : "Subscribe to Agency Pro →"}
          </button>

          <p className="mt-4 text-center text-xs text-black/50">
            Secure payment via Stripe • Cancel anytime
          </p>
        </div>

        {/* Comparison */}
        <div className="mt-12 rounded-xl border-2 border-black bg-white overflow-hidden">
          <div className="grid grid-cols-3 border-b-2 border-black bg-black/5">
            <div className="p-4 font-bold text-black">Feature</div>
            <div className="p-4 text-center font-bold text-black border-l-2 border-black">Standard ($199 one-time)</div>
            <div className="p-4 text-center font-bold text-black border-l-2 border-black bg-[#28D17C]/20">Agency Pro ($199/mo)</div>
          </div>
          {[
            { feature: "Properties", standard: "1 listing", agency: "Unlimited" },
            { feature: "Team Logins", standard: "1", agency: "5 included" },
            { feature: "Organize by Owner", standard: "—", agency: "✓" },
            { feature: "Owner Access Portals", standard: "—", agency: "✓" },
            { feature: "Dashboard View", standard: "Single property", agency: "All properties" },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-b border-black/10 last:border-b-0">
              <div className="p-4 text-sm text-black">{row.feature}</div>
              <div className="p-4 text-center text-sm text-black/60 border-l-2 border-black/10">{row.standard}</div>
              <div className="p-4 text-center text-sm font-medium text-black border-l-2 border-black/10 bg-[#28D17C]/5">{row.agency}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="mb-6 text-center font-heading text-2xl text-black">Questions?</h2>
          <div className="space-y-4">
            {[
              { q: "Can I cancel anytime?", a: "Yes! Cancel anytime and your subscription will end at the end of the billing period." },
              { q: "What happens to my properties if I cancel?", a: "Your properties remain active. You just lose access to agency features like team seats and bulk offers." },
              { q: "Can I add more team seats?", a: "Contact us to add additional team seats at $29/seat/month." },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border-2 border-black bg-white p-4">
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
