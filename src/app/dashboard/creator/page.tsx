import { Suspense } from "react"
import { CreatorDashboardProfile } from "@/components/creators/creator-dashboard-profile"
import { ActionRequiredBanner } from "@/components/dashboard/action-required-banner"
import { CreatorDashboardSkeleton } from "@/components/ui/loading-skeleton"

export const metadata = {
  title: "Creator Dashboard | CreatorStays",
  description: "Manage your creator profile and view offers from hosts.",
}

export default function CreatorDashboardPage() {
  return (
    <div className="dashboard">
      <ActionRequiredBanner />
      <Suspense fallback={<CreatorDashboardSkeleton />}>
        <CreatorDashboardProfile />
      </Suspense>
    </div>
  )
}
