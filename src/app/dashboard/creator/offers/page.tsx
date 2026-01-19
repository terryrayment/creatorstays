import { Container } from "@/components/layout/container"
import { CreatorOffersInbox } from "@/components/creators/creator-offers-inbox"
import Link from "next/link"

export const metadata = {
  title: "Offers | Creator Dashboard | CreatorStays",
  description: "Review and respond to collaboration offers from hosts.",
}

export default function CreatorOffersPage() {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-black/5 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">BETA</span>
            <span className="text-xs text-black/60">Offers</span>
          </div>
          <Link href="/dashboard/creator" className="text-xs text-black/60 hover:text-black">← Back to Dashboard</Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-normal tracking-tight">Collaboration Offers</h1>
            <p className="mt-1 text-sm text-black/60">
              Review requests from hosts. You set the terms—approve, counter, or decline.
            </p>
          </div>

          <CreatorOffersInbox />

          {/* Help text */}
          <div className="mt-8 rounded-lg border border-black/5 bg-black/[0.02] p-4 text-xs text-black/60">
            <p className="font-medium text-black">How it works:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Hosts send you offers with proposed terms (affiliate %, flat fee, or post-for-stay)</li>
              <li>You can approve as-is, counter with your terms, or decline</li>
              <li>Once approved, we generate a unique affiliate link for tracking</li>
              <li>You create content, share your link, and track clicks</li>
              <li>Payments are settled off-platform between you and the host</li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  )
}
