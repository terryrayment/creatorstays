import { Container } from "@/components/layout/container"
import { AnalyticsDashboard } from "@/components/shared/analytics-dashboard"
import Link from "next/link"

export const metadata = {
  title: "Analytics | CreatorStays",
  description: "Track clicks and performance across your collaborations.",
}

export default function AnalyticsPage() {
  // In real app, determine viewAs from auth context
  const viewAs = 'host' as const

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-foreground/5 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">BETA</span>
            <span className="text-xs text-muted-foreground">Analytics</span>
          </div>
          <Link href="/dashboard/host" className="text-xs text-muted-foreground hover:text-foreground">← Back to Dashboard</Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-normal tracking-tight">Link Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track clicks and visitor activity across all your collaborations.</p>
        </div>

        <AnalyticsDashboard viewAs={viewAs} />
      </Container>
    </div>
  )
}
