import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Validate Airbnb URL format
function isValidAirbnbUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?airbnb\.[a-z.]+\/(rooms\/\d+|h\/[^/?]+)/i.test(url)
}

// GET /api/properties - List properties for current host
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create host profile
    let hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      // Create host profile if doesn't exist
      hostProfile = await prisma.hostProfile.create({
        data: {
          userId: session.user.id,
          displayName: session.user.name || 'Host',
          contactEmail: session.user.email,
        },
      })
    }

    const properties = await prisma.property.findMany({
      where: { hostProfileId: hostProfile.id },
      orderBy: { updatedAt: 'desc' },
    })
    
    return NextResponse.json({ properties })
  } catch (error) {
    console.error('[Properties API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

// POST /api/properties - Create or update a property
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create host profile
    let hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      hostProfile = await prisma.hostProfile.create({
        data: {
          userId: session.user.id,
          displayName: session.user.name || 'Host',
          contactEmail: session.user.email,
        },
      })
    }

    const body = await request.json()
    const { 
      id,
      airbnbUrl,
      title,
      cityRegion,
      priceNightlyRange,
      rating,
      reviewCount,
      guests,
      beds,
      baths,
      amenities = [],
      vibeTags = [],
      houseRules,
      photos = [],
      heroImageUrl,
      creatorBrief,
      isActive = true,
      isDraft = true,
      lastImportedAt,
    } = body

    // If no ID provided but host already has a property, find and update it
    let propertyIdToUse = id
    if (!propertyIdToUse && !hostProfile.isAgency) {
      const existingProperty = await prisma.property.findFirst({
        where: { hostProfileId: hostProfile.id },
      })
      
      if (existingProperty) {
        // Use existing property ID for update
        propertyIdToUse = existingProperty.id
        console.log(`[Properties API] Auto-updating existing property ${propertyIdToUse}`)
      }
    }

    // Check property limit for non-agency hosts (only when creating truly new property)
    if (!propertyIdToUse && !hostProfile.isAgency) {
      const existingPropertyCount = await prisma.property.count({
        where: { hostProfileId: hostProfile.id },
      })
      
      if (existingPropertyCount >= 1) {
        return NextResponse.json({ 
          error: 'Property limit reached. Upgrade to Agency Pro for unlimited properties.',
          code: 'PROPERTY_LIMIT_REACHED'
        }, { status: 403 })
      }
    }

    // Validate Airbnb URL if provided
    if (airbnbUrl && !isValidAirbnbUrl(airbnbUrl)) {
      return NextResponse.json({ 
        error: 'Invalid Airbnb URL. Use format: airbnb.com/rooms/123456' 
      }, { status: 400 })
    }

    const propertyData = {
      hostProfileId: hostProfile.id,
      airbnbUrl: airbnbUrl || null,
      title: title || null,
      cityRegion: cityRegion || null,
      priceNightlyRange: priceNightlyRange || null,
      rating: rating ? parseFloat(rating) : null,
      reviewCount: reviewCount ? parseInt(reviewCount) : null,
      guests: guests ? parseInt(guests) : null,
      beds: beds ? parseInt(beds) : null,
      baths: baths ? parseInt(baths) : null,
      amenities,
      vibeTags,
      houseRules: houseRules || null,
      photos,
      heroImageUrl: heroImageUrl || null,
      creatorBrief: creatorBrief || null,
      isActive,
      isDraft,
      lastImportedAt: lastImportedAt ? new Date(lastImportedAt) : null,
    }

    let property
    if (propertyIdToUse) {
      // Verify ownership before update
      const existing = await prisma.property.findUnique({ where: { id: propertyIdToUse } })
      if (!existing || existing.hostProfileId !== hostProfile.id) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
      
      // Update existing
      property = await prisma.property.update({
        where: { id: propertyIdToUse },
        data: propertyData,
      })
    } else {
      // Create new
      property = await prisma.property.create({
        data: propertyData,
      })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('[Properties API] POST error:', error)
    return NextResponse.json({ error: 'Failed to save property' }, { status: 500 })
  }
}

// DELETE /api/properties - Delete a property
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 })
    }

    // Verify ownership before delete
    const property = await prisma.property.findUnique({ where: { id } })
    if (!property || property.hostProfileId !== hostProfile.id) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    await prisma.property.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Properties API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}
