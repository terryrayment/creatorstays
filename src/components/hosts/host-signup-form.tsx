"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HostSignupForm() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    cityRegion: "",
    listingUrl: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo only - no backend call
    console.log("Host signup:", form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Account created (demo)</h2>
        <p className="mt-2 text-sm text-muted-foreground">Next: build your profile and add your listing details.</p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/host">Go to Host Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full name *</label>
          <Input
            required
            placeholder="Your name"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email *</label>
          <Input
            required
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Phone <span className="text-muted-foreground font-normal">(optional)</span></label>
          <Input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Company/Brand <span className="text-muted-foreground font-normal">(optional)</span></label>
          <Input
            placeholder="Your company or brand"
            value={form.companyName}
            onChange={e => setForm({ ...form, companyName: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">City/Region *</label>
        <Input
          required
          placeholder="e.g. Los Angeles, CA"
          value={form.cityRegion}
          onChange={e => setForm({ ...form, cityRegion: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Airbnb/VRBO listing URL *</label>
        <Input
          required
          type="url"
          placeholder="https://airbnb.com/rooms/..."
          value={form.listingUrl}
          onChange={e => setForm({ ...form, listingUrl: e.target.value })}
        />
        <p className="mt-1 text-xs text-muted-foreground">We&apos;ll use this to set up your tracked links.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Password *</label>
          <Input
            required
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirm password *</label>
          <Input
            required
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-start gap-2 pt-2">
        <input
          type="checkbox"
          id="terms"
          required
          checked={form.agreeTerms}
          onChange={e => setForm({ ...form, agreeTerms: e.target.checked })}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground">
          I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </label>
      </div>

      <Button type="submit" size="lg" className="w-full mt-2">
        Create host account
      </Button>
    </form>
  )
}
