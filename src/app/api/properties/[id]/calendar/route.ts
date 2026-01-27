import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchAndParseICal, getAvailablePeriods, BlockedPeriod, mergeAllBlocks } from '@/lib/ical'

export const dynamic = 'force-dynamic'

// Rate limiting: 1 manual sync per 10 minutes per property
const PROPERTY_RATE_LIMIT_MS = 10 * 60 * 1000 // 10 minutes
// Rate limiting: 10 manual syncs per hour per user
const USER_RATE_LIMIT_COUNT = 10
const USER_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// In-memory rate limit tracking (resets on deploy - acceptable for this use case)
const propertySyncTimes = new Map<string, number>()
const userSyncCounts = new Map<string, { count: number; windowStart: number }>()

function checkPropertyRateLimit(propertyId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const lastSync = propertySyncTimes.get(propertyId)
  const now = Date.now()
  
  if (lastSync && now - lastSync < PROPERTY_RATE_LIMIT_MS) {
    const retryAfterSeconds = Math.ceil((PROPERTY_RATE_LIMIT_MS - (now - lastSync)) / 1000)
    return { allowed: false, retryAfterSeconds }
  }
  
  return { allowed: true }
}

function checkUserRateLimit(userId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  const userLimit = userSyncCounts.get(userId)
  
  if (userLimit) {
    // Check if we're still in the window
    if (now - userLimit.windowStart < USER_RATE_LIMIT_WINDOW_MS) {
      if (userLimit.count >= USER_RATE_LIMIT_COUNT) {
        const retryAfterSeconds = Math.ceil((USER_RATE_LIMIT_WINDOW_MS - (now - userLimit.windowStart)) / 1000)
        return { allowed: false, retryAfterSeconds }
      }
    } else {
      // Window expired, reset
      userSyncCounts.set(userId, { count: 0, windowStart: now })
    }
  }
  
  return { allowed: true }
}

function recordSync(propertyId: string, userId: string): void {
  const now = Date.now()
  propertySyncTimes.set(propertyId, now)
  
  const userLimit = userSyncCounts.get(userId) || { count: 0, windowStart: now }
  if (now - userLimit.windowStart >= USER_RATE_LIMIT_WINDOW_MS) {
    userSyncCounts.set(userId, { count: 1, windowStart: now })
  } else {
    userSyncCounts.set(userId, { ...userLimit, count: userLimit.count + 1 })
  }
}

/**
 * GET /api/properties/[id]/calendar
 * Get calendar availability for a property (includes merged iCal + manual blocks)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        icalUrl: true,
        blockedDates: true,
        lastCalendarSync: true,
        lastCalendarSyncAt: true,
        lastCalendarSyncStatus: true,
        lastCalendarSyncError: true,
        manualBlocks: {
          orderBy: { startDate: 'asc' },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const icalBlocks = (property.blockedDates as unknown as BlockedPeriod[]) || []
    
    // Merge iCal blocks with manual blocks
    const { blockedDatesFromIcal, blockedDatesManual, blockedDatesMerged } = mergeAllBlocks(
      icalBlocks,
      property.manualBlocks
    )
    
    const availablePeriods = getAvailablePeriods(blockedDatesMerged, 3)

    return NextResponse.json({
      propertyId: property.id,
      title: property.title,
      hasCalendar: !!property.icalUrl,
      lastSync: property.lastCalendarSyncAt || property.lastCalendarSync,
      lastSyncStatus: property.lastCalendarSyncStatus,
      lastSyncError: property.lastCalendarSyncError,
      blockedDatesFromIcal,
      blockedDatesManual,
      blockedDatesMerged,
      blockedDates: blockedDatesMerged,
      availablePeriods,
    })
  } catch (error) {
    console.error('[Calendar GET] Error:', error)
    return NextResponse.json({ error: 'Failed to get calendar' }, { status: 500 })
  }
}

/**
 * POST /api/properties/[id]/calendar
 * Trigger a calendar sync for a property (owner only)
 * - Uses conditional requests (If-None-Match, If-Modified-Since)
 * - Rate limited: 1 per property per 10 min, 10 per user per hour
 * - Preserves last good data on failure
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limits
    const propertyLimit = checkPropertyRateLimit(params.id)
    if (!propertyLimit.allowed) {
      return NextResponse.json({ 
        error: `Rate limited. Try again in ${propertyLimit.retryAfterSeconds} seconds.`,
        rateLimited: true,
        retryAfterSeconds: propertyLimit.retryAfterSeconds,
      }, { status: 429 })
    }
    
    const userLimit = checkUserRateLimit(session.user.id)
    if (!userLimit.allowed) {
      return NextResponse.json({ 
        error: `Rate limited. You've reached the hourly sync limit. Try again in ${userLimit.retryAfterSeconds} seconds.`,
        rateLimited: true,
        retryAfterSeconds: userLimit.retryAfterSeconds,
      }, { status: 429 })
    }

    // Get property with all sync metadata
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        hostProfile: {
          select: { userId: true },
        },
        manualBlocks: {
          orderBy: { startDate: 'asc' },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.hostProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (!property.icalUrl) {
      return NextResponse.json({ error: 'No calendar URL configured' }, { status: 400 })
    }

    // Record the sync attempt (for rate limiting)
    recordSync(params.id, session.user.id)

    // Fetch with conditional request support
    console.log(`[Calendar Sync] Syncing calendar for property ${property.id}`)
    const result = await fetchAndParseICal(property.icalUrl, {
      etag: property.icalEtag,
      lastModified: property.icalLastModified,
    })

    const now = new Date()

    // Handle 304 Not Modified
    if (result.notModified) {
      console.log(`[Calendar Sync] 304 Not Modified for property ${property.id}`)
      
      await prisma.property.update({
        where: { id: property.id },
        data: {
          lastCalendarSync: now,
          lastCalendarSyncAt: now,
          lastCalendarSyncStatus: 'not_modified',
          lastCalendarSyncError: null,
        },
      })

      // Return existing data
      const existingBlocks = (property.blockedDates as unknown as BlockedPeriod[]) || []
      const { blockedDatesFromIcal, blockedDatesManual, blockedDatesMerged } = mergeAllBlocks(
        existingBlocks,
        property.manualBlocks
      )

      return NextResponse.json({
        success: true,
        notModified: true,
        message: 'Calendar unchanged since last sync',
        eventCount: existingBlocks.length,
        blockedDatesFromIcal,
        blockedDatesManual,
        blockedDatesMerged,
        blockedDates: blockedDatesMerged,
        availablePeriods: getAvailablePeriods(blockedDatesMerged, 3),
        lastSync: now.toISOString(),
      })
    }

    // Handle failure - DO NOT wipe existing data
    if (!result.success) {
      console.error(`[Calendar Sync] Failed for property ${property.id}:`, result.error)
      
      await prisma.property.update({
        where: { id: property.id },
        data: {
          lastCalendarSync: now,
          lastCalendarSyncAt: now,
          lastCalendarSyncStatus: 'failed',
          lastCalendarSyncError: result.error?.substring(0, 255),
          lastCalendarSyncDebug: result.debug as any,
        },
      })

      return NextResponse.json({ 
        error: result.error || 'Failed to sync calendar',
        success: false,
        lastSyncStatus: 'failed',
      }, { status: 400 })
    }

    // Log parsed events
    console.log(`[Calendar Sync] Raw events: ${result.rawEventCount}, Blocked periods: ${result.eventCount}`)
    result.blockedDates.forEach((period, i) => {
      console.log(`[Calendar Sync] Period ${i + 1}: ${period.start} to ${period.end} ${period.summary ? `(${period.summary})` : ''}`)
    })

    // Update property with new blocked dates AND caching metadata
    await prisma.property.update({
      where: { id: property.id },
      data: {
        blockedDates: result.blockedDates as any,
        lastCalendarSync: now,
        lastCalendarSyncAt: now,
        lastCalendarSyncStatus: 'ok',
        lastCalendarSyncError: null,
        lastCalendarSyncDebug: result.debug as any,
        icalEtag: result.etag,
        icalLastModified: result.lastModified,
      },
    })

    console.log(`[Calendar Sync] Success for property ${property.id}: ${result.eventCount} events`)

    // Merge with manual blocks
    const { blockedDatesFromIcal, blockedDatesManual, blockedDatesMerged } = mergeAllBlocks(
      result.blockedDates,
      property.manualBlocks
    )
    
    const availablePeriods = getAvailablePeriods(blockedDatesMerged, 3)

    return NextResponse.json({
      success: true,
      eventCount: result.eventCount,
      rawEventCount: result.rawEventCount,
      blockedDatesFromIcal,
      blockedDatesManual,
      blockedDatesMerged,
      blockedDates: blockedDatesMerged,
      availablePeriods,
      lastSync: now.toISOString(),
      lastSyncStatus: 'ok',
    })
  } catch (error) {
    console.error('[Calendar POST] Error:', error)
    return NextResponse.json({ error: 'Failed to sync calendar' }, { status: 500 })
  }
}

/**
 * PUT /api/properties/[id]/calendar
 * Update iCal URL for a property (owner only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { icalUrl } = body

    // Get property and verify ownership
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        hostProfile: {
          select: { userId: true },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.hostProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Validate URL format if provided
    if (icalUrl && !icalUrl.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid iCal URL format' }, { status: 400 })
    }

    // Update the iCal URL
    if (icalUrl) {
      // URL provided - just update the URL, sync will happen below
      await prisma.property.update({
        where: { id: property.id },
        data: {
          icalUrl: icalUrl,
        },
      })
    } else {
      // URL removed - clear everything
      await prisma.$executeRaw`UPDATE "properties" SET "icalUrl" = NULL, "blockedDates" = NULL, "lastCalendarSync" = NULL WHERE "id" = ${property.id}`
    }

    // If new URL provided, sync immediately
    if (icalUrl) {
      const result = await fetchAndParseICal(icalUrl)
      
      if (result.success) {
        await prisma.property.update({
          where: { id: property.id },
          data: {
            blockedDates: result.blockedDates as any,
            lastCalendarSync: new Date(),
          },
        })

        return NextResponse.json({
          success: true,
          synced: true,
          eventCount: result.eventCount,
          blockedDates: result.blockedDates,
        })
      } else {
        // URL saved but sync failed - return warning
        return NextResponse.json({
          success: true,
          synced: false,
          syncError: result.error,
          message: 'Calendar URL saved but initial sync failed. Will retry automatically.',
        })
      }
    }

    return NextResponse.json({ success: true, icalUrl: icalUrl || null })
  } catch (error) {
    console.error('[Calendar PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to update calendar' }, { status: 500 })
  }
}
