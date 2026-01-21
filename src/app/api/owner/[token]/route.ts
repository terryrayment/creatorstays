import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/owner/[token] - Get property data for owner portal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find owner by access token
    const owner = await prisma.propertyOwner.findUnique({
      where: { accessToken: token },
      include: {
        property: {
          include: {
            hostProfile: true,
            collaborations: {
              include: {
                creator: true,
                offer: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        invitedBy: true,
      },
    })

    if (!owner) {
      return NextResponse.json({ error: 'Invalid or expired access link' }, { status: 404 })
    }

    if (!owner.isActive) {
      return NextResponse.json({ error: 'Your access has been revoked' }, { status: 403 })
    }

    // Update last accessed
    await prisma.propertyOwner.update({
      where: { id: owner.id },
      data: {
        lastAccessedAt: new Date(),
        accessCount: { increment: 1 },
      },
    })

    // Calculate stats
    const collaborations = owner.property.collaborations
    const stats = {
      totalCollaborations: collaborations.length,
      completedCollaborations: collaborations.filter(c => c.status === 'completed').length,
      totalClicks: collaborations.reduce((sum, c) => sum + (c.clicksGenerated || 0), 0),
      totalSpent: collaborations
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + (c.offer?.cashCents || 0), 0),
    }

    // Format response
    return NextResponse.json({
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
      },
      property: {
        id: owner.property.id,
        title: owner.property.title,
        cityRegion: owner.property.cityRegion,
        heroImageUrl: owner.property.heroImageUrl,
        photos: owner.property.photos,
      },
      collaborations: collaborations.map(c => ({
        id: c.id,
        status: c.status,
        createdAt: c.createdAt,
        completedAt: c.completedAt,
        clicksGenerated: c.clicksGenerated || 0,
        creator: {
          displayName: c.creator.displayName,
          handle: c.creator.handle,
          avatarUrl: c.creator.avatarUrl,
          instagramFollowers: c.creator.instagramFollowers,
        },
        offer: {
          cashCents: c.offer?.cashCents || 0,
          stayNights: c.offer?.stayNights || 0,
        },
        contentLinks: c.contentLinks || [],
        contentSubmittedAt: c.contentSubmittedAt,
      })),
      stats,
      agency: {
        displayName: owner.invitedBy.displayName,
      },
    })
  } catch (error) {
    console.error('[Owner Portal] GET error:', error)
    return NextResponse.json({ error: 'Failed to load property data' }, { status: 500 })
  }
}
