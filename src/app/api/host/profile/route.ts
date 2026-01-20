import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Create or update host profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { displayName, contactEmail, location, bio, styleTags } = body

    // Upsert host profile
    const hostProfile = await prisma.hostProfile.upsert({
      where: { userId: session.user.id },
      update: {
        displayName: displayName || session.user.name || 'Host',
        contactEmail: contactEmail || session.user.email,
        location: location || null,
        bio: bio || null,
        styleTags: styleTags || [],
      },
      create: {
        userId: session.user.id,
        displayName: displayName || session.user.name || 'Host',
        contactEmail: contactEmail || session.user.email,
        location: location || null,
        bio: bio || null,
        styleTags: styleTags || [],
      },
    })

    return NextResponse.json({ success: true, profile: hostProfile })
  } catch (error) {
    console.error('[Host Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}

// Get host profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
      include: { properties: true },
    })

    if (!hostProfile) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({ profile: hostProfile })
  } catch (error) {
    console.error('[Host Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    )
  }
}
