import { NextRequest, NextResponse } from 'next/server'

interface PrefillResult {
  ok: boolean
  title?: string
  cityRegion?: string
  imageUrl?: string
  rating?: number
  reviewCount?: number
  price?: string
  photos?: string[]
  guests?: number
  bedrooms?: number
  beds?: number
  baths?: number
  propertyType?: string
  error?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ ok: false, error: 'URL required' } as PrefillResult)
  }

  if (!url.includes('airbnb.com') && !url.includes('airbnb.')) {
    return NextResponse.json({ ok: false, error: 'Only Airbnb URLs supported' } as PrefillResult)
  }

  try {
    // Fetch the Airbnb page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ 
        ok: false, 
        error: `Failed to fetch listing (${response.status})` 
      } as PrefillResult)
    }

    const html = await response.text()
    const result: PrefillResult = { ok: true }

    // Extract Open Graph tags (most reliable)
    const ogTitle = extractMetaContent(html, 'og:title')
    const ogImage = extractMetaContent(html, 'og:image')
    const ogDescription = extractMetaContent(html, 'og:description')

    if (ogTitle) {
      // Clean up title - remove "- Airbnb" suffix
      result.title = ogTitle
        .replace(/\s*[-–—]\s*Airbnb.*$/i, '')
        .replace(/\s*\|\s*Airbnb.*$/i, '')
        .trim()
    }

    if (ogImage) {
      result.imageUrl = ogImage
    }

    // Extract location from description or title
    if (ogDescription) {
      // Common formats: "Entire cabin in Big Bear, California" or "in Big Bear Lake, CA"
      const locationMatch = ogDescription.match(/(?:in|at)\s+([^.·\-|]+(?:,\s*[A-Z]{2})?)/i)
      if (locationMatch) {
        result.cityRegion = locationMatch[1].trim()
      }
    }

    // Try to extract property details from description
    if (ogDescription) {
      // "4 guests · 2 bedrooms · 3 beds · 1 bath"
      const guestsMatch = ogDescription.match(/(\d+)\s*guests?/i)
      const bedroomsMatch = ogDescription.match(/(\d+)\s*bedrooms?/i)
      const bedsMatch = ogDescription.match(/(\d+)\s*beds?(?!room)/i)
      const bathsMatch = ogDescription.match(/(\d+(?:\.\d+)?)\s*baths?/i)
      
      if (guestsMatch) result.guests = parseInt(guestsMatch[1])
      if (bedroomsMatch) result.bedrooms = parseInt(bedroomsMatch[1])
      if (bedsMatch) result.beds = parseInt(bedsMatch[1])
      if (bathsMatch) result.baths = parseFloat(bathsMatch[1])

      // Property type
      const typeMatch = ogDescription.match(/^(Entire\s+\w+|Private\s+room|Shared\s+room|Room)/i)
      if (typeMatch) result.propertyType = typeMatch[1]
    }

    // Collect photos
    const photos: string[] = []
    if (ogImage) {
      photos.push(ogImage)
    }
    
    // Find additional images from muscache CDN
    const imageRegex = /["'](https:\/\/a0\.muscache\.com\/[^"']+\.(?:jpg|jpeg|webp|png)[^"']*)/gi
    let imageMatch: RegExpExecArray | null
    while ((imageMatch = imageRegex.exec(html)) !== null && photos.length < 10) {
      const imgUrl = imageMatch[1].split('?')[0] // Remove query params for dedup
      if (!photos.some(p => p.includes(imgUrl.split('/').pop() || ''))) {
        photos.push(imageMatch[1])
      }
    }
    
    if (photos.length > 0) {
      result.photos = photos.slice(0, 10)
    }

    // Try to extract JSON-LD data (structured data)
    const jsonLdRegex = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
    let jsonLdMatch: RegExpExecArray | null
    while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1])
        const data = Array.isArray(jsonLd) ? jsonLd[0] : jsonLd
        
        // Get title if not already set
        if (data.name && !result.title) {
          result.title = data.name
        }
        
        // Get address
        if (data.address && !result.cityRegion) {
          const addr = data.address
          if (typeof addr === 'string') {
            result.cityRegion = addr
          } else if (addr.addressLocality) {
            result.cityRegion = `${addr.addressLocality}${addr.addressRegion ? ', ' + addr.addressRegion : ''}`
          }
        }
        
        // Get rating
        if (data.aggregateRating) {
          result.rating = data.aggregateRating.ratingValue
          result.reviewCount = data.aggregateRating.reviewCount
        }
        
        // Get price
        if (data.offers?.priceSpecification?.price) {
          result.price = `$${data.offers.priceSpecification.price}`
        } else if (data.offers?.price) {
          result.price = `$${data.offers.price}`
        }
      } catch {
        // JSON-LD parse failed, continue
      }
    }

    // Fallback: Try to extract rating from HTML patterns
    if (!result.rating) {
      const ratingPatterns = [
        /(\d+\.\d+)\s*·?\s*(\d+)\s*reviews?/i,
        /rating["\s:]+(\d+\.?\d*)/i,
        /"ratingValue"["\s:]+(\d+\.?\d*)/i,
      ]
      for (const pattern of ratingPatterns) {
        const ratingMatch = html.match(pattern)
        if (ratingMatch) {
          result.rating = parseFloat(ratingMatch[1])
          if (ratingMatch[2]) result.reviewCount = parseInt(ratingMatch[2])
          break
        }
      }
    }

    // Check if we got any useful data
    if (!result.title && !result.cityRegion && !result.imageUrl) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Could not extract listing details. Airbnb may have blocked the request.' 
      } as PrefillResult)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Airbnb prefill error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch listing. Try again or enter details manually.' 
    } as PrefillResult)
  }
}

function extractMetaContent(html: string, property: string): string | null {
  // Try property attribute first
  const propertyMatch = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
  if (propertyMatch) return decodeHtmlEntities(propertyMatch[1])
  
  // Try content before property
  const reverseMatch = html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'))
  if (reverseMatch) return decodeHtmlEntities(reverseMatch[1])
  
  // Try name attribute
  const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
  if (nameMatch) return decodeHtmlEntities(nameMatch[1])
  
  return null
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}
