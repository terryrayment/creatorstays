"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import Link from "next/link"

const platformOptions = [
  { value: "", label: "All Platforms" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
]

const nicheOptions = [
  { value: "", label: "All Niches" },
  { value: "travel", label: "Travel" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "photography", label: "Photography" },
  { value: "food", label: "Food & Hospitality" },
  { value: "adventure", label: "Adventure" },
  { value: "luxury", label: "Luxury" },
]

const mockCreators = [
  { handle: "wanderlust_amy", name: "Amy Chen", niches: ["Travel", "Lifestyle"], platform: "Instagram", location: "Los Angeles, CA", followers: "125K" },
  { handle: "photo_marcus", name: "Marcus Webb", niches: ["Photography", "Adventure"], platform: "YouTube", location: "Denver, CO", followers: "89K" },
  { handle: "cozy_interiors", name: "Sarah Park", niches: ["Lifestyle"], platform: "Instagram", location: "Austin, TX", followers: "67K" },
]

export default function CreatorsPage() {
  const [platform, setPlatform] = useState("")
  const [niche, setNiche] = useState("")
  const [locationInput, setLocationInput] = useState("")
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error")
      return
    }
    setLocationStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLocationStatus("success")
        setLocationInput("")
      },
      () => {
        setLocationStatus("error")
      }
    )
  }

  const handleLocationInputChange = (value: string) => {
    setLocationInput(value)
    if (value) {
      setLocationStatus("idle")
      setCoords(null)
    }
  }

  return (
    <div className="min-h-screen">
      <Container className="py-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-normal tracking-tight md:text-4xl">
            Creator Directory
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find creators who match your property and audience.
          </p>
        </div>

        {/* Filter row */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          {/* Platform filter */}
          <div className="w-40">
            <Select
              options={platformOptions}
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />
          </div>

          {/* Niche filter */}
          <div className="w-40">
            <Select
              options={nicheOptions}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>

          {/* Location control */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGetLocation}
              disabled={locationStatus === "loading"}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-all ${
                locationStatus === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-foreground/10 bg-white/70 text-muted-foreground hover:border-foreground/20 hover:bg-white/80"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {locationStatus === "loading" && "Locating…"}
              {locationStatus === "success" && "Near me"}
              {locationStatus === "idle" && "Location"}
              {locationStatus === "error" && "Location"}
            </button>
            {locationStatus === "error" && (
              <span className="text-xs text-red-500">Unavailable</span>
            )}
            <span className="text-xs text-muted-foreground">or</span>
            <Input
              placeholder="City / Region"
              value={locationInput}
              onChange={(e) => handleLocationInputChange(e.target.value)}
              className="w-36 text-sm"
            />
          </div>
        </div>

        {/* Creator grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockCreators.map((creator) => (
            <Link
              key={creator.handle}
              href={`/creators/${creator.handle}`}
              className="surface-card group relative rounded-xl p-5 transition-all"
            >
              <div className="surface-card-glow" aria-hidden="true" />
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
                    {creator.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight">{creator.name}</h3>
                    <p className="text-sm text-muted-foreground">@{creator.handle}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {creator.niches.map((n) => (
                    <span key={n} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {n}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{creator.platform}</span>
                  <span>{creator.followers} followers</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground/70">
                  {creator.location}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state hint */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            More creators coming soon. <Link href="/waitlist" className="text-primary hover:underline">Join the creator waitlist</Link>
          </p>
        </div>
      </Container>
    </div>
  )
}
