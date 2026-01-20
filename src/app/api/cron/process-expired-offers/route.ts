import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  sendEmail, 
  offerExpiringSoonEmail, 
  offerExpiredToCreatorEmail, 
  offerExpiredToHostEmail 
} from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Cron job to process offer expirations
 * 
 * This endpoint should be called daily (e.g., via Vercel Cron or external service)
 * 
 * It handles:
 * 1. Sending warning emails 2 days before expiration
 * 2. Marking expired offers and sending notification emails
 * 
 * To set up in Vercel, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-expired-offers",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 * 
 * Or call manually/externally with the CRON_SECRET header for security
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
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

    const results = {
      warningsSent: 0,
      offersExpired: 0,
      errors: [] as string[],
    }

    // 1. Find offers expiring in ~2 days that haven't received a warning
    // We use a window to avoid sending multiple warnings
    const offersExpiringSoon = await prisma.offer.findMany({
      where: {
        status: 'pending',
        expiresAt: {
          gte: now,
          lte: twoDaysFromNow,
        },
        // We'll track warnings via a simple approach: 
        // check if expiration is within 48-72 hours (first warning window)
      },
      include: {
        creatorProfile: {
          include: { user: true },
        },
        hostProfile: true,
        property: true,
      },
    })

    // Filter to only those in the 48-72 hour window (first-time warnings)
    const offersNeedingWarning = offersExpiringSoon.filter(offer => {
      if (!offer.expiresAt) return false
      const hoursUntilExpiry = (offer.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
      // Send warning if between 44-52 hours (roughly 2 days, with buffer for daily cron)
      return hoursUntilExpiry >= 44 && hoursUntilExpiry <= 52
    })

    // Send warning emails
    for (const offer of offersNeedingWarning) {
      const creatorEmail = offer.creatorProfile.user?.email
      if (creatorEmail && offer.expiresAt) {
        try {
          const emailData = offerExpiringSoonEmail({
            creatorName: offer.creatorProfile.displayName,
            hostName: offer.hostProfile.displayName,
            propertyTitle: offer.property?.title || 'Property',
            propertyLocation: offer.property?.cityRegion || '',
            cashAmount: offer.cashCents,
            expiresAt: offer.expiresAt,
            offerId: offer.id,
          })

          await sendEmail({
            to: creatorEmail,
            ...emailData,
          })

          results.warningsSent++
        } catch (err) {
          results.errors.push(`Warning email failed for offer ${offer.id}: ${err}`)
        }
      }
    }

    // 2. Find and expire offers that have passed their expiration date
    const expiredOffers = await prisma.offer.findMany({
      where: {
        status: 'pending',
        expiresAt: {
          lt: now,
        },
      },
      include: {
        creatorProfile: {
          include: { user: true },
        },
        hostProfile: {
          include: { user: true },
        },
        property: true,
      },
    })

    // Update status and send notifications
    for (const offer of expiredOffers) {
      try {
        // Update offer status
        await prisma.offer.update({
          where: { id: offer.id },
          data: {
            status: 'expired',
            respondedAt: now,
          },
        })

        // Send email to creator
        const creatorEmail = offer.creatorProfile.user?.email
        if (creatorEmail) {
          const creatorEmailData = offerExpiredToCreatorEmail({
            creatorName: offer.creatorProfile.displayName,
            hostName: offer.hostProfile.displayName,
            propertyTitle: offer.property?.title || 'Property',
          })

          sendEmail({
            to: creatorEmail,
            ...creatorEmailData,
          }).catch(err => results.errors.push(`Creator email failed for offer ${offer.id}: ${err}`))
        }

        // Send email to host
        const hostEmail = offer.hostProfile.user?.email || offer.hostProfile.contactEmail
        if (hostEmail) {
          const hostEmailData = offerExpiredToHostEmail({
            hostName: offer.hostProfile.displayName,
            creatorName: offer.creatorProfile.displayName,
            creatorHandle: offer.creatorProfile.handle,
            propertyTitle: offer.property?.title || 'Property',
            offerId: offer.id,
          })

          sendEmail({
            to: hostEmail,
            ...hostEmailData,
          }).catch(err => results.errors.push(`Host email failed for offer ${offer.id}: ${err}`))
        }

        results.offersExpired++
      } catch (err) {
        results.errors.push(`Failed to expire offer ${offer.id}: ${err}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Offer expiration processing complete',
      results,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[Cron: Process Expired Offers] Error:', error)
    return NextResponse.json({ error: 'Failed to process expired offers' }, { status: 500 })
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}
