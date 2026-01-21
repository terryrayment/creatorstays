import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * Admin Daily Digest
 * 
 * Sends a summary email to admin(s) with yesterday's activity:
 * - New signups (hosts & creators)
 * - New offers sent
 * - Offers accepted/declined/countered
 * - New collaborations started
 * - Collaborations completed
 * - Disputes filed
 * - Revenue processed
 * 
 * Set up in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/admin-daily-digest",
 *     "schedule": "0 8 * * *"  // 8 AM daily
 *   }]
 * }
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean)
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'

interface DigestStats {
  // Signups
  newHosts: number
  newCreators: number
  newWaitlist: number
  
  // Offers
  offersSent: number
  offersAccepted: number
  offersDeclined: number
  offersCountered: number
  offersExpired: number
  
  // Collaborations
  collaborationsStarted: number
  collaborationsCompleted: number
  collaborationsCancelled: number
  
  // Issues
  disputesFiled: number
  
  // Revenue
  totalRevenueCents: number
  paymentCount: number
  
  // Lists for details
  newHostsList: { name: string; email: string; location: string | null }[]
  newCreatorsList: { name: string; handle: string; followers: number }[]
  completedCollabs: { host: string; creator: string; amount: number }[]
  activeDisputes: { id: string; reason: string; status: string }[]
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET
    
    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin emails configured
    if (ADMIN_EMAILS.length === 0) {
      return NextResponse.json({ 
        error: 'No admin emails configured. Set ADMIN_EMAILS env var.',
        hint: 'ADMIN_EMAILS=you@example.com,team@example.com'
      }, { status: 400 })
    }

    // Calculate yesterday's date range (UTC)
    const now = new Date()
    const yesterdayStart = new Date(now)
    yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1)
    yesterdayStart.setUTCHours(0, 0, 0, 0)
    
    const yesterdayEnd = new Date(yesterdayStart)
    yesterdayEnd.setUTCHours(23, 59, 59, 999)

    const dateRange = {
      gte: yesterdayStart,
      lte: yesterdayEnd,
    }

    // Gather all stats
    const stats: DigestStats = {
      newHosts: 0,
      newCreators: 0,
      newWaitlist: 0,
      offersSent: 0,
      offersAccepted: 0,
      offersDeclined: 0,
      offersCountered: 0,
      offersExpired: 0,
      collaborationsStarted: 0,
      collaborationsCompleted: 0,
      collaborationsCancelled: 0,
      disputesFiled: 0,
      totalRevenueCents: 0,
      paymentCount: 0,
      newHostsList: [],
      newCreatorsList: [],
      completedCollabs: [],
      activeDisputes: [],
    }

    // 1. New Hosts
    const newHosts = await prisma.hostProfile.findMany({
      where: { createdAt: dateRange },
      include: { user: true },
    })
    stats.newHosts = newHosts.length
    stats.newHostsList = newHosts.map(h => ({
      name: h.displayName,
      email: h.user?.email || h.contactEmail || 'N/A',
      location: h.location,
    }))

    // 2. New Creators
    const newCreators = await prisma.creatorProfile.findMany({
      where: { createdAt: dateRange },
    })
    stats.newCreators = newCreators.length
    stats.newCreatorsList = newCreators.map(c => ({
      name: c.displayName,
      handle: c.handle,
      followers: c.totalFollowers || 0,
    }))

    // 3. New Waitlist
    stats.newWaitlist = await prisma.waitlistEntry.count({
      where: { createdAt: dateRange },
    })

    // 4. Offers sent
    stats.offersSent = await prisma.offer.count({
      where: { createdAt: dateRange },
    })

    // 5. Offers responded to
    const respondedOffers = await prisma.offer.findMany({
      where: { respondedAt: dateRange },
      select: { status: true },
    })
    
    for (const offer of respondedOffers) {
      if (offer.status === 'accepted') stats.offersAccepted++
      else if (offer.status === 'declined') stats.offersDeclined++
      else if (offer.status === 'countered') stats.offersCountered++
      else if (offer.status === 'expired') stats.offersExpired++
    }

    // 6. Collaborations started (created yesterday)
    stats.collaborationsStarted = await prisma.collaboration.count({
      where: { createdAt: dateRange },
    })

    // 7. Collaborations completed
    const completedCollabs = await prisma.collaboration.findMany({
      where: { 
        status: 'completed',
        updatedAt: dateRange,
      },
      include: {
        host: true,
        creator: true,
        offer: true,
      },
    })
    stats.collaborationsCompleted = completedCollabs.length
    stats.completedCollabs = completedCollabs.map(c => ({
      host: c.host.displayName,
      creator: c.creator.displayName,
      amount: c.offer.cashCents,
    }))

    // Calculate revenue from completed collabs
    for (const collab of completedCollabs) {
      if (collab.paymentStatus === 'completed' && collab.offer.cashCents > 0) {
        stats.totalRevenueCents += collab.offer.cashCents
        stats.paymentCount++
      }
    }

    // 8. Collaborations cancelled
    stats.collaborationsCancelled = await prisma.collaboration.count({
      where: { 
        status: 'cancelled',
        updatedAt: dateRange,
      },
    })

    // 9. Disputes filed
    const disputes = await prisma.dispute.findMany({
      where: { createdAt: dateRange },
      select: { id: true, reason: true, status: true },
    })
    stats.disputesFiled = disputes.length
    stats.activeDisputes = disputes.map(d => ({
      id: d.id,
      reason: d.reason?.substring(0, 50) + (d.reason && d.reason.length > 50 ? '...' : '') || 'No reason',
      status: d.status,
    }))

    // Generate email HTML
    const emailHtml = generateDigestEmail(stats, yesterdayStart)

    // Send to all admins
    const sendResults = await Promise.all(
      ADMIN_EMAILS.map(email => 
        sendEmail({
          to: email.trim(),
          subject: `📊 CreatorStays Daily Digest - ${formatDate(yesterdayStart)}`,
          html: emailHtml,
        })
      )
    )

    const successCount = sendResults.filter(r => r.success).length

    return NextResponse.json({
      success: true,
      message: `Daily digest sent to ${successCount}/${ADMIN_EMAILS.length} admins`,
      stats: {
        newHosts: stats.newHosts,
        newCreators: stats.newCreators,
        offersSent: stats.offersSent,
        collaborationsCompleted: stats.collaborationsCompleted,
        revenue: `$${(stats.totalRevenueCents / 100).toFixed(2)}`,
      },
      dateRange: {
        start: yesterdayStart.toISOString(),
        end: yesterdayEnd.toISOString(),
      },
    })

  } catch (error) {
    console.error('[Cron: Admin Daily Digest] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate daily digest',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function generateDigestEmail(stats: DigestStats, date: Date): string {
  const hasActivity = stats.newHosts > 0 || stats.newCreators > 0 || 
                      stats.offersSent > 0 || stats.collaborationsStarted > 0 ||
                      stats.collaborationsCompleted > 0 || stats.disputesFiled > 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
  
  <!-- Header -->
  <div style="background: #FFD84A; border: 3px solid #000; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #000;">
      📊 Daily Digest
    </h1>
    <p style="margin: 8px 0 0 0; color: #000; opacity: 0.7;">
      ${formatDate(date)}
    </p>
  </div>

  ${!hasActivity ? `
  <!-- No Activity -->
  <div style="background: #fff; border: 2px solid #e5e5e5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
    <p style="margin: 0; color: #666; font-size: 16px;">
      😴 Quiet day — no significant activity yesterday
    </p>
  </div>
  ` : ''}

  <!-- Key Metrics Grid -->
  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
    
    <!-- New Signups -->
    <div style="background: #fff; border: 2px solid #000; border-radius: 12px; padding: 16px;">
      <div style="font-size: 32px; font-weight: 900; color: #000;">
        ${stats.newHosts + stats.newCreators}
      </div>
      <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">
        New Signups
      </div>
      <div style="font-size: 11px; color: #999; margin-top: 4px;">
        ${stats.newHosts} hosts · ${stats.newCreators} creators
      </div>
    </div>

    <!-- Offers -->
    <div style="background: #fff; border: 2px solid #000; border-radius: 12px; padding: 16px;">
      <div style="font-size: 32px; font-weight: 900; color: #000;">
        ${stats.offersSent}
      </div>
      <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">
        Offers Sent
      </div>
      <div style="font-size: 11px; color: #999; margin-top: 4px;">
        ${stats.offersAccepted} accepted · ${stats.offersDeclined} declined
      </div>
    </div>

    <!-- Collaborations -->
    <div style="background: #fff; border: 2px solid #000; border-radius: 12px; padding: 16px;">
      <div style="font-size: 32px; font-weight: 900; color: #28D17C;">
        ${stats.collaborationsCompleted}
      </div>
      <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">
        Completed
      </div>
      <div style="font-size: 11px; color: #999; margin-top: 4px;">
        ${stats.collaborationsStarted} started · ${stats.collaborationsCancelled} cancelled
      </div>
    </div>

    <!-- Revenue -->
    <div style="background: ${stats.totalRevenueCents > 0 ? '#28D17C' : '#fff'}; border: 2px solid #000; border-radius: 12px; padding: 16px;">
      <div style="font-size: 32px; font-weight: 900; color: #000;">
        ${formatCurrency(stats.totalRevenueCents)}
      </div>
      <div style="font-size: 12px; color: ${stats.totalRevenueCents > 0 ? '#000' : '#666'}; text-transform: uppercase; letter-spacing: 0.5px;">
        Revenue
      </div>
      <div style="font-size: 11px; color: ${stats.totalRevenueCents > 0 ? 'rgba(0,0,0,0.6)' : '#999'}; margin-top: 4px;">
        ${stats.paymentCount} payment${stats.paymentCount !== 1 ? 's' : ''} processed
      </div>
    </div>

  </div>

  ${stats.disputesFiled > 0 ? `
  <!-- Disputes Alert -->
  <div style="background: #FEE2E2; border: 2px solid #EF4444; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <div style="font-weight: 700; color: #B91C1C; margin-bottom: 8px;">
      ⚠️ ${stats.disputesFiled} New Dispute${stats.disputesFiled !== 1 ? 's' : ''} Filed
    </div>
    ${stats.activeDisputes.map(d => `
    <div style="background: #fff; border-radius: 8px; padding: 8px 12px; margin-top: 8px; font-size: 13px;">
      <strong>${d.id.slice(0, 8)}...</strong>: ${d.reason}
    </div>
    `).join('')}
    <a href="${BASE_URL}/admin/disputes" style="display: inline-block; margin-top: 12px; color: #B91C1C; font-weight: 600; font-size: 13px;">
      Review in Admin →
    </a>
  </div>
  ` : ''}

  ${stats.newHostsList.length > 0 ? `
  <!-- New Hosts -->
  <div style="background: #fff; border: 2px solid #000; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #000;">
      🏠 New Hosts
    </h3>
    ${stats.newHostsList.slice(0, 5).map(h => `
    <div style="padding: 8px 0; border-top: 1px solid #eee;">
      <div style="font-weight: 600; color: #000;">${h.name}</div>
      <div style="font-size: 12px; color: #666;">${h.email}${h.location ? ` · ${h.location}` : ''}</div>
    </div>
    `).join('')}
    ${stats.newHostsList.length > 5 ? `
    <div style="font-size: 12px; color: #999; margin-top: 8px;">
      + ${stats.newHostsList.length - 5} more
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${stats.newCreatorsList.length > 0 ? `
  <!-- New Creators -->
  <div style="background: #fff; border: 2px solid #000; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #000;">
      ⭐ New Creators
    </h3>
    ${stats.newCreatorsList.slice(0, 5).map(c => `
    <div style="padding: 8px 0; border-top: 1px solid #eee;">
      <div style="font-weight: 600; color: #000;">${c.name}</div>
      <div style="font-size: 12px; color: #666;">@${c.handle} · ${c.followers.toLocaleString()} followers</div>
    </div>
    `).join('')}
    ${stats.newCreatorsList.length > 5 ? `
    <div style="font-size: 12px; color: #999; margin-top: 8px;">
      + ${stats.newCreatorsList.length - 5} more
    </div>
    ` : ''}
  </div>
  ` : ''}

  ${stats.completedCollabs.length > 0 ? `
  <!-- Completed Deals -->
  <div style="background: #fff; border: 2px solid #000; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #000;">
      ✅ Completed Deals
    </h3>
    ${stats.completedCollabs.slice(0, 5).map(c => `
    <div style="padding: 8px 0; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 13px; color: #000;">${c.host} → ${c.creator}</div>
      </div>
      <div style="font-weight: 700; color: #28D17C;">
        ${c.amount > 0 ? formatCurrency(c.amount) : 'Post-for-Stay'}
      </div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <!-- Waitlist -->
  ${stats.newWaitlist > 0 ? `
  <div style="background: #EDE9FE; border: 2px solid #8B5CF6; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <span style="font-weight: 700; color: #6D28D9;">
      📝 ${stats.newWaitlist} new waitlist signup${stats.newWaitlist !== 1 ? 's' : ''}
    </span>
  </div>
  ` : ''}

  <!-- Quick Actions -->
  <div style="background: #000; border-radius: 12px; padding: 20px; text-align: center;">
    <a href="${BASE_URL}/admin" style="display: inline-block; background: #FFD84A; color: #000; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px;">
      Open Admin Dashboard →
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
    <p style="margin: 0; font-size: 12px; color: #999;">
      CreatorStays Daily Digest · Sent at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
    </p>
    <p style="margin: 8px 0 0 0; font-size: 11px; color: #ccc;">
      To change recipients, update ADMIN_EMAILS in Vercel environment variables
    </p>
  </div>

</body>
</html>
  `
}
