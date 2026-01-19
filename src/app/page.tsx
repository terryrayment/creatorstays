import { Container } from "@/components/layout/container"
import Link from "next/link"

function HeroGraphics() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Strong color field - left side */}
      <div className="absolute left-0 top-0 h-full w-[45%] bg-[#0066FF]" />
      
      {/* Subtle atmosphere on right */}
      <div className="absolute right-0 top-0 h-full w-[55%] bg-[#FAFAFA]" />
      
      {/* Floating abstract shapes */}
      <div className="hero-drift absolute left-[8%] top-[15%] h-32 w-32 border-[3px] border-white/40" style={{ animationDelay: '0s' }} />
      <div className="hero-drift absolute left-[25%] bottom-[20%] h-24 w-24 rounded-full border-[3px] border-white/30" style={{ animationDelay: '2s' }} />
      <div className="hero-drift absolute left-[5%] bottom-[35%] h-16 w-40 bg-white/10" style={{ animationDelay: '4s' }} />
      
      {/* Line illustrations */}
      <svg className="hero-drift absolute left-[30%] top-[30%] h-40 w-40 text-white/20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ animationDelay: '1s' }}>
        <path d="M10 50 L50 10 L90 50 L50 90 Z" />
        <circle cx="50" cy="50" r="15" />
      </svg>
      
      <svg className="hero-drift absolute left-[15%] top-[60%] h-24 w-24 text-white/15" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ animationDelay: '3s' }}>
        <path d="M20 80 L50 20 L80 80 Z" />
      </svg>
      
      {/* Right side subtle shapes */}
      <div className="hero-drift absolute right-[10%] top-[20%] h-48 w-48 rounded-full border border-[#0066FF]/10" style={{ animationDelay: '1.5s' }} />
      <div className="hero-drift absolute right-[25%] bottom-[25%] h-20 w-20 bg-[#0066FF]/5" style={{ animationDelay: '2.5s' }} />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <HeroGraphics />
      
      {/* Content grid */}
      <div className="relative grid min-h-[90vh] grid-cols-1 lg:grid-cols-2">
        {/* Left - headline on blue */}
        <div className="flex flex-col justify-center px-6 py-20 lg:px-12 xl:px-20">
          <h1 className="font-heading text-[3.5rem] font-black uppercase leading-[0.85] tracking-[-0.03em] text-white sm:text-[4.5rem] md:text-[5.5rem] lg:text-[4rem] xl:text-[5.5rem]">
            <span className="block">Creator</span>
            <span className="block">Marketing</span>
            <span className="block opacity-60">For Rentals</span>
          </h1>
          
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-white/70">
            Hire vetted creators to showcase your vacation property. They post, you get traffic and content.
          </p>
        </div>
        
        {/* Right - CTA area */}
        <div className="flex flex-col justify-center px-6 py-20 lg:px-12 xl:px-20">
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0066FF]">
              Now in beta
            </p>
            
            <h2 className="mt-4 text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[2.5rem]">
              Get more bookings through authentic content
            </h2>
            
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link 
                href="/hosts" 
                className="inline-flex h-14 items-center justify-center bg-[#0066FF] px-8 text-[14px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#0052CC]"
              >
                Start as Host
              </Link>
              <Link 
                href="/waitlist" 
                className="inline-flex h-14 items-center justify-center border-2 border-foreground/20 px-8 text-[14px] font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-foreground/40"
              >
                Join as Creator
              </Link>
            </div>
            
            <div className="mt-12 flex gap-8 text-[12px] text-muted-foreground">
              <span>Free to start</span>
              <span>No contracts</span>
              <span>Pay per result</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ValuePropsSection() {
  return (
    <section className="relative bg-foreground py-24 text-white">
      {/* Floating shape */}
      <div className="hero-drift pointer-events-none absolute right-[10%] top-[20%] h-32 w-32 rounded-full border border-white/10" style={{ animationDelay: '0.5s' }} />
      
      <Container>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left - section title */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Why CreatorStays
            </p>
            <h2 className="mt-4 font-heading text-[2.5rem] font-bold uppercase leading-[0.9] tracking-tight sm:text-[3rem] md:text-[3.5rem]">
              Real traffic.<br />Real content.
            </h2>
          </div>
          
          {/* Right - value list */}
          <div className="space-y-10">
            <div>
              <h3 className="text-[18px] font-semibold">More clicks to your listing</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                Creators drive real visitors to your Airbnb. Every click tracked and attributed.
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-semibold">Professional content you own</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                Photos and videos created for your property. Use them anywhere, forever.
              </p>
            </div>
            <div>
              <h3 className="text-[18px] font-semibold">Targeted travel audience</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                Reach real travelers who actually book, not random followers.
              </p>
            </div>
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
      <ValuePropsSection />
      <HowItWorksSection />
      <BetaSection />
      <FinalCTASection />
    </>
  )
}
