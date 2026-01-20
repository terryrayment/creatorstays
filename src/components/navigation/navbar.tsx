"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  
  // Fallback to localStorage for demo mode
  const [demoRole, setDemoRole] = useState<'host' | 'creator' | null>(null)
  const [notifications, setNotifications] = useState({ unreadMessages: 0, pendingOffers: 0, total: 0 })
  
  useEffect(() => {
    const role = localStorage.getItem('creatorstays_role')
    if (role === 'host' || role === 'creator') {
      setDemoRole(role)
    }
  }, [pathname])

  // Fetch notifications when logged in
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
        }
      } catch (e) {
        console.error('Failed to fetch notifications:', e)
      }
    }

    if (status === 'authenticated') {
      fetchNotifications()
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [status])

  // Use NextAuth session if available, otherwise fall back to demo mode
  const isLoggedIn = status === "authenticated" || demoRole !== null
  const userRole = session?.user?.role || demoRole

  const handleLogout = async () => {
    // Clear demo mode
    localStorage.removeItem('creatorstays_role')
    setDemoRole(null)
    
    // Sign out from NextAuth if authenticated
    if (status === "authenticated") {
      await signOut({ callbackUrl: '/' })
    } else {
      window.location.href = '/'
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-black">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Left - Logo icon */}
        <Link 
          href="/" 
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white transition-colors hover:bg-white hover:text-black"
        >
          <span className="text-[13px] font-bold">CS</span>
        </Link>

        {/* Center - Pill nav buttons (absolutely centered) */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 md:flex">
          {[
            { href: "/how-it-works", label: "How It Works" },
            { href: "/hosts", label: "For Hosts" },
            { href: "/creators", label: "Creators" },
            { href: "/help", label: "Help" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border-2 border-white bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black transition-all hover:bg-transparent hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right - Login/Logout + CTA */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* Messages with badge */}
              <Link
                href="/dashboard/messages"
                className="relative rounded-full border-2 border-white/50 p-2 text-white transition-all hover:border-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                {notifications.unreadMessages > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#28D17C] text-[9px] font-bold text-black">
                    {notifications.unreadMessages > 9 ? '9+' : notifications.unreadMessages}
                  </span>
                )}
              </Link>

              {/* User avatar/name if available */}
              {session?.user?.image && (
                <img 
                  src={session.user.image} 
                  alt="" 
                  className="h-8 w-8 rounded-full border-2 border-white/50"
                />
              )}
              
              {/* Dashboard Link with notification dot */}
              <Link
                href={userRole === 'host' ? '/dashboard/host' : '/dashboard/creator'}
                className="relative rounded-full border-2 border-white/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:border-white"
              >
                Dashboard
                {notifications.pendingOffers > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFD84A] text-[9px] font-bold text-black">
                    {notifications.pendingOffers > 9 ? '9+' : notifications.pendingOffers}
                  </span>
                )}
              </Link>
              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="rounded-full bg-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black transition-all hover:bg-white/90"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              {/* Login link */}
              <Link
                href="/login"
                className="rounded-full border-2 border-white/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:border-white"
              >
                Login
              </Link>
              
              <Link
                href="/hosts#signup"
                className="rounded-full bg-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black transition-all hover:bg-white/90"
              >
                Host Signup
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
