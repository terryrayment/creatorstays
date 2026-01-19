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
  
  useEffect(() => {
    const role = localStorage.getItem('creatorstays_role')
    if (role === 'host' || role === 'creator') {
      setDemoRole(role)
    }
  }, [pathname])

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

        {/* Center - Pill nav buttons */}
        <div className="hidden items-center gap-1.5 md:flex">
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
              {/* User avatar/name if available */}
              {session?.user?.image && (
                <img 
                  src={session.user.image} 
                  alt="" 
                  className="h-8 w-8 rounded-full border-2 border-white/50"
                />
              )}
              
              {/* Dashboard Link */}
              <Link
                href={userRole === 'host' ? '/dashboard/host' : '/dashboard/creator'}
                className="rounded-full border-2 border-white/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:border-white"
              >
                Dashboard
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
