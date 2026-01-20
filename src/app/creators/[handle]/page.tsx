import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CreatorPublicProfile } from "@/components/creators/creator-public-profile"

export const dynamic = 'force-dynamic'

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

  return <CreatorPublicProfile creator={profileData} />
}
