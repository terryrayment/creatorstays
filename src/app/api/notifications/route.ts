import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/notifications - Get unread counts for current user
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

    const isHost = !!hostProfile
    const userProfile = isHost ? hostProfile : creatorProfile

    if (!userProfile) {
      return NextResponse.json({ 
        unreadMessages: 0,
        pendingOffers: 0,
        total: 0,
      })
    }

    // Get unread message count
    let unreadMessages = 0
    if (isHost) {
      const conversations = await prisma.conversation.findMany({
        where: { hostProfileId: userProfile.id },
        select: { hostUnread: true },
      })
      unreadMessages = conversations.reduce((sum, c) => sum + c.hostUnread, 0)
    } else {
      const conversations = await prisma.conversation.findMany({
        where: { creatorProfileId: userProfile.id },
        select: { creatorUnread: true },
      })
      unreadMessages = conversations.reduce((sum, c) => sum + c.creatorUnread, 0)
    }

    // Get pending offers count (for creators: pending offers to review)
    let pendingOffers = 0
    if (!isHost) {
      pendingOffers = await prisma.offer.count({
        where: { 
          creatorProfileId: userProfile.id,
          status: 'pending',
        },
      })
    } else {
      // For hosts: count countered offers that need response
      pendingOffers = await prisma.offer.count({
        where: { 
          hostProfileId: userProfile.id,
          status: 'countered',
        },
      })
    }

    return NextResponse.json({
      unreadMessages,
      pendingOffers,
      total: unreadMessages + pendingOffers,
    })
  } catch (error) {
    console.error('[Notifications API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
