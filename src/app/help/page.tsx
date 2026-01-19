"use client"

import { useState } from "react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"

// Help scenarios
const scenarios = [
  {
    id: "host-signup",
    title: "Host signup and listing setup",
    icon: "🏠",
    answer: `To get started as a host, click "Host Signup" in the navigation. You'll need to provide your Airbnb listing URL—we only support Airbnb listings at this time. Once submitted, we'll pull your listing details automatically. You can then browse creators and send collaboration offers.`,
    links: [
      { label: "Host Signup", href: "/hosts" },
      { label: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    id: "airbnb-issues",
    title: "Airbnb link issues",
    icon: "🔗",
    answer: `Make sure your Airbnb URL follows this format: airbnb.com/rooms/123456. We don't support Airbnb Experiences or non-room listings. If the auto-fill isn't working, you can enter your property details manually. Some Airbnb pages may block automated fetching—try a different browser or clear cookies.`,
    links: [
      { label: "Host Signup", href: "/hosts" },
      { label: "Contact Us", href: "#message-form" },
    ],
  },
  {
    id: "affiliate-analytics",
    title: "Affiliate links and analytics",
    icon: "📊",
    answer: `Each collaboration generates a unique affiliate link that tracks clicks, unique visitors, and revisit rates. Both hosts and creators can view analytics for their campaigns. We track link clicks only—we cannot detect bookings made on Airbnb. Analytics are available in your dashboard after a collaboration is active.`,
    links: [
      { label: "Host Dashboard", href: "/dashboard/host" },
      { label: "Creator Dashboard", href: "/dashboard/creator" },
    ],
  },
  {
    id: "creator-waitlist",
    title: "Creator waitlist and profile",
    icon: "✨",
    answer: `Creators can join our waitlist to get early access. Once invited, you'll create a profile with your social handles, niches, and deal preferences. Hosts will be able to browse creator profiles and send collaboration offers. Connect your Instagram, TikTok, or YouTube to strengthen your profile.`,
    links: [
      { label: "Join Creator Waitlist", href: "/waitlist" },
      { label: "Creator Dashboard", href: "/dashboard/creator" },
    ],
  },
  {
    id: "payments-taxes",
    title: "Payments, fees, and tax forms",
    icon: "💳",
    answer: `CreatorStays charges a 15% platform fee to both hosts and creators (30% total). Payments are processed through Stripe. Creators in the US earning $600+ will receive a 1099-NEC via Stripe. Connect your Stripe account in your dashboard to receive payouts. Payment features are coming soon in beta.`,
    links: [
      { label: "Creator Dashboard", href: "/dashboard/creator" },
      { label: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    id: "social-connections",
    title: "Instagram / TikTok / YouTube connections",
    icon: "📱",
    answer: `You can connect your social accounts from your Creator Dashboard. Instagram uses secure OAuth through Meta. TikTok and YouTube connections are manual (paste your profile URL). We'll sync follower counts and engagement metrics automatically after the beta period. Connected accounts help hosts find you.`,
    links: [
      { label: "Creator Dashboard", href: "/dashboard/creator" },
      { label: "Join Creator Waitlist", href: "/waitlist" },
    ],
  },
]

const topics = scenarios.map(s => ({ value: s.id, label: s.title }))

export default function HelpPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "creator",
    topic: "",
    message: "",
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const activeScenario = scenarios.find(s => s.id === selectedScenario)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo only - no actual submission
    setFormSubmitted(true)
    setTimeout(() => setFormSubmitted(false), 4000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Navbar />
      
      <main className="flex-1 py-12">
        <Container>
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Help</h1>
            <p className="mt-2 text-muted-foreground">Get answers fast, or message us.</p>
          </div>

          {/* Scenarios Grid */}
          <div className="mb-12">
            <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Select a topic
            </p>
            <div className="help-scenario-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(
                    selectedScenario === scenario.id ? null : scenario.id
                  )}
                  className={`help-scenario-card group relative rounded-xl p-4 text-left transition-all duration-250 ${
                    selectedScenario === scenario.id
                      ? "bg-white/80 ring-2 ring-primary/20"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                >
                  <div className="help-scenario-glow" aria-hidden="true" />
                  <div className="relative z-10 flex items-start gap-3">
                    <span className="text-xl">{scenario.icon}</span>
                    <span className="text-[13px] font-medium leading-snug">{scenario.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Scenario Answer */}
          {activeScenario && (
            <div className="mb-12 rounded-2xl border border-primary/10 bg-primary/[0.02] p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{activeScenario.icon}</span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{activeScenario.title}</h2>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                    {activeScenario.answer}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeScenario.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        {link.label} →
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message Form */}
          <div id="message-form" className="mx-auto max-w-xl">
            <div className="rounded-2xl border border-foreground/5 bg-white/50 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold">Message us</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Can&apos;t find what you need? Send us a message.
              </p>

              {formSubmitted ? (
                <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-center">
                  <span className="text-lg">✓</span>
                  <p className="mt-1 text-sm font-medium text-emerald-700">Message received (demo)</p>
                  <p className="mt-0.5 text-[11px] text-emerald-600">We&apos;ll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                        Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                        I&apos;m a
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, userType: "host" })}
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            formData.userType === "host"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-foreground/10 bg-white hover:bg-foreground/[0.02]"
                          }`}
                        >
                          Host
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, userType: "creator" })}
                          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                            formData.userType === "creator"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-foreground/10 bg-white hover:bg-foreground/[0.02]"
                          }`}
                        >
                          Creator
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                        Topic
                      </label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="w-full rounded-lg border border-foreground/10 bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      >
                        <option value="">Select a topic</option>
                        {topics.map((topic) => (
                          <option key={topic.value} value={topic.value}>
                            {topic.label}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help?"
                      rows={4}
                      required
                      className="w-full resize-none rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-12 text-center">
            <p className="text-[11px] text-muted-foreground">
              Looking for something else?{" "}
              <Link href="/how-it-works" className="text-primary hover:underline">
                How It Works
              </Link>
              {" · "}
              <Link href="/hosts" className="text-primary hover:underline">
                Host Signup
              </Link>
              {" · "}
              <Link href="/waitlist" className="text-primary hover:underline">
                Creator Waitlist
              </Link>
            </p>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
