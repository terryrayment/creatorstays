import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Hero image - full opacity at top, fades to bottom */}
      <div 
        className="absolute inset-0"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)',
        }}
      >
        <Image
          src="/images/hero-cabin.jpg"
          alt=""
          fill
          priority
          className="object-cover blur-[2px]"
          sizes="100vw"
        />
      </div>
      
      {/* Subtle bottom blend */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 60%, hsl(210 20% 98%) 100%)',
        }}
      />
      
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
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <HeroBackground />
      <Container>
        <div className="flex flex-col items-center text-center opacity-0 reveal">
          <span className="text-label mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary backdrop-blur-sm">
            Influencer marketing for vacation rentals
          </span>
          <h1 className="font-heading text-[2.5rem] font-normal leading-[1.05] tracking-tight drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            <span className="whitespace-nowrap">Get more bookings with</span>{" "}
            <span className="whitespace-nowrap bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">creator marketing</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground drop-shadow-sm md:text-lg">
            Hire vetted creators to showcase your property. They post, you get clicks and stunning content.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="px-8 shadow-lg shadow-primary/20">
              <Link href="/hosts">Host Signup</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/80 px-8 backdrop-blur-sm">
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
    <section className="py-16">
      <Container>
        <div className="text-center opacity-0 reveal">
          <span className="inline-block rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            Now in Beta
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            CreatorStays is launching soon
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            The marketplace connecting vacation rental hosts with content creators.
          </p>
        </div>

        {/* For Hosts / For Creators - Clean two-column layout */}
        <div className="relative mt-12">
          {/* Background blur */}
          <div className="pointer-events-none absolute -inset-10 -z-10" aria-hidden="true">
            <div className="absolute left-1/4 top-1/2 h-[200px] w-[300px] -translate-y-1/2 rounded-full bg-[hsl(213,94%,45%)]/[0.05] blur-[100px]" />
            <div className="absolute right-1/4 top-1/2 h-[180px] w-[280px] -translate-y-1/2 rounded-full bg-[hsl(199,89%,48%)]/[0.04] blur-[90px]" />
          </div>
          
          <div className="beta-card-group grid gap-px overflow-hidden rounded-2xl border border-foreground/[0.04] bg-foreground/[0.02] md:grid-cols-2">
            {/* Hosts - Primary */}
            <div className="beta-card group relative p-8 opacity-0 reveal" style={{ animationDelay: '100ms' }}>
              <div className="beta-card-glow" aria-hidden="true" />
              <div className="relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/70">For property owners</span>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">Hosts</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground/70">
                  List your property and connect with creators who drive real traffic through authentic content.
                </p>
                <div className="mt-6">
                  <Button size="sm" className="text-xs" asChild>
                    <Link href="/hosts">Host Signup</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Creators - Secondary */}
            <div className="beta-card group relative border-t border-foreground/[0.04] p-8 opacity-0 reveal md:border-l md:border-t-0" style={{ animationDelay: '200ms' }}>
              <div className="beta-card-glow" aria-hidden="true" />
              <div className="relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-accent/70">For content creators</span>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">Creators</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground/70">
                  Get early access to browse properties and receive collaboration offers from hosts.
                </p>
                <div className="mt-6">
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <Link href="/waitlist">Join Creator Waitlist</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Creator categories - Clean grid */}
        <div className="mt-14">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            Creator categories we&apos;re recruiting
          </p>
          <div className="category-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {creatorTypes.map((type, i) => (
              <div 
                key={type.category}
                className="category-item group relative rounded-xl p-4 opacity-0 reveal"
                style={{ animationDelay: `${(i + 1) * 50}ms` }}
              >
                <div className="category-item-glow" aria-hidden="true" />
                <div className="relative z-10 flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 text-[9px] font-bold text-primary/70">
                    {type.category[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-tight text-foreground/90">{type.category}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/50">{type.description}</p>
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
