import { Suspense } from "react"
import { CreatorDashboardProfile } from "@/components/creators/creator-dashboard-profile"

export const metadata = {
  title: "Creator Dashboard | CreatorStays",
  description: "Manage your creator profile and view offers from hosts.",
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[hsl(210,20%,99%)] flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )
}

export default function CreatorDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <CreatorDashboardProfile />
    </Suspense>
  )
}
