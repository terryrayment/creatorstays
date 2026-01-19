import { Container } from "@/components/layout/container"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"
import Link from "next/link"

export default function HowToHostsPage() {
  const steps = [
    {
      number: "1",
      title: "Create your host profile",
      description: "Sign up with your email and basic info. Your profile helps creators understand who you are and what properties you manage.",
    },
    {
      number: "2",
      title: "Add your Airbnb property",
      description: "Paste your Airbnb URL to auto-import listing details. Review and confirm the info, add vibe tags, and write a brief for creators.",
    },
    {
      number: "3",
      title: "Find creators and send requests",
      description: "Browse the creator directory filtered by niche, location, and audience size. Send collaboration requests with your offer terms.",
    },
    {
      number: "4",
      title: "Campaign approved → affiliate link created",
      description: "Once a creator accepts your request, we generate a unique tracking link. The creator shares this link in their content.",
    },
    {
      number: "5",
      title: "Track link analytics",
      description: "See clicks, unique visitors, and engagement in real-time. Understand which creators drive the most traffic to your listing.",
    },
    {
      number: "6",
      title: "Pay creators through the platform",
      description: "When campaigns complete, pay creators securely through our payment system. Stripe handles the transaction.",
      comingSoon: true,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Navbar />
      <main className="flex-1 py-12">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Link href="/how-it-works" className="text-xs text-muted-foreground hover:text-foreground">← How It Works</Link>
            
            <h1 className="mt-4 text-3xl font-bold tracking-tight">How To: Hosts</h1>
            <p className="mt-2 text-muted-foreground">
              Get your property in front of travel creators in 6 steps.
            </p>

            <div className="mt-10 space-y-8">
              {steps.map((step) => (
                <div key={step.number} className="relative flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {step.number}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h2 className="text-lg font-semibold">
                      {step.title}
                      {step.comingSoon && (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">Coming soon</span>
                      )}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-xl border border-foreground/5 bg-white/50 p-6">
              <h3 className="font-semibold">Ready to get started?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your host profile and add your first property.</p>
              <div className="mt-4 flex gap-3">
                <Link href="/hosts" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  Host Signup
                </Link>
                <Link href="/help" className="rounded-lg border border-foreground/10 bg-white px-4 py-2 text-sm font-medium hover:bg-foreground/[0.02]">
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
