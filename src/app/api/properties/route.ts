import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Demo host ID (TODO: replace with auth session)
const DEMO_HOST_ID = 'demo-host-001'

// Validate Airbnb URL format
function isValidAirbnbUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?airbnb\.[a-z.]+\/(rooms\/\d+|h\/[^/?]+)/i.test(url)
}

// GET /api/properties - List properties for current host
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: { hostProfileId: DEMO_HOST_ID },
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

    // Validate Airbnb URL if provided
    if (airbnbUrl && !isValidAirbnbUrl(airbnbUrl)) {
      return NextResponse.json({ 
        error: 'Invalid Airbnb URL. Use format: airbnb.com/rooms/123456' 
      }, { status: 400 })
    }

    const propertyData = {
      hostProfileId: DEMO_HOST_ID,
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
    if (id) {
      // Update existing
      property = await prisma.property.update({
        where: { id },
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
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 })
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
