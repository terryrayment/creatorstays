import { Container } from "@/components/layout/container"
import { HostApprovePay } from "@/components/hosts/host-approve-pay"
import Link from "next/link"

export const metadata = {
  title: "Approve & Pay | Host Dashboard | CreatorStays",
  description: "Review fees and pay your creator for their collaboration.",
}

export default function HostPayPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="border-b-2 border-black bg-[#FFD84A]">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full border-2 border-black bg-white px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">BETA</span>
            <span className="text-xs font-bold text-black">Approve & Pay</span>
          </div>
          <Link href="/beta/dashboard/host" className="rounded-full border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5">← Back to Dashboard</Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-xl">
          <div className="mb-6">
            <h1 className="font-heading text-[2rem] font-black tracking-tight text-black">APPROVE & PAY</h1>
            <p className="mt-1 text-sm text-black/70">
              Review the fee breakdown and complete payment for this collaboration.
            </p>
          </div>

          <HostApprovePay />

          {/* Info footer */}
          <div className="mt-8 rounded-2xl border-[3px] border-black bg-white p-5 text-xs text-black/70">
            <p className="font-bold text-black">How payments work:</p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black bg-[#28D17C] text-[8px] font-bold text-black">1</span>
                <span>You pay the agreed amount plus a 15% platform fee</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black bg-[#28D17C] text-[8px] font-bold text-black">2</span>
                <span>The creator receives 85% of the agreed amount (after their 15% fee)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black bg-[#28D17C] text-[8px] font-bold text-black">3</span>
                <span>Payments are processed securely via Stripe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black bg-[#28D17C] text-[8px] font-bold text-black">4</span>
                <span>Creators receive payouts within 2-3 business days</span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  )
}
