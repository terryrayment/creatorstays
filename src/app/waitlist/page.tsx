"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function EdgeBlur() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-[hsl(199,89%,48%)]/6 blur-[150px]" />
      <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-[hsl(213,94%,45%)]/5 blur-[120px]" />
    </div>
  )
}

const creatorNiches = ["Travel", "Lifestyle", "Photography", "Vlog", "Food", "Adventure", "Fashion", "Wellness"]
const platforms = ["Instagram", "TikTok", "YouTube", "Twitter/X", "Other"]
const audienceSizes = ["Under 10K", "10K - 50K", "50K - 100K", "100K - 500K", "500K+"]

export default function WaitlistPage() {
  const [userType, setUserType] = useState<"creator" | "host">("creator")
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    email: "",
    name: "",
    // Creator fields
    handle: "",
    platform: "",
    niche: "",
    audienceSize: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    // Host fields
    propertyLocation: "",
    listingUrl: "",
    propertyType: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Send to API/MailerLite
    console.log("Waitlist submission:", { userType, ...form })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="relative min-h-[80vh]">
        <EdgeBlur />
        <Container className="flex min-h-[80vh] items-center justify-center py-16">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">You&apos;re on the list!</h1>
            <p className="mt-3 text-muted-foreground">
              Thanks for joining the CreatorStays {userType} waitlist. We&apos;ll be in touch soon with early access.
            </p>
            <Button className="mt-6" variant="outline" onClick={() => { setSubmitted(false); setForm({ ...form, email: "" }) }}>
              Sign up another email
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="relative">
      <EdgeBlur />
      <Container className="py-12 md:py-16">
        <div className="mx-auto max-w-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              Early Access
            </span>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Join the Waitlist
            </h1>
            <p className="mt-3 text-muted-foreground">
              Be first in line when CreatorStays launches. Get early access and shape the platform.
            </p>
          </div>

          {/* User type toggle */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex rounded-full border border-foreground/10 bg-white p-1">
              <button
                onClick={() => setUserType("creator")}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  userType === "creator" 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                I&apos;m a Creator
              </button>
              <button
                onClick={() => setUserType("host")}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  userType === "host" 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                I&apos;m a Host
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-foreground/5 bg-white/70 p-6 shadow-xl shadow-black/[0.03] backdrop-blur-sm md:p-8">
            {/* Common fields */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Name</label>
                  <Input
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <Input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Creator-specific fields */}
              {userType === "creator" && (
                <>
                  <div className="border-t border-foreground/5 pt-4">
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Tell us about your content</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Primary Platform</label>
                      <select
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={form.platform}
                        onChange={e => setForm({ ...form, platform: e.target.value })}
                      >
                        <option value="">Select platform</option>
                        {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Content Niche</label>
                      <select
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={form.niche}
                        onChange={e => setForm({ ...form, niche: e.target.value })}
                      >
                        <option value="">Select niche</option>
                        {creatorNiches.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Audience Size</label>
                      <select
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={form.audienceSize}
                        onChange={e => setForm({ ...form, audienceSize: e.target.value })}
                      >
                        <option value="">Select size</option>
                        {audienceSizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Primary Handle</label>
                      <Input
                        placeholder="@yourhandle"
                        value={form.handle}
                        onChange={e => setForm({ ...form, handle: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Social Links <span className="text-muted-foreground">(optional)</span></label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Input
                        placeholder="Instagram URL"
                        value={form.instagram}
                        onChange={e => setForm({ ...form, instagram: e.target.value })}
                      />
                      <Input
                        placeholder="TikTok URL"
                        value={form.tiktok}
                        onChange={e => setForm({ ...form, tiktok: e.target.value })}
                      />
                      <Input
                        placeholder="YouTube URL"
                        value={form.youtube}
                        onChange={e => setForm({ ...form, youtube: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Host-specific fields */}
              {userType === "host" && (
                <>
                  <div className="border-t border-foreground/5 pt-4">
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Tell us about your property</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Property Location</label>
                      <Input
                        required
                        placeholder="City, State/Country"
                        value={form.propertyLocation}
                        onChange={e => setForm({ ...form, propertyLocation: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Property Type</label>
                      <select
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={form.propertyType}
                        onChange={e => setForm({ ...form, propertyType: e.target.value })}
                      >
                        <option value="">Select type</option>
                        <option value="entire-home">Entire Home</option>
                        <option value="apartment">Apartment</option>
                        <option value="cabin">Cabin</option>
                        <option value="villa">Villa</option>
                        <option value="unique">Unique Stay</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Listing URL <span className="text-muted-foreground">(optional)</span></label>
                    <Input
                      placeholder="https://airbnb.com/rooms/..."
                      value={form.listingUrl}
                      onChange={e => setForm({ ...form, listingUrl: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Airbnb, VRBO, or direct booking link</p>
                  </div>
                </>
              )}
            </div>

            {/* Submit */}
            <div className="mt-6">
              <Button type="submit" className="w-full" size="lg">
                Join {userType === "creator" ? "Creator" : "Host"} Waitlist
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                We&apos;ll never spam you. Unsubscribe anytime.
              </p>
            </div>
          </form>

          {/* Social proof placeholder */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Join <span className="font-medium text-foreground">200+</span> creators and hosts on the waitlist
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
