import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchAndParseICal } from '@/lib/ical'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max for this job

// Cron job to sync all property calendars
// Should run every 6-12 hours
// Schedule configured in vercel.json: "0 0/6 * * *" (every 6 hours)

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel adds this header for cron jobs)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.log('[Calendar Cron] Unauthorized request')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('[Calendar Cron] Starting calendar sync job')

    // Get all properties with iCal URLs that haven't been synced in the last 6 hours
    // or have never been synced
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
    
    const properties = await prisma.property.findMany({
      where: {
        icalUrl: { not: null },
        isActive: true,
        OR: [
          { lastCalendarSync: null },
          { lastCalendarSync: { lt: sixHoursAgo } },
        ],
      },
      select: {
        id: true,
        title: true,
        icalUrl: true,
        lastCalendarSync: true,
      },
      // Limit to avoid timeout
      take: 50,
      orderBy: [
        { lastCalendarSync: 'asc' }, // Oldest first (null = oldest)
      ],
    })

    console.log(`[Calendar Cron] Found ${properties.length} properties to sync`)

    const results = {
      total: properties.length,
      success: 0,
      failed: 0,
      errors: [] as { propertyId: string; error: string }[],
    }

    // Process each property
    for (const property of properties) {
      if (!property.icalUrl) continue

      try {
        console.log(`[Calendar Cron] Syncing property ${property.id}: ${property.title}`)
        
        const result = await fetchAndParseICal(property.icalUrl)

        if (result.success) {
          await prisma.property.update({
            where: { id: property.id },
            data: {
              blockedDates: result.blockedDates,
              lastCalendarSync: new Date(),
            },
          })
          
          results.success++
          console.log(`[Calendar Cron] Success for ${property.id}: ${result.eventCount} events`)
        } else {
          results.failed++
          results.errors.push({
            propertyId: property.id,
            error: result.error || 'Unknown error',
          })
          console.error(`[Calendar Cron] Failed for ${property.id}: ${result.error}`)
        }

        // Small delay to be nice to calendar servers
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        results.failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push({
          propertyId: property.id,
          error: errorMessage,
        })
        console.error(`[Calendar Cron] Error for ${property.id}:`, error)
      }
    }

    console.log(`[Calendar Cron] Completed: ${results.success} success, ${results.failed} failed`)

    return NextResponse.json({
      success: true,
      message: `Synced ${results.success}/${results.total} calendars`,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Calendar Cron] Job failed:', error)
    return NextResponse.json(
      { error: 'Calendar sync job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
