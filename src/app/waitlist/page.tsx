"use client"

import { useState } from "react"
import Link from "next/link"
import { ImageBlock, MARKETING_IMAGES } from "@/components/marketing/image-block"

// Select image for this page
const pageImage = MARKETING_IMAGES[3]

const creatorNicheOptions = [
  { value: "Travel", label: "Travel" },
  { value: "Lifestyle", label: "Lifestyle" },
  { value: "Photography", label: "Photography" },
  { value: "Vlog", label: "Vlog" },
  { value: "Food", label: "Food" },
  { value: "Adventure", label: "Adventure" },
  { value: "Fashion", label: "Fashion" },
  { value: "Wellness", label: "Wellness" },
]
const platformOptions = [
  { value: "Instagram", label: "Instagram" },
  { value: "TikTok", label: "TikTok" },
  { value: "YouTube", label: "YouTube" },
  { value: "Twitter/X", label: "Twitter/X" },
  { value: "Other", label: "Other" },
]
const audienceSizeOptions = [
  { value: "Under 10K", label: "Under 10K" },
  { value: "10K - 50K", label: "10K - 50K" },
  { value: "50K - 100K", label: "50K - 100K" },
  { value: "100K - 500K", label: "100K - 500K" },
  { value: "500K+", label: "500K+" },
]

export default function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    email: "",
    name: "",
    handle: "",
    platform: "",
    niche: "",
    audienceSize: "",
    instagram: "",
    tiktok: "",
    youtube: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Waitlist submission:", form)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black px-3 py-20 lg:px-4">
        <div className="mx-auto max-w-2xl">
          <div className="block-hover rounded-2xl border-[3px] border-black bg-[#28D17C] p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-white">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="font-heading text-[2.5rem] leading-[0.85] tracking-[-0.03em] text-black" style={{ fontWeight: 900 }}>
              YOU'RE ON THE LIST!
            </h1>
            <p className="mt-4 text-[14px] font-medium text-black">
              Thanks for joining the CreatorStays creator waitlist. We'll be in touch soon with early access.
            </p>
            <button 
              onClick={() => { setSubmitted(false); setForm({ ...form, email: "" }) }}
              className="mt-6 inline-flex h-10 items-center rounded-full border-[3px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
            >
              Sign up another email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-3 pb-8 pt-20 lg:px-4">
      <div className="mx-auto max-w-5xl">
        
        {/* Hero Row */}
        <div className="grid gap-2 lg:grid-cols-[1.2fr_1fr]">
          {/* Left: Hero Block */}
          <div className="block-hover rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-6">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border-[2px] border-black bg-white px-3 py-1">
              <span className="text-sm">🔒</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-black">Invite Only Beta</span>
            </div>
            
            <h1 className="font-heading text-[2.5rem] leading-[0.85] tracking-[-0.03em] sm:text-[3.5rem] md:text-[4rem]" style={{ fontWeight: 900 }}>
              <span className="block text-black">CREATOR</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>WAITLIST</span>
            </h1>
            
            <p className="mt-4 max-w-md text-[14px] font-medium leading-snug text-black">
              Get paid to create content for vacation rentals. Join the waitlist for early access to CreatorStays.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/hosts"
                className="inline-flex h-10 items-center gap-2 rounded-full border-[3px] border-black bg-white px-5 text-[10px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
              >
                Hosts are live now →
              </Link>
            </div>
          </div>

          {/* Right: Image Block */}
          <ImageBlock src={pageImage} aspectRatio="aspect-[4/3]" />
        </div>

        {/* Form Section */}
        <div className="mt-2 grid gap-2 lg:grid-cols-[1fr_1.5fr]">
          {/* Left: Benefits */}
          <div className="space-y-2">
            <div className="block-hover rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
              <h2 className="font-heading text-[1.5rem] leading-[0.85] tracking-[-0.02em]" style={{ fontWeight: 900 }}>
                <span className="block text-black">HOW YOU</span>
                <span className="block text-black" style={{ fontWeight: 400 }}>EARN</span>
              </h2>
              <div className="mt-4 space-y-0 border-t-2 border-black">
                {[
                  { label: "Base rate", desc: "Per post payout" },
                  { label: "Traffic bonus", desc: "Based on clicks" },
                  { label: "Post-for-stay", desc: "Trade for lodging" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b-2 border-black py-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-black">{item.label}</span>
                    <span className="text-[10px] font-medium text-black">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="block-hover rounded-2xl border-[3px] border-black bg-white p-5">
              <p className="text-[11px] font-bold text-black">
                Join <span className="text-[#4AA3FF]">200+</span> creators on the waitlist
              </p>
              <p className="mt-2 text-[10px] text-black/60">
                We review applications and onboard in batches. Priority goes to travel, lifestyle, and hospitality niches.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="block-hover rounded-2xl border-[3px] border-black bg-white p-5 lg:p-6">
            <p className="text-[9px] font-black uppercase tracking-wider text-black">Join the waitlist</p>
            <h2 className="mt-1 font-heading text-[1.5rem] leading-[0.85] tracking-[-0.02em]" style={{ fontWeight: 900 }}>
              <span className="block text-black">APPLY FOR</span>
              <span className="block text-black" style={{ fontWeight: 400 }}>EARLY ACCESS</span>
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Name & Email */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-black">Name *</label>
                  <input
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-black">Email *</label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Platform & Niche */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-black">Primary Platform *</label>
                  <select
                    required
                    value={form.platform}
                    onChange={e => setForm({ ...form, platform: e.target.value })}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-[13px] font-medium text-black focus:outline-none"
                  >
                    <option value="">Select platform</option>
                    {platformOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-black">Content Niche *</label>
                  <select
                    required
                    value={form.niche}
                    onChange={e => setForm({ ...form, niche: e.target.value })}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-[13px] font-medium text-black focus:outline-none"
                  >
                    <option value="">Select niche</option>
                    {creatorNicheOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Audience & Handle */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-black">Audience Size *</label>
                  <select
                    required
                    value={form.audienceSize}
                    onChange={e => setForm({ ...form, audienceSize: e.target.value })}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-[13px] font-medium text-black focus:outline-none"
                  >
                    <option value="">Select size</option>
                    {audienceSizeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-black">Primary Handle</label>
                  <input
                    placeholder="@yourhandle"
                    value={form.handle}
                    onChange={e => setForm({ ...form, handle: e.target.value })}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-black">Social Links <span className="font-medium text-black/50">(optional)</span></label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    placeholder="Instagram URL"
                    value={form.instagram}
                    onChange={e => setForm({ ...form, instagram: e.target.value })}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-[12px] font-medium text-black placeholder:text-black/40 focus:outline-none"
                  />
                  <input
                    placeholder="TikTok URL"
                    value={form.tiktok}
                    onChange={e => setForm({ ...form, tiktok: e.target.value })}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-[12px] font-medium text-black placeholder:text-black/40 focus:outline-none"
                  />
                  <input
                    placeholder="YouTube URL"
                    value={form.youtube}
                    onChange={e => setForm({ ...form, youtube: e.target.value })}
                    className="w-full rounded-lg border-2 border-black px-3 py-2 text-[12px] font-medium text-black placeholder:text-black/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                className="w-full rounded-full border-[3px] border-black bg-black py-3 text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Join Creator Waitlist
              </button>
              <p className="text-center text-[10px] text-black/50">
                We'll never spam you. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>

        {/* Footer Marquee */}
        <div className="mt-2 overflow-hidden rounded-2xl border-[3px] border-black bg-[#D7B6FF] py-2">
          <div className="marquee-track flex whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4 font-heading text-[1.75rem] tracking-[-0.02em] text-black sm:text-[2.5rem]">
                CREATORSTAYS • CREATOR WAITLIST •
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
