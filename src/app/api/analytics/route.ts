import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/analytics
 * 
 * Query params:
 * - linkId: Get analytics for a specific affiliate link
 * - creatorId: Get all link analytics for a creator
 * - hostId: Get all link analytics for a host
 * - days: Number of days to include (default 30)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')
    const token = searchParams.get('token')
    const creatorId = searchParams.get('creatorId')
    const hostId = searchParams.get('hostId')
    const days = parseInt(searchParams.get('days') || '30', 10)

    // Calculate start date for time-based queries
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Single link analytics (by ID or token)
    if (linkId || token) {
      const link = await prisma.affiliateLink.findFirst({
        where: linkId ? { id: linkId } : { token: token! },
        include: {
          clicks: {
            where: { createdAt: { gte: startDate } },
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!link) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 })
      }

      const analytics = computeLinkAnalytics(link, days)

      return NextResponse.json({
        link: {
          id: link.id,
          token: link.token,
          destinationUrl: link.destinationUrl,
          campaignName: link.campaignName,
          creatorId: link.creatorId,
          hostId: link.hostId,
          propertyId: link.propertyId,
          isActive: link.isActive,
          createdAt: link.createdAt,
        },
        analytics,
      })
    }

    // All links for a creator
    if (creatorId) {
      const links = await prisma.affiliateLink.findMany({
        where: { creatorId },
        include: {
          clicks: {
            where: { createdAt: { gte: startDate } },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const linkAnalytics = links.map(link => ({
        link: {
          id: link.id,
          token: link.token,
          destinationUrl: link.destinationUrl,
          campaignName: link.campaignName,
          hostId: link.hostId,
          propertyId: link.propertyId,
          isActive: link.isActive,
          createdAt: link.createdAt,
        },
        analytics: computeLinkAnalytics(link, days),
      }))

      const totals = computeTotals(links)

      return NextResponse.json({
        links: linkAnalytics,
        totals,
        period: { days, startDate, endDate: new Date() },
      })
    }

    // All links for a host
    if (hostId) {
      const links = await prisma.affiliateLink.findMany({
        where: { hostId },
        include: {
          clicks: {
            where: { createdAt: { gte: startDate } },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      const linkAnalytics = links.map(link => ({
        link: {
          id: link.id,
          token: link.token,
          destinationUrl: link.destinationUrl,
          campaignName: link.campaignName,
          creatorId: link.creatorId,
          propertyId: link.propertyId,
          isActive: link.isActive,
          createdAt: link.createdAt,
        },
        analytics: computeLinkAnalytics(link, days),
      }))

      const totals = computeTotals(links)

      return NextResponse.json({
        links: linkAnalytics,
        totals,
        period: { days, startDate, endDate: new Date() },
      })
    }

    return NextResponse.json(
      { error: 'Provide linkId, token, creatorId, or hostId' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[CreatorStays] Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

/**
 * Compute analytics for a single link
 */
function computeLinkAnalytics(
  link: {
    clickCount: number
    uniqueClickCount: number
    clicks: Array<{
      id: string
      createdAt: Date
      isUnique: boolean
      isRevisit: boolean
      referer: string | null
    }>
  },
  days: number
) {
  const clicks = link.clicks

  // Period stats (within the requested time window)
  const periodClicks = clicks.length
  const periodUniqueClicks = clicks.filter(c => c.isUnique).length
  const periodRevisits = clicks.filter(c => c.isRevisit).length

  // Group by day
  const clicksByDay: Record<string, { total: number; unique: number }> = {}
  clicks.forEach(click => {
    const day = click.createdAt.toISOString().split('T')[0]
    if (!clicksByDay[day]) {
      clicksByDay[day] = { total: 0, unique: 0 }
    }
    clicksByDay[day].total++
    if (click.isUnique) {
      clicksByDay[day].unique++
    }
  })

  // Fill in missing days with zeros
  const dailyData: Array<{ date: string; clicks: number; uniqueClicks: number }> = []
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    const dayData = clicksByDay[dateStr] || { total: 0, unique: 0 }
    dailyData.push({
      date: dateStr,
      clicks: dayData.total,
      uniqueClicks: dayData.unique,
    })
  }

  // Group by referer source
  const refererCounts: Record<string, number> = {}
  clicks.forEach(click => {
    const source = parseRefererSource(click.referer)
    refererCounts[source] = (refererCounts[source] || 0) + 1
  })

  const topSources = Object.entries(refererCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Last click
  const lastClickAt = clicks.length > 0 ? clicks[0].createdAt : null

  return {
    // All-time totals (from denormalized counters)
    allTime: {
      totalClicks: link.clickCount,
      uniqueClicks: link.uniqueClickCount,
    },
    // Period stats
    period: {
      days,
      totalClicks: periodClicks,
      uniqueClicks: periodUniqueClicks,
      revisits: periodRevisits,
    },
    // Daily breakdown
    daily: dailyData,
    // Top traffic sources
    topSources,
    // Last activity
    lastClickAt,
  }
}

/**
 * Compute aggregate totals across multiple links
 */
function computeTotals(
  links: Array<{
    clickCount: number
    uniqueClickCount: number
    isActive: boolean
    clicks: Array<{ isUnique: boolean }>
  }>
) {
  return {
    totalLinks: links.length,
    activeLinks: links.filter(l => l.isActive).length,
    allTime: {
      totalClicks: links.reduce((sum, l) => sum + l.clickCount, 0),
      uniqueClicks: links.reduce((sum, l) => sum + l.uniqueClickCount, 0),
    },
    period: {
      totalClicks: links.reduce((sum, l) => sum + l.clicks.length, 0),
      uniqueClicks: links.reduce(
        (sum, l) => sum + l.clicks.filter(c => c.isUnique).length,
        0
      ),
    },
  }
}

/**
 * Parse referer URL into a readable source name
 */
function parseRefererSource(referer: string | null): string {
  if (!referer) return 'Direct'

  try {
    const url = new URL(referer)
    const hostname = url.hostname.toLowerCase()

    // Social platforms
    if (hostname.includes('instagram')) return 'Instagram'
    if (hostname.includes('tiktok')) return 'TikTok'
    if (hostname.includes('youtube')) return 'YouTube'
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter/X'
    if (hostname.includes('facebook')) return 'Facebook'
    if (hostname.includes('pinterest')) return 'Pinterest'
    if (hostname.includes('linkedin')) return 'LinkedIn'
    if (hostname.includes('reddit')) return 'Reddit'

    // Search engines
    if (hostname.includes('google')) return 'Google'
    if (hostname.includes('bing')) return 'Bing'
    if (hostname.includes('duckduckgo')) return 'DuckDuckGo'

    // Link shorteners
    if (hostname.includes('linktr.ee')) return 'Linktree'
    if (hostname.includes('bit.ly')) return 'Bitly'

    // Return domain for other sources
    return hostname.replace('www.', '')
  } catch {
    return 'Other'
  }
}
