"use client"

import { usePathname } from "next/navigation"

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Dashboard pages don't have the navbar, so they don't need the top padding
  const isDashboardPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/beta/dashboard')
  
  return (
    <main className={`flex-1 bg-black ${isDashboardPage ? '' : 'pt-14'}`}>
      {children}
    </main>
  )
}
