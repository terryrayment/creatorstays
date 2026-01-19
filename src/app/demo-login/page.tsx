'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<'host' | 'creator' | null>(null)

  const handleLogin = (role: 'host' | 'creator') => {
    setLoading(role)
    // Simulate brief loading then redirect to appropriate dashboard
    setTimeout(() => {
      if (role === 'host') {
        router.push('/dashboard/host')
      } else {
        router.push('/dashboard/creator')
      }
    }, 500)
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
              {loading === 'host' ? 'Loading...' : 'Enter as Host'}
            </button>
            
            <button
              onClick={() => handleLogin('creator')}
              disabled={loading !== null}
              className="w-full border-4 border-black bg-white hover:bg-gray-50 text-black font-bold py-4 px-6 transition-colors disabled:opacity-50"
            >
              {loading === 'creator' ? 'Loading...' : 'Enter as Creator'}
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
