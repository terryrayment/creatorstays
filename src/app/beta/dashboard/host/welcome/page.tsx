"use client"

import { useRouter } from "next/navigation"
import { Container } from "@/components/layout/container"
import { HostOnboardingGuide } from "@/components/hosts/host-onboarding-guide"

export default function HostWelcomePage() {
  const router = useRouter()

  const handleComplete = () => {
    // Mark as complete in localStorage so we don't show again
    if (typeof window !== 'undefined') {
      localStorage.setItem('hostOnboardingComplete', 'true')
    }
    router.push('/beta/dashboard/host')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b-2 border-black bg-[#FFD84A]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white font-black text-sm">
              CS
            </div>
            <span className="font-bold text-black">CreatorStays</span>
          </div>
        </div>
      </div>

      <Container className="py-8 sm:py-12">
        <HostOnboardingGuide onComplete={handleComplete} />
      </Container>
    </div>
  )
}
