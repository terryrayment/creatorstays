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
        <Link href="/trust-safety" className="block text-primary hover:underline">Trust & Safety</Link>
        <Link href="/pricing" className="block text-primary hover:underline">Pricing</Link>
        <Link href="/help" className="block text-primary hover:underline">Help center</Link>
        <a href="mailto:support@creatorstays.com" className="block text-primary hover:underline">Contact us</a>
      </div>
    </Panel>
  )
}

export default function PrivacyPage() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Privacy</h1>
              <p className="mt-2 text-[15px] text-muted-foreground">What data we collect and how we use it.</p>
            </div>

            {/* What we track */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">What we track</h2>
              <div className="text-[14px] text-muted-foreground space-y-3">
                <div>
                  <p className="font-medium text-foreground">Link clicks</p>
                  <p className="text-[13px] mt-0.5">When someone clicks an affiliate link, we record the timestamp, referrer URL, and a hashed visitor identifier.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Unique visitors</p>
                  <p className="text-[13px] mt-0.5">We use a privacy-safe hash of IP + user agent to identify unique visitors without storing raw IPs.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Account data</p>
                  <p className="text-[13px] mt-0.5">Email, name, and profile information you provide during signup. Social account usernames if you connect platforms.</p>
                </div>
              </div>
            </Panel>

            {/* What we don't track */}
            <Panel className="bg-emerald-50/50 border-emerald-200/50">
              <h2 className="text-[15px] font-semibold mb-3">What we don&apos;t track</h2>
              <div className="text-[14px] text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Airbnb booking data.</strong> We have no access to Airbnb&apos;s systems and cannot see if a click led to a booking.</p>
                <p><strong className="text-foreground">Raw IP addresses.</strong> We hash IPs immediately and never store them in readable form.</p>
                <p><strong className="text-foreground">Payment card details.</strong> Stripe handles all payment processing. We never see your full card number.</p>
              </div>
            </Panel>

            {/* Cookies */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">Cookies</h2>
              <div className="text-[14px] text-muted-foreground space-y-3">
                <div>
                  <p className="font-medium text-foreground">cs_vid (visitor cookie)</p>
                  <p className="text-[13px] mt-0.5">A random identifier stored on link visitors to track unique vs. repeat clicks. Expires in 30 days.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">cs_ref (attribution cookie)</p>
                  <p className="text-[13px] mt-0.5">Records which affiliate link referred a visitor. Used for analytics attribution. Expires in 30 days.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Session cookies</p>
                  <p className="text-[13px] mt-0.5">Standard authentication cookies for logged-in users. Expire when you close your browser or log out.</p>
                </div>
              </div>
            </Panel>

            {/* Data retention */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">Data retention</h2>
              <div className="text-[14px] text-muted-foreground space-y-2">
                <p>Click and visitor data is retained for 2 years for analytics purposes.</p>
                <p>Account data is retained while your account is active. Request deletion by emailing <a href="mailto:support@creatorstays.com" className="text-primary hover:underline">support@creatorstays.com</a>.</p>
              </div>
            </Panel>

            {/* Third parties */}
            <Panel>
              <h2 className="text-[15px] font-semibold mb-3">Third-party services</h2>
              <div className="text-[14px] text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Stripe</strong> — Payment processing</p>
                <p><strong className="text-foreground">Vercel</strong> — Hosting and analytics</p>
                <p><strong className="text-foreground">Meta/TikTok/Google</strong> — OAuth for social connections (only with your permission)</p>
              </div>
            </Panel>

            {/* Last updated */}
            <p className="text-[12px] text-muted-foreground">Last updated: January 2025</p>
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
