import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, agreementCopyEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * POST /api/collaborations/[id]/agreement/email
 * Email a copy of the agreement to the current user
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

    // Get collaboration with agreement
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: {
        agreement: true,
        host: { include: { user: true } },
        creator: { include: { user: true } },
        property: true,
      },
    })

    if (!collaboration || !collaboration.agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Verify user is party to this collaboration
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    const isHost = hostProfile?.id === collaboration.hostId
    const isCreator = creatorProfile?.id === collaboration.creatorId

    if (!isHost && !isCreator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const agreement = collaboration.agreement
    const recipientEmail = isHost 
      ? (collaboration.host.user?.email || collaboration.host.contactEmail)
      : collaboration.creator.user.email

    if (!recipientEmail) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 })
    }

    const agreementId = `CS-${collaboration.id.slice(-8).toUpperCase()}`

    // Send email
    const emailData = agreementCopyEmail({
      recipientName: isHost ? collaboration.host.displayName : collaboration.creator.displayName,
      recipientRole: isHost ? 'host' : 'creator',
      agreementId,
      hostName: agreement.hostName,
      hostEmail: agreement.hostEmail,
      creatorName: agreement.creatorName,
      creatorHandle: agreement.creatorHandle,
      creatorEmail: agreement.creatorEmail,
      propertyTitle: agreement.propertyTitle,
      propertyLocation: agreement.propertyLocation || undefined,
      dealType: agreement.dealType,
      cashAmount: agreement.cashAmount,
      stayNights: agreement.stayNights,
      deliverables: agreement.deliverables,
      isFullyExecuted: agreement.isFullyExecuted,
      executedAt: agreement.executedAt,
      collaborationId: collaboration.id,
    })

    const result = await sendEmail({
      to: recipientEmail,
      ...emailData,
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Agreement copy sent to ${recipientEmail}`,
    })
  } catch (error) {
    console.error('[Agreement Email API] Error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
