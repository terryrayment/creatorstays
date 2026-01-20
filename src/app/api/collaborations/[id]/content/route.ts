import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, contentSubmittedEmail, contentApprovedEmail, changesRequestedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/collaborations/[id]/content - Submit content links (creator)
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
    const { contentLinks } = body

    if (!contentLinks || !Array.isArray(contentLinks) || contentLinks.length === 0) {
      return NextResponse.json({ error: 'Content links required' }, { status: 400 })
    }

    // Validate URLs
    for (const link of contentLinks) {
      try {
        new URL(link)
      } catch {
        return NextResponse.json({ error: `Invalid URL: ${link}` }, { status: 400 })
      }
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: { 
        agreement: true,
        host: { include: { user: true } },
        creator: true,
        property: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify user is the creator
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!creatorProfile || creatorProfile.id !== collaboration.creatorId) {
      return NextResponse.json({ error: 'Only the creator can submit content' }, { status: 403 })
    }

    // Check collaboration status
    if (collaboration.status !== 'active') {
      return NextResponse.json({ 
        error: `Cannot submit content. Collaboration status: ${collaboration.status}` 
      }, { status: 400 })
    }

    // Update collaboration with content links
    const updated = await prisma.collaboration.update({
      where: { id: params.id },
      data: {
        contentLinks: contentLinks,
        contentSubmittedAt: new Date(),
        status: 'content-submitted',
      },
    })

    // Send email to host
    const hostEmail = collaboration.host.user?.email || collaboration.host.contactEmail
    if (hostEmail) {
      const emailData = contentSubmittedEmail({
        hostName: collaboration.host.displayName,
        creatorName: collaboration.creator.displayName,
        propertyTitle: collaboration.property.title || 'Property',
        contentLinks,
        collaborationId: params.id,
      })
      
      sendEmail({
        to: hostEmail,
        ...emailData,
      }).catch(err => console.error('[Content API] Email error:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Content submitted! Waiting for host review.',
      collaboration: updated,
    })
  } catch (error) {
    console.error('[Content API] POST error:', error)
    return NextResponse.json({ error: 'Failed to submit content' }, { status: 500 })
  }
}

// PATCH /api/collaborations/[id]/content - Approve/reject content (host)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, feedback } = body // action: 'approve' | 'request-changes'

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: {
        host: true,
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
      return NextResponse.json({ error: 'Only the host can review content' }, { status: 403 })
    }

    // Check collaboration status
    if (collaboration.status !== 'content-submitted') {
      return NextResponse.json({ 
        error: `Cannot review. Collaboration status: ${collaboration.status}` 
      }, { status: 400 })
    }

    if (action === 'approve') {
      // Check if this is a $0 cash deal (post-for-stay) - auto-complete without payment
      const isZeroCashDeal = collaboration.offer.cashCents === 0
      
      const updated = await prisma.collaboration.update({
        where: { id: params.id },
        data: {
          status: isZeroCashDeal ? 'completed' : 'approved',
          contentApprovedAt: new Date(),
          ...(isZeroCashDeal && { 
            completedAt: new Date(),
            paymentStatus: 'completed',
            paymentNotes: 'Post-for-stay deal - no payment required',
          }),
        },
      })

      // Send email to creator
      if (collaboration.creator.user.email) {
        const emailData = contentApprovedEmail({
          creatorName: collaboration.creator.displayName,
          hostName: collaboration.host.displayName,
          propertyTitle: collaboration.property.title || 'Property',
          collaborationId: params.id,
        })
        
        sendEmail({
          to: collaboration.creator.user.email,
          ...emailData,
        }).catch(err => console.error('[Content API] Email error:', err))
      }

      return NextResponse.json({
        success: true,
        message: isZeroCashDeal 
          ? 'Content approved! Collaboration complete. Thank you for the great content!'
          : 'Content approved! Tracking link is now active. Payment will be processed.',
        collaboration: updated,
      })
    }

    if (action === 'request-changes') {
      const updated = await prisma.collaboration.update({
        where: { id: params.id },
        data: {
          status: 'active', // Back to active for creator to resubmit
          paymentNotes: feedback ? `Host requested changes: ${feedback}` : 'Host requested changes',
        },
      })

      // Send email to creator about requested changes
      if (collaboration.creator.user.email) {
        const emailData = changesRequestedEmail({
          creatorName: collaboration.creator.displayName,
          hostName: collaboration.host.displayName,
          propertyTitle: collaboration.property.title || 'Property',
          feedback: feedback,
          collaborationId: params.id,
        })

        sendEmail({
          to: collaboration.creator.user.email,
          ...emailData,
        }).catch(err => console.error('[Content API] Changes email error:', err))
      }

      return NextResponse.json({
        success: true,
        message: 'Change request sent to creator.',
        collaboration: updated,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[Content API] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to review content' }, { status: 500 })
  }
}
