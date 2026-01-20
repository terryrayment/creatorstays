import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/messages/[id] - Get conversation with all messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Determine user's role
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    const isHost = !!hostProfile
    const userProfile = isHost ? hostProfile : creatorProfile

    if (!userProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        hostProfile: {
          select: { id: true, displayName: true, contactEmail: true },
        },
        creatorProfile: {
          select: { id: true, displayName: true, handle: true, avatarUrl: true },
        },
        collaboration: {
          select: {
            id: true,
            status: true,
            property: {
              select: { title: true, cityRegion: true },
            },
          },
        },
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify user is part of this conversation
    if (isHost && conversation.hostProfileId !== userProfile.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }
    if (!isHost && conversation.creatorProfileId !== userProfile.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Mark messages as read and reset unread count
    const unreadMessageIds = conversation.messages
      .filter(m => !m.isRead && m.senderType !== (isHost ? 'host' : 'creator'))
      .map(m => m.id)

    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { isRead: true, readAt: new Date() },
      })
    }

    // Reset unread count
    await prisma.conversation.update({
      where: { id: params.id },
      data: isHost ? { hostUnread: 0 } : { creatorUnread: 0 },
    })

    return NextResponse.json({
      role: isHost ? 'host' : 'creator',
      conversation: {
        id: conversation.id,
        hostProfile: conversation.hostProfile,
        creatorProfile: conversation.creatorProfile,
        collaboration: conversation.collaboration,
        messages: conversation.messages.map(m => ({
          id: m.id,
          senderType: m.senderType,
          senderId: m.senderId,
          body: m.body,
          sentAt: m.sentAt,
          isRead: m.isRead,
        })),
      },
    })
  } catch (error) {
    console.error('[Conversation API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}
