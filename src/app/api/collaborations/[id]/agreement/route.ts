import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail, agreementSignedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// GET /api/collaborations/[id]/agreement - Get agreement details
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
      include: {
        agreement: true,
        creator: { include: { user: true } },
        host: true,
        property: true,
        offer: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
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

    return NextResponse.json({ 
      collaboration,
      agreement: collaboration.agreement,
      userRole: isHost ? 'host' : 'creator',
      affiliateLink: collaboration.affiliateToken 
        ? `https://creatorstays.com/r/${collaboration.affiliateToken}`
        : null,
    })
  } catch (error) {
    console.error('[Agreement API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch agreement' }, { status: 500 })
  }
}

// POST /api/collaborations/[id]/agreement - Sign agreement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get client IP for signature record
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: { agreement: true },
    })

    if (!collaboration || !collaboration.agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Verify user is party to this collaboration
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

    const isHost = hostProfile?.id === collaboration.hostId
    const isCreator = creatorProfile?.id === collaboration.creatorId

    if (!isHost && !isCreator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get full collaboration data for emails
    const fullCollab = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: {
        host: { include: { user: true } },
        creator: { include: { user: true } },
        property: true,
      },
    })

    const now = new Date()
    const updateData: Record<string, unknown> = {}

    if (isHost && !collaboration.agreement.hostAcceptedAt) {
      updateData.hostAcceptedAt = now
      updateData.hostIpAddress = ipAddress
    } else if (isCreator && !collaboration.agreement.creatorAcceptedAt) {
      updateData.creatorAcceptedAt = now
      updateData.creatorIpAddress = ipAddress
    } else {
      return NextResponse.json({ error: 'Already signed' }, { status: 400 })
    }

    // Update agreement
    const updatedAgreement = await prisma.collaborationAgreement.update({
      where: { collaborationId: params.id },
      data: updateData,
    })

    // Check if both parties have signed
    const isFullyExecuted = !!(updatedAgreement.hostAcceptedAt && updatedAgreement.creatorAcceptedAt)
    
    if (isFullyExecuted) {
      // Mark agreement as fully executed
      await prisma.collaborationAgreement.update({
        where: { collaborationId: params.id },
        data: {
          isFullyExecuted: true,
          executedAt: now,
        },
      })

      // Update collaboration status to active
      await prisma.collaboration.update({
        where: { id: params.id },
        data: { status: 'active' },
      })
    }

    // Send email notification to the OTHER party
    if (fullCollab) {
      const recipientEmail = isHost 
        ? fullCollab.creator.user.email 
        : fullCollab.host.user?.email || fullCollab.host.contactEmail
      
      if (recipientEmail) {
        const emailData = agreementSignedEmail({
          recipientName: isHost ? fullCollab.creator.displayName : fullCollab.host.displayName,
          signerName: isHost ? fullCollab.host.displayName : fullCollab.creator.displayName,
          signerRole: isHost ? 'host' : 'creator',
          propertyTitle: fullCollab.property.title || 'Property',
          collaborationId: params.id,
          isFullyExecuted,
        })
        
        sendEmail({
          to: recipientEmail,
          ...emailData,
        }).catch(err => console.error('[Agreement API] Email error:', err))
      }
    }

    if (isFullyExecuted) {
      return NextResponse.json({
        success: true,
        message: 'Agreement fully executed! Collaboration is now active.',
        fullyExecuted: true,
        affiliateLink: `https://creatorstays.com/r/${collaboration.affiliateToken}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: isHost 
        ? 'You have signed the agreement. Waiting for creator to sign.'
        : 'You have signed the agreement. Waiting for host to sign.',
      fullyExecuted: false,
    })
  } catch (error) {
    console.error('[Agreement API] POST error:', error)
    return NextResponse.json({ error: 'Failed to sign agreement' }, { status: 500 })
  }
}
