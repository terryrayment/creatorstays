import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/messages - Get all conversations for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is host or creator
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    let conversations

    if (hostProfile) {
      conversations = await prisma.conversation.findMany({
        where: { hostProfileId: hostProfile.id },
        include: {
          creatorProfile: {
            select: { id: true, displayName: true, handle: true, avatarUrl: true },
          },
          messages: {
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
          collaboration: {
            select: { id: true, status: true },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      })

      return NextResponse.json({
        role: 'host',
        conversations: conversations.map(c => ({
          id: c.id,
          otherParty: c.creatorProfile,
          lastMessage: c.messages[0] || null,
          unreadCount: c.hostUnread,
          collaboration: c.collaboration,
          lastMessageAt: c.lastMessageAt,
        })),
      })
    }

    if (creatorProfile) {
      conversations = await prisma.conversation.findMany({
        where: { creatorProfileId: creatorProfile.id },
        include: {
          hostProfile: {
            select: { id: true, displayName: true, contactEmail: true },
          },
          messages: {
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
          collaboration: {
            select: { id: true, status: true },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      })

      return NextResponse.json({
        role: 'creator',
        conversations: conversations.map(c => ({
          id: c.id,
          otherParty: c.hostProfile,
          lastMessage: c.messages[0] || null,
          unreadCount: c.creatorUnread,
          collaboration: c.collaboration,
          lastMessageAt: c.lastMessageAt,
        })),
      })
    }

    return NextResponse.json({ error: 'No profile found' }, { status: 404 })
  } catch (error) {
    console.error('[Messages API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/messages - Start a new conversation or send a message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, recipientId, message, collaborationId } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Determine sender's role and profile
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    const isHost = !!hostProfile
    const senderProfile = isHost ? hostProfile : creatorProfile

    if (!senderProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let conversation

    // If conversationId provided, use existing conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      })

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      // Verify user is part of this conversation
      if (isHost && conversation.hostProfileId !== senderProfile.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }
      if (!isHost && conversation.creatorProfileId !== senderProfile.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }
    } else {
      // Start new conversation
      if (!recipientId) {
        return NextResponse.json({ error: 'Recipient ID required for new conversation' }, { status: 400 })
      }

      // Determine host and creator IDs
      let hostProfileId: string
      let creatorProfileId: string

      if (isHost) {
        hostProfileId = senderProfile.id
        creatorProfileId = recipientId
        // Verify recipient exists
        const recipient = await prisma.creatorProfile.findUnique({ where: { id: recipientId } })
        if (!recipient) {
          return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
        }
      } else {
        creatorProfileId = senderProfile.id
        hostProfileId = recipientId
        // Verify recipient exists
        const recipient = await prisma.hostProfile.findUnique({ where: { id: recipientId } })
        if (!recipient) {
          return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
        }
      }

      // Check if conversation already exists
      conversation = await prisma.conversation.findUnique({
        where: {
          hostProfileId_creatorProfileId: {
            hostProfileId,
            creatorProfileId,
          },
        },
      })

      // Create new conversation if doesn't exist
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            hostProfileId,
            creatorProfileId,
            collaborationId: collaborationId || null,
          },
        })
      }
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: isHost ? 'host' : 'creator',
        senderId: senderProfile.id,
        body: message.trim(),
      },
    })

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        // Increment unread count for the other party
        ...(isHost
          ? { creatorUnread: { increment: 1 } }
          : { hostUnread: { increment: 1 } }),
      },
    })

    return NextResponse.json({
      success: true,
      message: newMessage,
      conversationId: conversation.id,
    })
  } catch (error) {
    console.error('[Messages API] Error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
