import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface ActionItem {
  id: string
  type: string
  title: string
  description: string
  href: string
  priority: 'high' | 'medium' | 'low'
  createdAt: Date
}

// GET /api/dashboard/action-items - Get pending action items for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const actionItems: ActionItem[] = []

    // Check if user is host or creator
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    // HOST ACTION ITEMS
    if (hostProfile) {
      // 1. Counter offers awaiting response
      const counterOffers = await prisma.offer.findMany({
        where: { 
          hostProfileId: hostProfile.id,
          status: 'countered',
        },
        include: {
          creatorProfile: { select: { displayName: true, handle: true } },
          property: { select: { title: true } },
        },
        orderBy: { updatedAt: 'desc' },
      })

      for (const offer of counterOffers) {
        actionItems.push({
          id: offer.id,
          type: 'counter-offer',
          title: `Counter offer from @${offer.creatorProfile.handle}`,
          description: `Review and respond to their counter for ${offer.property?.title || 'your property'}`,
          href: `/dashboard/host/offers`,
          priority: 'high',
          createdAt: offer.updatedAt,
        })
      }

      // 2. Agreements pending host signature
      const pendingAgreements = await prisma.collaboration.findMany({
        where: {
          hostId: hostProfile.id,
          status: 'pending-agreement',
          agreement: {
            hostSignedAt: null,
          },
        },
        include: {
          creator: { select: { displayName: true, handle: true } },
          property: { select: { title: true } },
          agreement: { select: { creatorSignedAt: true } },
        },
      })

      for (const collab of pendingAgreements) {
        actionItems.push({
          id: collab.id,
          type: 'sign-agreement',
          title: `Sign agreement with @${collab.creator.handle}`,
          description: collab.agreement?.creatorSignedAt 
            ? `Creator has signed - waiting for your signature`
            : `Agreement ready for signatures`,
          href: `/dashboard/collaborations/${collab.id}`,
          priority: 'high',
          createdAt: collab.createdAt,
        })
      }

      // 3. Content awaiting review
      const contentToReview = await prisma.collaboration.findMany({
        where: {
          hostId: hostProfile.id,
          status: 'content-submitted',
        },
        include: {
          creator: { select: { displayName: true, handle: true } },
          property: { select: { title: true } },
        },
      })

      for (const collab of contentToReview) {
        actionItems.push({
          id: collab.id,
          type: 'review-content',
          title: `Review content from @${collab.creator.handle}`,
          description: `Content submitted for ${collab.property.title || 'your property'}`,
          href: `/dashboard/collaborations/${collab.id}`,
          priority: 'high',
          createdAt: collab.contentSubmittedAt || collab.updatedAt,
        })
      }

      // 4. Approved content awaiting payment
      const pendingPayments = await prisma.collaboration.findMany({
        where: {
          hostId: hostProfile.id,
          status: 'approved',
          paymentStatus: 'pending',
        },
        include: {
          creator: { select: { displayName: true, handle: true } },
          property: { select: { title: true } },
        },
      })

      for (const collab of pendingPayments) {
        actionItems.push({
          id: collab.id,
          type: 'complete-payment',
          title: `Complete payment to @${collab.creator.handle}`,
          description: `Content approved - payment pending`,
          href: `/dashboard/host/pay/${collab.id}`,
          priority: 'high',
          createdAt: collab.contentApprovedAt || collab.updatedAt,
        })
      }

      // 5. Cancellation requests to review
      const cancellationRequests = await prisma.collaboration.findMany({
        where: {
          hostId: hostProfile.id,
          status: 'cancellation-requested',
        },
        include: {
          creator: { select: { displayName: true, handle: true } },
        },
      })

      for (const collab of cancellationRequests) {
        actionItems.push({
          id: collab.id,
          type: 'cancellation-request',
          title: `Cancellation request from @${collab.creator.handle}`,
          description: `Review and respond to the cancellation request`,
          href: `/dashboard/collaborations/${collab.id}`,
          priority: 'high',
          createdAt: collab.updatedAt,
        })
      }
    }

    // CREATOR ACTION ITEMS
    if (creatorProfile) {
      // 1. Pending offers to review
      const pendingOffers = await prisma.offer.findMany({
        where: {
          creatorProfileId: creatorProfile.id,
          status: 'pending',
        },
        include: {
          hostProfile: { select: { displayName: true } },
          property: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      for (const offer of pendingOffers) {
        actionItems.push({
          id: offer.id,
          type: 'review-offer',
          title: `New offer from ${offer.hostProfile.displayName}`,
          description: `Review offer for ${offer.property?.title || 'a property'}`,
          href: `/dashboard/creator/offers`,
          priority: 'high',
          createdAt: offer.createdAt,
        })
      }

      // 2. Agreements pending creator signature
      const pendingAgreements = await prisma.collaboration.findMany({
        where: {
          creatorId: creatorProfile.id,
          status: 'pending-agreement',
          agreement: {
            creatorSignedAt: null,
          },
        },
        include: {
          host: { select: { displayName: true } },
          property: { select: { title: true } },
          agreement: { select: { hostSignedAt: true } },
        },
      })

      for (const collab of pendingAgreements) {
        actionItems.push({
          id: collab.id,
          type: 'sign-agreement',
          title: `Sign agreement for ${collab.property.title}`,
          description: collab.agreement?.hostSignedAt 
            ? `Host has signed - waiting for your signature`
            : `Agreement ready for signatures`,
          href: `/dashboard/collaborations/${collab.id}`,
          priority: 'high',
          createdAt: collab.createdAt,
        })
      }

      // 3. Active collaborations needing content submission
      const needsContent = await prisma.collaboration.findMany({
        where: {
          creatorId: creatorProfile.id,
          status: 'active',
          contentSubmittedAt: null,
        },
        include: {
          host: { select: { displayName: true } },
          property: { select: { title: true } },
        },
      })

      for (const collab of needsContent) {
        const daysLeft = collab.contentDeadline 
          ? Math.ceil((new Date(collab.contentDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null

        actionItems.push({
          id: collab.id,
          type: 'submit-content',
          title: `Submit content for ${collab.property.title}`,
          description: daysLeft !== null 
            ? daysLeft <= 3 
              ? `⚠️ Only ${daysLeft} days left!` 
              : `${daysLeft} days until deadline`
            : `Content submission pending`,
          href: `/dashboard/collaborations/${collab.id}/submit`,
          priority: daysLeft !== null && daysLeft <= 3 ? 'high' : 'medium',
          createdAt: collab.createdAt,
        })
      }

      // 4. Deadline passed - urgent
      const deadlinePassed = await prisma.collaboration.findMany({
        where: {
          creatorId: creatorProfile.id,
          status: 'deadline-passed',
        },
        include: {
          host: { select: { displayName: true } },
          property: { select: { title: true } },
        },
      })

      for (const collab of deadlinePassed) {
        actionItems.push({
          id: collab.id,
          type: 'deadline-passed',
          title: `⚠️ Deadline passed for ${collab.property.title}`,
          description: `Submit content ASAP or message the host`,
          href: `/dashboard/collaborations/${collab.id}`,
          priority: 'high',
          createdAt: collab.deadlinePassedAt || collab.updatedAt,
        })
      }

      // 5. Cancellation requests to review
      const cancellationRequests = await prisma.collaboration.findMany({
        where: {
          creatorId: creatorProfile.id,
          status: 'cancellation-requested',
        },
        include: {
          host: { select: { displayName: true } },
        },
      })

      for (const collab of cancellationRequests) {
        actionItems.push({
          id: collab.id,
          type: 'cancellation-request',
          title: `Cancellation request from ${collab.host.displayName}`,
          description: `Review and respond to the cancellation request`,
          href: `/dashboard/collaborations/${collab.id}`,
          priority: 'high',
          createdAt: collab.updatedAt,
        })
      }
    }

    // Sort by priority (high first) then by date (newest first)
    actionItems.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({
      actionItems,
      count: actionItems.length,
    })
  } catch (error) {
    console.error('[Action Items API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch action items' }, { status: 500 })
  }
}
