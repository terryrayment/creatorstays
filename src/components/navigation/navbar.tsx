"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Fallback to localStorage for demo mode
  const [demoRole, setDemoRole] = useState<'host' | 'creator' | null>(null)
  const [notifications, setNotifications] = useState({ unreadMessages: 0, pendingOffers: 0, total: 0 })
  
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])
  
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
        // Silently fail - notifications are not critical
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
    document.cookie = 'cs_demo_role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    setDemoRole(null)
    setMobileMenuOpen(false)
    
    // Sign out from NextAuth if authenticated
    if (status === "authenticated") {
      await signOut({ callbackUrl: '/' })
    } else {
      window.location.href = '/'
    }
  }

  const navLinks = [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/hosts", label: "For Hosts" },
    { href: "/creators", label: "Creators" },
    { href: "/help", label: "Help" },
  ]

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 bg-black">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* Left - Logo icon */}
          <Link 
            href="/" 
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white transition-colors hover:bg-white hover:text-black"
          >
            <span className="text-[13px] font-bold">CS</span>
          </Link>

          {/* Center - Pill nav buttons (desktop only) */}
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full border-2 border-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-transparent hover:text-white ${
                  pathname === link.href 
                    ? 'bg-transparent text-white' 
                    : 'bg-white text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right - Desktop buttons + Mobile hamburger */}
          <div className="flex items-center gap-2">
            {/* Desktop buttons */}
            <div className="hidden items-center gap-2 md:flex">
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

                  {/* User avatar if available */}
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

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 text-white transition-all hover:border-white md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-14 bottom-0 w-full max-w-sm bg-black border-l-2 border-white/10 overflow-y-auto">
            <div className="p-4 space-y-2">
              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-white/40">
                  Navigate
                </p>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                      pathname === link.href 
                        ? 'bg-white text-black' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="my-4 h-px bg-white/10" />

              {/* Auth Section */}
              {isLoggedIn ? (
                <div className="space-y-1">
                  <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-white/40">
                    Your Account
                  </p>
                  
                  {/* User info */}
                  {session?.user && (
                    <div className="flex items-center gap-3 px-4 py-3">
                      {session.user.image && (
                        <img 
                          src={session.user.image} 
                          alt="" 
                          className="h-10 w-10 rounded-full border-2 border-white/30"
                        />
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{session.user.name || 'User'}</p>
                        <p className="text-xs text-white/60">{session.user.email}</p>
                      </div>
                    </div>
                  )}

                  <Link
                    href={userRole === 'host' ? '/dashboard/host' : '/dashboard/creator'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-[#28D17C] px-4 py-3 text-sm font-bold text-black"
                  >
                    <span>Dashboard</span>
                    {notifications.total > 0 && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white">
                        {notifications.total > 9 ? '9+' : notifications.total}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/dashboard/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                  >
                    <span>Messages</span>
                    {notifications.unreadMessages > 0 && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4AA3FF] text-xs text-black">
                        {notifications.unreadMessages}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={userRole === 'host' ? '/dashboard/host/settings' : '/dashboard/creator/settings'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                  >
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl border-2 border-white/20 px-4 py-3 text-left text-sm font-bold text-white/80 hover:border-white/40 hover:text-white"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-white/40">
                    Get Started
                  </p>
                  
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl border-2 border-white px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Login
                  </Link>
                  
                  <Link
                    href="/hosts#signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl bg-[#FFD84A] px-4 py-3 text-center text-sm font-bold text-black"
                  >
                    Host Signup
                  </Link>
                  
                  <Link
                    href="/waitlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-xl bg-[#D7B6FF] px-4 py-3 text-center text-sm font-bold text-black"
                  >
                    Creator Waitlist
                  </Link>
                </div>
              )}

              {/* Footer links */}
              <div className="my-4 h-px bg-white/10" />
              <div className="flex flex-wrap gap-3 px-3 py-2">
                <Link href="/terms" className="text-xs text-white/40 hover:text-white/60">Terms</Link>
                <Link href="/privacy" className="text-xs text-white/40 hover:text-white/60">Privacy</Link>
                <Link href="/help" className="text-xs text-white/40 hover:text-white/60">Help</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
