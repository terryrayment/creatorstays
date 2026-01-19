import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function EdgeBlur({ className = "" }: { className?: string }) {
  return (
    <div 
      className={`absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute -top-1/2 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute -bottom-1/2 right-0 h-[400px] w-[600px] rounded-full bg-accent/5 blur-[100px]" />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <EdgeBlur />
      <Container>
        <div className="flex flex-col items-center text-center opacity-0 reveal">
          <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            Now accepting early access applications
          </span>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Where creators find their
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> perfect stay</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Connect with unique properties designed for content creation. 
            Hosts get exposure, creators get incredible locations.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild className="px-8">
              <Link href="/waitlist">Join the Waitlist</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}

const hostReasons = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Massive Exposure",
    description: "Get your property featured to millions of followers through authentic creator content."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Premium Rates",
    description: "Earn top dollar while building long-term relationships with professional creators."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Vetted Creators",
    description: "Every creator is verified for professionalism, audience quality, and content standards."
  }
]

function WhyHostsSection() {
  return (
    <section className="py-24">
      <Container>
        <div className="text-center opacity-0 reveal">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why hosts choose CreatorStays
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Turn your property into a content destination and unlock a new revenue stream.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {hostReasons.map((reason, i) => (
            <div 
              key={reason.title}
              className={`group relative rounded-2xl border border-border/50 bg-card p-8 opacity-0 reveal transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5`}
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                {reason.icon}
              </div>
              <h3 className="text-xl font-semibold">{reason.title}</h3>
              <p className="mt-2 text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

const steps = [
  {
    number: "01",
    title: "Apply & Get Verified",
    description: "Creators submit their portfolio. Hosts list their properties. We verify everyone for quality."
  },
  {
    number: "02", 
    title: "Match & Connect",
    description: "Our platform matches creators with ideal properties based on content style and requirements."
  },
  {
    number: "03",
    title: "Create & Share",
    description: "Creators produce amazing content. Hosts get exposure. Everyone wins."
  }
]

function HowItWorksSection() {
  return (
    <section className="border-y border-border/50 bg-muted/30 py-24">
      <Container>
        <div className="text-center opacity-0 reveal">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A simple process designed to create perfect matches.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div 
              key={step.number}
              className="relative opacity-0 reveal"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <span className="text-6xl font-bold text-primary/10">{step.number}</span>
              <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

const creators = [
  { name: "Alex Rivera", handle: "@alexcreates", followers: "2.4M", category: "Travel" },
  { name: "Jordan Lee", handle: "@jordanlee", followers: "890K", category: "Lifestyle" },
  { name: "Sam Chen", handle: "@samvisuals", followers: "1.2M", category: "Photography" },
  { name: "Taylor Morgan", handle: "@taylormorg", followers: "3.1M", category: "Vlog" },
  { name: "Casey Brooks", handle: "@caseyb", followers: "670K", category: "Food" },
  { name: "Morgan Silva", handle: "@morgansilva", followers: "1.8M", category: "Adventure" },
]

function FeaturedCreatorsSection() {
  return (
    <section className="py-24">
      <Container>
        <div className="text-center opacity-0 reveal">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Featured creators
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join a community of professional content creators already on the platform.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator, i) => (
            <div 
              key={creator.handle}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 opacity-0 reveal transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${((i % 3) + 1) * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
                  {creator.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{creator.name}</h3>
                  <p className="text-sm text-muted-foreground">{creator.handle}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm font-medium text-primary">{creator.followers} followers</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{creator.category}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join the waitlist today and be among the first to access CreatorStays when we launch.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="px-8">
              <Link href="/waitlist">Join as a Creator</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <Link href="/waitlist">List Your Property</Link>
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
      <FeaturedCreatorsSection />
      <FinalCTASection />
    </>
  )
}
