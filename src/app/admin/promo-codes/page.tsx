"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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

function StatCard({ label, value, subValue, color }: { label: string; value: string | number; subValue?: string; color: string }) {
  return (
    <div className={`rounded-xl border-2 border-black ${color} p-4`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">{label}</p>
      <p className="mt-1 text-2xl font-black text-black">{value}</p>
      {subValue && <p className="mt-0.5 text-xs text-black/60">{subValue}</p>}
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`rounded-full border border-black px-2 py-0.5 text-[9px] font-bold text-black ${active ? "bg-[#28D17C]" : "bg-gray-200"}`}>
      {active ? "ACTIVE" : "INACTIVE"}
    </span>
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
          code: newCode.code,
          discountType: newCode.discountType,
          discountAmount: newCode.discountAmount ? Number(newCode.discountAmount) : null,
          maxUses: newCode.maxUses ? Number(newCode.maxUses) : null,
          expiresAt: newCode.expiresAt || null,
          note: newCode.note || null,
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setCodes(prev => [data.code, ...prev])
        setNewCode({ code: "", discountType: "full", discountAmount: "", maxUses: "", expiresAt: "", note: "" })
        setShowForm(false)
        setSuccess(`Promo code ${data.code.code} created!`)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to create code")
      }
    } catch (e) {
      setError("Network error")
    }
    setCreating(false)
  }

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      })
      
      if (res.ok) {
        setCodes(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentActive } : c))
      }
    } catch (e) {
      console.error("Failed to toggle:", e)
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete promo code "${code}"? This cannot be undone.`)) return
    
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCodes(prev => prev.filter(c => c.id !== id))
        setSuccess(`Promo code ${code} deleted`)
      }
    } catch (e) {
      setError("Failed to delete")
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setSuccess(`Copied ${code} to clipboard!`)
    setTimeout(() => setSuccess(""), 2000)
  }

  const calculateSavings = (code: PromoCode) => {
    if (code.discountType === "full") return 199
    if (code.discountType === "percent" && code.discountAmount) return Math.round(199 * code.discountAmount / 100)
    if (code.discountType === "fixed" && code.discountAmount) return Math.min(code.discountAmount, 199)
    return 0
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const totalSavings = codes.reduce((sum, c) => sum + (c.uses * calculateSavings(c)), 0)

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Header */}
      <div className="border-b-2 border-white/20 bg-black px-4 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-black text-white">ADMIN DASHBOARD</h1>
            <p className="mt-1 text-sm text-white/60">Platform overview and management</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border-2 border-white/30 px-4 py-2 text-xs font-bold text-white/70 transition-colors hover:border-white hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-white/20 bg-black px-4">
        <div className="mx-auto flex max-w-7xl gap-1">
          <Link
            href="/admin/dashboard"
            className="border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
          >
            Overview
          </Link>
          <Link
            href="/admin/dashboard"
            className="border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
          >
            Creators
          </Link>
          <Link
            href="/admin/dashboard"
            className="border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
          >
            Hosts
          </Link>
          <Link
            href="/admin/dashboard"
            className="border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
          >
            Offers
          </Link>
          <Link
            href="/admin/dashboard"
            className="border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
          >
            Collaborations
          </Link>
          <Link
            href="/admin/dashboard"
            className="border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
          >
            📢 Announce
          </Link>
          <span className="border-b-2 border-[#28D17C] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white">
            🎟️ Promo Codes
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 rounded-xl border-2 border-[#28D17C] bg-[#28D17C] p-3">
            <p className="text-sm font-bold text-black">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border-2 border-red-500 bg-red-500 p-3">
            <p className="text-sm font-bold text-white">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Codes" value={codes.length} color="bg-white" />
          <StatCard label="Active" value={codes.filter(c => c.isActive).length} color="bg-[#28D17C]" />
          <StatCard label="Total Redemptions" value={codes.reduce((sum, c) => sum + c.uses, 0)} color="bg-[#4AA3FF]" />
          <StatCard label="Total Savings" value={`$${totalSavings.toLocaleString()}`} color="bg-[#FFD84A]" />
        </div>

        {/* Create New Code */}
        <div className="mb-6 rounded-xl border-2 border-black bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-black">Create New Code</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full border-2 border-black bg-[#28D17C] px-3 py-1 text-xs font-bold text-black"
            >
              {showForm ? "Cancel" : "+ New Code"}
            </button>
          </div>
          
          {showForm && (
            <form onSubmit={handleCreate} className="space-y-4 border-t border-black/10 pt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Code *</label>
                  <input
                    type="text"
                    value={newCode.code}
                    onChange={e => setNewCode(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="LAUNCH2025"
                    required
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold uppercase text-black placeholder:text-black/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Discount Type</label>
                  <select
                    value={newCode.discountType}
                    onChange={e => setNewCode(prev => ({ ...prev, discountType: e.target.value }))}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black"
                  >
                    <option value="full">100% Off (Free)</option>
                    <option value="percent">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                  </select>
                </div>
                {newCode.discountType !== "full" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">
                      {newCode.discountType === "percent" ? "Percent Off" : "Amount Off ($)"}
                    </label>
                    <input
                      type="number"
                      value={newCode.discountAmount}
                      onChange={e => setNewCode(prev => ({ ...prev, discountAmount: e.target.value }))}
                      placeholder={newCode.discountType === "percent" ? "50" : "50"}
                      className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Max Uses</label>
                  <input
                    type="number"
                    value={newCode.maxUses}
                    onChange={e => setNewCode(prev => ({ ...prev, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Expires</label>
                  <input
                    type="date"
                    value={newCode.expiresAt}
                    onChange={e => setNewCode(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-black">Note (Internal)</label>
                  <input
                    type="text"
                    value={newCode.note}
                    onChange={e => setNewCode(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="For beta testers"
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={creating || !newCode.code}
                className="rounded-full border-2 border-black bg-black px-6 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Code"}
              </button>
            </form>
          )}
        </div>

        {/* Codes List */}
        <div className="rounded-xl border-2 border-black bg-white p-4">
          <h3 className="mb-4 text-sm font-bold text-black">All Codes ({codes.length})</h3>
          
          {codes.length === 0 ? (
            <p className="text-sm text-black/60">No promo codes yet. Create your first one above.</p>
          ) : (
            <div className="space-y-3">
              {codes.map(code => (
                <div key={code.id} className="rounded-lg border-2 border-black/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-black text-black">{code.code}</span>
                        <StatusBadge active={code.isActive} />
                      </div>
                      <p className="mt-1 text-sm text-black/60">
                        {code.discountType === "full" && "100% OFF (FREE)"}
                        {code.discountType === "percent" && `${code.discountAmount}% OFF`}
                        {code.discountType === "fixed" && `$${code.discountAmount} OFF`}
                        {" · "}
                        {code.uses} used
                        {code.maxUses && ` / ${code.maxUses} max`}
                        {code.expiresAt && ` · Expires ${formatDate(code.expiresAt)}`}
                      </p>
                      {code.note && <p className="mt-1 text-xs text-black/40">Note: {code.note}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyCode(code.code)}
                        className="rounded-full border-2 border-black/20 px-3 py-1 text-xs font-bold text-black hover:border-black"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleToggle(code.id, code.isActive)}
                        className="rounded-full border-2 border-black/20 px-3 py-1 text-xs font-bold text-black hover:border-black"
                      >
                        {code.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDelete(code.id, code.code)}
                        className="rounded-full border-2 border-red-500 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Redemptions */}
                  {code.redemptions.length > 0 && (
                    <div className="mt-3 border-t border-black/10 pt-3">
                      <p className="mb-2 text-xs font-bold text-black/60">Recent Redemptions</p>
                      <div className="space-y-1">
                        {code.redemptions.slice(0, 5).map(r => (
                          <div key={r.id} className="flex items-center justify-between text-xs">
                            <span className="text-black">
                              {r.hostProfile?.displayName || "Unknown"} 
                              <span className="text-black/40"> ({r.hostProfile?.contactEmail})</span>
                            </span>
                            <span className="text-black/60">
                              Saved ${r.amountSaved} · {formatDate(r.createdAt)}
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
        </div>
      </div>
    </div>
  )
}
