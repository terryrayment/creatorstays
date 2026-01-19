"use client"

import { useState } from "react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Guide items - simplified list
const guideItems = [
  { id: "host-signup", title: "Host signup and getting started", desc: "Create your account and list your first property", href: "/how-to/hosts" },
  { id: "airbnb-url", title: "Airbnb listing URL format", desc: "The correct format for your listing URL" },
  { id: "prefill-issues", title: "Listing prefill not working", desc: "Troubleshooting automatic listing details" },
  { id: "finding-creators", title: "Finding and messaging creators", desc: "Browse creators and send collaboration offers" },
  { id: "affiliate-links", title: "Understanding affiliate links", desc: "How tracking links work and what they measure" },
  { id: "payment-fees", title: "Payments and platform fees", desc: "Fee structure for hosts and creators" },
  { id: "creator-waitlist", title: "Joining the creator waitlist", desc: "How to sign up and what to expect", href: "/waitlist" },
  { id: "setting-rates", title: "Setting rates and deliverables", desc: "Configure your default pricing and content types" },
  { id: "connect-socials", title: "Connecting Instagram, TikTok, YouTube", desc: "Link your accounts for analytics sync" },
  { id: "approving-offers", title: "Approving and countering offers", desc: "How to respond to host collaboration requests" },
  { id: "sharing-links", title: "Sharing your affiliate links", desc: "Best practices for link placement in content" },
  { id: "tracking-earnings", title: "Tracking analytics and earnings", desc: "Understanding your dashboard metrics" },
  { id: "account-access", title: "Account access and login", desc: "Managing your CreatorStays account" },
  { id: "privacy-data", title: "Privacy and data handling", desc: "How we protect your information" },
  { id: "reporting-abuse", title: "Reporting abuse or fraud", desc: "What to do if something seems wrong" },
]

// FAQ items
const faqItems = [
  { q: "How much does CreatorStays cost?", a: "Free to join. We charge 15% on successful collaborations from both hosts and creators." },
  { q: "Can I use VRBO or other platforms?", a: "Currently we only support Airbnb listings. More platforms coming soon." },
  { q: "How do I get paid as a creator?", a: "Connect your bank account via Stripe. Payouts process after campaign completion." },
  { q: "What if a creator doesn't deliver?", a: "You only pay after approving completed work. Disputes can be raised via support." },
  { q: "Can I track actual bookings?", a: "We track link clicks and visitors, not Airbnb bookings (platform limitation)." },
  { q: "How long until my listing is approved?", a: "Listings appear immediately after URL validation." },
]

function GuideRow({ item }: { item: typeof guideItems[0] }) {
  const content = (
    <div className="guide-row group relative flex items-start gap-4 rounded-lg px-4 py-3 -mx-4 transition-all duration-200">
      {/* Blur glow on hover */}
      <div className="absolute inset-0 rounded-lg bg-primary/[0.03] opacity-0 blur-xl group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex-1 min-w-0">
        <span className="block text-[15px] font-medium text-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200">
          {item.title}
        </span>
        {item.desc && (
          <span className="block text-[13px] text-muted-foreground mt-0.5 group-hover:text-muted-foreground/80 transition-colors">{item.desc}</span>
        )}
      </div>
      <svg className="relative h-4 w-4 mt-1 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  )

  if (item.href) {
    return <Link href={item.href} className="block">{content}</Link>
  }
  return <button className="block w-full text-left">{content}</button>
}

function FAQRow({ item, isOpen, onToggle }: { item: typeof faqItems[0], isOpen: boolean, onToggle: () => void }) {
  return (
    <div className="border-b border-foreground/5 last:border-0">
      <button onClick={onToggle} className="flex w-full items-center justify-between py-3 text-left">
        <span className="text-[14px] font-medium text-foreground">{item.q}</span>
        <svg className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {isOpen && (
        <p className="pb-3 text-[13px] text-muted-foreground leading-relaxed">{item.a}</p>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubscribed(true)
  }

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <h1 className="text-2xl font-semibold tracking-tight">Help Center</h1>
          
          {/* Quick links pill row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/hosts" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              Host signup
            </Link>
            <Link href="/waitlist" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              Creator waitlist
            </Link>
            <Link href="/creators" className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              Browse creators
            </Link>
          </div>

          {/* Guide list */}
          <div className="mt-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4">Guides</h2>
            <div className="space-y-0">
              {guideItems.map(item => (
                <GuideRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* FAQ section */}
          <div className="mt-12">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4">Frequently Asked</h2>
            <div className="rounded-xl border border-foreground/5 bg-white/50 px-4">
              {faqItems.map((item, i) => (
                <FAQRow key={i} item={item} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>

          {/* Utility blocks */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {/* Subscribe block */}
            <div className="rounded-xl border border-foreground/5 bg-white/50 p-5">
              <h3 className="text-[13px] font-semibold">Stay updated</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Get product updates and tips.</p>
              {subscribed ? (
                <p className="mt-4 text-[12px] text-emerald-600 font-medium">✓ You&apos;re subscribed!</p>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="you@email.com" 
                    className="flex-1 text-[13px] h-9 bg-white" 
                    required 
                  />
                  <Button type="submit" size="sm" className="h-9 px-4 text-[12px]">Subscribe</Button>
                </form>
              )}
            </div>

            {/* Support block */}
            <div className="rounded-xl border border-foreground/5 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
              <h3 className="text-[13px] font-semibold">Always here to help</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">Can&apos;t find your answer? We respond within 24 hours.</p>
              <Button size="sm" className="mt-4 h-9 px-4 text-[12px]" asChild>
                <a href="mailto:support@creatorstays.com">Get support</a>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
