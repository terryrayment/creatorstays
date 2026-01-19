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
            Influencer marketing for vacation rentals
          </span>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Get more bookings with
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> creator marketing</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Hire vetted content creators to showcase your property. 
            They post, you get clicks, bookings, and stunning content.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild className="px-8">
              <Link href="/creators">Find Creators</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="px-8">
              <Link href="/waitlist">I&apos;m a creator</Link>
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "More Bookings",
    description: "Creators drive real traffic to your listing. Track every click and measure your ROI."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
    title: "Professional Content",
    description: "Get scroll-stopping photos and videos you can use forever. No photographer fees."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Targeted Reach",
    description: "Your property shown to travelers who actually book. Not random followers—real guests."
  }
]

function WhyHostsSection() {
  return (
    <section className="py-24">
      <Container>
        <div className="text-center opacity-0 reveal">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why hosts use CreatorStays
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Turn creator content into bookings. Measurable marketing that actually works.
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
    title: "Add Your Property",
    description: "Create your host profile and paste your Airbnb or VRBO link. We'll pull in your listing details."
  },
  {
    number: "02", 
    title: "Browse & Hire Creators",
    description: "Find creators who match your property vibe. Send offers with your budget and requirements."
  },
  {
    number: "03",
    title: "They Post, You Track",
    description: "Creators publish content with your tracked link. Watch clicks roll in from their audience."
  },
  {
    number: "04",
    title: "Confirm & Pay",
    description: "Review results, confirm bookings you received, and pay creators for performance."
  }
]

function HowItWorksSection() {
  return (
    <section className="border-y border-border/50 bg-muted/30 py-24">
      <Container>
        <div className="text-center opacity-0 reveal">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works for hosts
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From signup to bookings in four simple steps.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
            Creators ready to promote your property
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Browse vetted creators with engaged audiences of travelers and adventure seekers.
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
            Ready to fill your calendar?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start browsing creators today. No commitment until you find the perfect match.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="px-8">
              <Link href="/creators">Find Creators</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <Link href="/how-it-works">Learn More</Link>
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
