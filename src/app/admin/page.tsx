"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Check for admin cookie
    const hasAdminAuth = document.cookie.includes("admin_auth=true")
    
    if (hasAdminAuth) {
      router.replace("/admin/dashboard")
    } else {
      router.replace("/admin/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-white">Redirecting...</div>
    </div>
  )
}
