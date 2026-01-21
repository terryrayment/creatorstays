import { notFound } from "next/navigation"
import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { CreatorPublicProfile } from "@/components/creators/creator-public-profile"

export const dynamic = 'force-dynamic'

// Generate dynamic metadata for each creator
export async function generateMetadata({
  params,
}: {
  params: { handle: string }
}): Promise<Metadata> {
  const creator = await prisma.creatorProfile.findUnique({
    where: { handle: params.handle.toLowerCase() },
    select: {
      displayName: true,
      handle: true,
      bio: true,
      location: true,
      avatarUrl: true,
      niches: true,
      totalFollowers: true,
    },
  })

  if (!creator) {
    return {
      title: "Creator Not Found",
    }
  }

  const followerText = creator.totalFollowers 
    ? `${(creator.totalFollowers / 1000).toFixed(0)}K followers` 
    : ""
  
  const nichesText = creator.niches?.slice(0, 3).join(", ") || "Travel"
  
  const description = creator.bio 
    ? creator.bio.substring(0, 155) + (creator.bio.length > 155 ? "..." : "")
    : `${creator.displayName} is a ${nichesText} content creator${creator.location ? ` based in ${creator.location}` : ""}${followerText ? ` with ${followerText}` : ""}. View their portfolio and collaborate on CreatorStays.`

  return {
    title: `${creator.displayName} (@${creator.handle}) - Travel Creator`,
    description,
    openGraph: {
      title: `${creator.displayName} (@${creator.handle}) | CreatorStays`,
      description,
      images: creator.avatarUrl ? [creator.avatarUrl] : ["/og-creator-default.png"],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${creator.displayName} (@${creator.handle})`,
      description,
      images: creator.avatarUrl ? [creator.avatarUrl] : undefined,
    },
    alternates: {
      canonical: `/creators/${creator.handle}`,
    },
  }
}

export default async function CreatorProfilePage({
  params,
}: {
  params: { handle: string }
}) {
  // Fetch creator from database
  const creator = await prisma.creatorProfile.findUnique({
    where: { handle: params.handle.toLowerCase() },
    include: {
      user: {
        select: {
          image: true,
        },
      },
      collaborations: {
        where: { status: 'completed' },
        select: {
          id: true,
          property: {
            select: {
              title: true,
              cityRegion: true,
            },
          },
        },
        take: 5,
      },
    },
  })

  if (!creator) {
    notFound()
  }

  // Format data for the component
  const profileData = {
    id: creator.id,
    handle: creator.handle,
    displayName: creator.displayName,
    bio: creator.bio,
    location: creator.location,
    avatarUrl: creator.avatarUrl || creator.user.image,
    niches: creator.niches,
    platforms: {
      instagram: creator.instagramHandle,
      tiktok: creator.tiktokHandle,
      youtube: creator.youtubeHandle,
    },
    stats: {
      followers: creator.totalFollowers,
      engagementRate: creator.engagementRate,
    },
    dealPreferences: {
      baseRate: creator.minimumFlatFee,
      openToGiftedStays: creator.openToGiftedStays,
    },
    deliverables: creator.deliverables,
    pastCollabs: creator.collaborations.map(c => ({
      id: c.id,
      propertyTitle: c.property.title || 'Property',
      location: c.property.cityRegion || '',
    })),
    portfolioUrls: creator.mediaKitUrl ? [creator.mediaKitUrl] : [],
  }

  // JSON-LD Person schema
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: creator.displayName,
    alternateName: `@${creator.handle}`,
    description: creator.bio || `${creator.displayName} is a travel content creator on CreatorStays.`,
    image: creator.avatarUrl || creator.user.image,
    url: `https://creatorstays.com/creators/${creator.handle}`,
    ...(creator.location && { address: { "@type": "PostalAddress", addressLocality: creator.location } }),
    sameAs: [
      creator.instagramHandle && `https://instagram.com/${creator.instagramHandle}`,
      creator.tiktokHandle && `https://tiktok.com/@${creator.tiktokHandle}`,
      creator.youtubeHandle && `https://youtube.com/@${creator.youtubeHandle}`,
    ].filter(Boolean),
    jobTitle: "Content Creator",
    knowsAbout: creator.niches || ["Travel", "Content Creation"],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <CreatorPublicProfile creator={profileData} />
    </>
  )
}
