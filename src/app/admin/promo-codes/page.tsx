"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardFooter } from "@/components/navigation/dashboard-footer"

interface PromoCode {
  id: string
  code: string
  discountType: string
  discountAmount: number | null
  maxUses: number | null
  uses: number
  isActive: boolean
  expiresAt: string | null
  note: string | null
  createdAt: string
  redemptions: {
    id: string
    amountSaved: number
    createdAt: string
    hostProfile: {
      displayName: string
      contactEmail: string
    } | null
  }[]
}

// Section wrapper - same as dashboard
function Section({ title, children, badge, action }: { title: string; children: React.ReactNode; badge?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-black bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-sm font-black uppercase tracking-wider text-black">{title}</h2>
          {badge}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// Stat card
function StatCard({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="rounded-xl border-2 border-black bg-white p-4">
      <p className={`text-2xl font-bold ${color || 'text-black'}`}>{value}</p>
      <p className="text-xs text-black/60">{label}</p>
    </div>
  )
}

export default function AdminPromoCodesPage() {
  const router = useRouter()
  
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Form state
  const [newCode, setNewCode] = useState({
    code: "",
    discountType: "full",
    discountAmount: "",
    maxUses: "",
    expiresAt: "",
    note: "",
  })

  // Fetch promo codes
  useEffect(() => {
    async function fetchCodes() {
      try {
        const res = await fetch("/api/admin/promo-codes")
        if (res.status === 401) {
          router.push("/admin/login")
          return
        }
        if (res.ok) {
          const data = await res.json()
          setCodes(data.codes || [])
        }
      } catch (e) {
        console.error("Failed to fetch codes:", e)
      }
      setLoading(false)
    }
    
    fetchCodes()
  }, [router])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    setSuccess("")
    
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.code.toUpperCase().trim(),
          discountType: newCode.discountType,
          discountAmount: newCode.discountAmount ? parseInt(newCode.discountAmount) : null,
          maxUses: newCode.maxUses ? parseInt(newCode.maxUses) : null,
          expiresAt: newCode.expiresAt || null,
          note: newCode.note || null,
        }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setCodes(prev => [data.code, ...prev])
        setNewCode({ code: "", discountType: "full", discountAmount: "", maxUses: "", expiresAt: "", note: "" })
        setShowForm(false)
        setSuccess(`Promo code ${data.code.code} created!`)
      } else {
        setError(data.error || "Failed to create promo code")
      }
    } catch (e) {
      setError("Something went wrong")
    }
    
    setCreating(false)
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      
      if (res.ok) {
        setCodes(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c))
      }
    } catch (e) {
      console.error("Failed to toggle:", e)
    }
  }

  const deleteCode = async (id: string, code: string) => {
    if (!confirm(`Delete promo code "${code}"? This cannot be undone.`)) return
    
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        setCodes(prev => prev.filter(c => c.id !== id))
        setSuccess(`Promo code ${code} deleted`)
      }
    } catch (e) {
      console.error("Failed to delete:", e)
    }
  }

  const formatDiscount = (code: PromoCode) => {
    if (code.discountType === "full") return "100% OFF (FREE)"
    if (code.discountType === "percent") return `${code.discountAmount}% OFF`
    if (code.discountType === "fixed") return `$${code.discountAmount} OFF`
    return "Unknown"
  }

  const calculateSavings = (code: PromoCode) => {
    if (code.discountType === "full") return 199
    if (code.discountType === "percent" && code.discountAmount) return Math.round(199 * code.discountAmount / 100)
    if (code.discountType === "fixed" && code.discountAmount) return Math.min(code.discountAmount, 199)
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header - matches dashboard style */}
      <div className="border-b-2 border-black bg-white">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded border border-black bg-[#FFD84A] px-2 py-0.5 text-[10px] font-bold text-black">ADMIN</span>
            <span className="rounded bg-[#FFD84A] px-2 py-0.5 text-sm font-bold text-black">Promo Codes</span>
          </div>
          <Link 
            href="/admin/dashboard" 
            className="text-xs text-black/60 hover:text-black"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Navigation Strip */}
      <div className="border-b-2 border-black bg-[#FFD84A]">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/admin/dashboard"
              className="rounded-full border-2 border-black bg-white px-3 py-1 text-[10px] font-bold text-black"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/promo-codes"
              className="rounded-full border-2 border-black bg-black px-3 py-1 text-[10px] font-bold text-white"
            >
              Promo Codes
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-3">
            <p className="text-sm font-medium text-black">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard value={codes.length} label="Total Codes" />
              <StatCard value={codes.filter(c => c.isActive).length} label="Active" color="text-[#28D17C]" />
              <StatCard value={codes.reduce((sum, c) => sum + c.uses, 0)} label="Total Redemptions" />
              <StatCard 
                value={`$${codes.reduce((sum, c) => sum + (c.uses * calculateSavings(c)), 0).toLocaleString()}`} 
                label="Total Savings Given" 
              />
            </div>

            {/* Codes List */}
            <Section 
              title="All Promo Codes"
              badge={
                <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                  {codes.length}
                </span>
              }
              action={
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="rounded-full border-2 border-black bg-[#28D17C] px-3 py-1 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
                >
                  {showForm ? "Cancel" : "+ New Code"}
                </button>
              }
            >
              {/* Create Form */}
              {showForm && (
                <div className="mb-4 rounded-xl border-2 border-dashed border-black/30 bg-[#FAFAFA] p-4">
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                          Code *
                        </label>
                        <input
                          type="text"
                          value={newCode.code}
                          onChange={e => setNewCode(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="e.g., LAUNCH2025"
                          required
                          className="w-full rounded-lg border-2 border-black bg-white px-4 py-2.5 text-sm font-bold uppercase text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                          Discount Type *
                        </label>
                        <select
                          value={newCode.discountType}
                          onChange={e => setNewCode(prev => ({ ...prev, discountType: e.target.value }))}
                          className="w-full rounded-lg border-2 border-black bg-white px-4 py-2.5 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-black/20"
                        >
                          <option value="full">100% Off (Free)</option>
                          <option value="percent">Percentage Off</option>
                          <option value="fixed">Fixed Amount Off</option>
                        </select>
                      </div>
                    </div>

                    {newCode.discountType !== "full" && (
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                          {newCode.discountType === "percent" ? "Percentage" : "Amount ($)"} *
                        </label>
                        <input
                          type="number"
                          value={newCode.discountAmount}
                          onChange={e => setNewCode(prev => ({ ...prev, discountAmount: e.target.value }))}
                          placeholder={newCode.discountType === "percent" ? "e.g., 50" : "e.g., 50"}
                          min="1"
                          max={newCode.discountType === "percent" ? "100" : "199"}
                          required
                          className="w-full rounded-lg border-2 border-black bg-white px-4 py-2.5 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                        />
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                          Max Uses (optional)
                        </label>
                        <input
                          type="number"
                          value={newCode.maxUses}
                          onChange={e => setNewCode(prev => ({ ...prev, maxUses: e.target.value }))}
                          placeholder="Unlimited"
                          min="1"
                          className="w-full rounded-lg border-2 border-black bg-white px-4 py-2.5 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                          Expires (optional)
                        </label>
                        <input
                          type="date"
                          value={newCode.expiresAt}
                          onChange={e => setNewCode(prev => ({ ...prev, expiresAt: e.target.value }))}
                          className="w-full rounded-lg border-2 border-black bg-white px-4 py-2.5 text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-black/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                        Note (optional)
                      </label>
                      <input
                        type="text"
                        value={newCode.note}
                        onChange={e => setNewCode(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="e.g., For podcast guests"
                        className="w-full rounded-lg border-2 border-black bg-white px-4 py-2.5 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating || !newCode.code}
                        className="rounded-full border-2 border-black bg-[#28D17C] px-6 py-2 text-sm font-bold text-black disabled:opacity-50 transition-transform hover:-translate-y-0.5"
                      >
                        {creating ? "Creating..." : "Create Code"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Empty State */}
              {codes.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-black/30 bg-[#FAFAFA] p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-black/20">
                    <svg className="h-6 w-6 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-bold text-black">No promo codes yet</p>
                  <p className="mt-1 text-xs text-black/60">Create your first promo code to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {codes.map(code => (
                    <div
                      key={code.id}
                      className={`rounded-xl border-2 p-4 transition-all hover:-translate-y-0.5 ${
                        code.isActive 
                          ? 'border-black bg-white' 
                          : 'border-black/30 bg-[#FAFAFA] opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFD84A] border-2 border-black">
                            <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-mono text-base font-bold text-black">{code.code}</h3>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                code.isActive 
                                  ? 'bg-[#28D17C]/20 text-[#28D17C]' 
                                  : 'bg-black/10 text-black/50'
                              }`}>
                                {code.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </div>
                            <p className="text-xs text-black/60 mt-0.5">
                              {formatDiscount(code)} • {code.uses} used
                              {code.maxUses && ` / ${code.maxUses} max`}
                            </p>
                            {code.note && (
                              <p className="mt-1 text-[10px] text-black/40">{code.note}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(code.code)
                              setSuccess(`Copied ${code.code}!`)
                              setTimeout(() => setSuccess(""), 2000)
                            }}
                            className="rounded-lg border-2 border-black bg-white px-2.5 py-1 text-[10px] font-bold text-black hover:bg-black/5"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => toggleActive(code.id, code.isActive)}
                            className={`rounded-lg border-2 border-black px-2.5 py-1 text-[10px] font-bold ${
                              code.isActive 
                                ? 'bg-white text-black hover:bg-black/5' 
                                : 'bg-[#28D17C] text-black'
                            }`}
                          >
                            {code.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => deleteCode(code.id, code.code)}
                            className="rounded-lg border-2 border-red-500 bg-white px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Redemptions */}
                      {code.redemptions.length > 0 && (
                        <div className="mt-3 border-t border-black/10 pt-3">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-black/40">
                            Recent Redemptions
                          </p>
                          <div className="space-y-1.5">
                            {code.redemptions.slice(0, 5).map(r => (
                              <div key={r.id} className="flex items-center justify-between text-xs">
                                <span className="text-black">
                                  {r.hostProfile?.displayName || 'Unknown'} 
                                  <span className="text-black/40 ml-1">({r.hostProfile?.contactEmail})</span>
                                </span>
                                <span className="text-black/50">
                                  Saved ${(r.amountSaved / 100).toFixed(0)} • {new Date(r.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Section title="Quick Actions">
              <div className="space-y-2">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full rounded-xl border-2 border-black bg-[#28D17C] p-3 text-left transition-transform hover:-translate-y-0.5"
                >
                  <p className="text-sm font-bold text-black">Create New Code</p>
                  <p className="text-[10px] text-black/60">Add a promo code for hosts</p>
                </button>
                <Link
                  href="/admin/dashboard"
                  className="block rounded-xl border-2 border-black bg-white p-3 transition-transform hover:-translate-y-0.5"
                >
                  <p className="text-sm font-bold text-black">View Dashboard</p>
                  <p className="text-[10px] text-black/60">See all admin stats</p>
                </Link>
              </div>
            </Section>

            {/* Info */}
            <Section title="About Promo Codes">
              <div className="space-y-3 text-xs text-black/60">
                <p>
                  Promo codes give hosts discounts on the $199 membership fee.
                </p>
                <div className="rounded-lg bg-[#FAFAFA] p-3">
                  <p className="font-bold text-black mb-1">Discount Types:</p>
                  <ul className="space-y-1">
                    <li><span className="font-medium text-black">100% Off</span> — Free membership</li>
                    <li><span className="font-medium text-black">Percentage</span> — e.g., 50% off = $99.50</li>
                    <li><span className="font-medium text-black">Fixed Amount</span> — e.g., $50 off = $149</li>
                  </ul>
                </div>
                <p>
                  Codes are case-insensitive. Hosts enter them during checkout.
                </p>
              </div>
            </Section>

            {/* Help */}
            <div className="rounded-xl border-2 border-dashed border-black/20 bg-[#FAFAFA] p-4 text-center">
              <p className="text-xs text-black/60">Questions about promo codes?</p>
              <a 
                href="mailto:hello@creatorstays.com" 
                className="mt-1 inline-block text-sm font-bold text-black hover:underline"
              >
                hello@creatorstays.com
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <DashboardFooter />
    </div>
  )
}
