"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

// Mock city data
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
  "Austin, TX",
  "Denver, CO",
  "Miami, FL",
  "Nashville, TN",
  "Scottsdale, AZ",
  "Seattle, WA",
  "New York, NY",
  "Chicago, IL",
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
      <input
        required
        placeholder="Start typing a city..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className="h-10 w-full rounded-lg border-[2px] border-black bg-white px-3 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border-[2px] border-black bg-white py-1">
          {suggestions.map((city, i) => (
            <button
              key={i}
              type="button"
              className="w-full px-3 py-2 text-left text-[12px] font-medium text-black transition-colors hover:bg-[#FFD84A]"
              onClick={() => {
                onChange(city)
                setOpen(false)
              }}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function normalizeUrl(url: string): string {
  if (!url) return url
  let normalized = url.trim()
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized
  }
  return normalized
}

function isValidAirbnbUrl(url: string): boolean {
  if (!url) return true
  const normalized = normalizeUrl(url)
  return normalized.includes("airbnb.com")
}

interface ListingPrefill {
  title?: string
  city?: string
  rating?: number
  reviewCount?: number
  price?: string
  photos?: string[]
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
  
  const [prefill, setPrefill] = useState<ListingPrefill | null>(null)
  const [prefillStatus, setPrefillStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [manuallyEdited, setManuallyEdited] = useState(false)
  const [prefillAttempted, setPrefillAttempted] = useState(false)

  const listingUrlError = form.listingUrl && !isValidAirbnbUrl(form.listingUrl)
  const canSubmit = !listingUrlError
  const showPrefillButton = form.listingUrl && isValidAirbnbUrl(form.listingUrl) && form.listingUrl.includes("airbnb.com")

  const handleListingUrlBlur = () => {
    if (form.listingUrl) {
      const normalized = normalizeUrl(form.listingUrl)
      setForm({ ...form, listingUrl: normalized })
      
      if (isValidAirbnbUrl(normalized) && normalized.includes("airbnb.com") && !manuallyEdited && !prefillAttempted) {
        fetchPrefill(normalized)
      }
    }
  }

  const fetchPrefill = async (url: string) => {
    setPrefillStatus("loading")
    setPrefillAttempted(true)
    
    try {
      const res = await fetch(`/api/airbnb/prefill?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      
      if (data.ok) {
        setPrefill(data)
        setPrefillStatus("success")
        
        if (data.city && !form.cityRegion) {
          setForm(prev => ({ ...prev, cityRegion: data.city }))
        }
      } else {
        setPrefillStatus("error")
        setPrefill(null)
      }
    } catch {
      setPrefillStatus("error")
      setPrefill(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    console.log("Host signup:", form, prefill)
    setSubmitted(true)
  }

  const inputClass = "h-10 w-full rounded-lg border-[2px] border-black bg-white px-3 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-[2px] border-black bg-[#28D17C]">
          <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-[16px] font-black uppercase tracking-wide text-black">Account Created</h2>
        <p className="mt-2 text-[12px] font-medium text-black">Next: build your profile and add listing details.</p>
        <Link 
          href="/dashboard/host"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
        >
          Go to Dashboard
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-wider text-black mb-3">Start as Host</p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Full Name *</label>
            <input
              required
              placeholder="Your name"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Email *</label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Phone</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Company</label>
            <input
              placeholder="Your company or brand"
              value={form.companyName}
              onChange={e => setForm({ ...form, companyName: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">City / Region *</label>
          <CityAutocomplete
            value={form.cityRegion}
            onChange={(value) => { 
              setForm({ ...form, cityRegion: value })
              setManuallyEdited(true)
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Airbnb Listing URL *</label>
          <div className="flex gap-2">
            <input
              required
              type="text"
              placeholder="airbnb.com/rooms/..."
              value={form.listingUrl}
              onChange={e => setForm({ ...form, listingUrl: e.target.value })}
              onBlur={handleListingUrlBlur}
              className={`flex-1 ${inputClass} ${listingUrlError ? "border-[#FF6B6B]" : ""}`}
            />
            {showPrefillButton && (
              <button
                type="button"
                disabled={prefillStatus === "loading"}
                onClick={() => fetchPrefill(form.listingUrl)}
                className="shrink-0 rounded-lg border-[2px] border-black bg-white px-3 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {prefillStatus === "loading" ? "..." : "Pull"}
              </button>
            )}
          </div>
          {listingUrlError && (
            <p className="mt-1 text-[10px] font-medium text-[#FF6B6B]">Only Airbnb listings supported during beta.</p>
          )}
          {prefillStatus === "error" && (
            <p className="mt-1 text-[10px] font-medium text-[#FF6B6B]">Couldn&apos;t pull details. Enter manually.</p>
          )}
        </div>

        {/* Listing preview */}
        {prefillStatus === "success" && prefill && (
          <div className="rounded-lg border-[2px] border-black bg-[#28D17C]/20 p-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {prefill.title && (
                  <h4 className="font-bold text-[12px] text-black leading-tight">{prefill.title}</h4>
                )}
                {prefill.city && (
                  <p className="text-[10px] font-medium text-black mt-0.5">{prefill.city}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-black">
                  {prefill.rating && (
                    <span>★ {prefill.rating}{prefill.reviewCount && ` (${prefill.reviewCount})`}</span>
                  )}
                  {prefill.price && <span>{prefill.price}/night</span>}
                </div>
              </div>
              {prefill.photos && prefill.photos[0] && (
                <img 
                  src={prefill.photos[0]} 
                  alt="Listing" 
                  className="h-14 w-18 rounded-md border-[2px] border-black object-cover shrink-0"
                />
              )}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Password *</label>
            <input
              required
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Confirm *</label>
            <input
              required
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            required
            checked={form.agreeTerms}
            onChange={e => setForm({ ...form, agreeTerms: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-[2px] border-black accent-black"
          />
          <label htmlFor="terms" className="text-[10px] font-medium text-black">
            I agree to the <a href="#" className="font-bold underline">Terms</a> and <a href="#" className="font-bold underline">Privacy Policy</a>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={!canSubmit}
          className="w-full h-11 rounded-full bg-black text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          Create Host Account
        </button>
      </form>
    </div>
  )
}
