"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useParams } from "next/navigation"

export default function ReferralJoinPage() {
  const params = useParams()
  const code = params.code as string
  const [referrerName, setReferrerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Store referral code in localStorage
    if (code) {
      localStorage.setItem("referralCode", code.toUpperCase())
    }

    // Try to get referrer info
    async function fetchReferrer() {
      try {
        // We'd need an API to look up the referrer by code
        // For now, just show the code
        setLoading(false)
      } catch (e) {
        setLoading(false)
      }
    }

    fetchReferrer()
  }, [code])

  const handleSignUp = () => {
    signIn("google", { 
      callbackUrl: "/onboarding/creator?ref=" + code 
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border-4 border-black bg-white p-8 text-center">
          <span className="mb-4 inline-block text-6xl">🎁</span>
          
          <h1 className="font-heading text-3xl tracking-tight text-black">
            You've been invited!
          </h1>
          
          <p className="mt-3 text-sm text-black/60">
            A creator friend invited you to join CreatorStays — the marketplace connecting content creators with amazing stays.
          </p>

          <div className="my-6 rounded-xl border-2 border-[#D7B6FF] bg-[#D7B6FF]/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-black/60">Referral Code</p>
            <p className="mt-1 font-mono text-2xl font-bold text-black">{code?.toUpperCase()}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignUp}
              className="w-full rounded-full border-2 border-black bg-[#D7B6FF] py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              Sign Up with Google
            </button>
            
            <p className="text-xs text-black/50">
              By signing up, your friend will earn a referral bonus when you complete your profile.
            </p>
          </div>

          {/* Benefits */}
          <div className="mt-8 border-t-2 border-black/10 pt-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-black/60">
              As a creator, you'll get:
            </p>
            <div className="space-y-2 text-left">
              {[
                "🏡 Free stays at beautiful properties",
                "💰 Paid collaborations with hosts",
                "📈 Analytics & tracking tools",
                "🤝 Direct booking requests",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-black">
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-black/40">
          Already have an account?{" "}
          <button 
            onClick={() => signIn("google", { callbackUrl: "/dashboard/creator" })}
            className="font-medium text-black underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
