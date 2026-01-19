import { Container } from "@/components/layout/container"
import Link from "next/link"

function Panel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-xl border border-foreground/5 bg-white/50 p-5 ${className}`}>{children}</div>
}

function QuickLinks() {
  return (
    <Panel>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">Quick links</h3>
      <div className="space-y-2 text-[13px]">
        <Link href="/hosts" className="block text-primary hover:underline">Host signup</Link>
        <Link href="/waitlist" className="block text-primary hover:underline">Creator waitlist</Link>
        <Link href="/help" className="block text-primary hover:underline">Help center</Link>
        <Link href="/trust-safety" className="block text-primary hover:underline">Trust & Safety</Link>
      </div>
    </Panel>
  )
}

export default function PricingPage() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Pricing</h1>
              <p className="mt-2 text-[15px] text-muted-foreground">Simple, transparent pricing for hosts and creators.</p>
            </div>

            {/* Host fees */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">Host fees</h2>
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between items-start pb-3 border-b border-foreground/5">
                  <div>
                    <p className="font-medium">One-time membership</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">Access to creator directory and campaign tools</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$199</p>
                    <p className="text-[11px] text-emerald-600 font-medium">First 100 hosts: FREE</p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Platform fee</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">Applied to creator payments you approve</p>
                  </div>
                  <p className="font-semibold">15%</p>
                </div>
              </div>
            </Panel>

            {/* Creator fees */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">Creator fees</h2>
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between items-start pb-3 border-b border-foreground/5">
                  <div>
                    <p className="font-medium">Joining</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">Sign up and create your profile</p>
                  </div>
                  <p className="font-semibold text-emerald-600">Free</p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Platform fee</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">Deducted from earnings when you get paid</p>
                  </div>
                  <p className="font-semibold">15%</p>
                </div>
              </div>
            </Panel>

            {/* Example */}
            <Panel className="bg-foreground/[0.02]">
              <h2 className="text-[15px] font-semibold mb-3">Example</h2>
              <div className="text-[14px] space-y-2">
                <p>A host agrees to pay a creator <span className="font-medium">$500</span> for a campaign.</p>
                <ul className="space-y-1 text-[13px] text-muted-foreground ml-4">
                  <li>• Host pays: $500 + $75 (15% fee) = <span className="font-medium text-foreground">$575</span></li>
                  <li>• Creator receives: $500 - $75 (15% fee) = <span className="font-medium text-foreground">$425</span></li>
                </ul>
              </div>
            </Panel>

            {/* Notes */}
            <div className="text-[13px] text-muted-foreground space-y-2">
              <p>All payments processed securely via Stripe. You only pay when you approve completed work.</p>
              <p>No hidden fees. No monthly subscriptions. No contracts.</p>
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
