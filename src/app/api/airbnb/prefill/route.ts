import { NextRequest, NextResponse } from 'next/server'

/**
 * Airbnb listing prefill endpoint
 * 
 * Attempts to fetch basic listing details from an Airbnb URL.
 * This is best-effort - Airbnb actively blocks scraping, so failures are expected.
 * 
 * Returns:
 * - ok: true + listing data on success
 * - ok: false + error message on failure
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ ok: false, error: 'URL is required' })
  }
  
  // Extract room ID from URL
  const roomIdMatch = url.match(/\/rooms\/(\d+)/)
  if (!roomIdMatch) {
    return NextResponse.json({ ok: false, error: 'Invalid Airbnb URL' })
  }
  
  const roomId = roomIdMatch[1]
  
  try {
    // Attempt to fetch the Airbnb listing page
    const response = await fetch(`https://www.airbnb.com/rooms/${roomId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    
    if (!response.ok) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Could not access listing. Airbnb may be blocking this request.' 
      })
    }
    
    const html = await response.text()
    
    // Extract data from the page
    const data = extractListingData(html, roomId)
    
    if (!data.title && !data.imageUrl) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Could not extract listing details. Try entering details manually.' 
      })
    }
    
    return NextResponse.json({ ok: true, ...data })
    
  } catch (error) {
    // Network errors, timeouts, etc.
    return NextResponse.json({ 
      ok: false, 
      error: 'Could not connect to Airbnb. Please try again or enter details manually.' 
    })
  }
}

/**
 * Extract listing data from Airbnb HTML
 * Uses multiple strategies since Airbnb's markup changes frequently
 */
function extractListingData(html: string, roomId: string) {
  const data: {
    title?: string
    imageUrl?: string
    cityRegion?: string
    rating?: number
    reviewCount?: number
    price?: string
    guests?: number
    beds?: number
    baths?: number
    photos?: string[]
  } = {}
  
  // Try to extract from JSON-LD structured data
  const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1])
      if (jsonLd.name) data.title = jsonLd.name
      if (jsonLd.image) data.imageUrl = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image
      if (jsonLd.address?.addressLocality) data.cityRegion = jsonLd.address.addressLocality
      if (jsonLd.aggregateRating?.ratingValue) data.rating = parseFloat(jsonLd.aggregateRating.ratingValue)
      if (jsonLd.aggregateRating?.reviewCount) data.reviewCount = parseInt(jsonLd.aggregateRating.reviewCount)
    } catch {
      // JSON-LD parsing failed, continue with other methods
    }
  }
  
  // Try to extract from meta tags
  if (!data.title) {
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                       html.match(/<title>([^<]+)<\/title>/i)
    if (titleMatch) data.title = decodeHtmlEntities(titleMatch[1])
  }
  
  if (!data.imageUrl) {
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
    if (imageMatch) data.imageUrl = imageMatch[1]
  }
  
  if (!data.cityRegion) {
    // Try to extract location from title or description
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
    if (descMatch) {
      // Often format is "Entire rental unit in City, Region"
      const locationMatch = descMatch[1].match(/in\s+([^·]+)/i)
      if (locationMatch) data.cityRegion = decodeHtmlEntities(locationMatch[1].trim())
    }
  }
  
  // Try to extract capacity/amenity info from page content
  const guestsMatch = html.match(/(\d+)\s*guests?/i)
  if (guestsMatch) data.guests = parseInt(guestsMatch[1])
  
  const bedsMatch = html.match(/(\d+)\s*beds?/i)
  if (bedsMatch) data.beds = parseInt(bedsMatch[1])
  
  const bathsMatch = html.match(/(\d+(?:\.\d+)?)\s*baths?/i)
  if (bathsMatch) data.baths = parseFloat(bathsMatch[1])
  
  // Try to extract photos from the page
  const photoMatches = Array.from(
    html.matchAll(/https:\/\/a0\.muscache\.com\/[^"'\s]+/g),
    (m) => m[0]
  )
  
  // Dedupe without Set spread (avoids downlevelIteration build error)
  const seen = new Set<string>()
  const photos = photoMatches
    .filter((url) => {
      if (!url.includes('/pictures/')) return false
      if (url.includes('avatar')) return false
      if (seen.has(url)) return false
      seen.add(url)
      return true
    })
    .slice(0, 10)
  
  if (photos.length > 0) data.photos = photos
  
  return data
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}
