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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-heading text-xl tracking-tight">
              <span className="text-black">ADMIN</span>
            </Link>
            <span className="text-black/30">/</span>
            <span className="text-sm font-bold text-black">Promo Codes</span>
          </div>
          <Link 
            href="/dashboard/host"
            className="text-sm font-medium text-black/60 hover:text-black"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl tracking-tight text-black">Promo Codes</h1>
            <p className="mt-1 text-sm text-black/60">
              Create and manage host membership promo codes
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full border-2 border-black bg-[#28D17C] px-4 py-2 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
          >
            {showForm ? "Cancel" : "+ New Code"}
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 rounded-lg border-2 border-[#28D17C] bg-[#28D17C]/10 p-3">
            <p className="text-sm font-medium text-black">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="mb-8 rounded-xl border-2 border-black bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-black">Create New Promo Code</h2>
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

              {/* Preview */}
              <div className="rounded-lg border-2 border-dashed border-black/30 bg-black/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-black/60 mb-2">Preview</p>
                <p className="text-sm text-black">
                  <span className="font-bold">{newCode.code || "CODE"}</span>
                  {" → "}
                  {newCode.discountType === "full" && "FREE ($199 off)"}
                  {newCode.discountType === "percent" && newCode.discountAmount && `${newCode.discountAmount}% off ($${Math.round(199 * parseInt(newCode.discountAmount) / 100)} off)`}
                  {newCode.discountType === "fixed" && newCode.discountAmount && `$${newCode.discountAmount} off`}
                  {newCode.maxUses && ` • ${newCode.maxUses} uses max`}
                  {newCode.expiresAt && ` • Expires ${newCode.expiresAt}`}
                </p>
              </div>

              <div className="flex justify-end gap-3">
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
                  className="rounded-full border-2 border-black bg-[#28D17C] px-6 py-2 text-sm font-bold text-black disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <p className="text-2xl font-bold text-black">{codes.length}</p>
            <p className="text-xs text-black/60">Total Codes</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <p className="text-2xl font-bold text-[#28D17C]">{codes.filter(c => c.isActive).length}</p>
            <p className="text-xs text-black/60">Active</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <p className="text-2xl font-bold text-black">{codes.reduce((sum, c) => sum + c.uses, 0)}</p>
            <p className="text-xs text-black/60">Total Redemptions</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-white p-4">
            <p className="text-2xl font-bold text-black">
              ${codes.reduce((sum, c) => sum + (c.uses * calculateSavings(c)), 0).toLocaleString()}
            </p>
            <p className="text-xs text-black/60">Total Savings Given</p>
          </div>
        </div>

        {/* Codes List */}
        {codes.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-black/30 bg-white p-12 text-center">
            <span className="mb-4 inline-block text-5xl">🎟️</span>
            <h3 className="text-lg font-bold text-black">No promo codes yet</h3>
            <p className="mt-1 text-sm text-black/60">Create your first promo code to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {codes.map(code => (
              <div
                key={code.id}
                className={`rounded-xl border-2 border-black bg-white p-4 transition-opacity ${!code.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFD84A] text-xl font-bold">
                      🎟️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-lg font-bold text-black">{code.code}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${code.isActive ? 'bg-[#28D17C]/20 text-[#28D17C]' : 'bg-black/10 text-black/50'}`}>
                          {code.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <p className="text-sm text-black/60">
                        {formatDiscount(code)}
                        {code.maxUses && ` • ${code.uses}/${code.maxUses} used`}
                        {!code.maxUses && code.uses > 0 && ` • ${code.uses} used`}
                        {code.expiresAt && ` • Expires ${new Date(code.expiresAt).toLocaleDateString()}`}
                      </p>
                      {code.note && (
                        <p className="mt-1 text-xs text-black/40">{code.note}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(code.code)
                        setSuccess(`Copied ${code.code} to clipboard!`)
                        setTimeout(() => setSuccess(""), 2000)
                      }}
                      className="rounded-lg border-2 border-black bg-white px-3 py-1.5 text-xs font-bold text-black hover:bg-black/5"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => toggleActive(code.id, code.isActive)}
                      className={`rounded-lg border-2 border-black px-3 py-1.5 text-xs font-bold ${code.isActive ? 'bg-white text-black hover:bg-black/5' : 'bg-[#28D17C] text-black'}`}
                    >
                      {code.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteCode(code.id, code.code)}
                      className="rounded-lg border-2 border-red-500 bg-white px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Redemptions */}
                {code.redemptions.length > 0 && (
                  <div className="mt-4 border-t-2 border-black/10 pt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-black/60">
                      Recent Redemptions
                    </p>
                    <div className="space-y-2">
                      {code.redemptions.slice(0, 5).map(r => (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                          <span className="text-black">
                            {r.hostProfile?.displayName || 'Unknown'} 
                            <span className="text-black/40"> ({r.hostProfile?.contactEmail})</span>
                          </span>
                          <span className="text-black/60">
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
      </main>
    </div>
  )
}
