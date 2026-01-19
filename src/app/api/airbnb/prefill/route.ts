import { NextRequest, NextResponse } from 'next/server'

interface PrefillResult {
  ok: boolean
  title?: string
  city?: string
  rating?: number
  reviewCount?: number
  price?: string
  photos?: string[]
  error?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ ok: false, error: 'URL required' } as PrefillResult)
  }

  if (!url.includes('airbnb.com')) {
    return NextResponse.json({ ok: false, error: 'Only Airbnb URLs supported' } as PrefillResult)
  }

  try {
    // Fetch the Airbnb page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: 'Failed to fetch listing' } as PrefillResult)
    }

    const html = await response.text()
    const result: PrefillResult = { ok: true }

    // Extract Open Graph tags
    const ogTitle = extractMetaContent(html, 'og:title')
    const ogImage = extractMetaContent(html, 'og:image')
    const ogDescription = extractMetaContent(html, 'og:description')

    if (ogTitle) {
      result.title = ogTitle.replace(' - Airbnb', '').replace('Airbnb', '').trim()
    }

    // Try to extract city from title or description
    if (ogDescription) {
      // Often format is "Entire cabin in Big Bear, California"
      const locationMatch = ogDescription.match(/in\s+([^.·\-]+)/i)
      if (locationMatch) {
        result.city = locationMatch[1].trim()
      }
    }

    // Collect photos from og:image and any other image meta tags
    const photos: string[] = []
    if (ogImage) {
      photos.push(ogImage)
    }
    
    // Try to find additional images using exec loop
    const imageRegex = /content="(https:\/\/a0\.muscache\.com\/[^"]+)"/g
    let imageMatch: RegExpExecArray | null
    while ((imageMatch = imageRegex.exec(html)) !== null && photos.length < 6) {
      if (!photos.includes(imageMatch[1])) {
        photos.push(imageMatch[1])
      }
    }
    
    if (photos.length > 0) {
      result.photos = photos.slice(0, 6)
    }

    // Try to extract JSON-LD data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1])
        
        // Handle array of JSON-LD objects
        const data = Array.isArray(jsonLd) ? jsonLd[0] : jsonLd
        
        if (data.name && !result.title) {
          result.title = data.name
        }
        
        if (data.address) {
          const addr = data.address
          if (typeof addr === 'string') {
            result.city = addr
          } else if (addr.addressLocality) {
            result.city = `${addr.addressLocality}${addr.addressRegion ? ', ' + addr.addressRegion : ''}`
          }
        }
        
        if (data.aggregateRating) {
          result.rating = data.aggregateRating.ratingValue
          result.reviewCount = data.aggregateRating.reviewCount
        }
        
        if (data.offers?.priceSpecification?.price) {
          result.price = `$${data.offers.priceSpecification.price}`
        }
      } catch {
        // JSON-LD parse failed, continue with what we have
      }
    }

    // Try to extract rating from HTML if not in JSON-LD
    if (!result.rating) {
      const ratingMatch = html.match(/(\d+\.\d+)\s*·?\s*(\d+)\s*reviews?/i)
      if (ratingMatch) {
        result.rating = parseFloat(ratingMatch[1])
        result.reviewCount = parseInt(ratingMatch[2])
      }
    }

    // Check if we got any useful data
    if (!result.title && !result.city && photos.length === 0) {
      return NextResponse.json({ ok: false, error: 'Could not extract listing details' } as PrefillResult)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Airbnb prefill error:', error)
    return NextResponse.json({ ok: false, error: 'Failed to fetch listing' } as PrefillResult)
  }
}

function extractMetaContent(html: string, property: string): string | null {
  // Try property attribute
  const propertyMatch = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
  if (propertyMatch) return propertyMatch[1]
  
  // Try content before property
  const reverseMatch = html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'))
  if (reverseMatch) return reverseMatch[1]
  
  // Try name attribute (for some meta tags)
  const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'))
  if (nameMatch) return nameMatch[1]
  
  return null
}
