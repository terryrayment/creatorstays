import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Create or update host profile (POST)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { displayName, contactEmail, location, bio, styleTags, idealGuests, vibes, houseRules } = body

    // Upsert host profile
    const hostProfile = await prisma.hostProfile.upsert({
      where: { userId: session.user.id },
      update: {
        displayName: displayName || session.user.name || 'Host',
        contactEmail: contactEmail || session.user.email,
        location: location || null,
        bio: bio || null,
        styleTags: styleTags || [],
        idealGuests: idealGuests || [],
        vibes: vibes || [],
        houseRules: houseRules || [],
      },
      create: {
        userId: session.user.id,
        displayName: displayName || session.user.name || 'Host',
        contactEmail: contactEmail || session.user.email,
        location: location || null,
        bio: bio || null,
        styleTags: styleTags || [],
        idealGuests: idealGuests || [],
        vibes: vibes || [],
        houseRules: houseRules || [],
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

// Update host profile (PUT) - same as POST but explicit
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      displayName, contactEmail, location, bio, avatarUrl,
      styleTags, idealGuests, vibes, houseRules, 
      onboardingComplete, creatorPrefs, contentGoals
    } = body

    // Upsert host profile
    const hostProfile = await prisma.hostProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(location !== undefined && { location }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(styleTags !== undefined && { styleTags }),
        ...(idealGuests !== undefined && { idealGuests }),
        ...(vibes !== undefined && { vibes }),
        ...(houseRules !== undefined && { houseRules }),
        ...(onboardingComplete !== undefined && { onboardingComplete }),
        ...(creatorPrefs !== undefined && { creatorPrefs }),
        ...(contentGoals !== undefined && { contentGoals }),
      },
      create: {
        userId: session.user.id,
        displayName: displayName || session.user.name || 'Host',
        contactEmail: contactEmail || session.user.email,
        location: location || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        styleTags: styleTags || [],
        idealGuests: idealGuests || [],
        vibes: vibes || [],
        houseRules: houseRules || [],
        onboardingComplete: onboardingComplete || false,
      },
    })

    return NextResponse.json(hostProfile)
  } catch (error) {
    console.error('[Host Profile] PUT Error:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}

// Partial update (PATCH) - for quiz data
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Only update fields that are provided
    const updateData: any = {}
    
    if (body.creatorPrefs !== undefined) {
      updateData.creatorPrefs = body.creatorPrefs
    }
    if (body.contentGoals !== undefined) {
      updateData.contentGoals = body.contentGoals
    }
    if (body.displayName !== undefined) {
      updateData.displayName = body.displayName
    }
    if (body.bio !== undefined) {
      updateData.bio = body.bio
    }
    if (body.location !== undefined) {
      updateData.location = body.location
    }
    if (body.avatarUrl !== undefined) {
      updateData.avatarUrl = body.avatarUrl
    }

    const hostProfile = await prisma.hostProfile.update({
      where: { userId: session.user.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, profile: hostProfile })
  } catch (error) {
    console.error('[Host Profile] PATCH Error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// Get host profile
export async function GET() {
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
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(hostProfile)
  } catch (error) {
    console.error('[Host Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    )
  }
}
