import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base gradient wash - top right, warm sky */}
      <div 
        className="absolute -top-1/4 -right-1/4 h-[120%] w-[80%]"
        style={{
          background: "radial-gradient(ellipse at 70% 20%, hsl(199 89% 48% / 0.06) 0%, transparent 60%)",
        }}
      />
      {/* Counter gradient - bottom left, deep blue */}
      <div 
        className="absolute -bottom-1/4 -left-1/4 h-[100%] w-[70%]"
        style={{
          background: "radial-gradient(ellipse at 30% 80%, hsl(213 94% 45% / 0.04) 0%, transparent 50%)",
        }}
      />
      {/* Soft atmospheric layer */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(165deg, hsl(210 20% 99%) 0%, hsl(210 30% 97%) 50%, hsl(210 20% 99%) 100%)",
        }}
      />
      {/* Single large soft cloud */}
      <div className="absolute top-1/4 right-1/4 h-[500px] w-[700px] rounded-full bg-accent/[0.03] blur-[150px]" />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <Container>
        <div className="flex flex-col items-center text-center opacity-0 reveal">
          <span className="text-label mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
            Influencer marketing for vacation rentals
          </span>
          <h1 className="font-heading text-[2.5rem] font-normal leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            <span className="whitespace-nowrap">Get more bookings with</span>{" "}
            <span className="whitespace-nowrap bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">creator marketing</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Hire vetted creators to showcase your property. They post, you get clicks and stunning content.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="px-8">
              <Link href="/hosts">Host Signup</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <Link href="/waitlist">Creator Waitlist</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}

function EdgeBlur({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute -top-1/4 right-0 h-[500px] w-[600px] rounded-full bg-accent/[0.04] blur-[120px]" />
      <div className="absolute -bottom-1/4 left-0 h-[400px] w-[500px] rounded-full bg-primary/[0.03] blur-[100px]" />
    </div>
  )
}

const hostReasons = [
  {
    title: "More Traffic",
    description: "Creators drive real clicks to your listing. Track every visit.",
  },
  {
    title: "Professional Content",
    description: "Scroll-stopping photos and videos. Yours to keep forever.",
  },
  {
    title: "Targeted Reach",
    description: "Real travelers who actually book, not random followers.",
  }
]

function WhyHostsSection() {
  return (
    <section className="py-10">
      <Container>
        <div className="mb-6 opacity-0 reveal">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Why hosts use CreatorStays
          </h2>
        </div>
        <div className="relative">
          {/* Edge blur behind pills */}
          <div className="pointer-events-none absolute -inset-20 -z-10" aria-hidden="true">
            <div className="absolute left-1/4 top-0 h-[400px] w-[500px] rounded-full bg-[hsl(199,89%,48%)]/[0.08] blur-[180px]" />
            <div className="absolute bottom-0 right-1/4 h-[350px] w-[450px] rounded-full bg-[hsl(213,94%,45%)]/[0.06] blur-[160px]" />
          </div>
          <div className="focus-group flex flex-col gap-3">
            {hostReasons.map((reason, i) => (
              <div 
                key={reason.title}
                className="marketing-pill focus-card opacity-0 reveal"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="marketing-pill-glow" aria-hidden="true" />
                <div className="relative z-10 flex flex-1 items-center justify-between gap-4">
                  <h3 className="text-[15px] font-semibold tracking-tight md:text-base">{reason.title}</h3>
                  <p className="text-[12px] text-muted-foreground/70 md:text-[13px]">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

const steps = [
  { number: "1", title: "Add property", description: "Paste your Airbnb link to get started" },
  { number: "2", title: "Find creators", description: "Browse by niche, audience size & location" },
  { number: "3", title: "Track traffic", description: "Real-time click analytics on every link" },
  { number: "4", title: "Pay & settle", description: "Direct payouts to creators through Stripe" },
]

function HowItWorksSection() {
  return (
    <section className="py-8">
      <Container>
        <div className="mb-6 opacity-0 reveal">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            How it works
          </h2>
        </div>
        <div className="relative">
          {/* Edge blur behind pills */}
          <div className="pointer-events-none absolute -inset-16 -z-10" aria-hidden="true">
            <div className="absolute left-0 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-[hsl(199,89%,48%)]/[0.07] blur-[160px]" />
            <div className="absolute right-0 top-1/2 h-[280px] w-[380px] -translate-y-1/2 rounded-full bg-[hsl(213,94%,45%)]/[0.05] blur-[140px]" />
          </div>
          <div className="focus-group flex flex-col gap-2">
            {steps.map((step, i) => (
              <div 
                key={step.number}
                className="marketing-pill focus-card opacity-0 reveal"
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                <div className="marketing-pill-glow" aria-hidden="true" />
                <div className="relative z-10 flex flex-1 items-center gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {step.number}
                  </span>
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <h3 className="text-[14px] font-semibold tracking-tight md:text-[15px]">{step.title}</h3>
                    <p className="text-[11px] text-muted-foreground/60 md:text-[12px]">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

const creatorTypes = [
  { category: "Travel", description: "Destination & adventure content" },
  { category: "Lifestyle", description: "Home & living inspiration" },
  { category: "Photography", description: "Stunning visual storytelling" },
  { category: "Vlog", description: "Day-in-the-life experiences" },
  { category: "Food & Hospitality", description: "Culinary & hosting content" },
  { category: "Adventure", description: "Outdoor & exploration content" },
]

function BetaSection() {
  return (
    <section className="py-24">
      <Container>
        <div className="text-center opacity-0 reveal">
          <span className="inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            Now in Beta
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            CreatorStays is launching soon
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            We&apos;re building the marketplace to connect vacation rental hosts with content creators. Get early access.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-border/50 bg-card p-8 opacity-0 reveal" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xl font-semibold">For Hosts</h3>
            <p className="mt-2 text-muted-foreground">
              Sign up to list your property and connect with creators who can drive bookings through authentic content.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/hosts">Host Signup</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-8 opacity-0 reveal" style={{ animationDelay: '200ms' }}>
            <h3 className="text-xl font-semibold">For Creators</h3>
            <p className="mt-2 text-muted-foreground">
              Join the waitlist to get early access. Be first to browse properties and receive offers from hosts.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/waitlist">Join Waitlist</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground">Creator categories we&apos;re recruiting</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creatorTypes.map((type, i) => (
              <div 
                key={type.category}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-4 opacity-0 reveal"
                style={{ animationDelay: `${(i % 3 + 1) * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                  <span className="text-lg font-semibold text-primary">{type.category[0]}</span>
                </div>
                <div>
                  <p className="font-medium">{type.category}</p>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

function FinalCTASection() {
  return (
    <section className="relative overflow-hidden py-24">
      <EdgeBlur />
      <Container>
        <div className="relative rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-12 text-center md:p-16 opacity-0 reveal">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Get early access
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Be among the first to use CreatorStays when we launch.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="px-8">
              <Link href="/hosts">Host Signup</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <Link href="/waitlist">Creator Waitlist</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyHostsSection />
      <HowItWorksSection />
      <BetaSection />
      <FinalCTASection />
    </>
  )
}
