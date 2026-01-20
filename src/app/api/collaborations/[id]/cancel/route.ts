import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, cancellationRequestEmail, collaborationCancelledEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/collaborations/[id]/cancel - Request or confirm cancellation
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
    const { action, reason } = body // action: 'request' | 'accept' | 'decline'

    if (!action || !['request', 'accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use: request, accept, or decline' }, { status: 400 })
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

    const userRole = isHost ? 'host' : 'creator'
    const userName = isHost ? collaboration.host.displayName : collaboration.creator.displayName

    // Cannot cancel if already completed or cancelled
    if (['completed', 'cancelled'].includes(collaboration.status)) {
      return NextResponse.json({ 
        error: `Cannot cancel a ${collaboration.status} collaboration` 
      }, { status: 400 })
    }

    // Cannot cancel if payment is already processing or completed
    if (['processing', 'completed'].includes(collaboration.paymentStatus)) {
      return NextResponse.json({ 
        error: 'Cannot cancel after payment has been initiated. Please contact support.' 
      }, { status: 400 })
    }

    // Handle REQUEST cancellation
    if (action === 'request') {
      // Check if there's already a pending cancellation request
      if (collaboration.status === 'cancellation-requested') {
        return NextResponse.json({ 
          error: 'A cancellation request is already pending' 
        }, { status: 400 })
      }

      // Update collaboration with cancellation request
      await prisma.collaboration.update({
        where: { id: params.id },
        data: {
          status: 'cancellation-requested',
          paymentNotes: `Cancellation requested by ${userRole} on ${new Date().toISOString()}${reason ? `: ${reason}` : ''}`,
        },
      })

      // Send email to other party
      const otherPartyEmail = isHost 
        ? collaboration.creator.user.email 
        : (collaboration.host.user?.email || collaboration.host.contactEmail)
      
      const otherPartyName = isHost 
        ? collaboration.creator.displayName 
        : collaboration.host.displayName

      if (otherPartyEmail) {
        const emailData = cancellationRequestEmail({
          recipientName: otherPartyName,
          requesterName: userName,
          requesterRole: userRole,
          propertyTitle: collaboration.property.title || 'Property',
          reason,
          collaborationId: params.id,
        })

        sendEmail({
          to: otherPartyEmail,
          ...emailData,
        }).catch(err => console.error('[Collab Cancel] Email error:', err))
      }

      return NextResponse.json({
        success: true,
        message: 'Cancellation request sent. Waiting for other party to confirm.',
      })
    }

    // Handle ACCEPT cancellation
    if (action === 'accept') {
      // Must be in cancellation-requested status
      if (collaboration.status !== 'cancellation-requested') {
        return NextResponse.json({ 
          error: 'No pending cancellation request to accept' 
        }, { status: 400 })
      }

      // Update collaboration to cancelled
      await prisma.collaboration.update({
        where: { id: params.id },
        data: {
          status: 'cancelled',
          paymentStatus: 'cancelled',
          paymentNotes: `${collaboration.paymentNotes || ''}\nCancellation accepted by ${userRole} on ${new Date().toISOString()}`,
          completedAt: new Date(),
        },
      })

      // Send email to both parties
      const hostEmail = collaboration.host.user?.email || collaboration.host.contactEmail
      const creatorEmail = collaboration.creator.user.email

      if (hostEmail) {
        const emailData = collaborationCancelledEmail({
          recipientName: collaboration.host.displayName,
          otherPartyName: collaboration.creator.displayName,
          propertyTitle: collaboration.property.title || 'Property',
          cancelledBy: 'mutual',
        })
        sendEmail({ to: hostEmail, ...emailData })
          .catch(err => console.error('[Collab Cancel] Host email error:', err))
      }

      if (creatorEmail) {
        const emailData = collaborationCancelledEmail({
          recipientName: collaboration.creator.displayName,
          otherPartyName: collaboration.host.displayName,
          propertyTitle: collaboration.property.title || 'Property',
          cancelledBy: 'mutual',
        })
        sendEmail({ to: creatorEmail, ...emailData })
          .catch(err => console.error('[Collab Cancel] Creator email error:', err))
      }

      return NextResponse.json({
        success: true,
        message: 'Collaboration cancelled by mutual agreement.',
      })
    }

    // Handle DECLINE cancellation
    if (action === 'decline') {
      // Must be in cancellation-requested status
      if (collaboration.status !== 'cancellation-requested') {
        return NextResponse.json({ 
          error: 'No pending cancellation request to decline' 
        }, { status: 400 })
      }

      // Revert to previous status (active is safest default)
      await prisma.collaboration.update({
        where: { id: params.id },
        data: {
          status: 'active',
          paymentNotes: `${collaboration.paymentNotes || ''}\nCancellation declined by ${userRole} on ${new Date().toISOString()}`,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Cancellation request declined. Collaboration remains active.',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[Collab Cancel API] Error:', error)
    return NextResponse.json({ error: 'Failed to process cancellation' }, { status: 500 })
  }
}

// GET /api/collaborations/[id]/cancel - Get cancellation status
export async function GET(
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
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        paymentNotes: true,
        hostId: true,
        creatorId: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Check user is part of this collaboration
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    const isHost = hostProfile?.id === collaboration.hostId
    const isCreator = creatorProfile?.id === collaboration.creatorId

    if (!isHost && !isCreator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const canCancel = !['completed', 'cancelled'].includes(collaboration.status) 
      && !['processing', 'completed'].includes(collaboration.paymentStatus)

    const hasPendingCancellation = collaboration.status === 'cancellation-requested'

    return NextResponse.json({
      canCancel,
      hasPendingCancellation,
      status: collaboration.status,
      paymentStatus: collaboration.paymentStatus,
    })
  } catch (error) {
    console.error('[Collab Cancel Status API] Error:', error)
    return NextResponse.json({ error: 'Failed to get cancellation status' }, { status: 500 })
  }
}
