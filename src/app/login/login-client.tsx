"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function LoginClient() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/beta/dashboard"
  const error = searchParams.get("error")
  
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState<"google" | "email" | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading("google")
    await signIn("google", { callbackUrl })
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading("email")
    const result = await signIn("email", { 
      email, 
      callbackUrl,
      redirect: false,
    })
    
    if (result?.ok) {
      setEmailSent(true)
    }
    setLoading(null)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-black px-3 py-20 lg:px-4">
        <div className="mx-auto max-w-md">
          <div className="block-hover rounded-2xl border-[3px] border-black bg-[#28D17C] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-white">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="font-heading text-[2rem] leading-[0.85] tracking-[-0.03em] text-black" style={{ fontWeight: 900 }}>
              CHECK YOUR EMAIL
            </h1>
            <p className="mt-4 text-[14px] font-medium text-black">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-[13px] text-black/70">
              Click the link in the email to sign in. The link expires in 24 hours.
            </p>
            <button 
              onClick={() => { setEmailSent(false); setEmail("") }}
              className="mt-6 inline-flex h-10 items-center rounded-full border-[3px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
            >
              Use different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-3 py-20 lg:px-4">
      <div className="mx-auto max-w-md">
        
        {/* Hero */}
        <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-6 text-center">
          <h1 className="font-heading text-[2.5rem] leading-[0.85] tracking-[-0.03em] text-black" style={{ fontWeight: 900 }}>
            <span className="block">WELCOME</span>
            <span className="block" style={{ fontWeight: 400 }}>BACK</span>
          </h1>
          <p className="mt-3 text-[14px] font-medium text-black">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 rounded-xl border-[3px] border-red-500 bg-red-50 p-4 text-center">
            <p className="text-[13px] font-medium text-red-600">
              {error === "OAuthAccountNotLinked" 
                ? "This email is already registered with a different sign-in method."
                : error === "EmailSignin"
                ? "Could not send email. Please try again."
                : "Something went wrong. Please try again."}
            </p>
          </div>
        )}

        {/* Login Options */}
        <div className="mt-3 rounded-2xl border-[3px] border-black bg-white p-6">
          
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading === "google"}
            className="flex w-full items-center justify-center gap-3 rounded-full border-[3px] border-black bg-white py-3 text-[12px] font-bold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading === "google" ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-[2px] flex-1 bg-black/10" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/40">or</span>
            <div className="h-[2px] flex-1 bg-black/10" />
          </div>

          {/* Email Sign In */}
          <form onSubmit={handleEmailSignIn}>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-black">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border-[3px] border-black px-4 py-3 text-[14px] font-medium text-black placeholder:text-black/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading === "email" || !email}
              className="mt-3 w-full rounded-full border-[3px] border-black bg-black py-3 text-[12px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "email" ? "Sending link..." : "Send Magic Link"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-black/50">
            We'll email you a magic link to sign in instantly.
          </p>
        </div>

        {/* New User CTA */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Link 
            href="/hosts"
            className="block-hover rounded-xl border-[3px] border-black bg-[#4AA3FF] p-4 text-center transition-transform duration-200"
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-black">New Host?</p>
            <p className="mt-1 text-[12px] font-bold text-black">Create account →</p>
          </Link>
          <Link 
            href="/waitlist"
            className="block-hover rounded-xl border-[3px] border-black bg-[#FF7A00] p-4 text-center transition-transform duration-200"
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-black">Creator?</p>
            <p className="mt-1 text-[12px] font-bold text-black">Join waitlist →</p>
          </Link>
        </div>

      </div>
    </div>
  )
}
