"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function JoinBetaPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string)?.toUpperCase()

  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [signingIn, setSigningIn] = useState(false)

  // Validate code on mount via API
  useEffect(() => {
    async function validateCode() {
      if (!code) {
        setIsValid(false)
        return
      }
      
      try {
        const res = await fetch(`/api/invites/validate?token=${encodeURIComponent(code)}`)
        const data = await res.json()
        setIsValid(data.valid === true)
      } catch (error) {
        console.error('Error validating invite code:', error)
        setIsValid(false)
      }
    }
    
    validateCode()
  }, [code])

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    // Store the beta code in localStorage so we can use it after OAuth callback
    localStorage.setItem("betaInviteCode", code)
    
    await signIn("google", {
      callbackUrl: "/onboarding?role=creator&beta=true",
    })
  }

  // Loading state
  if (isValid === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Invalid code
  if (!isValid) {
    return (
      <div className="min-h-screen bg-black px-4 py-16">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border-[3px] border-black bg-[#FF6B6B] p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-white">
              <span className="text-2xl">🚫</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Invalid Code</p>
            <h1 className="mt-2 font-heading text-2xl font-black text-black">
              This invite link isn't valid
            </h1>
            <p className="mt-3 text-sm text-black/80">
              CreatorStays is currently in private beta. If you'd like access, join our waitlist.
            </p>
            <Link
              href="/waitlist"
              className="mt-6 inline-block rounded-full border-[3px] border-black bg-white px-6 py-3 text-sm font-black text-black transition-transform hover:-translate-y-1"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Valid code - show signup
  return (
    <div className="min-h-screen bg-black px-4 py-16">
      <div className="mx-auto max-w-md space-y-4">
        {/* Beta Access Card */}
        <div className="rounded-2xl border-[3px] border-black bg-[#28D17C] p-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-white">
            <span className="text-2xl"></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Private Beta</p>
          <h1 className="mt-2 font-heading text-2xl font-black text-black">
            You're Invited!
          </h1>
          <p className="mt-2 text-sm text-black/80">
            Welcome to CreatorStays beta. Create your account to start connecting with hosts.
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="rounded-2xl border-[3px] border-black bg-white p-6">
          <h2 className="font-heading text-xl font-black text-black">Create Your Account</h2>
          <p className="mt-1 text-sm text-black/60">
            Sign up with Google to get started in seconds.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border-[3px] border-black bg-white py-3 text-sm font-bold text-black transition-transform hover:-translate-y-1 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {signingIn ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-black/10" />
            <span className="text-xs text-black/40">or</span>
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <Link
            href={`/creators/signup?invite=${code}`}
            className="block w-full rounded-full border-[3px] border-black bg-black py-3 text-center text-sm font-bold text-white transition-transform hover:-translate-y-1"
          >
            Sign up with Email
          </Link>

          <p className="mt-4 text-center text-[10px] text-black/50">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>

        {/* What you get */}
        <div className="rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-black/60">Beta Perks</p>
          <ul className="mt-3 space-y-2">
            {[
              "Connect with vacation rental hosts",
              "Get paid for content collaborations",
              "Free stays at amazing properties",
              "Early access to new features",
              "Direct support from our team",
            ].map((perk, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-black">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-black bg-white text-xs">✓</span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Back link */}
        <p className="text-center text-xs text-white/50">
          <Link href="/" className="underline hover:text-white">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
