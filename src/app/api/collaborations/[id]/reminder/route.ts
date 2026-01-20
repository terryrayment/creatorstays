import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/collaborations/[id]/reminder - Send reminder to creator (host only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: {
        host: true,
        creator: { include: { user: true } },
        property: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify user is the host
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile || hostProfile.id !== collaboration.hostId) {
      return NextResponse.json({ error: 'Only the host can send reminders' }, { status: 403 })
    }

    // Check collaboration status - only allow reminders for active collaborations waiting for content
    if (collaboration.status !== 'active' && collaboration.status !== 'deadline-passed') {
      return NextResponse.json({ 
        error: 'Can only send reminders for active collaborations awaiting content' 
      }, { status: 400 })
    }

    // Rate limit: Check if reminder was sent in last 24 hours
    // We'll use paymentNotes field to track last reminder (simple approach)
    const lastReminderMatch = collaboration.paymentNotes?.match(/Last reminder sent: (.+)/)
    if (lastReminderMatch) {
      const lastReminderDate = new Date(lastReminderMatch[1])
      const hoursSinceLastReminder = (Date.now() - lastReminderDate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLastReminder < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastReminder)
        return NextResponse.json({ 
          error: `You can send another reminder in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}` 
        }, { status: 429 })
      }
    }

    // Send reminder email to creator
    const creatorEmail = collaboration.creator.user?.email
    if (!creatorEmail) {
      return NextResponse.json({ error: 'Creator email not found' }, { status: 400 })
    }

    const daysLeft = collaboration.contentDeadline 
      ? Math.ceil((new Date(collaboration.contentDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    const deadlineText = daysLeft !== null
      ? daysLeft > 0 
        ? `You have ${daysLeft} day${daysLeft > 1 ? 's' : ''} left until the deadline.`
        : 'The deadline has passed. Please submit as soon as possible.'
      : 'Please submit your content when ready.'

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #f0f0f0;">
  <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="background: #000; padding: 24px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'}" style="color: #fff; font-size: 24px; font-weight: 900; text-decoration: none;">CreatorStays</a>
    </div>
    <div style="padding: 32px 24px; background: #fff;">
      <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Friendly Reminder 👋</h1>
      <p style="color: #666; margin: 0 0 24px;">Hi ${collaboration.creator.displayName},</p>
      
      <p style="margin: 0 0 16px;">
        <strong>${collaboration.host.displayName}</strong> is looking forward to seeing your content for 
        <strong>${collaboration.property.title || 'their property'}</strong>.
      </p>
      
      <div style="background: #FFD84A; border: 2px solid #000; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; font-weight: 700;">${deadlineText}</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'}/dashboard/collaborations/${collaboration.id}" 
           style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px;">
          View Collaboration →
        </a>
      </div>
      
      <p style="font-size: 13px; color: #666;">
        If you have any questions or need to discuss the deadline, you can message ${collaboration.host.displayName} directly through the platform.
      </p>
    </div>
    <div style="padding: 24px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
      <p>© ${new Date().getFullYear()} CreatorStays. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

    await sendEmail({
      to: creatorEmail,
      subject: `Reminder: ${collaboration.host.displayName} is waiting for your content`,
      html: emailHtml,
      text: `Hi ${collaboration.creator.displayName}, ${collaboration.host.displayName} is looking forward to seeing your content for ${collaboration.property.title || 'their property'}. ${deadlineText} View collaboration: ${process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'}/dashboard/collaborations/${collaboration.id}`,
    })

    // Update collaboration to track reminder sent
    const now = new Date().toISOString()
    const existingNotes = collaboration.paymentNotes || ''
    const notesWithoutOldReminder = existingNotes.replace(/Last reminder sent: .+/, '').trim()
    const newNotes = notesWithoutOldReminder 
      ? `${notesWithoutOldReminder}\nLast reminder sent: ${now}`
      : `Last reminder sent: ${now}`

    await prisma.collaboration.update({
      where: { id: params.id },
      data: { paymentNotes: newNotes },
    })

    return NextResponse.json({
      success: true,
      message: 'Reminder sent successfully!',
    })
  } catch (error) {
    console.error('[Reminder API] Error:', error)
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 })
  }
}
