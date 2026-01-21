import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  sendEmail, 
  contentDeadlineWarningEmail, 
  contentDeadlinePassedToCreatorEmail, 
  contentDeadlinePassedToHostEmail 
} from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Cron job to process content deadline warnings and escalations
 * 
 * This endpoint should be called daily (e.g., via Vercel Cron)
 * 
 * It handles:
 * 1. Sending reminder emails 3 days before deadline
 * 2. Sending reminder emails 1 day before deadline
 * 3. Sending reminder emails on the day of deadline
 * 4. Updating status and sending notifications when deadline passes
 * 
 * We track which reminders have been sent using:
 * - deadline3DayWarningAt
 * - deadline1DayWarningAt
 * - deadlineDayOfWarningAt
 * - deadlinePassedAt
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional security layer)
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET
    
    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    
    // Calculate date boundaries (use start of day for cleaner comparisons)
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)
    
    const oneDayFromNow = new Date(todayStart)
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)
    
    const twoDaysFromNow = new Date(todayStart)
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    
    const threeDaysFromNow = new Date(todayStart)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    
    const fourDaysFromNow = new Date(todayStart)
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4)

    const results = {
      threeDay: { sent: 0, errors: [] as string[] },
      oneDay: { sent: 0, errors: [] as string[] },
      dayOf: { sent: 0, errors: [] as string[] },
      passed: { processed: 0, errors: [] as string[] },
    }

    // ==========================================================================
    // 1. THREE DAYS BEFORE - Send 3-day warning
    // ==========================================================================
    try {
      const collabs3Day = await prisma.collaboration.findMany({
        where: {
          status: 'active',
          contentDeadline: {
            gte: threeDaysFromNow,
            lt: fourDaysFromNow,
          },
          contentSubmittedAt: null,
          deadline3DayWarningAt: null, // Haven't sent this reminder yet
        },
        include: {
          creator: { include: { user: true } },
          host: { include: { user: true } },
          property: true,
        },
      })

      for (const collab of collabs3Day) {
        const creatorEmail = collab.creator.user?.email
        if (creatorEmail && collab.contentDeadline) {
          try {
            const emailData = contentDeadlineWarningEmail({
              creatorName: collab.creator.displayName,
              hostName: collab.host.displayName,
              propertyTitle: collab.property?.title || 'Property',
              deadline: collab.contentDeadline,
              daysLeft: 3,
              collaborationId: collab.id,
            })

            await sendEmail({ to: creatorEmail, ...emailData })

            await prisma.collaboration.update({
              where: { id: collab.id },
              data: { deadline3DayWarningAt: now },
            })

            results.threeDay.sent++
          } catch (err) {
            results.threeDay.errors.push(`Collab ${collab.id}: ${err}`)
          }
        }
      }
    } catch (e) {
      results.threeDay.errors.push(`Query error: ${e}`)
    }

    // ==========================================================================
    // 2. ONE DAY BEFORE - Send 1-day warning
    // ==========================================================================
    try {
      const collabs1Day = await prisma.collaboration.findMany({
        where: {
          status: 'active',
          contentDeadline: {
            gte: oneDayFromNow,
            lt: twoDaysFromNow,
          },
          contentSubmittedAt: null,
          deadline1DayWarningAt: null, // Haven't sent this reminder yet
        },
        include: {
          creator: { include: { user: true } },
          host: { include: { user: true } },
          property: true,
        },
      })

      for (const collab of collabs1Day) {
        const creatorEmail = collab.creator.user?.email
        if (creatorEmail && collab.contentDeadline) {
          try {
            const emailData = contentDeadlineWarningEmail({
              creatorName: collab.creator.displayName,
              hostName: collab.host.displayName,
              propertyTitle: collab.property?.title || 'Property',
              deadline: collab.contentDeadline,
              daysLeft: 1,
              collaborationId: collab.id,
            })

            await sendEmail({ to: creatorEmail, ...emailData })

            await prisma.collaboration.update({
              where: { id: collab.id },
              data: { deadline1DayWarningAt: now },
            })

            results.oneDay.sent++
          } catch (err) {
            results.oneDay.errors.push(`Collab ${collab.id}: ${err}`)
          }
        }
      }
    } catch (e) {
      results.oneDay.errors.push(`Query error: ${e}`)
    }

    // ==========================================================================
    // 3. DAY OF - Send day-of reminder (deadline is today)
    // ==========================================================================
    try {
      const collabsDayOf = await prisma.collaboration.findMany({
        where: {
          status: 'active',
          contentDeadline: {
            gte: todayStart,
            lte: todayEnd,
          },
          contentSubmittedAt: null,
          deadlineDayOfWarningAt: null, // Haven't sent this reminder yet
        },
        include: {
          creator: { include: { user: true } },
          host: { include: { user: true } },
          property: true,
        },
      })

      for (const collab of collabsDayOf) {
        const creatorEmail = collab.creator.user?.email
        if (creatorEmail && collab.contentDeadline) {
          try {
            // Special "TODAY" email with urgent subject
            const baseEmail = contentDeadlineWarningEmail({
              creatorName: collab.creator.displayName,
              hostName: collab.host.displayName,
              propertyTitle: collab.property?.title || 'Property',
              deadline: collab.contentDeadline,
              daysLeft: 0,
              collaborationId: collab.id,
            })

            await sendEmail({ 
              to: creatorEmail, 
              subject: `🚨 TODAY: Content due for ${collab.property?.title || 'your collaboration'}`,
              html: baseEmail.html,
              text: baseEmail.text,
            })

            await prisma.collaboration.update({
              where: { id: collab.id },
              data: { deadlineDayOfWarningAt: now },
            })

            results.dayOf.sent++
          } catch (err) {
            results.dayOf.errors.push(`Collab ${collab.id}: ${err}`)
          }
        }
      }
    } catch (e) {
      results.dayOf.errors.push(`Query error: ${e}`)
    }

    // ==========================================================================
    // 4. DEADLINE PASSED - Update status and notify both parties
    // ==========================================================================
    try {
      const collabsPassed = await prisma.collaboration.findMany({
        where: {
          status: 'active',
          contentDeadline: {
            lt: todayStart, // Deadline was before today
          },
          contentSubmittedAt: null,
          deadlinePassedAt: null, // Haven't processed this yet
        },
        include: {
          creator: { include: { user: true } },
          host: { include: { user: true } },
          property: true,
        },
      })

      for (const collab of collabsPassed) {
        try {
          // Update collaboration status
          await prisma.collaboration.update({
            where: { id: collab.id },
            data: {
              status: 'deadline-passed',
              deadlinePassedAt: now,
            },
          })

          // Email creator
          const creatorEmail = collab.creator.user?.email
          if (creatorEmail && collab.contentDeadline) {
            const creatorEmailData = contentDeadlinePassedToCreatorEmail({
              creatorName: collab.creator.displayName,
              hostName: collab.host.displayName,
              propertyTitle: collab.property?.title || 'Property',
              deadline: collab.contentDeadline,
              collaborationId: collab.id,
            })
            sendEmail({ to: creatorEmail, ...creatorEmailData }).catch(() => {})
          }

          // Email host
          const hostEmail = collab.host.user?.email || collab.host.contactEmail
          if (hostEmail && collab.contentDeadline) {
            const hostEmailData = contentDeadlinePassedToHostEmail({
              hostName: collab.host.displayName,
              creatorName: collab.creator.displayName,
              creatorHandle: collab.creator.handle,
              propertyTitle: collab.property?.title || 'Property',
              deadline: collab.contentDeadline,
              collaborationId: collab.id,
            })
            sendEmail({ to: hostEmail, ...hostEmailData }).catch(() => {})
          }

          results.passed.processed++
        } catch (err) {
          results.passed.errors.push(`Collab ${collab.id}: ${err}`)
        }
      }
    } catch (e) {
      results.passed.errors.push(`Query error: ${e}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Content deadline processing complete',
      results: {
        threeDayReminders: results.threeDay.sent,
        oneDayReminders: results.oneDay.sent,
        dayOfReminders: results.dayOf.sent,
        deadlinesPassed: results.passed.processed,
        errors: [
          ...results.threeDay.errors,
          ...results.oneDay.errors,
          ...results.dayOf.errors,
          ...results.passed.errors,
        ],
      },
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[Cron: Process Content Deadlines] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to process content deadlines',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}
