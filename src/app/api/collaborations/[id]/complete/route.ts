import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, collaborationCompletedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/collaborations/[id]/complete - Mark collaboration as complete (for post-for-stay deals)
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
        host: { include: { user: true } },
        creator: { include: { user: true } },
        property: true,
        offer: true,
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
      return NextResponse.json({ error: 'Only the host can complete this collaboration' }, { status: 403 })
    }

    // Only allow completion for post-for-stay deals (no cash payment)
    if (collaboration.offer.cashCents > 0) {
      return NextResponse.json({ 
        error: 'Paid collaborations must be completed through the payment flow' 
      }, { status: 400 })
    }

    // Must be in approved status
    if (collaboration.status !== 'approved') {
      return NextResponse.json({ 
        error: `Cannot complete. Current status: ${collaboration.status}. Content must be approved first.` 
      }, { status: 400 })
    }

    // Mark as completed
    const updated = await prisma.collaboration.update({
      where: { id: params.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        paymentStatus: 'completed',
        paymentNotes: 'Post-for-stay deal - stay confirmed by host',
      },
    })

    // Send review prompt emails to both parties
    const propertyTitle = collaboration.property.title || 'Property'

    // Email to creator
    if (collaboration.creator.user?.email) {
      const creatorEmailData = collaborationCompletedEmail({
        recipientName: collaboration.creator.displayName,
        recipientRole: 'creator',
        otherPartyName: collaboration.host.displayName,
        propertyTitle,
        collaborationId: params.id,
      })
      
      sendEmail({
        to: collaboration.creator.user.email,
        ...creatorEmailData,
      }).catch(err => console.error('[Complete API] Creator email error:', err))
    }

    // Email to host
    if (collaboration.host.user?.email) {
      const hostEmailData = collaborationCompletedEmail({
        recipientName: collaboration.host.displayName,
        recipientRole: 'host',
        otherPartyName: collaboration.creator.displayName,
        propertyTitle,
        collaborationId: params.id,
      })
      
      sendEmail({
        to: collaboration.host.user.email,
        ...hostEmailData,
      }).catch(err => console.error('[Complete API] Host email error:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Collaboration marked as complete! Thank you for hosting.',
      collaboration: updated,
    })
  } catch (error) {
    console.error('[Complete API] Error:', error)
    return NextResponse.json({ error: 'Failed to complete collaboration' }, { status: 500 })
  }
}
