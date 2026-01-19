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
    title: "More Bookings",
    description: "Creators drive real traffic. Track every click.",
    featured: true,
  },
  {
    title: "Professional Content",
    description: "Scroll-stopping photos and videos. Yours forever.",
    featured: false,
  },
  {
    title: "Targeted Reach",
    description: "Real travelers who book, not random followers.",
    featured: false,
  }
]

function WhyHostsSection() {
  return (
    <section className="py-8">
      <Container>
        <div className="mb-5 opacity-0 reveal">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Why hosts use CreatorStays
          </h2>
        </div>
        <div className="relative">
          {/* Extreme edge blur behind cards */}
          <div className="pointer-events-none absolute -inset-20 -z-10" aria-hidden="true">
            <div className="absolute left-1/4 top-0 h-[400px] w-[500px] rounded-full bg-[hsl(199,89%,48%)]/[0.08] blur-[180px]" />
            <div className="absolute bottom-0 right-1/4 h-[350px] w-[450px] rounded-full bg-[hsl(213,94%,45%)]/[0.06] blur-[160px]" />
          </div>
          <div className="focus-group grid gap-2 md:grid-cols-12">
            {/* Featured card - takes more space */}
            <div 
              className="focus-card surface-card group relative rounded-xl p-4 opacity-0 reveal md:col-span-5 md:row-span-2 md:p-5"
              style={{ animationDelay: '100ms' }}
            >
              <div className="surface-card-glow" aria-hidden="true" />
              <div className="relative z-10 flex h-full flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">Primary benefit</span>
                <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight md:text-xl">{hostReasons[0].title}</h3>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground/80 md:text-[13px]">{hostReasons[0].description}</p>
                <div className="mt-auto pt-4">
                  <span className="text-[10px] text-muted-foreground/50">Measurable ROI on every campaign</span>
                </div>
              </div>
            </div>
            
            {/* Secondary cards - stacked */}
            {hostReasons.slice(1).map((reason, i) => (
              <div 
                key={reason.title}
                className="focus-card surface-card group relative rounded-xl p-3 opacity-0 reveal md:col-span-7 md:p-4"
                style={{ animationDelay: `${(i + 2) * 100}ms` }}
              >
                <div className="surface-card-glow" aria-hidden="true" />
                <div className="relative z-10">
                  <h3 className="text-[14px] font-semibold leading-tight tracking-tight md:text-[15px]">{reason.title}</h3>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/70 md:text-[12px]">{reason.description}</p>
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
  { number: "1", title: "Add property", description: "Paste your Airbnb link" },
  { number: "2", title: "Find creators", description: "Browse by niche & audience" },
  { number: "3", title: "Track clicks", description: "Real-time link analytics" },
  { number: "4", title: "Pay & settle", description: "Direct creator payouts" },
]

function HowItWorksSection() {
  return (
    <section className="py-6">
      <Container>
        <div className="mb-4 opacity-0 reveal">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            How it works
          </h2>
        </div>
        <div className="relative">
          {/* Extreme edge blur behind cards */}
          <div className="pointer-events-none absolute -inset-16 -z-10" aria-hidden="true">
            <div className="absolute left-0 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-[hsl(199,89%,48%)]/[0.07] blur-[160px]" />
            <div className="absolute right-0 top-1/2 h-[280px] w-[380px] -translate-y-1/2 rounded-full bg-[hsl(213,94%,45%)]/[0.05] blur-[140px]" />
          </div>
          <div className="focus-group grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2">
            {steps.map((step, i) => (
              <div 
                key={step.number}
                className="focus-card surface-card relative overflow-hidden rounded-lg px-2.5 py-3 opacity-0 reveal md:px-3 md:py-3.5"
                style={{ animationDelay: `${(i + 1) * 80}ms` }}
              >
                <span className="absolute -right-1.5 -top-3 font-heading text-[60px] font-normal leading-none text-foreground/[0.04] md:text-[72px]">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <h3 className="text-[12px] font-semibold leading-tight tracking-tight md:text-[13px]">{step.title}</h3>
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground/60 md:text-[11px]">{step.description}</p>
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
