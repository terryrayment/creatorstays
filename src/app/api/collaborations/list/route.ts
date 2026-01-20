import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/collaborations/list - Get all collaborations for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user's profiles
    const [hostProfile, creatorProfile] = await Promise.all([
      prisma.hostProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    let collaborations: unknown[] = []

    if (hostProfile) {
      collaborations = await prisma.collaboration.findMany({
        where: { hostId: hostProfile.id },
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              handle: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              cityRegion: true,
            },
          },
          offer: {
            select: {
              offerType: true,
              cashCents: true,
              deliverables: true,
            },
          },
          agreement: {
            select: {
              isFullyExecuted: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (creatorProfile) {
      collaborations = await prisma.collaboration.findMany({
        where: { creatorId: creatorProfile.id },
        include: {
          host: {
            select: {
              id: true,
              displayName: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              cityRegion: true,
            },
          },
          offer: {
            select: {
              offerType: true,
              cashCents: true,
              deliverables: true,
            },
          },
          agreement: {
            select: {
              isFullyExecuted: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ collaborations })
  } catch (error) {
    console.error('[Collaborations List API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch collaborations' }, { status: 500 })
  }
}
