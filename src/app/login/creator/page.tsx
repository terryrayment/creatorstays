"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CreatorLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Fake auth - accept any email/password
    setTimeout(() => {
      // Set fake session cookie
      document.cookie = `cs_session=creator_${Date.now()}; path=/; max-age=86400`
      document.cookie = `cs_role=creator; path=/; max-age=86400`
      document.cookie = `cs_user=${encodeURIComponent(JSON.stringify({ email: form.email, role: "creator" }))}; path=/; max-age=86400`
      router.push("/dashboard/creator")
    }, 500)
  }

  const inputClass = "h-11 w-full rounded-lg border-[2px] border-black bg-white px-4 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  return (
    <div className="min-h-screen bg-black px-3 pt-16 pb-8 lg:px-4">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-6 transition-transform duration-200 hover:-translate-y-1">
          <p className="text-[9px] font-black uppercase tracking-wider text-black">Creator Portal</p>
          <h1 className="mt-1 font-heading text-[2rem] leading-[0.85] tracking-[-0.02em]" style={{ fontWeight: 900 }}>
            <span className="block text-black">SIGN IN</span>
          </h1>
          <p className="mt-2 text-[12px] font-medium text-black">
            Access your creator dashboard to manage offers and track earnings.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Email</label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Password</label>
              <input
                required
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-[11px] font-medium text-[#FF6B6B]">{error}</p>
            )}

            <div className="flex items-center justify-between pt-1">
              <Link href="/login/creator/forgot" className="text-[10px] font-bold text-black underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-black text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 border-t-[2px] border-black pt-4">
            <p className="text-[11px] font-medium text-black text-center">
              Don't have an account?{" "}
              <Link href="/waitlist" className="font-black underline">Join Creator Waitlist</Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] font-medium text-white/60">
          Are you a host?{" "}
          <Link href="/login/host" className="font-bold text-white underline">Host login</Link>
        </p>
      </div>
    </div>
  )
}
