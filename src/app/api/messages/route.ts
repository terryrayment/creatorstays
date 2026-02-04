import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canAccessMarketplace, getMarketplaceBlockedMessage } from '@/lib/feature-flags'

export const dynamic = 'force-dynamic'

// Creator outreach limit per month
const CREATOR_MONTHLY_OUTREACH_LIMIT = 3

/**
 * Get the start of the current calendar month (UTC)
 */
function getMonthStart(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
}

/**
 * Count how many new conversations a creator has initiated this month.
 * A creator-initiated conversation is one where the first message was sent by the creator.
 */
async function getCreatorOutreachCountThisMonth(creatorProfileId: string): Promise<number> {
  const monthStart = getMonthStart()
  
  // Find conversations created this month where the creator sent the first message
  const conversations = await prisma.conversation.findMany({
    where: {
      creatorProfileId,
      createdAt: { gte: monthStart },
    },
    include: {
      messages: {
        orderBy: { sentAt: 'asc' },
        take: 1,
      },
    },
  })
  
  // Count only those where creator sent the first message (creator-initiated)
  const creatorInitiated = conversations.filter(conv => {
    const firstMessage = conv.messages[0]
    return firstMessage && firstMessage.senderType === 'creator'
  })
  
  return creatorInitiated.length
}

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
            select: { 
              id: true, 
              status: true,
              property: {
                select: { id: true, title: true, heroImageUrl: true },
              },
            },
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
            select: { 
              id: true, 
              status: true,
              property: {
                select: { id: true, title: true, heroImageUrl: true },
              },
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      })

      // Get creator's outreach count for this month
      const outreachCount = await getCreatorOutreachCountThisMonth(creatorProfile.id)

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
        // Include outreach limit info for creators
        outreachLimit: {
          used: outreachCount,
          limit: CREATOR_MONTHLY_OUTREACH_LIMIT,
          remaining: Math.max(0, CREATOR_MONTHLY_OUTREACH_LIMIT - outreachCount),
        },
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
    let isNewCreatorInitiatedConversation = false

    // If conversationId provided, use existing conversation (this is a reply, no limit check needed)
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

      // ========================================================================
      // BETA GATE: Block NEW cross-side conversations during split beta
      // ========================================================================
      if (!canAccessMarketplace(session.user.email)) {
        return NextResponse.json({
          error: getMarketplaceBlockedMessage('Starting new conversations'),
          code: 'BETA_MARKETPLACE_BLOCKED',
        }, { status: 403 })
      }
      // ========================================================================

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
        // This is a NEW conversation
        // BETA RESTRICTION: Creators cannot initiate conversations
        // They can only reply to hosts who message them first
        // This will be relaxed once OAuth follower verification is complete
        if (!isHost) {
          // Check if creator has verified 50k+ followers via OAuth
          const creatorWithFollowers = await prisma.creatorProfile.findUnique({
            where: { id: creatorProfileId },
            select: {
              instagramFollowers: true,
              tiktokFollowers: true,
              instagramConnected: true,
              tiktokConnected: true,
            },
          })

          // Use verified OAuth follower count only
          const verifiedFollowers = Math.max(
            creatorWithFollowers?.instagramConnected ? (creatorWithFollowers.instagramFollowers || 0) : 0,
            creatorWithFollowers?.tiktokConnected ? (creatorWithFollowers.tiktokFollowers || 0) : 0
          )

          // Require 50k verified followers to initiate
          const MIN_FOLLOWERS_TO_INITIATE = 50000

          if (verifiedFollowers < MIN_FOLLOWERS_TO_INITIATE) {
            return NextResponse.json({
              error: 'Cannot initiate conversations',
              code: 'MESSAGING_RESTRICTED',
              message: "During beta, only creators with 50,000+ verified followers can message hosts first. Connect your Instagram or TikTok to verify your follower count. Hosts can still message you directly.",
              requiredFollowers: MIN_FOLLOWERS_TO_INITIATE,
              currentVerifiedFollowers: verifiedFollowers,
              hasConnectedAccounts: creatorWithFollowers?.instagramConnected || creatorWithFollowers?.tiktokConnected,
            }, { status: 403 })
          }

          // If they have 50k+ verified, also check monthly limit
          const outreachCount = await getCreatorOutreachCountThisMonth(creatorProfileId)
          
          if (outreachCount >= CREATOR_MONTHLY_OUTREACH_LIMIT) {
            return NextResponse.json({
              error: 'Monthly outreach limit reached',
              code: 'OUTREACH_LIMIT_REACHED',
              message: "You've reached your monthly outreach limit. Hosts can still message you, and you can continue existing conversations.",
              outreachLimit: {
                used: outreachCount,
                limit: CREATOR_MONTHLY_OUTREACH_LIMIT,
                remaining: 0,
              },
            }, { status: 429 })
          }
          
          isNewCreatorInitiatedConversation = true
        }

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
