'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Suspense } from 'react'
import Link from 'next/link'

function DemoLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const roleParam = searchParams.get('role')
  const clearParam = searchParams.get('clear')
  
  const [loading, setLoading] = useState<'host' | 'creator' | 'clearing' | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Handle clear param - completely reset demo state
  useEffect(() => {
    if (clearParam === 'true') {
      clearDemoState()
      router.replace('/demo-login')
    }
  }, [clearParam, router])

  // Auto-login if role param provided (and not currently authenticated)
  useEffect(() => {
    if (roleParam === 'host' || roleParam === 'creator') {
      // If user has a real session, warn them
      if (status === 'authenticated') {
        setError('You are logged in with a real account. Demo mode is for testing only. Log out first to use demo mode.')
        return
      }
      if (status === 'unauthenticated') {
        handleLogin(roleParam)
      }
    }
  }, [roleParam, status])

  // Clear all demo-related state
  const clearDemoState = () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('creatorstays_role')
      localStorage.removeItem('betaInviteCode')
    }
    
    // Clear cookies
    document.cookie = 'cs_demo_role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax'
  }

  const handleLogin = async (role: 'host' | 'creator') => {
    setLoading(role)
    setError(null)
    
    // Clear any existing demo state first
    clearDemoState()
    
    // Set new demo state
    // Cookie: 7 days, path=/, SameSite=Lax
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    document.cookie = `cs_demo_role=${role.toUpperCase()}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    
    // Set localStorage for navbar state
    localStorage.setItem('creatorstays_role', role)
    
    // Small delay for state to propagate
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Redirect to appropriate dashboard
    if (role === 'host') {
      router.push('/dashboard/host')
    } else {
      router.push('/dashboard/creator')
    }
  }

  const handleClearAndLogout = async () => {
    setLoading('clearing')
    
    // Clear demo state
    clearDemoState()
    
    // If user has a real session, sign them out too
    if (status === 'authenticated') {
      await signOut({ redirect: false })
    }
    
    // Reload to clear all state
    window.location.href = '/'
  }

  // Show warning if user has real session
  const hasRealSession = status === 'authenticated'

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Warning for authenticated users */}
        {hasRealSession && (
          <div className="mb-4 rounded-2xl border-[3px] border-[#FFD84A] bg-[#FFD84A]/10 p-4">
            <p className="text-sm font-bold text-[#FFD84A]">⚠️ You're logged in</p>
            <p className="mt-1 text-xs text-white/70">
              You have a real account session. Demo mode is for testing the platform without an account.
            </p>
            <button
              onClick={handleClearAndLogout}
              disabled={loading === 'clearing'}
              className="mt-3 w-full rounded-full border-2 border-[#FFD84A] py-2 text-xs font-bold text-[#FFD84A] hover:bg-[#FFD84A] hover:text-black transition-colors disabled:opacity-50"
            >
              {loading === 'clearing' ? 'Signing out...' : 'Sign out & clear demo state'}
            </button>
          </div>
        )}

        {/* Main card */}
        <div className="rounded-2xl border-[3px] border-black bg-white p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#4AA3FF]">
              <span className="text-xl">🧪</span>
            </div>
            <h1 className="text-2xl font-black text-black">Demo Login</h1>
            <p className="mt-2 text-sm text-black/60">
              Explore the platform without creating an account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border-2 border-red-300 bg-red-50 p-3 text-center">
              <p className="text-xs font-medium text-red-600">{error}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => handleLogin('host')}
              disabled={loading !== null || hasRealSession}
              className="w-full rounded-xl border-[3px] border-black bg-[#FFD84A] py-4 px-6 text-sm font-black text-black transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading === 'host' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                <>
                  <span className="block text-lg">🏠</span>
                  Demo as Host
                </>
              )}
            </button>
            
            <button
              onClick={() => handleLogin('creator')}
              disabled={loading !== null || hasRealSession}
              className="w-full rounded-xl border-[3px] border-black bg-[#D7B6FF] py-4 px-6 text-sm font-black text-black transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading === 'creator' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                <>
                  <span className="block text-lg">📸</span>
                  Demo as Creator
                </>
              )}
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t-2 border-black/10">
            <p className="text-center text-xs text-black/50">
              Demo mode uses sample data. No account required.
            </p>
            <p className="mt-2 text-center text-xs text-black/40">
              Want a real account?{' '}
              <Link href="/hosts" className="font-bold text-black underline">
                Sign up as Host
              </Link>
              {' '}or{' '}
              <Link href="/waitlist" className="font-bold text-black underline">
                Join Creator Waitlist
              </Link>
            </p>
          </div>
        </div>

        {/* Clear state link */}
        <div className="mt-4 text-center">
          <Link 
            href="/demo-login?clear=true"
            className="text-xs text-white/40 hover:text-white/60 underline"
          >
            Clear demo state & start fresh
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function DemoLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <DemoLoginContent />
    </Suspense>
  )
}
