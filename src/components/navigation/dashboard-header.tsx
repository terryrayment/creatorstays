"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

interface DashboardHeaderProps {
  variant?: "host" | "creator" | "admin"
}

export function DashboardHeader({ variant = "host" }: DashboardHeaderProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Determine if beta route
  const isBeta = pathname?.includes('/beta/')
  const basePath = isBeta ? '/beta/dashboard' : '/dashboard'

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

  const handleLogout = async () => {
    localStorage.removeItem('creatorstays_role')
    localStorage.removeItem('creatorstays_agency')
    setShowDropdown(false)
    if (status === "authenticated") {
      await signOut({ callbackUrl: '/' })
    } else {
      window.location.href = '/'
    }
  }

  // Get nav items based on variant
  const getNavItems = () => {
    if (variant === "host") {
      return [
        { href: `${basePath}/host`, label: "Overview" },
        { href: `${basePath}/host/properties`, label: "Properties" },
        { href: `${basePath}/host/search-creators`, label: "Find Creators" },
        { href: `${basePath}/collaborations`, label: "Collaborations" },
        { href: `${basePath}/host/settings`, label: "Settings" },
      ]
    }
    if (variant === "creator") {
      return [
        { href: `${basePath}/creator`, label: "Overview" },
        { href: `${basePath}/creator/opportunities`, label: "Opportunities" },
        { href: `${basePath}/collaborations`, label: "Collaborations" },
        { href: `${basePath}/creator/settings`, label: "Settings" },
      ]
    }
    return []
  }

  const navItems = getNavItems()
  const variantLabel = variant === "host" ? "Host" : variant === "creator" ? "Creator" : "Admin"
  const variantColor = variant === "host" ? "bg-[#FFD84A]" : variant === "creator" ? "bg-[#4AA3FF]" : "bg-[#28D17C]"

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-black">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-white transition-colors hover:bg-white hover:text-black"
          >
            <span className="text-[13px] font-bold">CS</span>
          </Link>
          
          {/* Dashboard Badge */}
          <span className={`rounded-full border-2 border-black ${variantColor} px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black`}>
            {variantLabel} Dashboard
          </span>
          
          {isBeta && (
            <span className="rounded border border-white/30 px-1.5 py-0.5 text-[9px] font-bold text-white/60">
              BETA
            </span>
          )}
        </div>

        {/* Center - Nav Pills */}
        {navItems.length > 0 && (
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    isActive 
                      ? 'border-white bg-white text-black' 
                      : 'border-white/30 text-white/70 hover:border-white hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Right - Avatar + Actions */}
        <div className="flex items-center gap-3">
          {/* Back to site */}
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1 rounded-full border-2 border-white/30 px-3 py-1 text-[10px] font-bold text-white/70 transition-all hover:border-white hover:text-white"
          >
            ← Site
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
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border-2 border-black bg-white py-2 shadow-xl">
                <div className="px-4 py-2 border-b border-black/10">
                  <p className="text-sm font-bold text-black truncate">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-black/50 truncate">
                    {session?.user?.email}
                  </p>
                </div>
                
                <Link
                  href={`${basePath}/${variant}/settings`}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-black/5"
                >
                  Settings
                </Link>
                
                <div className="border-t border-black/10 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-black/5"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
