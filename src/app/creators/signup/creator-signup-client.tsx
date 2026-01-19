"use client"

import { useState, useEffect } from "react"
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
 *    - Create creator profile with isBeta=true, inviteTokenUsed=token
 *    - Call /api/invites/use to increment usage
 *    - Redirect to dashboard
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError("")

    try {
      // In a real app, this would create the user account and creator profile
      // For now, we'll simulate success and use the invite

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mark invite as used
      const useRes = await fetch("/api/invites/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: inviteToken,
          creatorProfileId: "mock_profile_id" // Would be real ID in production
        })
      })

      if (!useRes.ok) {
        throw new Error("Failed to process invite")
      }

      // Set mock session cookies (same as dev login)
      document.cookie = `cs_session=creator_${Date.now()}; path=/; max-age=86400`
      document.cookie = `cs_role=creator; path=/; max-age=86400`
      document.cookie = `cs_user=${encodeURIComponent(JSON.stringify({
        email: form.email,
        role: "creator",
        isBeta: true,
        inviteToken: inviteToken
      }))}; path=/; max-age=86400`

      // Redirect to creator dashboard
      router.push("/dashboard/creator")

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Signup failed")
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
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-black border-t-transparent" />
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

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
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
                Social Platforms (at least one)
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
              <p className="text-[11px] font-medium text-[#FF6B6B]">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-full bg-black text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-[10px] text-black/50">
            By signing up, you agree to our{" "}
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
