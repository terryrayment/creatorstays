"use client"

import { useState, useRef, useEffect } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import LocationAutocomplete from "@/components/ui/location-autocomplete"


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
  cityRegion?: string
  rating?: number
  reviewCount?: number
  price?: string
  photos?: string[]
  beds?: number
  bedrooms?: number
  baths?: number
  guests?: number
  propertyType?: string
}

export function HostSignupForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    cityRegion: "",
    listingUrl: "",
    agreeTerms: false,
  })
  
  const [prefill, setPrefill] = useState<ListingPrefill | null>(null)
  const [prefillStatus, setPrefillStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [manuallyEdited, setManuallyEdited] = useState(false)
  const [prefillAttempted, setPrefillAttempted] = useState(false)

  const listingUrlError = form.listingUrl && !isValidAirbnbUrl(form.listingUrl)
  const canSubmit = !listingUrlError && !loading && form.agreeTerms
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    
    setLoading(true)
    setError("")

    try {
      // Create real User + HostProfile + Property
      const response = await fetch('/api/host/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          phone: form.phone,
          companyName: form.companyName,
          cityRegion: form.cityRegion || prefill?.cityRegion || prefill?.city,
          listingUrl: form.listingUrl,
          listingTitle: prefill?.title,
          listingPhotos: prefill?.photos,
          // Include property details from Airbnb prefill
          listingBeds: prefill?.beds || prefill?.bedrooms,
          listingBaths: prefill?.baths,
          listingGuests: prefill?.guests,
          listingPropertyType: prefill?.propertyType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.alreadyExists) {
          setError("This email is already registered. Please sign in instead.")
        } else {
          setError(data.error || 'Something went wrong. Please try again.')
        }
        return
      }

      setSubmittedEmail(form.email)
      setSubmitted(true)
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "h-10 w-full rounded-lg border-[2px] border-black bg-white px-3 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  // Success state - show email confirmation
  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-black bg-[#28D17C]">
          <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h2 className="text-[16px] font-black uppercase tracking-wide text-black">Check Your Email!</h2>
        <p className="mt-3 text-[13px] font-medium text-black">
          We sent a sign-in link to <strong>{submittedEmail}</strong>
        </p>
        <p className="mt-2 text-[11px] text-black/60">
          Click the link in the email to access your host dashboard and complete your setup. The link expires in 24 hours.
        </p>
        <div className="mt-5 space-y-2">
          <Link 
            href="/login/host"
            className="inline-flex h-10 items-center gap-2 rounded-full border-[2px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
          >
            Sign in with different email
          </Link>
        </div>
        <p className="mt-4 text-[10px] text-black/50">
          Didn't receive the email? Check your spam folder or <button onClick={() => setSubmitted(false)} className="underline font-bold">try again</button>.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-wider text-black mb-3">Start as Host</p>
      
      {/* Google Sign Up - Quick option */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        className="mb-4 flex w-full items-center justify-center gap-3 rounded-full border-[2px] border-black bg-white py-3 text-[11px] font-bold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="mb-4 flex items-center gap-3">
        <div className="h-[2px] flex-1 bg-black/10" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-black/40">or sign up with email</span>
        <div className="h-[2px] flex-1 bg-black/10" />
      </div>
      
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
          <LocationAutocomplete
            value={form.cityRegion}
            onChange={(value) => { 
              setForm({ ...form, cityRegion: value })
              setManuallyEdited(true)
            }}
            placeholder="Start typing a city..."
            className="flex h-10 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
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
            I agree to the <Link href="/terms" target="_blank" className="font-bold underline">Terms & Conditions</Link> and <Link href="/privacy" target="_blank" className="font-bold underline">Privacy Policy</Link>
          </label>
        </div>

        {error && (
          <div className="rounded-lg border-2 border-red-500 bg-red-50 p-3 text-center">
            <p className="text-[12px] font-medium text-red-600">{error}</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={!canSubmit}
          className="w-full h-11 rounded-full bg-black text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Host Account'}
        </button>

        <p className="text-center text-[10px] text-black/50">
          We'll send you a magic link to sign in. No password needed.
        </p>
      </form>
    </div>
  )
}
