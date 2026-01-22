"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface InviteData {
  valid: boolean
  email: string
  role: string
  agencyName: string
  inviterName: string
  alreadyAccepted?: boolean
  error?: string
}

export default function JoinTeamPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const token = params.token as string
  
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [error, setError] = useState("")

  // Fetch invite details
  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/host/agency/team/invite/${token}`)
        const data = await res.json()
        
        if (!res.ok) {
          setError(data.error || "Invalid or expired invitation")
        } else {
          setInviteData(data)
        }
      } catch (e) {
        setError("Failed to load invitation")
      }
      setLoading(false)
    }
    
    if (token) {
      fetchInvite()
    }
  }, [token])

  // If user is logged in, check if they can accept
  useEffect(() => {
    if (status === "authenticated" && inviteData?.valid && session?.user?.email) {
      // Check if the logged-in email matches the invite email
      if (session.user.email.toLowerCase() !== inviteData.email.toLowerCase()) {
        setError(`This invitation was sent to ${inviteData.email}. You're logged in as ${session.user.email}. Please log out and try again with the correct account.`)
      }
    }
  }, [status, session, inviteData])

  const handleAcceptInvite = async () => {
    setAccepting(true)
    setError("")
    
    try {
      const res = await fetch(`/api/host/agency/team/invite/${token}/accept`, {
        method: "POST",
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || "Failed to accept invitation")
        setAccepting(false)
        return
      }
      
      // Success! Redirect to dashboard
      router.push("/beta/dashboard/host?welcome=team")
    } catch (e) {
      setError("Something went wrong")
      setAccepting(false)
    }
  }

  const handleSignInAndAccept = () => {
    // Store the token in sessionStorage so we can accept after login
    sessionStorage.setItem('pendingTeamInvite', token)
    
    // Sign in with the invite email pre-filled
    signIn("email", { 
      email: inviteData?.email,
      callbackUrl: `/join/team/${token}` 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    )
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-red-50">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-black">Invalid Invitation</h1>
          <p className="mt-2 text-sm text-black/60">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full border-2 border-black bg-black px-6 py-2 text-sm font-bold text-white"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  if (inviteData?.alreadyAccepted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#28D17C] bg-green-50">
            <svg className="h-8 w-8 text-[#28D17C]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-black">Already Accepted</h1>
          <p className="mt-2 text-sm text-black/60">
            You've already accepted this invitation to join {inviteData.agencyName}.
          </p>
          <Link
            href="/beta/dashboard/host"
            className="mt-6 inline-block rounded-full border-2 border-black bg-[#28D17C] px-6 py-2 text-sm font-bold text-black"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border-[3px] border-black bg-white p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-[#FFD84A]">
            <span className="text-lg font-black">CS</span>
          </div>
          <h1 className="text-2xl font-black text-black">You're Invited!</h1>
          <p className="mt-2 text-sm text-black/60">
            Join <strong>{inviteData?.agencyName}</strong> on CreatorStays
          </p>
        </div>

        {/* Invite Details */}
        <div className="mt-6 rounded-xl border-2 border-black bg-[#FAFAFA] p-4">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Invited by</p>
              <p className="text-sm font-bold text-black">{inviteData?.inviterName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Your Role</p>
              <span className={`inline-block rounded-full border-2 border-black px-3 py-1 text-xs font-bold ${
                inviteData?.role === 'editor' ? 'bg-[#FFD84A]' : 'bg-white'
              }`}>
                {inviteData?.role === 'editor' ? 'Editor' : 'Viewer'}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Email</p>
              <p className="text-sm text-black">{inviteData?.email}</p>
            </div>
          </div>
        </div>

        {/* What you can do */}
        <div className="mt-4 rounded-xl border border-black/10 bg-white p-4">
          <p className="text-xs font-bold text-black mb-2">What you'll be able to do:</p>
          {inviteData?.role === 'editor' ? (
            <ul className="space-y-1 text-xs text-black/70">
              <li>✓ Manage properties and listings</li>
              <li>✓ Send offers to creators</li>
              <li>✓ View analytics and collaborations</li>
            </ul>
          ) : (
            <ul className="space-y-1 text-xs text-black/70">
              <li>✓ View properties and listings</li>
              <li>✓ View collaborations and analytics</li>
            </ul>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border-2 border-red-500 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action */}
        <div className="mt-6">
          {status === "authenticated" ? (
            // User is logged in - show accept button
            <button
              onClick={handleAcceptInvite}
              disabled={accepting || !!error}
              className="w-full rounded-full border-2 border-black bg-[#28D17C] py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? "Joining team..." : "Accept & Join Team"}
            </button>
          ) : (
            // User not logged in - show sign in button
            <>
              <button
                onClick={handleSignInAndAccept}
                className="w-full rounded-full border-2 border-black bg-[#28D17C] py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
              >
                Sign In to Accept Invitation
              </button>
              <p className="mt-3 text-center text-xs text-black/50">
                We'll send a magic link to {inviteData?.email}
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[10px] text-black/40">
          By accepting, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
