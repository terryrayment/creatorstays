"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

/**
 * Private Beta Creator Signup Page (Client Component)
 * 
 * URL: /creators/signup?invite=cs_beta_xxxxxx
 * 
 * Flow:
 * 1. On load, validate the invite token via API
 * 2. If invalid → redirect to /creators (public waitlist page)
 * 3. If valid → show signup form
 * 4. On successful signup:
 *    - Create User + CreatorProfile with isBeta=true, inviteTokenUsed=token
 *    - Send magic link email
 *    - Show confirmation screen
 */
export default function CreatorSignupClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("invite")

  // State
  const [validating, setValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")

  // Form state
  const [form, setForm] = useState({
    email: "",
    displayName: "",
    handle: "",
    instagramHandle: "",
    tiktokHandle: "",
  })

  // Validate invite token on page load
  useEffect(() => {
    async function validateInvite() {
      // No token provided - redirect immediately
      if (!inviteToken) {
        router.replace("/creators")
        return
      }

      try {
        const res = await fetch(`/api/invites/validate?token=${encodeURIComponent(inviteToken)}`)
        const data = await res.json()

        if (data.valid) {
          setIsValid(true)
        } else {
          setValidationError(data.reason || "Invalid invite")
          // Redirect after showing error briefly
          setTimeout(() => router.replace("/creators"), 2000)
        }
      } catch (error) {
        setValidationError("Failed to validate invite")
        setTimeout(() => router.replace("/creators"), 2000)
      } finally {
        setValidating(false)
      }
    }

    validateInvite()
  }, [inviteToken, router])

  // Handle Google sign up
  const handleGoogleSignUp = () => {
    // Store invite token in localStorage so we can use it after OAuth callback
    if (inviteToken) {
      localStorage.setItem("betaInviteCode", inviteToken)
    }
    signIn("google", { callbackUrl: "/onboarding?role=creator&beta=true" })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError("")

    // Validate at least one social platform
    if (!form.instagramHandle && !form.tiktokHandle) {
      setSubmitError("Please add at least one social platform")
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/creator/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          displayName: form.displayName,
          handle: form.handle,
          instagramHandle: form.instagramHandle,
          tiktokHandle: form.tiktokHandle,
          inviteToken,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.alreadyExists) {
          setSubmitError("This email is already registered. Please sign in instead.")
        } else {
          setSubmitError(data.error || "Failed to create account")
        }
        return
      }

      // Account created — now trigger magic link from the client
      // This uses NextAuth's email provider which works reliably client-side
      if (data.sendMagicLink) {
        await signIn("email", {
          email: form.email,
          redirect: false,
          callbackUrl: "/onboarding/creator",
        })
      }

      // Show confirmation
      setSubmittedEmail(form.email)
      setSubmitted(true)

    } catch (error) {
      setSubmitError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Input styling
  const inputClass = "h-11 w-full rounded-lg border-[2px] border-black bg-white px-4 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  // Loading state while validating
  if (validating) {
    return (
      <div className="min-h-screen bg-black px-3 pt-16 pb-8 lg:px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border-[3px] border-black bg-white p-6 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
            <p className="mt-4 text-sm text-black">Validating invite...</p>
          </div>
        </div>
      </div>
    )
  }

  // Invalid invite - show error before redirect
  if (!isValid) {
    return (
      <div className="min-h-screen bg-black px-3 pt-16 pb-8 lg:px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl border-[3px] border-black bg-[#FF6B6B] p-6 text-center">
            <p className="text-[9px] font-black uppercase tracking-wider text-black">Invalid Invite</p>
            <h1 className="mt-2 font-heading text-[1.5rem] leading-[0.85] text-black" style={{ fontWeight: 900 }}>
              {validationError || "This invite is not valid"}
            </h1>
            <p className="mt-3 text-[12px] font-medium text-black">
              Redirecting to waitlist...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success - show email confirmation
  if (submitted) {
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
              YOU'RE IN! 
            </h1>
            <p className="mt-3 text-[13px] font-medium text-black">
              We sent a sign-in link to <strong>{submittedEmail}</strong>
            </p>
            <p className="mt-2 text-[11px] text-black/70">
              Click the link in your email to access your dashboard. One click, you're in. The link expires in 24 hours.
            </p>
            <p className="mt-4 text-[10px] text-black/60">
              Didn't receive the email? Check your spam folder or{" "}
              <button onClick={() => setSubmitted(false)} className="underline font-bold">
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Valid invite - show signup form
  return (
    <div className="min-h-screen bg-black px-3 pt-16 pb-8 lg:px-4">
      <div className="mx-auto max-w-md">
        {/* Private Beta Badge Card */}
        <div className="mb-4 rounded-2xl border-[3px] border-black bg-[#28D17C] p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border-[2px] border-black bg-white">
            <span className="text-lg">🔒</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-wider text-black">Private Beta Access</p>
          <p className="mt-1 text-[12px] font-medium text-black">
            You've been invited to CreatorStays beta.
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="rounded-2xl border-[3px] border-black bg-white p-6">
          <p className="text-[9px] font-black uppercase tracking-wider text-black">Creator Signup</p>
          <h1 className="mt-1 font-heading text-[2rem] leading-[0.85] tracking-[-0.02em]" style={{ fontWeight: 900 }}>
            <span className="block text-black">CREATE YOUR</span>
            <span className="block text-black" style={{ fontWeight: 400 }}>PROFILE</span>
          </h1>

          {/* Google Sign Up - Quick option */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-full border-[2px] border-black bg-white py-3 text-[11px] font-bold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-[2px] flex-1 bg-black/10" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">or sign up with email</span>
            <div className="h-[2px] flex-1 bg-black/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">
                Email *
              </label>
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
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">
                Display Name *
              </label>
              <input
                required
                placeholder="Your name or brand"
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">
                Handle *
              </label>
              <div className="flex items-center">
                <span className="mr-1 text-sm font-medium text-black">@</span>
                <input
                  required
                  placeholder="yourhandle"
                  value={form.handle}
                  onChange={e => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                  className={inputClass}
                />
              </div>
              <p className="mt-1 text-[9px] text-black/50">Letters, numbers, underscores only</p>
            </div>

            <div className="border-t-2 border-black/10 pt-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-black">
                Social Platforms (at least one) *
              </p>
              
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-[9px] font-medium text-black/60">Instagram</label>
                  <input
                    placeholder="@yourinstagram"
                    value={form.instagramHandle}
                    onChange={e => setForm({ ...form, instagramHandle: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[9px] font-medium text-black/60">TikTok</label>
                  <input
                    placeholder="@yourtiktok"
                    value={form.tiktokHandle}
                    onChange={e => setForm({ ...form, tiktokHandle: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-lg border-2 border-red-500 bg-red-50 p-3 text-center">
                <p className="text-[11px] font-medium text-red-600">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-full bg-black text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-3 text-center text-[10px] text-black/50">
            We'll send you a magic link to sign in. No password needed.
          </p>

          <p className="mt-4 text-center text-[10px] text-black/50">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>

        {/* Back link */}
        <p className="mt-4 text-center text-[10px] font-medium text-white/60">
          <Link href="/creators" className="underline hover:text-white">← Back to Creators</Link>
        </p>
      </div>
    </div>
  )
}
