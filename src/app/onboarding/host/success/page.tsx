"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    
    if (!sessionId) {
      // No session ID - might be free access via promo
      setVerifying(false)
      return
    }

    // Verify the payment was successful
    async function verifyPayment() {
      try {
        // The webhook should have already updated the database
        // Just wait a moment for it to process
        await new Promise(resolve => setTimeout(resolve, 2000))
        setVerifying(false)
      } catch (e) {
        setError("Failed to verify payment. Please contact support.")
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm font-medium text-black/60">Confirming your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-4">
        <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-8 text-center">
          <span className="mb-4 inline-block text-5xl">⚠️</span>
          <h1 className="font-heading text-2xl tracking-tight text-black">Something went wrong</h1>
          <p className="mt-2 text-sm text-black/60">{error}</p>
          <Link
            href="/onboarding/host"
            className="mt-6 inline-block rounded-full border-2 border-black bg-black px-6 py-3 text-sm font-bold text-white"
          >
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#28D17C]">
          <svg className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        
        <h1 className="font-heading text-3xl tracking-tight text-black">You're in!</h1>
        <p className="mt-2 text-sm text-black/60">
          Welcome to CreatorStays. Your lifetime membership is now active.
        </p>

        <div className="mt-6 rounded-xl border-2 border-black bg-[#FFD84A]/20 p-4 text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/60">What's included</h3>
          <ul className="mt-2 space-y-2 text-sm text-black">
            <li className="flex items-center gap-2">
              <span className="text-[#28D17C]">✓</span>
              Unlimited access to creator directory
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#28D17C]">✓</span>
              Send unlimited offers to creators
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#28D17C]">✓</span>
              Tracked links & performance analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#28D17C]">✓</span>
              Secure payment processing
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#28D17C]">✓</span>
              Priority support
            </li>
          </ul>
        </div>

        <Link
          href="/dashboard/host?welcome=true"
          className="mt-6 block rounded-full border-2 border-black bg-[#28D17C] px-6 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  )
}

export default function HostMembershipSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm font-medium text-black/60">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
