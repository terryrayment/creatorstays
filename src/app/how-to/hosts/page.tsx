import { Container } from "@/components/layout/container"
import Link from "next/link"

const steps = [
  { title: "Create your host profile", desc: "Sign up with your email and basic info. Your profile helps creators understand who you are." },
  { title: "Add your Airbnb property", desc: "Paste your Airbnb URL to auto-import listing details. Review and confirm the info." },
  { title: "Find creators and send requests", desc: "Browse the creator directory filtered by niche and location. Send collaboration offers." },
  { title: "Campaign approved → affiliate link created", desc: "Once a creator accepts, we generate a unique tracking link for their content." },
  { title: "Track link analytics", desc: "See clicks, unique visitors, and engagement in real-time in your dashboard." },
  { title: "Pay creators through the platform", desc: "When campaigns complete, pay creators securely. Stripe handles the transaction.", soon: true },
]

function StepRow({ step, index }: { step: typeof steps[0], index: number }) {
  return (
    <div className="guide-row group relative flex items-start gap-4 rounded-lg px-4 py-4 -mx-4 transition-all duration-200">
      {/* Blur glow on hover */}
      <div className="absolute inset-0 rounded-lg bg-primary/[0.03] opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary group-hover:bg-primary/20 transition-colors">
        {index + 1}
      </div>
      <div className="relative flex-1 min-w-0">
        <span className="flex items-center gap-2 text-[15px] font-medium text-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200">
          {step.title}
          {step.soon && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Soon</span>}
        </span>
        <span className="block text-[13px] text-muted-foreground mt-0.5 leading-relaxed group-hover:text-muted-foreground/80 transition-colors">{step.desc}</span>
      </div>
    </div>
  )
}

export default function HowToHostsPage() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <h1 className="text-2xl font-semibold tracking-tight">How To: Hosts</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Get your property in front of travel creators in 6 steps.</p>
          
          {/* Quick links pill row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/hosts" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              Host signup →
            </Link>
            <Link href="/creators" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              Browse creators
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
            <div className="rounded-xl border border-foreground/5 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
              <h3 className="text-[13px] font-semibold">Ready to get started?</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Create your host profile and add your first property.</p>
              <Link href="/hosts" className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-[12px] font-medium text-white hover:bg-primary/90 transition-colors">
                Host signup
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
