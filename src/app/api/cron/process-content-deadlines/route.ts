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
 * 1. Sending warning emails 3 days before deadline
 * 2. Updating status and sending notifications when deadline passes
 * 
 * To set up in Vercel, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-content-deadlines",
 *     "schedule": "0 10 * * *"
 *   }]
 * }
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
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    const results = {
      warningsSent: 0,
      deadlinesPassed: 0,
      errors: [] as string[],
    }

    // ==========================================================================
    // 1. Find collaborations with deadlines approaching (3 days out)
    // ==========================================================================
    // Look for active collaborations where deadline is within 3-4 days
    // and we haven't already sent a warning (tracked via deadlineWarningAt field)
    const collaborationsNearingDeadline = await prisma.collaboration.findMany({
      where: {
        status: 'active',
        contentDeadline: {
          gte: now,
          lte: threeDaysFromNow,
        },
        contentSubmittedAt: null, // Haven't submitted yet
        deadlineWarningAt: null, // Haven't sent warning yet
      },
      include: {
        creator: {
          include: { user: true },
        },
        host: {
          include: { user: true },
        },
        property: true,
      },
    })

    // Send warning emails
    for (const collab of collaborationsNearingDeadline) {
      const creatorEmail = collab.creator.user?.email
      if (creatorEmail && collab.contentDeadline) {
        const daysLeft = Math.ceil(
          (collab.contentDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        try {
          const emailData = contentDeadlineWarningEmail({
            creatorName: collab.creator.displayName,
            hostName: collab.host.displayName,
            propertyTitle: collab.property.title || 'Property',
            deadline: collab.contentDeadline,
            daysLeft,
            collaborationId: collab.id,
          })

          await sendEmail({
            to: creatorEmail,
            ...emailData,
          })

          // Mark warning as sent
          await prisma.collaboration.update({
            where: { id: collab.id },
            data: { deadlineWarningAt: now },
          })

          results.warningsSent++
        } catch (err) {
          results.errors.push(`Warning email failed for collab ${collab.id}: ${err}`)
        }
      }
    }

    // ==========================================================================
    // 2. Find collaborations where deadline has passed
    // ==========================================================================
    const collaborationsPastDeadline = await prisma.collaboration.findMany({
      where: {
        status: 'active',
        contentDeadline: {
          lt: now,
        },
        contentSubmittedAt: null, // Still haven't submitted
        deadlinePassedAt: null, // Haven't processed this yet
      },
      include: {
        creator: {
          include: { user: true },
        },
        host: {
          include: { user: true },
        },
        property: true,
      },
    })

    // Update status and send notifications
    for (const collab of collaborationsPastDeadline) {
      try {
        // Update collaboration to mark deadline as passed
        await prisma.collaboration.update({
          where: { id: collab.id },
          data: {
            status: 'deadline-passed',
            deadlinePassedAt: now,
          },
        })

        // Send email to creator
        const creatorEmail = collab.creator.user?.email
        if (creatorEmail && collab.contentDeadline) {
          const creatorEmailData = contentDeadlinePassedToCreatorEmail({
            creatorName: collab.creator.displayName,
            hostName: collab.host.displayName,
            propertyTitle: collab.property.title || 'Property',
            deadline: collab.contentDeadline,
            collaborationId: collab.id,
          })

          sendEmail({
            to: creatorEmail,
            ...creatorEmailData,
          }).catch(err => results.errors.push(`Creator email failed for collab ${collab.id}: ${err}`))
        }

        // Send email to host
        const hostEmail = collab.host.user?.email || collab.host.contactEmail
        if (hostEmail && collab.contentDeadline) {
          const hostEmailData = contentDeadlinePassedToHostEmail({
            hostName: collab.host.displayName,
            creatorName: collab.creator.displayName,
            creatorHandle: collab.creator.handle,
            propertyTitle: collab.property.title || 'Property',
            deadline: collab.contentDeadline,
            collaborationId: collab.id,
          })

          sendEmail({
            to: hostEmail,
            ...hostEmailData,
          }).catch(err => results.errors.push(`Host email failed for collab ${collab.id}: ${err}`))
        }

        results.deadlinesPassed++
      } catch (err) {
        results.errors.push(`Failed to process deadline for collab ${collab.id}: ${err}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Content deadline processing complete',
      results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[Cron: Process Content Deadlines] Error:', error)
    return NextResponse.json({ error: 'Failed to process content deadlines' }, { status: 500 })
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}
