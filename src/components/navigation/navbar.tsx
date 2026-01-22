"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  
  // Fallback to localStorage for demo mode
  const [demoRole, setDemoRole] = useState<'host' | 'creator' | null>(null)
  const [notifications, setNotifications] = useState({ unreadMessages: 0, pendingOffers: 0, total: 0 })
  const [showDropdown, setShowDropdown] = useState(false)
  const [isAgency, setIsAgency] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const role = localStorage.getItem('creatorstays_role')
    if (role === 'host' || role === 'creator') {
      setDemoRole(role)
    }
    // Check agency status
    const agencyStatus = localStorage.getItem('creatorstays_agency') === 'true'
    setIsAgency(agencyStatus)
  }, [pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    localStorage.removeItem('creatorstays_agency')
    setDemoRole(null)
    setShowDropdown(false)
    
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

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/50 bg-gray-500 text-sm font-bold text-white transition-all hover:border-white"
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    session?.user?.name?.[0]?.toUpperCase() || 'U'
                  )}
                </button>
                
                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border-2 border-black bg-white py-2 shadow-xl">
                    {/* Quick Links Header */}
                    <div className="px-4 py-2 border-b border-black/10">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Quick Links</p>
                    </div>
                    
                    <Link
                      href={userRole === 'host' ? '/dashboard/host' : '/dashboard/creator'}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                    >
                      <span>Dashboard</span>
                    </Link>
                    
                    {userRole === 'host' && (
                      <>
                        <Link
                          href="/dashboard/host/properties"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                        >
                          <span>My Properties</span>
                        </Link>
                        <Link
                          href="/dashboard/host/search-creators"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                        >
                          <span>Find Creators</span>
                        </Link>
                        <Link
                          href="/dashboard/collaborations"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                        >
                          <span>Collaborations</span>
                        </Link>
                        <Link
                          href="/dashboard/analytics"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                        >
                          <span>Analytics</span>
                        </Link>
                      </>
                    )}
                    
                    {/* Account Settings Header */}
                    <div className="px-4 py-2 border-t border-b border-black/10 mt-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Account Settings</p>
                    </div>
                    
                    {userRole === 'host' && isAgency && (
                      <Link
                        href="/dashboard/host/team"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                      >
                        <span>Manage Team</span>
                        <span className="rounded-full bg-[#28D17C] px-1.5 py-0.5 text-[9px] font-bold text-black">AGENCY</span>
                      </Link>
                    )}
                    
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                    >
                      <span>Settings</span>
                    </Link>
                    
                    <div className="border-t border-black/10 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
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
