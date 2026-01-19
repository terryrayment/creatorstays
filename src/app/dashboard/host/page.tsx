import { HostDashboard } from "@/components/hosts/host-dashboard"

export const metadata = {
  title: "Host Dashboard | CreatorStays",
  description: "Set up your property and connect with creators.",
}

export default function HostDashboardPage() {
  return (
    <div className="dashboard">
      <HostDashboard />
    </div>
  )
}
