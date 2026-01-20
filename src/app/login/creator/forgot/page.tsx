"use client"

import { useState } from "react"
import Link from "next/link"

export default function CreatorForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Fake - just show success
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 500)
  }

  const inputClass = "h-11 w-full rounded-lg border-[2px] border-black bg-white px-4 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  return (
    <div className="min-h-screen bg-black px-3 pt-16 pb-8 lg:px-4">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-6 transition-transform duration-200 hover:-translate-y-1">
          <p className="text-[9px] font-black uppercase tracking-wider text-black">Creator Portal</p>
          <h1 className="mt-1 font-heading text-[1.75rem] leading-[0.85] tracking-[-0.02em]" style={{ fontWeight: 900 }}>
            <span className="block text-black">RESET</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>PASSWORD</span>
          </h1>

          {submitted ? (
            <div className="mt-5">
              <div className="rounded-lg border-[2px] border-black bg-white p-4">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-[12px] font-bold text-black">Check your email</span>
                </div>
                <p className="mt-2 text-[11px] font-medium text-black">
                  If an account exists for {email}, you'll receive a password reset link.
                </p>
              </div>
              <Link
                href="/login/creator"
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border-[3px] border-black bg-white text-[11px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-2 text-[12px] font-medium text-black">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Email</label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-black text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/login/creator" className="text-[10px] font-bold text-black underline">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
