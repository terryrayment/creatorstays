import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// Base URL for tracking links
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'

/**
 * Generate a unique, URL-safe token for affiliate links
 * Format: cs_[random 12 chars]
 */
export function generateLinkToken(): string {
  return `cs_${nanoid(12)}`
}

/**
 * Build the full tracking URL from a token
 */
export function buildTrackingUrl(token: string): string {
  return `${BASE_URL}/r/${token}`
}

/**
 * Parameters for creating an affiliate link
 */
export interface CreateAffiliateLinkParams {
  creatorId: string
  hostId: string
  propertyId?: string
  collaborationId?: string
  destinationUrl: string
  campaignName?: string
  attributionWindowDays?: number
  expiresAt?: Date
}

/**
 * Create a new affiliate link
 * Call this when a collaboration is approved
 */
export async function createAffiliateLink(params: CreateAffiliateLinkParams) {
  const {
    creatorId,
    hostId,
    propertyId,
    collaborationId,
    destinationUrl,
    campaignName,
    attributionWindowDays = 30,
    expiresAt,
  } = params

  const token = generateLinkToken()

  const link = await prisma.affiliateLink.create({
    data: {
      token,
      creatorId,
      hostId,
      propertyId: propertyId || null,
      campaignId: collaborationId || null,
      campaignName: campaignName || null,
      destinationUrl,
      attributionWindowDays,
      expiresAt: expiresAt || null,
      isActive: true,
      clickCount: 0,
      uniqueClickCount: 0,
    },
  })

  return {
    ...link,
    trackingUrl: buildTrackingUrl(link.token),
  }
}

/**
 * Get affiliate link by token
 */
export async function getAffiliateLinkByToken(token: string) {
  const link = await prisma.affiliateLink.findUnique({
    where: { token },
  })

  if (!link) return null

  return {
    ...link,
    trackingUrl: buildTrackingUrl(link.token),
  }
}

/**
 * Get all affiliate links for a creator
 */
export async function getCreatorAffiliateLinks(creatorId: string) {
  const links = await prisma.affiliateLink.findMany({
    where: { creatorId },
    orderBy: { createdAt: 'desc' },
  })

  return links.map(link => ({
    ...link,
    trackingUrl: buildTrackingUrl(link.token),
  }))
}

/**
 * Get all affiliate links for a host
 */
export async function getHostAffiliateLinks(hostId: string) {
  const links = await prisma.affiliateLink.findMany({
    where: { hostId },
    orderBy: { createdAt: 'desc' },
  })

  return links.map(link => ({
    ...link,
    trackingUrl: buildTrackingUrl(link.token),
  }))
}

/**
 * Deactivate an affiliate link (soft delete)
 */
export async function deactivateAffiliateLink(token: string) {
  return prisma.affiliateLink.update({
    where: { token },
    data: { isActive: false },
  })
}

/**
 * Get click analytics for a link
 */
export async function getLinkAnalytics(linkId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const link = await prisma.affiliateLink.findUnique({
    where: { id: linkId },
    include: {
      clicks: {
        where: {
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!link) return null

  // Group clicks by day
  const clicksByDay: Record<string, number> = {}
  const uniqueClicksByDay: Record<string, number> = {}
  
  link.clicks.forEach(click => {
    const day = click.createdAt.toISOString().split('T')[0]
    clicksByDay[day] = (clicksByDay[day] || 0) + 1
    if (click.isUnique) {
      uniqueClicksByDay[day] = (uniqueClicksByDay[day] || 0) + 1
    }
  })

  // Calculate stats
  const uniqueClicks = link.clicks.filter(c => c.isUnique).length
  const revisits = link.clicks.filter(c => c.isRevisit).length

  return {
    linkId: link.id,
    token: link.token,
    trackingUrl: buildTrackingUrl(link.token),
    destinationUrl: link.destinationUrl,
    
    // All-time stats (from denormalized counters)
    totalClicks: link.clickCount,
    totalUniqueClicks: link.uniqueClickCount,
    
    // Period stats
    periodDays: days,
    periodClicks: link.clicks.length,
    periodUniqueClicks: uniqueClicks,
    periodRevisits: revisits,
    
    // Daily breakdown
    clicksByDay: Object.entries(clicksByDay)
      .map(([date, clicks]) => ({ date, clicks, uniqueClicks: uniqueClicksByDay[date] || 0 }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    
    // Recent clicks (for activity feed)
    recentClicks: link.clicks.slice(0, 20).map(c => ({
      id: c.id,
      createdAt: c.createdAt,
      isUnique: c.isUnique,
      isRevisit: c.isRevisit,
      referer: c.referer,
    })),
  }
}

/**
 * Check if a link has reached a click threshold
 * Used for bonus triggers
 */
export async function checkBonusThreshold(
  linkId: string, 
  threshold: number
): Promise<{ reached: boolean; currentClicks: number; remaining: number }> {
  const link = await prisma.affiliateLink.findUnique({
    where: { id: linkId },
    select: { uniqueClickCount: true },
  })

  if (!link) {
    return { reached: false, currentClicks: 0, remaining: threshold }
  }

  const reached = link.uniqueClickCount >= threshold
  const remaining = Math.max(0, threshold - link.uniqueClickCount)

  return {
    reached,
    currentClicks: link.uniqueClickCount,
    remaining,
  }
}

/**
 * Batch check multiple links for bonus thresholds
 * Efficient for cron jobs checking many collaborations
 */
export async function batchCheckBonusThresholds(
  checks: Array<{ linkId: string; threshold: number }>
): Promise<Array<{ linkId: string; reached: boolean; currentClicks: number }>> {
  const linkIds = checks.map(c => c.linkId)
  
  const links = await prisma.affiliateLink.findMany({
    where: { id: { in: linkIds } },
    select: { id: true, uniqueClickCount: true },
  })

  const linkMap = new Map(links.map(l => [l.id, l.uniqueClickCount]))

  return checks.map(check => {
    const currentClicks = linkMap.get(check.linkId) || 0
    return {
      linkId: check.linkId,
      reached: currentClicks >= check.threshold,
      currentClicks,
    }
  })
}
