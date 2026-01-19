import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

// Base URL for tracking links
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'

/**
 * Generate a unique, URL-safe token for affiliate links
 * Format: cs_[random 12 chars]
 */
function generateLinkToken(): string {
  return `cs_${nanoid(12)}`
}

/**
 * POST /api/affiliate-links
 * Create a new affiliate link when a collaboration is approved
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      creatorId,
      hostId,
      propertyId,
      collaborationId,
      destinationUrl,
      campaignName,
      attributionWindowDays = 30,
      expiresAt,
    } = body

    // Validate required fields
    if (!creatorId || !hostId || !destinationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: creatorId, hostId, destinationUrl' },
        { status: 400 }
      )
    }

    // Validate destination URL
    try {
      new URL(destinationUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid destination URL' },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = generateLinkToken()

    // Create the affiliate link
    const affiliateLink = await prisma.affiliateLink.create({
      data: {
        token,
        creatorId,
        hostId,
        propertyId: propertyId || null,
        campaignId: collaborationId || null,
        campaignName: campaignName || null,
        destinationUrl,
        attributionWindowDays,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
        clickCount: 0,
        uniqueClickCount: 0,
      },
    })

    // Build the tracking URL
    const trackingUrl = `${BASE_URL}/r/${token}`

    console.log('[CreatorStays] Affiliate link created:', {
      id: affiliateLink.id,
      token,
      creatorId,
      hostId,
      destinationUrl,
      trackingUrl,
    })

    return NextResponse.json({
      success: true,
      link: {
        id: affiliateLink.id,
        token: affiliateLink.token,
        trackingUrl,
        destinationUrl: affiliateLink.destinationUrl,
        creatorId: affiliateLink.creatorId,
        hostId: affiliateLink.hostId,
        propertyId: affiliateLink.propertyId,
        campaignName: affiliateLink.campaignName,
        attributionWindowDays: affiliateLink.attributionWindowDays,
        clickCount: affiliateLink.clickCount,
        uniqueClickCount: affiliateLink.uniqueClickCount,
        isActive: affiliateLink.isActive,
        createdAt: affiliateLink.createdAt,
        expiresAt: affiliateLink.expiresAt,
      },
    })
  } catch (error) {
    console.error('[CreatorStays] Error creating affiliate link:', error)
    return NextResponse.json(
      { error: 'Failed to create affiliate link' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/affiliate-links
 * List affiliate links for a creator or host
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get('creatorId')
    const hostId = searchParams.get('hostId')
    const linkId = searchParams.get('id')
    const token = searchParams.get('token')
    const includeClicks = searchParams.get('includeClicks') === 'true'

    // Single link by ID or token
    if (linkId || token) {
      const link = await prisma.affiliateLink.findFirst({
        where: linkId ? { id: linkId } : { token: token! },
        include: includeClicks ? {
          clicks: {
            orderBy: { createdAt: 'desc' },
            take: 100, // Limit for performance
          },
        } : undefined,
      })

      if (!link) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 })
      }

      return NextResponse.json({
        link: {
          ...link,
          trackingUrl: `${BASE_URL}/r/${link.token}`,
        },
      })
    }

    // List links for creator or host
    if (!creatorId && !hostId) {
      return NextResponse.json(
        { error: 'Provide creatorId, hostId, id, or token' },
        { status: 400 }
      )
    }

    const where: { creatorId?: string; hostId?: string } = {}
    if (creatorId) where.creatorId = creatorId
    if (hostId) where.hostId = hostId

    const links = await prisma.affiliateLink.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: includeClicks ? {
        clicks: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Limited clicks per link in list view
        },
      } : undefined,
    })

    // Calculate totals
    const totals = {
      totalLinks: links.length,
      activeLinks: links.filter(l => l.isActive).length,
      totalClicks: links.reduce((sum, l) => sum + l.clickCount, 0),
      totalUniqueClicks: links.reduce((sum, l) => sum + l.uniqueClickCount, 0),
    }

    return NextResponse.json({
      links: links.map(link => ({
        ...link,
        trackingUrl: `${BASE_URL}/r/${link.token}`,
      })),
      totals,
    })
  } catch (error) {
    console.error('[CreatorStays] Error fetching affiliate links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch affiliate links' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/affiliate-links
 * Update an affiliate link (activate/deactivate, update destination, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, token, ...updates } = body

    if (!id && !token) {
      return NextResponse.json(
        { error: 'Provide id or token' },
        { status: 400 }
      )
    }

    // Only allow certain fields to be updated
    const allowedUpdates: Partial<{
      isActive: boolean
      destinationUrl: string
      campaignName: string
      attributionWindowDays: number
      expiresAt: Date | null
    }> = {}

    if (typeof updates.isActive === 'boolean') {
      allowedUpdates.isActive = updates.isActive
    }
    if (updates.destinationUrl) {
      try {
        new URL(updates.destinationUrl)
        allowedUpdates.destinationUrl = updates.destinationUrl
      } catch {
        return NextResponse.json(
          { error: 'Invalid destination URL' },
          { status: 400 }
        )
      }
    }
    if (updates.campaignName !== undefined) {
      allowedUpdates.campaignName = updates.campaignName
    }
    if (updates.attributionWindowDays) {
      allowedUpdates.attributionWindowDays = updates.attributionWindowDays
    }
    if (updates.expiresAt !== undefined) {
      allowedUpdates.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null
    }

    const link = await prisma.affiliateLink.update({
      where: id ? { id } : { token },
      data: allowedUpdates,
    })

    return NextResponse.json({
      success: true,
      link: {
        ...link,
        trackingUrl: `${BASE_URL}/r/${link.token}`,
      },
    })
  } catch (error) {
    console.error('[CreatorStays] Error updating affiliate link:', error)
    return NextResponse.json(
      { error: 'Failed to update affiliate link' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/affiliate-links
 * Soft-delete (deactivate) an affiliate link
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const token = searchParams.get('token')
    const hardDelete = searchParams.get('hard') === 'true'

    if (!id && !token) {
      return NextResponse.json(
        { error: 'Provide id or token' },
        { status: 400 }
      )
    }

    if (hardDelete) {
      // Permanent delete (cascades to clicks)
      await prisma.affiliateLink.delete({
        where: id ? { id } : { token: token! },
      })

      return NextResponse.json({ success: true, deleted: true })
    } else {
      // Soft delete (deactivate)
      const link = await prisma.affiliateLink.update({
        where: id ? { id } : { token: token! },
        data: { isActive: false },
      })

      return NextResponse.json({
        success: true,
        deactivated: true,
        link: {
          ...link,
          trackingUrl: `${BASE_URL}/r/${link.token}`,
        },
      })
    }
  } catch (error) {
    console.error('[CreatorStays] Error deleting affiliate link:', error)
    return NextResponse.json(
      { error: 'Failed to delete affiliate link' },
      { status: 500 }
    )
  }
}
