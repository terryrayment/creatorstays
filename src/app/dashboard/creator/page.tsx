import { Suspense } from "react"
import { CreatorDashboardProfile } from "@/components/creators/creator-dashboard-profile"
import { ActionRequiredBanner } from "@/components/dashboard/action-required-banner"

export const metadata = {
  title: "Creator Dashboard | CreatorStays",
  description: "Manage your creator profile and view offers from hosts.",
}

function DashboardLoading() {
  return (
    <div className="dashboard min-h-screen bg-[hsl(210,20%,98%)] flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        <p className="mt-2 text-sm text-black/60">Loading dashboard...</p>
      </div>
    </div>
  )
}

export default function CreatorDashboardPage() {
  return (
    <div className="dashboard">
      <ActionRequiredBanner />
      <Suspense fallback={<DashboardLoading />}>
        <CreatorDashboardProfile />
      </Suspense>
    </div>
  )
}
