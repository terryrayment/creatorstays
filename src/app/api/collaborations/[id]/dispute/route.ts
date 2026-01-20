import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, disputeSubmittedEmail, disputeNotificationEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/collaborations/[id]/dispute - File a dispute
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reason, category, evidence } = body

    if (!reason || reason.trim().length < 20) {
      return NextResponse.json({ 
        error: 'Please provide a detailed description (at least 20 characters)' 
      }, { status: 400 })
    }

    // Get user profiles
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ 
        where: { userId: session.user.id },
        include: { user: true },
      }),
      prisma.creatorProfile.findUnique({ 
        where: { userId: session.user.id },
        include: { user: true },
      }),
    ])

    // Get collaboration with all related data
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: {
        host: { include: { user: true } },
        creator: { include: { user: true } },
        property: true,
        disputes: {
          where: { status: { in: ['open', 'under-review'] } }
        },
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Determine user's role
    const isHost = hostProfile?.id === collaboration.hostId
    const isCreator = creatorProfile?.id === collaboration.creatorId

    if (!isHost && !isCreator) {
      return NextResponse.json({ error: 'You are not part of this collaboration' }, { status: 403 })
    }

    // Check if there's already an open dispute
    if (collaboration.disputes.length > 0) {
      return NextResponse.json({ 
        error: 'There is already an open dispute for this collaboration. Please wait for resolution.' 
      }, { status: 400 })
    }

    // Can't dispute certain statuses
    if (['cancelled'].includes(collaboration.status)) {
      return NextResponse.json({ 
        error: 'Cannot file a dispute for a cancelled collaboration' 
      }, { status: 400 })
    }

    const userRole = isHost ? 'host' : 'creator'
    const userName = isHost ? collaboration.host.displayName : collaboration.creator.displayName
    const userId = isHost ? collaboration.hostId : collaboration.creatorId

    // Create the dispute
    const dispute = await prisma.dispute.create({
      data: {
        collaborationId: params.id,
        filedByType: userRole,
        filedById: userId,
        filedByName: userName,
        reason: reason.trim(),
        category: category || 'other',
        evidence: evidence || [],
        status: 'open',
      },
    })

    // Update collaboration status to indicate dispute
    await prisma.collaboration.update({
      where: { id: params.id },
      data: {
        paymentNotes: `${collaboration.paymentNotes || ''}\nDispute filed by ${userRole} on ${new Date().toISOString()}: ${reason.substring(0, 100)}...`,
      },
    })

    // Get other party info for notifications
    const otherPartyEmail = isHost 
      ? collaboration.creator.user?.email 
      : (collaboration.host.user?.email || collaboration.host.contactEmail)
    
    const otherPartyName = isHost 
      ? collaboration.creator.displayName 
      : collaboration.host.displayName

    const userEmail = isHost 
      ? (collaboration.host.user?.email || collaboration.host.contactEmail)
      : collaboration.creator.user?.email

    // Send confirmation email to filer
    if (userEmail) {
      const confirmationEmail = disputeSubmittedEmail({
        recipientName: userName,
        disputeId: dispute.id,
        collaborationId: params.id,
        propertyTitle: collaboration.property.title || 'Property',
        otherPartyName,
        reason: reason.trim(),
      })

      sendEmail({
        to: userEmail,
        ...confirmationEmail,
      }).catch(err => console.error('[Dispute] Confirmation email error:', err))
    }

    // Send notification to other party
    if (otherPartyEmail) {
      const notificationEmail = disputeNotificationEmail({
        recipientName: otherPartyName,
        disputeId: dispute.id,
        collaborationId: params.id,
        propertyTitle: collaboration.property.title || 'Property',
        filedByName: userName,
        filedByRole: userRole,
      })

      sendEmail({
        to: otherPartyEmail,
        ...notificationEmail,
      }).catch(err => console.error('[Dispute] Notification email error:', err))
    }

    // Also notify support
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@creatorstays.com'
    sendEmail({
      to: supportEmail,
      subject: `🚨 New Dispute Filed — Case #${dispute.id.slice(0, 8)}`,
      html: `
        <h2>New Dispute Requires Attention</h2>
        <p><strong>Case ID:</strong> ${dispute.id}</p>
        <p><strong>Collaboration:</strong> ${collaboration.property.title}</p>
        <p><strong>Filed by:</strong> ${userName} (${userRole})</p>
        <p><strong>Category:</strong> ${category || 'Not specified'}</p>
        <p><strong>Reason:</strong></p>
        <blockquote>${reason}</blockquote>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/disputes/${dispute.id}">View in Admin</a></p>
      `,
      text: `New Dispute: ${dispute.id}\nFiled by: ${userName} (${userRole})\nReason: ${reason}`,
    }).catch(err => console.error('[Dispute] Support notification error:', err))

    return NextResponse.json({
      success: true,
      disputeId: dispute.id,
      message: 'Dispute filed successfully. Our team will review it within 1-2 business days.',
    })
  } catch (error) {
    console.error('[Dispute API] POST error:', error)
    return NextResponse.json({ error: 'Failed to file dispute' }, { status: 500 })
  }
}

// GET /api/collaborations/[id]/dispute - Get dispute status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profiles
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    // Get collaboration
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      select: {
        hostId: true,
        creatorId: true,
        status: true,
        disputes: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            filedByType: true,
            filedByName: true,
            reason: true,
            category: true,
            status: true,
            resolution: true,
            createdAt: true,
            resolvedAt: true,
          },
        },
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Check user is part of this collaboration
    const isHost = hostProfile?.id === collaboration.hostId
    const isCreator = creatorProfile?.id === collaboration.creatorId

    if (!isHost && !isCreator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const hasOpenDispute = collaboration.disputes.some(d => 
      ['open', 'under-review'].includes(d.status)
    )

    const canFileDispute = !hasOpenDispute && 
      !['cancelled'].includes(collaboration.status)

    return NextResponse.json({
      canFileDispute,
      hasOpenDispute,
      disputes: collaboration.disputes,
    })
  } catch (error) {
    console.error('[Dispute API] GET error:', error)
    return NextResponse.json({ error: 'Failed to get dispute status' }, { status: 500 })
  }
}
