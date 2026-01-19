import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Extract Airbnb listing ID from URL
function extractAirbnbId(url: string): string | null {
  // Match patterns like /rooms/12345 or /h/listing-name
  const roomsMatch = url.match(/airbnb\.[^/]+\/rooms\/(\d+)/)
  if (roomsMatch) return roomsMatch[1]
  
  const hMatch = url.match(/airbnb\.[^/]+\/h\/([^/?]+)/)
  if (hMatch) return hMatch[1]
  
  return null
}

// Validate Airbnb URL format
function isValidAirbnbUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?airbnb\.[a-z.]+\/(rooms\/\d+|h\/[^/?]+)/i.test(url)
}

// GET /api/properties - List properties for a host
export async function GET(request: NextRequest) {
  try {
    // In production, get hostProfileId from session
    // For now, use query param or mock
    const hostProfileId = request.nextUrl.searchParams.get('hostProfileId') || 'mock-host-id'
    
    const properties = await prisma.property.findMany({
      where: { hostProfileId },
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
      hostProfileId = 'mock-host-id', // In production, from session
      listingUrl,
      title,
      description,
      city,
      region,
      country,
      heroImageUrl,
      photoUrls = [],
      isActive = true,
      isDraft = false,
      refreshFromAirbnb = false,
    } = body

    // Validate Airbnb URL if provided
    if (listingUrl && !isValidAirbnbUrl(listingUrl)) {
      return NextResponse.json({ 
        error: 'Invalid Airbnb URL. Use format: airbnb.com/rooms/123456' 
      }, { status: 400 })
    }

    const airbnbListingId = listingUrl ? extractAirbnbId(listingUrl) : null

    // Prefill from Airbnb if new or refresh requested
    let prefillData: Record<string, unknown> = {}
    if (listingUrl && (!id || refreshFromAirbnb)) {
      try {
        // Call our existing prefill API
        const prefillUrl = new URL('/api/airbnb/prefill', request.url)
        prefillUrl.searchParams.set('url', listingUrl)
        
        const prefillRes = await fetch(prefillUrl.toString())
        if (prefillRes.ok) {
          const prefill = await prefillRes.json()
          prefillData = {
            title: prefill.title || title,
            heroImageUrl: prefill.imageUrl || heroImageUrl,
            city: prefill.cityRegion?.split(',')[0]?.trim() || city,
            region: prefill.cityRegion?.split(',')[1]?.trim() || region,
            airbnbLastFetchedAt: new Date(),
          }
        }
      } catch (prefillError) {
        console.warn('[Properties API] Prefill failed:', prefillError)
        // Continue without prefill data
      }
    }

    const propertyData = {
      hostProfileId,
      listingUrl,
      listingPlatform: 'airbnb',
      airbnbListingId,
      title: prefillData.title as string || title || 'Untitled Property',
      description,
      city: prefillData.city as string || city,
      region: prefillData.region as string || region,
      country,
      heroImageUrl: prefillData.heroImageUrl as string || heroImageUrl,
      photoUrls,
      isActive,
      isDraft,
      airbnbLastFetchedAt: prefillData.airbnbLastFetchedAt as Date || undefined,
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
