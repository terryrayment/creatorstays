import { Container } from "@/components/layout/container"
import { HostApprovePay } from "@/components/hosts/host-approve-pay"
import Link from "next/link"

export const metadata = {
  title: "Approve & Pay | Host Dashboard | CreatorStays",
  description: "Review fees and pay your creator for their collaboration.",
}

export default function HostPayPage() {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="border-b border-foreground/5 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex h-11 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">BETA</span>
            <span className="text-xs text-muted-foreground">Approve & Pay</span>
          </div>
          <Link href="/dashboard/host" className="text-xs text-muted-foreground hover:text-foreground">← Back to Dashboard</Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-lg">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-normal tracking-tight">Approve & Pay Creator</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the fee breakdown and complete payment for this collaboration.
            </p>
          </div>

          <HostApprovePay />

          {/* Info footer */}
          <div className="mt-8 rounded-lg border border-foreground/5 bg-foreground/[0.02] p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">How payments work:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>You pay the agreed amount plus a 15% platform fee</li>
              <li>The creator receives 85% of the agreed amount (after their 15% fee)</li>
              <li>Payments are processed securely via Stripe</li>
              <li>Creators receive payouts after completing Stripe onboarding</li>
              <li>Stripe issues 1099-NEC forms to US creators automatically</li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  )
}
