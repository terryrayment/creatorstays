import { Container } from "@/components/layout/container"
import Link from "next/link"

function Panel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-2xl border-[3px] border-black bg-white p-5 ${className}`}>{children}</div>
}

function QuickLinks() {
  return (
    <Panel>
      <h3 className="text-[11px] font-black uppercase tracking-wider text-black mb-3">Quick links</h3>
      <div className="space-y-2 text-[13px]">
        <Link href="/hosts" className="block font-medium text-black hover:underline">Host signup</Link>
        <Link href="/waitlist" className="block font-medium text-black hover:underline">Creator waitlist</Link>
        <Link href="/help" className="block font-medium text-black hover:underline">Help center</Link>
        <Link href="/trust-safety" className="block font-medium text-black hover:underline">Trust & Safety</Link>
      </div>
    </Panel>
  )
}

export default function PricingPage() {
  return (
    <section className="min-h-screen bg-[#F5F5F5] py-12 md:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-[2.5rem] font-black tracking-tight text-black">PRICING</h1>
              <p className="mt-2 text-[15px] font-medium text-black">Simple, transparent pricing for hosts and creators.</p>
            </div>

            {/* Host fees */}
            <Panel>
              <h2 className="text-[15px] font-bold text-black mb-3">Host fees</h2>
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between items-start pb-3 border-b-2 border-black">
                  <div>
                    <p className="font-bold text-black">One-time membership</p>
                    <p className="text-[13px] text-black/70 mt-0.5">Access to creator directory and campaign tools</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">$199</p>
                    <p className="text-[11px] text-[#28D17C] font-bold">First 100 hosts: FREE</p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-black">Platform fee</p>
                    <p className="text-[13px] text-black/70 mt-0.5">Applied to creator payments you approve</p>
                  </div>
                  <p className="font-bold text-black">15%</p>
                </div>
              </div>
            </Panel>

            {/* Creator fees */}
            <Panel>
              <h2 className="text-[15px] font-bold text-black mb-3">Creator fees</h2>
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between items-start pb-3 border-b-2 border-black">
                  <div>
                    <p className="font-bold text-black">Joining</p>
                    <p className="text-[13px] text-black/70 mt-0.5">Sign up and create your profile</p>
                  </div>
                  <p className="font-bold text-[#28D17C]">Free</p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-black">Platform fee</p>
                    <p className="text-[13px] text-black/70 mt-0.5">Deducted from earnings when you get paid</p>
                  </div>
                  <p className="font-bold text-black">15%</p>
                </div>
              </div>
            </Panel>

            {/* Example */}
            <Panel className="bg-[#FFD84A]">
              <h2 className="text-[15px] font-bold text-black mb-3">Example</h2>
              <div className="text-[14px] space-y-2">
                <p className="text-black">A host pays a creator <span className="font-bold">$500</span> for a post with tracked link.</p>
                <ul className="space-y-1 text-[13px] text-black/80 ml-4">
                  <li>• Host pays: $500 + $75 (15% fee) = <span className="font-bold text-black">$575</span></li>
                  <li>• Creator receives: $500 - $75 (15% fee) = <span className="font-bold text-black">$425</span></li>
                </ul>
                <p className="text-[12px] text-black/70 mt-3">Creators are paid per post. Performance bonuses are based on tracked link traffic, not booking data.</p>
              </div>
            </Panel>

            {/* Notes */}
            <div className="text-[13px] text-black/70 space-y-2">
              <p>All payments processed securely via Stripe. Pay per deliverable—no booking tracking required.</p>
              <p>No hidden fees. No monthly subscriptions. No contracts.</p>
              <p className="text-[12px] pt-2 border-t-2 border-black">CreatorStays links track traffic, not bookings. Hosts decide bonuses based on link performance.</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <QuickLinks />
          </div>
        </div>
      </Container>
    </section>
  )
}
