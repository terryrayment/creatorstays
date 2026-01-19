'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DemoLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const [loading, setLoading] = useState<'host' | 'creator' | null>(null)

  // Auto-login if role param provided
  useEffect(() => {
    if (roleParam === 'host' || roleParam === 'creator') {
      handleLogin(roleParam)
    }
  }, [roleParam])

  const handleLogin = (role: 'host' | 'creator') => {
    setLoading(role)
    
    // Set cookie: 7 days, path=/, SameSite=Lax
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    document.cookie = `cs_demo_role=${role.toUpperCase()}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    
    // Redirect to appropriate dashboard
    setTimeout(() => {
      if (role === 'host') {
        router.push('/dashboard/host')
      } else {
        router.push('/dashboard/creator')
      }
    }, 300)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-4 border-black bg-white p-8">
          <h1 className="text-3xl font-black text-black mb-2">Demo Login</h1>
          <p className="text-black/60 mb-8">Choose your role to explore the platform.</p>
          
          <div className="space-y-4">
            <button
              onClick={() => handleLogin('host')}
              disabled={loading !== null}
              className="w-full border-4 border-black bg-[#FFCC00] hover:bg-[#FFD633] text-black font-bold py-4 px-6 transition-colors disabled:opacity-50"
            >
              {loading === 'host' ? 'Loading...' : 'Demo as Host'}
            </button>
            
            <button
              onClick={() => handleLogin('creator')}
              disabled={loading !== null}
              className="w-full border-4 border-black bg-white hover:bg-gray-50 text-black font-bold py-4 px-6 transition-colors disabled:opacity-50"
            >
              {loading === 'creator' ? 'Loading...' : 'Demo as Creator'}
            </button>
          </div>
          
          <p className="text-xs text-black/40 mt-6 text-center">
            This is a demo environment with sample data.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DemoLoginPage() {
  return (
    <Suspense fallback={null}>
      <DemoLoginContent />
    </Suspense>
  )
}
