import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/hosts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/creators`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Legal pages
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic creator profile pages
  let creatorPages: MetadataRoute.Sitemap = []
  try {
    const creators = await prisma.creatorProfile.findMany({
      where: {
        isActive: true,
      },
      select: {
        handle: true,
        updatedAt: true,
      },
      orderBy: {
        totalFollowers: 'desc',
      },
      take: 1000, // Limit to top 1000 creators
    })

    creatorPages = creators.map((creator) => ({
      url: `${siteUrl}/c/${creator.handle}`,
      lastModified: creator.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error fetching creators for sitemap:', error)
  }

  // Dynamic property pages (if you have public property pages)
  let propertyPages: MetadataRoute.Sitemap = []
  try {
    const properties = await prisma.property.findMany({
      where: {
        isActive: true,
        isDraft: false,
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 500,
    })

    propertyPages = properties.map((property) => ({
      url: `${siteUrl}/properties/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error)
  }

  return [...staticPages, ...creatorPages, ...propertyPages]
}
