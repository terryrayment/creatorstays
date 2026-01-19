import { Container } from "@/components/layout/container"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"
import Link from "next/link"

export default function HowToCreatorsPage() {
  const steps = [
    {
      number: "1",
      title: "Join the Creator Waitlist",
      description: "Sign up to get early access. We're onboarding creators in batches to ensure quality matches with hosts.",
    },
    {
      number: "2",
      title: "Set your default rates and deliverables",
      description: "Choose your preferred deal types (commission %, flat fee, post-for-stay). List the content you typically deliver: posts, reels, stories.",
    },
    {
      number: "3",
      title: "Connect socials for analytics sync",
      description: "Link your Instagram, TikTok, or YouTube via OAuth. Your follower counts and engagement rates sync automatically.",
    },
    {
      number: "4",
      title: "Approve or counter host requests",
      description: "When hosts reach out, review their property and offer. Accept, decline, or counter with your own terms.",
    },
    {
      number: "5",
      title: "Share your affiliate links",
      description: "Once a campaign is live, share your unique tracking link in your content. Every click is tracked.",
    },
    {
      number: "6",
      title: "Track analytics and earnings",
      description: "See clicks, unique visitors, and pending earnings in your dashboard. Payouts happen automatically after campaigns complete.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Navbar />
      <main className="flex-1 py-12">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Link href="/how-it-works" className="text-xs text-muted-foreground hover:text-foreground">← How It Works</Link>
            
            <h1 className="mt-4 text-3xl font-bold tracking-tight">How To: Creators</h1>
            <p className="mt-2 text-muted-foreground">
              Turn your travel content into booking commissions in 6 steps.
            </p>

            <div className="mt-10 space-y-8">
              {steps.map((step) => (
                <div key={step.number} className="relative flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                    {step.number}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <h2 className="text-lg font-semibold">{step.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-xl border border-foreground/5 bg-white/50 p-6">
              <h3 className="font-semibold">Ready to get started?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Join the waitlist and we&apos;ll reach out when there&apos;s a spot.</p>
              <div className="mt-4 flex gap-3">
                <Link href="/waitlist" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90">
                  Creator Waitlist
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
