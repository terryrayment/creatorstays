import { Container } from "@/components/layout/container"
import { CreatorOffersInbox } from "@/components/creators/creator-offers-inbox"
import Link from "next/link"

export const metadata = {
  title: "Offers | Creator Dashboard | CreatorStays",
  description: "Review and respond to collaboration offers from hosts.",
}

export default function CreatorOffersPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Top bar */}
      <div className="bg-black">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full border-[2px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black">BETA</span>
            <span className="rounded-full border-[2px] border-black bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black">Offers</span>
          </div>
          <Link href="/beta/dashboard/creator" className="rounded-full border-[2px] border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-wider text-black hover:-translate-y-0.5 transition-transform">← Back to Dashboard</Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="font-heading text-[2rem] font-black tracking-tight text-white">COLLABORATION OFFERS</h1>
            <p className="mt-1 text-sm text-white/70">
              Review requests from hosts. You set the terms—approve, counter, or decline.
            </p>
          </div>

          <CreatorOffersInbox />

          {/* Help text */}
          <div className="mt-8 rounded-2xl border-[3px] border-black bg-white p-4 text-xs text-black/70">
            <p className="font-bold text-black">How it works:</p>
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
