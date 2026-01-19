import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    number: "01",
    title: "Create your host profile",
    description: "Sign up and add your property details. Paste your Airbnb, VRBO, or direct booking link—we'll generate a tracked URL for your campaigns.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    )
  },
  {
    number: "02",
    title: "Browse creators and send offers",
    description: "Search our marketplace of vetted creators by niche, audience size, and location. Found a match? Send them an offer with your budget and content requirements.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    )
  },
  {
    number: "03",
    title: "Creator posts, you track clicks",
    description: "Once accepted, the creator visits your property, creates content, and shares it with your unique tracked link. You see every click in real-time on your dashboard.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    )
  },
  {
    number: "04",
    title: "Confirm results and pay",
    description: "When you receive bookings from the campaign, confirm them in your dashboard. Pay creators based on the results they delivered. Simple, transparent, performance-based.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
]

export default function HowItWorksPage() {
  return (
    <>
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              How CreatorStays works
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Get more bookings through creator marketing. Here&apos;s the process from start to finish.
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="space-y-12">
              {steps.map((step, i) => (
                <div 
                  key={step.number}
                  className="relative flex gap-6 md:gap-8"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {step.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="mt-4 h-full w-px bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-12">
                    <span className="text-sm font-medium text-primary">Step {step.number}</span>
                    <h2 className="mt-1 text-2xl font-semibold">{step.title}</h2>
                    <p className="mt-3 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold">What we don&apos;t do</h2>
            <div className="mt-6 rounded-xl border border-border/50 bg-card p-6">
              <p className="text-muted-foreground">
                <strong className="text-foreground">No automatic booking detection.</strong> We can&apos;t see inside Airbnb, VRBO, or any booking platform. When a guest books your property, you manually confirm it in your CreatorStays dashboard. This keeps things simple, private, and transparent for everyone.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ready to get started?</h2>
            <p className="mt-4 text-muted-foreground">
              Browse creators and find the perfect match for your property.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="px-8">
                <Link href="/creators">Find Creators</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link href="/waitlist">I&apos;m a creator</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
