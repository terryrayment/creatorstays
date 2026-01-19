import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

/**
 * GET /api/tracking/analytics
 * Legacy endpoint - redirects to /api/analytics
 * 
 * Supports:
 * - linkId or token: Single link analytics
 * - creatorId: All links for a creator  
 * - hostId: All links for a host
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collaborationId = searchParams.get('collaborationId')
    const linkId = searchParams.get('linkId')
    const token = searchParams.get('token')
    const creatorId = searchParams.get('creatorId')
    const hostId = searchParams.get('hostId')
    const days = parseInt(searchParams.get('days') || '30', 10)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // If collaborationId provided, look up by campaignId
    if (collaborationId) {
      const link = await prisma.affiliateLink.findFirst({
        where: { campaignId: collaborationId },
        include: {
          clicks: {
            where: { createdAt: { gte: startDate } },
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!link) {
        return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
      }

      return NextResponse.json({
        collaboration: {
          id: collaborationId,
          linkId: link.id,
          token: link.token,
          creatorId: link.creatorId,
          hostId: link.hostId,
          propertyId: link.propertyId,
        },
        analytics: computeAnalytics(link),
      })
    }

    // Single link by ID or token
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

      return NextResponse.json({
        link: {
          id: link.id,
          token: link.token,
          creatorId: link.creatorId,
          hostId: link.hostId,
        },
        analytics: computeAnalytics(link),
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
      })

      const results = links.map(link => ({
        link: {
          id: link.id,
          token: link.token,
          hostId: link.hostId,
          propertyId: link.propertyId,
          campaignName: link.campaignName,
        },
        analytics: computeAnalytics(link),
      }))

      const totals = {
        totalLinks: links.length,
        activeLinks: links.filter(l => l.isActive).length,
        totalClicks: links.reduce((sum, l) => sum + l.clickCount, 0),
        totalUniqueClicks: links.reduce((sum, l) => sum + l.uniqueClickCount, 0),
      }

      return NextResponse.json({ links: results, totals })
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
      })

      const results = links.map(link => ({
        link: {
          id: link.id,
          token: link.token,
          creatorId: link.creatorId,
          propertyId: link.propertyId,
          campaignName: link.campaignName,
        },
        analytics: computeAnalytics(link),
      }))

      const totals = {
        totalLinks: links.length,
        activeLinks: links.filter(l => l.isActive).length,
        totalClicks: links.reduce((sum, l) => sum + l.clickCount, 0),
        totalUniqueClicks: links.reduce((sum, l) => sum + l.uniqueClickCount, 0),
      }

      return NextResponse.json({ links: results, totals })
    }

    return NextResponse.json(
      { error: 'Provide collaborationId, linkId, token, creatorId, or hostId' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[CreatorStays] Tracking analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

interface LinkWithClicks {
  clickCount: number
  uniqueClickCount: number
  clicks: Array<{
    createdAt: Date
    isUnique: boolean
    isRevisit: boolean
    referer: string | null
  }>
}

function computeAnalytics(link: LinkWithClicks) {
  const clicks = link.clicks

  // Group by day
  const clicksByDay: Record<string, number> = {}
  clicks.forEach(click => {
    const day = click.createdAt.toISOString().split('T')[0]
    clicksByDay[day] = (clicksByDay[day] || 0) + 1
  })

  // Group by referer
  const clicksBySource: Record<string, number> = {}
  clicks.forEach(click => {
    const source = parseSource(click.referer)
    clicksBySource[source] = (clicksBySource[source] || 0) + 1
  })

  const lastClick = clicks.length > 0 ? clicks[0].createdAt : undefined

  return {
    totalClicks: link.clickCount,
    uniqueClicks: link.uniqueClickCount,
    periodClicks: clicks.length,
    periodUniqueClicks: clicks.filter(c => c.isUnique).length,
    revisits: clicks.filter(c => c.isRevisit).length,
    clicksByDay: Object.entries(clicksByDay)
      .map(([date, count]) => ({ date, clicks: count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    clicksBySource: Object.entries(clicksBySource)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    lastClickAt: lastClick,
  }
}

function parseSource(referer: string | null): string {
  if (!referer) return 'Direct'
  try {
    const url = new URL(referer)
    const host = url.hostname.toLowerCase()
    if (host.includes('instagram')) return 'Instagram'
    if (host.includes('tiktok')) return 'TikTok'
    if (host.includes('youtube')) return 'YouTube'
    if (host.includes('twitter') || host.includes('x.com')) return 'Twitter/X'
    if (host.includes('facebook')) return 'Facebook'
    if (host.includes('google')) return 'Google'
    return host.replace('www.', '')
  } catch {
    return 'Other'
  }
}
