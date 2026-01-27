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
      propertyType, // Aliased to venueType in schema
      venueType,    // Direct schema field
      cityRegion,
      priceNightlyRange,
      rating,
      reviewCount,
      guests,
      maxGuests,
      beds,
      bedrooms,     // Alias for beds (from onboarding)
      baths,
      bathrooms,    // Alias for baths (from onboarding)
      amenities = [],
      vibeTags = [],
      houseRules,
      photos = [],
      heroImageUrl,
      creatorBrief,
      isActive,
      isDraft,
      lastImportedAt,
      icalUrl,
    } = body
    
    // Explicitly check for boolean values (don't use defaults that override passed values)
    const finalIsActive = isActive !== undefined ? isActive : true
    const finalIsDraft = isDraft !== undefined ? isDraft : true
    
    // Handle field aliases (bedrooms -> beds, bathrooms -> baths)
    const finalBeds = beds ?? bedrooms
    const finalBaths = baths ?? bathrooms
    
    // Use venueType if provided, otherwise fall back to propertyType
    const finalVenueType = venueType || propertyType || null
    
    console.log('[Properties API] Received:', { title, venueType: finalVenueType, isDraft, isActive, finalIsDraft, finalIsActive })

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

    // Build propertyData with ONLY the fields that were explicitly provided
    // This prevents partial updates (like photo saves) from wiping other fields
    const propertyData: Record<string, any> = {
      hostProfileId: hostProfile.id,
    }
    
    // Only include fields that were explicitly sent in the request
    if (airbnbUrl !== undefined) propertyData.airbnbUrl = airbnbUrl || null
    if (icalUrl !== undefined) propertyData.icalUrl = icalUrl || null
    if (title !== undefined) propertyData.title = title || null
    if (finalVenueType !== undefined && finalVenueType !== null) propertyData.venueType = finalVenueType
    if (cityRegion !== undefined) propertyData.cityRegion = cityRegion || null
    if (priceNightlyRange !== undefined) propertyData.priceNightlyRange = priceNightlyRange || null
    if (rating !== undefined) propertyData.rating = rating ? parseFloat(String(rating)) : null
    if (reviewCount !== undefined) propertyData.reviewCount = reviewCount ? parseInt(String(reviewCount)) : null
    if (maxGuests !== undefined || guests !== undefined) {
      propertyData.guests = maxGuests ? parseInt(String(maxGuests)) : (guests ? parseInt(String(guests)) : null)
    }
    if (finalBeds !== undefined) propertyData.beds = finalBeds ? parseInt(String(finalBeds)) : null
    if (finalBaths !== undefined) propertyData.baths = finalBaths ? Math.round(parseFloat(String(finalBaths))) : null
    if (body.amenities !== undefined) propertyData.amenities = amenities
    if (body.vibeTags !== undefined) propertyData.vibeTags = vibeTags
    if (houseRules !== undefined) propertyData.houseRules = houseRules || null
    if (body.photos !== undefined) propertyData.photos = photos
    if (heroImageUrl !== undefined) propertyData.heroImageUrl = heroImageUrl || null
    if (creatorBrief !== undefined) propertyData.creatorBrief = creatorBrief || null
    if (isActive !== undefined) propertyData.isActive = finalIsActive
    if (isDraft !== undefined) propertyData.isDraft = finalIsDraft
    if (lastImportedAt !== undefined) propertyData.lastImportedAt = lastImportedAt ? new Date(lastImportedAt) : null
    
    
    console.log('[Properties API] Property data to save:', { 
      title: propertyData.title, 
      venueType: propertyData.venueType,
      isDraft: propertyData.isDraft, 
      isActive: propertyData.isActive,
      propertyIdToUse,
      photosCount: propertyData.photos?.length || 'not updating',
      heroImageUrl: propertyData.heroImageUrl,
      fieldsBeingUpdated: Object.keys(propertyData).filter(k => k !== 'hostProfileId'),
    })

    let property
    if (propertyIdToUse) {
      // Verify ownership before update
      const existing = await prisma.property.findUnique({ where: { id: propertyIdToUse } })
      if (!existing || existing.hostProfileId !== hostProfile.id) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 })
      }
      
      console.log('[Properties API] Updating property:', propertyIdToUse)
      console.log('[Properties API] Before update - isDraft:', existing.isDraft, 'title:', existing.title)
      console.log('[Properties API] Will update fields:', Object.keys(propertyData).filter(k => k !== 'hostProfileId'))
      
      // Update existing - use partial data (only fields that were sent)
      // Remove hostProfileId from update data as it shouldn't change
      const { hostProfileId: _, ...updateData } = propertyData
      property = await prisma.property.update({
        where: { id: propertyIdToUse },
        data: updateData,
      })
      
      console.log('[Properties API] After update - isDraft:', property.isDraft, 'title:', property.title)
    } else {
      // Create new - need full data with defaults
      console.log('[Properties API] Creating new property')
      const createData = {
        hostProfileId: hostProfile.id,
        airbnbUrl: airbnbUrl || null,
        icalUrl: icalUrl || null,
        title: title || null,
        venueType: finalVenueType || null,
        cityRegion: cityRegion || null,
        priceNightlyRange: priceNightlyRange || null,
        rating: rating ? parseFloat(String(rating)) : null,
        reviewCount: reviewCount ? parseInt(String(reviewCount)) : null,
        guests: maxGuests ? parseInt(String(maxGuests)) : (guests ? parseInt(String(guests)) : null),
        beds: finalBeds ? parseInt(String(finalBeds)) : null,
        baths: finalBaths ? Math.round(parseFloat(String(finalBaths))) : null,
        amenities: amenities || [],
        vibeTags: vibeTags || [],
        houseRules: houseRules || null,
        photos: photos || [],
        heroImageUrl: heroImageUrl || null,
        creatorBrief: creatorBrief || null,
        isActive: finalIsActive,
        isDraft: finalIsDraft,
        lastImportedAt: lastImportedAt ? new Date(lastImportedAt) : null,
      }
      property = await prisma.property.create({
        data: createData,
      })
      console.log('[Properties API] Created property:', property.id, 'isDraft:', property.isDraft)
    }

    return NextResponse.json({ property })
  } catch (error: any) {
    console.error('[Properties API] POST error:', error)
    const errorMessage = error?.message || 'Failed to save property'
    return NextResponse.json({ error: errorMessage, details: error?.code || 'UNKNOWN' }, { status: 500 })
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
