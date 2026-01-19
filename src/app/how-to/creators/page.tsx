import { Container } from "@/components/layout/container"
import Link from "next/link"

const steps = [
  { title: "Join the creator waitlist", desc: "Sign up to get early access. We onboard creators in batches to ensure quality matches." },
  { title: "Set your default rates and deliverables", desc: "Choose your preferred deal types: commission %, flat fee, or post-for-stay." },
  { title: "Connect socials for analytics sync", desc: "Link Instagram, TikTok, or YouTube via OAuth. Follower counts sync automatically." },
  { title: "Approve or counter host requests", desc: "Review property offers and accept, decline, or counter with your own terms." },
  { title: "Share your affiliate links", desc: "Once live, share your unique tracking link in your content. Every click is tracked." },
  { title: "Track analytics and earnings", desc: "See clicks, visitors, and pending earnings in your dashboard. Payouts are automatic." },
]

function StepRow({ step, index }: { step: typeof steps[0], index: number }) {
  return (
    <div className="guide-row group flex items-start gap-4 rounded-lg px-4 py-4 -mx-4 transition-all duration-200 hover:bg-foreground/[0.02]">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[13px] font-semibold text-accent">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[15px] font-medium text-foreground group-hover:text-accent transition-colors">
          {step.title}
        </span>
        <span className="block text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</span>
      </div>
    </div>
  )
}

export default function HowToCreatorsPage() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <h1 className="text-2xl font-semibold tracking-tight">How To: Creators</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Turn your travel content into booking commissions in 6 steps.</p>
          
          {/* Quick links pill row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/waitlist" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              Join waitlist →
            </Link>
            <Link href="/creators" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              Creator directory
            </Link>
            <Link href="/help" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              Help center
            </Link>
          </div>

          {/* Steps list */}
          <div className="mt-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4">Step by step</h2>
            <div className="space-y-0">
              {steps.map((step, i) => (
                <StepRow key={i} step={step} index={i} />
              ))}
            </div>
          </div>

          {/* Utility blocks */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {/* CTA block */}
            <div className="rounded-xl border border-foreground/5 bg-gradient-to-br from-accent/5 to-primary/5 p-5">
              <h3 className="text-[13px] font-semibold">Ready to get started?</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Join the waitlist and we&apos;ll reach out when there&apos;s a spot.</p>
              <Link href="/waitlist" className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-[12px] font-medium text-white hover:bg-accent/90 transition-colors">
                Creator waitlist
              </Link>
            </div>

            {/* Support block */}
            <div className="rounded-xl border border-foreground/5 bg-white/50 p-5">
              <h3 className="text-[13px] font-semibold">Need help?</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Check our help center or message support.</p>
              <Link href="/help" className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-foreground/10 bg-white px-4 text-[12px] font-medium hover:bg-foreground/[0.02] transition-colors">
                Help center
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
