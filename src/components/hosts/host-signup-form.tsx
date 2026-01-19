"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mock city data - replace with real API later (Google Places, Mapbox, etc.)
const MOCK_CITIES = [
  "Lake Arrowhead, CA",
  "Lake Tahoe, CA",
  "Los Angeles, CA",
  "San Diego, CA",
  "San Francisco, CA",
  "Big Bear Lake, CA",
  "Palm Springs, CA",
  "Joshua Tree, CA",
  "Malibu, CA",
  "Santa Barbara, CA",
  "Napa Valley, CA",
  "Carmel-by-the-Sea, CA",
  "Austin, TX",
  "Dallas, TX",
  "Houston, TX",
  "Denver, CO",
  "Aspen, CO",
  "Miami, FL",
  "Orlando, FL",
  "Nashville, TN",
  "Scottsdale, AZ",
  "Sedona, AZ",
  "Seattle, WA",
  "Portland, OR",
  "New York, NY",
  "Brooklyn, NY",
  "Chicago, IL",
  "Boston, MA",
  "Savannah, GA",
  "Charleston, SC",
  "New Orleans, LA",
  "Park City, UT",
  "Maui, HI",
  "Honolulu, HI",
]

function CityAutocomplete({ 
  value, 
  onChange 
}: { 
  value: string
  onChange: (value: string) => void 
}) {
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = MOCK_CITIES.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6)
      setSuggestions(filtered)
      setOpen(filtered.length > 0)
    } else {
      setSuggestions([])
      setOpen(false)
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        required
        placeholder="Start typing a city..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-foreground/10 bg-white/95 py-1 shadow-lg backdrop-blur-sm">
          {suggestions.map((city, i) => (
            <button
              key={i}
              type="button"
              className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-primary/5"
              onClick={() => {
                onChange(city)
                setOpen(false)
              }}
            >
              <span className="text-foreground">{city}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function isValidAirbnbUrl(url: string): boolean {
  if (!url) return true // Empty is valid (required handled separately)
  return url.includes("airbnb.com")
}

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

  const listingUrlError = form.listingUrl && !isValidAirbnbUrl(form.listingUrl)
  const canSubmit = !listingUrlError

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
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
        <label className="mb-1.5 block text-sm font-medium">City / Region *</label>
        <CityAutocomplete
          value={form.cityRegion}
          onChange={(value) => setForm({ ...form, cityRegion: value })}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Airbnb listing URL *</label>
        <Input
          required
          type="url"
          placeholder="https://airbnb.com/rooms/..."
          value={form.listingUrl}
          onChange={e => setForm({ ...form, listingUrl: e.target.value })}
          className={listingUrlError ? "border-red-300 focus-visible:ring-red-500" : ""}
        />
        {listingUrlError ? (
          <p className="mt-1 text-xs text-red-600">Only Airbnb listings are supported during beta.</p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">VRBO and other platforms coming soon.</p>
        )}
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

      <Button type="submit" size="lg" className="w-full mt-2" disabled={!canSubmit}>
        Create host account
      </Button>
    </form>
  )
}
