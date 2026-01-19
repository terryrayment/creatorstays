import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function EdgeBlur() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-[hsl(199,89%,48%)]/5 blur-[150px]" />
      <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-[hsl(213,94%,45%)]/4 blur-[120px]" />
    </div>
  )
}

const benefits = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    title: "Track Real Results",
    description: "Every click from creator content is tracked. See exactly which creators drive traffic to your listing."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
    title: "Professional Content",
    description: "Get scroll-stopping photos and videos you can use forever. Better than stock, more authentic than staged."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Vetted Creators",
    description: "Browse creators by niche, audience, and style. Every creator is verified before joining the platform."
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: "Flexible Deals",
    description: "Pay flat fees, commissions, or offer post-for-stay arrangements. You set the terms that work for you."
  },
]

const steps = [
  { num: "1", title: "Create your profile", desc: "Add your property details and paste your Airbnb link. We generate tracked URLs automatically." },
  { num: "2", title: "Find your creators", desc: "Browse by niche, location, and audience size. Use the Taste Optimizer to find perfect matches." },
  { num: "3", title: "Send offers", desc: "Reach out with your budget and requirements. Negotiate directly with creators." },
  { num: "4", title: "Track & settle", desc: "Monitor clicks and traffic. Settle payments off-platform based on your agreement." },
]

const faqs = [
  { q: "How much does it cost?", a: "CreatorStays is free to join during beta. You only pay creators directly based on your negotiated deal—flat fee, commission, or post-for-stay." },
  { q: "Can you track bookings automatically?", a: "No. Airbnb and VRBO don't share booking data. We track clicks and attribution within a 30-day window. You settle with creators based on your agreement." },
  { q: "What kind of creators are on the platform?", a: "Travel, lifestyle, photography, vlog, and adventure creators with engaged audiences. All creators are vetted before joining." },
  { q: "Do creators stay for free?", a: "That's up to you. Some hosts offer complimentary stays (post-for-stay), others pay flat fees or commissions. You negotiate the terms." },
]

export default function HostsPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <EdgeBlur />
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              For Vacation Rental Hosts
            </span>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Turn creator content into
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> more bookings</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Hire vetted content creators to showcase your property. Track every click. 
              Get professional content you can use forever.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="px-8">
                <Link href="/waitlist">Join Host Waitlist</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link href="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="border-y border-foreground/5 bg-muted/30 py-16 md:py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Why hosts use CreatorStays</h2>
            <p className="mt-3 text-muted-foreground">Influencer marketing that actually drives results.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl border border-foreground/5 bg-white/60 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  {b.icon}
                </div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How it works for hosts</h2>
            <p className="mt-3 text-muted-foreground">From signup to bookings in four steps.</p>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="space-y-6">
              {steps.map((s, i) => (
                <div key={s.num} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                    {s.num}
                  </div>
                  <div className="flex-1 border-b border-foreground/5 pb-6">
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Pricing note */}
      <section className="border-y border-foreground/5 bg-muted/30 py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">
              CreatorStays is <strong className="text-foreground">free during beta</strong>. 
              You only pay creators directly—no platform fees, no middleman markup.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-foreground/5 bg-white/60 p-4 text-center">
                <p className="text-2xl font-bold">$0</p>
                <p className="text-sm text-muted-foreground">Platform fee</p>
              </div>
              <div className="rounded-xl border border-foreground/5 bg-white/60 p-4 text-center">
                <p className="text-2xl font-bold">You decide</p>
                <p className="text-sm text-muted-foreground">Creator rates</p>
              </div>
              <div className="rounded-xl border border-foreground/5 bg-white/60 p-4 text-center">
                <p className="text-2xl font-bold">Direct</p>
                <p className="text-sm text-muted-foreground">Payment to creators</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Frequently asked questions</h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-foreground/5 bg-white/60 p-5">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-10 text-center md:p-16">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ready to get more bookings?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join the waitlist today. Be among the first hosts to access CreatorStays when we launch.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="px-8">
                <Link href="/waitlist">Join Host Waitlist</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link href="/dashboard/host">Preview Dashboard</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
