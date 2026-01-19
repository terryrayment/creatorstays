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
        <Link href="/privacy" className="block text-primary hover:underline">Privacy policy</Link>
        <Link href="/pricing" className="block text-primary hover:underline">Pricing</Link>
        <Link href="/help" className="block text-primary hover:underline">Help center</Link>
        <a href="mailto:support@creatorstays.com" className="block text-primary hover:underline">Report an issue</a>
      </div>
    </Panel>
  )
}

export default function TrustSafetyPage() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Trust & Safety</h1>
              <p className="mt-2 text-[15px] text-muted-foreground">How we keep the platform fair and secure for everyone.</p>
            </div>

            {/* Click fraud */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">Click fraud prevention</h2>
              <div className="text-[14px] text-muted-foreground space-y-2">
                <p>We track unique visitors using privacy-safe hashed identifiers. Repeated clicks from the same visitor are counted but flagged separately.</p>
                <p>Suspicious patterns (rapid clicks, bot signatures, geographic anomalies) are automatically filtered from analytics reports.</p>
                <p>Hosts see both total clicks and unique visitors to assess real traffic quality.</p>
              </div>
            </Panel>

            {/* Reporting */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">Reporting issues</h2>
              <div className="text-[14px] text-muted-foreground space-y-2">
                <p>If you suspect fraud, misleading behavior, or policy violations, email <a href="mailto:support@creatorstays.com" className="text-primary hover:underline">support@creatorstays.com</a> with details.</p>
                <p>We investigate all reports within 48 hours. Confirmed violations may result in account suspension or removal.</p>
              </div>
            </Panel>

            {/* Creator disclosure */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">Creator disclosure expectations</h2>
              <div className="text-[14px] text-muted-foreground space-y-2">
                <p>Creators must comply with FTC guidelines and platform-specific rules for sponsored content disclosure.</p>
                <p>This typically means using #ad, #sponsored, or the platform&apos;s paid partnership label when sharing affiliate links.</p>
                <p>CreatorStays does not monitor individual posts, but hosts may flag non-compliant content.</p>
              </div>
            </Panel>

            {/* Booking detection */}
            <Panel className="bg-amber-50/50 border-amber-200/50">
              <h2 className="text-[15px] font-semibold mb-3">What we cannot track</h2>
              <div className="text-[14px] text-muted-foreground space-y-2">
                <p><strong className="text-foreground">We do not track Airbnb bookings.</strong> Airbnb does not share booking data with third parties.</p>
                <p>Our tracking measures clicks and visitors to your Airbnb listing. Actual booking conversions cannot be verified through our platform.</p>
                <p>Payment terms should be based on content delivery and traffic, not claimed booking performance.</p>
              </div>
            </Panel>

            {/* Disputes */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">Handling disputes</h2>
              <div className="text-[14px] text-muted-foreground space-y-2">
                <p>Hosts only release payment after reviewing and approving delivered content.</p>
                <p>If there&apos;s a disagreement about deliverables, both parties can submit evidence to our support team for mediation.</p>
                <p>We aim to resolve disputes fairly, but cannot guarantee outcomes in all cases.</p>
              </div>
            </Panel>
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
