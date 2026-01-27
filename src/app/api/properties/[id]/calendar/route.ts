import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetchAndParseICal, getAvailablePeriods, BlockedPeriod, mergeAllBlocks } from '@/lib/ical'

export const dynamic = 'force-dynamic'

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
      lastSync: property.lastCalendarSync,
      blockedDatesFromIcal,
      blockedDatesManual,
      blockedDatesMerged,
      // Keep legacy field for backwards compatibility
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

    // Get property and verify ownership (include manual blocks)
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

    // Fetch and parse the calendar
    console.log(`[Calendar Sync] Syncing calendar for property ${property.id}`)
    const result = await fetchAndParseICal(property.icalUrl)

    if (!result.success) {
      console.error(`[Calendar Sync] Failed for property ${property.id}:`, result.error)
      return NextResponse.json({ 
        error: result.error || 'Failed to sync calendar',
        success: false,
      }, { status: 400 })
    }

    // Log all blocked periods for debugging
    console.log(`[Calendar Sync] Raw events: ${result.rawEventCount}, Blocked periods: ${result.eventCount}`)
    result.blockedDates.forEach((period, i) => {
      console.log(`[Calendar Sync] Period ${i + 1}: ${period.start} to ${period.end} ${period.summary ? `(${period.summary})` : ''}`)
    })

    // Update property with new blocked dates
    await prisma.property.update({
      where: { id: property.id },
      data: {
        blockedDates: result.blockedDates as any,
        lastCalendarSync: new Date(),
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
      blockedDatesFromIcal,
      blockedDatesManual,
      blockedDatesMerged,
      // Keep legacy field for backwards compatibility
      blockedDates: blockedDatesMerged,
      availablePeriods,
      lastSync: new Date().toISOString(),
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
