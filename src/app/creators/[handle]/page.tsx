import { notFound } from "next/navigation"
import { CreatorProfileView, type CreatorProfile } from "@/components/creators/creator-profile"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock data - replace with DB lookup later
const mockCreators: Record<string, CreatorProfile> = {
  "sample-travel": {
    handle: "sample-travel",
    displayName: "Sample Travel Creator",
    bio: "This is a sample profile showing how a travel content creator might appear on CreatorStays. Travel creators help vacation rentals tell their story through cinematic video and authentic storytelling.",
    location: "Los Angeles, CA",
    niches: ["Travel", "Lifestyle", "Adventure"],
    platforms: {
      instagram: "example",
      tiktok: "example",
      youtube: "example",
    },
    stats: {
      followers: null,
      engagementRate: null,
      avgViews: null,
    },
    dealPreferences: {
      types: ["percent", "flat", "post-for-stay"],
      minimumFlatFee: 500,
      minimumPercent: 10,
      openToGiftedStays: true,
    },
    mediaKitUrl: "#",
    pastCollabs: [],
    isSample: true,
  },
  "sample-photo": {
    handle: "sample-photo",
    displayName: "Sample Photography Creator",
    bio: "This is a sample profile showing how a photography creator might appear. Photography creators specialize in interiors and hospitality, creating scroll-stopping content that makes people want to book.",
    location: "Austin, TX",
    niches: ["Photography", "Interior Design", "Hospitality"],
    platforms: {
      instagram: "example",
      tiktok: "example",
    },
    stats: {
      followers: null,
      engagementRate: null,
      avgViews: null,
    },
    dealPreferences: {
      types: ["flat", "post-for-stay"],
      minimumFlatFee: 750,
      openToGiftedStays: true,
    },
    isSample: true,
  },
  "sample-vlog": {
    handle: "sample-vlog",
    displayName: "Sample Vlog Creator",
    bio: "This is a sample profile showing how a vlogging creator might appear. Vlog creators document unique accommodations and experiences, creating engaging day-in-the-life content that drives bookings.",
    location: "Miami, FL",
    niches: ["Travel", "Vlog", "Food & Hospitality"],
    platforms: {
      instagram: "example",
      youtube: "example",
      tiktok: "example",
    },
    stats: {
      followers: null,
      engagementRate: null,
      avgViews: null,
    },
    dealPreferences: {
      types: ["percent", "post-for-stay"],
      minimumPercent: 15,
      openToGiftedStays: false,
    },
    mediaKitUrl: "#",
    isSample: true,
  },
}

export function generateStaticParams() {
  return Object.keys(mockCreators).map((handle) => ({ handle }))
}

export default function CreatorProfilePage({
  params,
}: {
  params: { handle: string }
}) {
  const creator = mockCreators[params.handle.toLowerCase()]

  if (!creator) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold">Creator not found</h1>
          <p className="mt-2 text-muted-foreground">
            This creator profile doesn&apos;t exist or hasn&apos;t been set up yet.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/creators">Browse Creators</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/waitlist">Join as Creator</Link>
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  return <CreatorProfileView creator={creator} />
}
