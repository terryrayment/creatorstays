"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HostCollaborationsPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard/collaborations")
  }, [router])

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <p className="text-sm text-black/60">Redirecting...</p>
    </div>
  )
}
