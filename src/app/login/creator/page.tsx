"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function CreatorLoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/creator"
  const errorParam = searchParams.get("error")
  
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState<"google" | "email" | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleSignIn = async () => {
    setLoading("google")
    setError("")
    await signIn("google", { callbackUrl })
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading("email")
    setError("")
    
    try {
      const result = await signIn("email", { 
        email, 
        callbackUrl,
        redirect: false,
      })
      
      if (result?.ok) {
        setEmailSent(true)
      } else if (result?.error) {
        setError("Could not send email. Please try again.")
      }
    } catch (e) {
      setError("Something went wrong. Please try again.")
    }
    setLoading(null)
  }

  const inputClass = "h-11 w-full rounded-lg border-[2px] border-black bg-white px-4 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  // Email sent confirmation
  if (emailSent) {
    return (
      <div className="min-h-screen bg-black px-3 pt-16 pb-8 lg:px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border-[3px] border-black bg-[#28D17C] p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-white">
              <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-[9px] font-black uppercase tracking-wider text-black">Check Your Email</p>
            <h1 className="mt-2 font-heading text-[1.75rem] leading-[0.85] tracking-[-0.02em] text-black" style={{ fontWeight: 900 }}>
              MAGIC LINK SENT
            </h1>
            <p className="mt-3 text-[12px] font-medium text-black">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-[11px] text-black/70">
              Click the link in the email to access your creator dashboard. The link expires in 24 hours.
            </p>
            <button
              onClick={() => { setEmailSent(false); setEmail("") }}
              className="mt-5 inline-flex h-10 items-center rounded-full border-[2px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
            >
              Use different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-3 pt-16 pb-8 lg:px-4">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-6">
          <p className="text-[9px] font-black uppercase tracking-wider text-black">Creator Portal</p>
          <h1 className="mt-1 font-heading text-[2rem] leading-[0.85] tracking-[-0.02em]" style={{ fontWeight: 900 }}>
            <span className="block text-black">SIGN IN</span>
          </h1>
          <p className="mt-2 text-[12px] font-medium text-black">
            Access your creator dashboard to manage offers and track earnings.
          </p>

          {/* Error Messages */}
          {(error || errorParam) && (
            <div className="mt-4 rounded-lg border-2 border-red-500 bg-red-50 p-3 text-center">
              <p className="text-[11px] font-medium text-red-600">
                {error || (errorParam === "OAuthAccountNotLinked" 
                  ? "This email is already registered with a different sign-in method."
                  : errorParam === "EmailSignin"
                  ? "Could not send email. Please try again."
                  : "Something went wrong. Please try again.")}
              </p>
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading === "google"}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-full border-[2px] border-black bg-white py-3 text-[11px] font-bold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="h-[2px] flex-1 bg-black/20" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/60">or</span>
            <div className="h-[2px] flex-1 bg-black/20" />
          </div>

          {/* Email Sign In */}
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Email Address</label>
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
              disabled={loading === "email" || !email}
              className="w-full h-11 rounded-full bg-black text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading === "email" ? "Sending link..." : "Send Magic Link"}
            </button>
          </form>

          <p className="mt-3 text-center text-[10px] text-black/70">
            We'll email you a magic link to sign in instantly. No password needed.
          </p>

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

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black px-3 pt-16 pb-8 lg:px-4">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-6 text-center">
          <p className="text-black">Loading...</p>
        </div>
      </div>
    </div>
  )
}

export default function CreatorLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreatorLoginContent />
    </Suspense>
  )
}
