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

    // Try to extract the full location from various HTML patterns
    // Look for "Where you'll be" section data or location JSON
    const locationPatterns = [
      // JSON patterns for location data
      /"locationTitle"\s*:\s*"([^"]+)"/i,
      /"smartLocationString"\s*:\s*"([^"]+)"/i,
      /"city"\s*:\s*"([^"]+)"[^}]{0,100}"state"\s*:\s*"([^"]+)"/i,
      /"addressLocality"\s*:\s*"([^"]+)"[^}]{0,100}"addressRegion"\s*:\s*"([^"]+)"/i,
      /"location"\s*:\s*\{[^}]*"city"\s*:\s*"([^"]+)"/i,
      /"smartLocation"\s*:\s*"([^"]+)"/i,
      /"publicAddress"\s*:\s*"([^"]+)"/i,
      /"localizedCityName"\s*:\s*"([^"]+)"/i,
      /"marketLocation"\s*:\s*"([^"]+)"/i,
      /"cityName"\s*:\s*"([^"]+)"[^}]{0,200}"stateName"\s*:\s*"([^"]+)"/i,
      /"locationName"\s*:\s*"([^"]+)"/i,
    ]
    
    for (const pattern of locationPatterns) {
      const match = html.match(pattern)
      if (match) {
        let location = ''
        if (match[2]) {
          // Pattern with city and state as separate groups
          location = `${match[1]}, ${match[2]}`
        } else {
          location = match[1]
        }
        // Clean up the location
        location = location
          .replace(/\\u[\dA-Fa-f]{4}/g, '') // Remove unicode escapes
          .replace(/\s+/g, ' ')
          .trim()
        if (location && location.length > 3) {
          // Prefer locations with comma (city, state format)
          if (location.includes(',')) {
            result.cityRegion = location
            break
          } else if (!result.cityRegion) {
            result.cityRegion = location
          }
        }
      }
    }

    // Also search for location in script tags with __RELAY_DATA or similar
    const relayDataMatch = html.match(/<script[^>]*id="__RELAY_DATA"[^>]*>([\s\S]*?)<\/script>/i)
    if (relayDataMatch) {
      try {
        // Look for location patterns in the relay data
        const relayText = relayDataMatch[1]
        const cityStateMatch = relayText.match(/"city"\s*:\s*"([^"]+)"[\s\S]{0,500}"state"\s*:\s*"([^"]+)"/i)
        if (cityStateMatch) {
          const fullLocation = `${cityStateMatch[1]}, ${cityStateMatch[2]}`
          if (fullLocation.length > 5) {
            result.cityRegion = fullLocation
          }
        }
      } catch {
        // Ignore relay data parsing errors
      }
    }

    // If still no good location, try extracting from title
    if (!result.cityRegion || !result.cityRegion.includes(',')) {
      if (ogTitle) {
        const titleLocationMatch = ogTitle.match(/(?:home|cabin|house|apartment|condo|villa|cottage|chalet|studio|loft|suite|room|place|retreat|estate|lodge|rental)\s+in\s+([^·\-|]+)/i)
        if (titleLocationMatch) {
          let location = titleLocationMatch[1].trim()
          // Clean up - remove trailing descriptors
          location = location
            .replace(/\s*[-–—]\s*Airbnb.*$/i, '')
            .replace(/\s*\|.*$/i, '')
            .replace(/\s*·.*$/i, '')
            .trim()
          // Only use if we don't have a better location already
          if (location && location.length > 2 && (!result.cityRegion || result.cityRegion.length < location.length)) {
            result.cityRegion = location
          }
        }
      }
    }

    // Fallback: Extract location from description
    if (!result.cityRegion && ogDescription) {
      // Common formats: "Entire cabin in Big Bear, California" or "in Big Bear Lake, CA"
      // Be more careful - stop at common separators and property descriptions
      const locationMatch = ogDescription.match(/(?:Entire\s+\w+|Private\s+room|Shared\s+room)\s+in\s+([^.·\-|]+(?:,\s*[A-Za-z\s]+)?)/i)
      if (locationMatch) {
        let location = locationMatch[1].trim()
        // Remove things that aren't locations
        location = location
          .replace(/\s+(estate|retreat|house|home|cabin|villa|lodge|resort).*$/i, '')
          .trim()
        if (location && location.length > 2) {
          result.cityRegion = location
        }
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
    if (ogImage && !isAirbnbLogo(ogImage)) {
      photos.push(ogImage)
    }
    
    // Find additional images from muscache CDN
    // Filter out logos, icons, avatars, and small images
    const imageRegex = /["'](https:\/\/a0\.muscache\.com\/[^"']+\.(?:jpg|jpeg|webp|png)[^"']*)/gi
    let imageMatch: RegExpExecArray | null
    while ((imageMatch = imageRegex.exec(html)) !== null && photos.length < 10) {
      const imgUrl = imageMatch[1]
      
      // Skip if it's a logo, icon, avatar, or known non-property image
      if (isAirbnbLogo(imgUrl)) {
        continue
      }
      
      // Deduplicate by checking the filename
      const filename = imgUrl.split('/').pop()?.split('?')[0] || ''
      if (!photos.some(p => p.includes(filename))) {
        photos.push(imgUrl)
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
        
        // Get address - prefer this over title-extracted location
        if (data.address) {
          const addr = data.address
          let fullLocation = ''
          if (typeof addr === 'string') {
            fullLocation = addr
          } else if (addr.addressLocality) {
            fullLocation = `${addr.addressLocality}${addr.addressRegion ? ', ' + addr.addressRegion : ''}${addr.addressCountry ? ', ' + addr.addressCountry : ''}`
          }
          // Use JSON-LD location if it's more complete (has comma = city, state)
          if (fullLocation && (fullLocation.includes(',') || !result.cityRegion)) {
            result.cityRegion = fullLocation
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

    // Try to extract price from various HTML patterns
    if (!result.price) {
      const pricePatterns = [
        /\$(\d{2,4})\s*(?:\/\s*night|per night|a night|nightly)/i,
        /"priceString"\s*:\s*"\$(\d+)"/i,
        /class="[^"]*price[^"]*"[^>]*>\s*\$(\d+)/i,
        /data-testid="[^"]*price[^"]*"[^>]*>\s*\$(\d+)/i,
        />\s*\$(\d{2,4})\s*<\/span>\s*<span[^>]*>\s*night/i,
        /"price"\s*:\s*(\d+)/i,
        /"priceForDisplay"\s*:\s*"\$(\d+)"/i,
        /"discountedPrice"\s*:\s*"\$(\d+)"/i,
        /"originalPrice"\s*:\s*"\$(\d+)"/i,
        /aria-label="[^"]*\$(\d+)[^"]*night/i,
        /\$(\d{2,4})\s*<[^>]*>\s*night/i,
        />\$(\d{2,4})<\/span>/i,
        /"amount"\s*:\s*(\d+)/i,
        /"localizedAmount"\s*:\s*"\$(\d+)"/i,
        /data-price="(\d+)"/i,
        /content="\$(\d+)"/i,
        /"minPrice"\s*:\s*(\d+)/i,
        /"maxPrice"\s*:\s*(\d+)/i,
        /"basePrice"\s*:\s*(\d+)/i,
        /"nightlyPrice"\s*:\s*(\d+)/i,
      ]
      for (const pattern of pricePatterns) {
        const priceMatch = html.match(pattern)
        if (priceMatch) {
          const price = parseInt(priceMatch[1])
          // Create a range (price ± 20%)
          const low = Math.round(price * 0.8)
          const high = Math.round(price * 1.2)
          result.price = `$${low}-$${high}`
          break
        }
      }
    }

    // If still no price, try to find any dollar amount followed by "night"
    if (!result.price) {
      const genericPriceMatch = html.match(/\$\s*(\d{2,4})(?:[^0-9]|$)[\s\S]{0,50}night/i)
      if (genericPriceMatch) {
        const price = parseInt(genericPriceMatch[1])
        const low = Math.round(price * 0.8)
        const high = Math.round(price * 1.2)
        result.price = `$${low}-$${high}`
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

/**
 * Detect if a URL is an Airbnb logo, icon, host photo, or non-property image
 */
function isAirbnbLogo(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  
  // Known logo/icon/non-property patterns
  const excludePatterns = [
    'airbnb-static',
    'airbnb_logo',
    'airbnb-logo',
    '/logo',
    '/icon',
    '/favicon',
    '/apple-touch',
    'android-chrome',
    'default_user',
    'default-user',
    'avatar',
    'user_pic',
    'profile_pic',
    'host_pic',
    'badge',
    'superhost',
    'verified',
    'safety',
    '/em/',           // Emoji/icon folder
    '/social/',       // Social icons
    '/experiences/',  // Not property images
    'brandmark',
    'symbol',
    'belo',           // Airbnb Bélo logo
    'airbnb.com/static', // Static assets
    '/illustrations/', // Illustration graphics
    '/category_icon/', // Category icons
    'placeholder',
    'blank',
    'empty',
    '/users/',        // Host profile photos
    '/user-',         // User images
    'im/users',       // User profile images
    'im/pictures/user', // User pictures
    '/host/',         // Host images
    '/miso/',         // Airbnb illustration system
    '/lottie/',       // Animated graphics
    '/aircover/',     // AirCover marketing
    '/trips/',        // Trip-related graphics
    '/guidebook/',    // Guidebook images
    'drawing',        // Illustrated content
    'cartoon',        // Cartoon graphics
    'illustration',   // Illustrations
    'artwork',        // Artwork
    '/im/pictures/e2', // Experience/marketing images
    '/im/pictures/c8', // Category images
    'mediacdn',       // Media CDN (often profile pics)
    'guest-favorite', // Guest favorite badge
    'guest_favorite', // Guest favorite badge alt
    'airbnb-edu',     // Airbnb education
    '/pictures/6f7',   // Known illustration folder
    '/pictures/f0a',   // Known illustration folder
    '/pictures/d7e',   // Known illustration folder  
    '/pictures/76f',   // Known illustration folder
    'getaway',        // Marketing images
    'travel-insurance', // Insurance graphics
    'hosting-',       // Hosting marketing
    '-hosting',       // Hosting marketing
    'hero-image',     // Marketing hero images
    'cover-photo',    // Cover photos (marketing)
  ]
  
  for (const pattern of excludePatterns) {
    if (lowerUrl.includes(pattern)) {
      return true
    }
  }
  
  // Check for very small image dimensions in URL (icons are usually small)
  const dimensionMatch = url.match(/\/(\d+)x(\d+)/)
  if (dimensionMatch) {
    const width = parseInt(dimensionMatch[1])
    const height = parseInt(dimensionMatch[2])
    // Skip images smaller than 200px in either dimension (likely icons)
    if (width < 200 || height < 200) {
      return true
    }
    // Also skip very square small images (likely profile photos)
    if (width === height && width < 400) {
      return true
    }
  }
  
  // Check if the image looks like an illustration by examining the URL structure
  // Airbnb property photos typically have UUIDs or numeric IDs
  // Illustrations often have descriptive names
  const filename = url.split('/').pop()?.toLowerCase() || ''
  const illustrationKeywords = ['welcome', 'guest', 'host', 'check', 'arrival', 'key', 'door', 'people', 'person', 'family', 'couple', 'pet', 'dog', 'cat', 'luggage', 'suitcase', 'travel']
  for (const keyword of illustrationKeywords) {
    if (filename.includes(keyword)) {
      return true
    }
  }
  
  // Airbnb logo has specific red/pink color scheme - check for known logo image IDs
  const logoImageIds = [
    'airbnb-logo',
    'rbw4n0bgz',  // Common Airbnb Bélo logo ID
    'd22pp7j',    // Another Bélo variant
    'wkvmnj',     // House icon
    'hvna6j',     // Illustrated house
  ]
  
  for (const id of logoImageIds) {
    if (lowerUrl.includes(id)) {
      return true
    }
  }
  
  // Filter out images that are likely Airbnb brand assets by checking URL patterns
  // Airbnb property photos usually come from /im/pictures/hosting/ or /im/pictures/miso-*
  if (lowerUrl.includes('/airbnb-platform-assets/') || 
      lowerUrl.includes('/platform-assets/') ||
      lowerUrl.includes('/original_application/') ||
      lowerUrl.includes('/airbnb-brand/')) {
    return true
  }
  
  // Check if it looks like a simple graphic (PNG with transparency often)
  // Property photos are usually jpg/webp
  if (lowerUrl.includes('.png') && 
      (lowerUrl.includes('illustration') || 
       lowerUrl.includes('graphic') || 
       lowerUrl.includes('icon') ||
       lowerUrl.includes('brand') ||
       lowerUrl.includes('asset'))) {
    return true
  }
  
  // Property photos should contain certain patterns
  // If it doesn't look like a property photo path, be more cautious
  const propertyPhotoPatterns = [
    '/im/pictures/hosting/',
    '/im/pictures/miso-listing/',
    '/im/pictures/prohost-api/',
    '/pictures/hosting/',
    'a0.muscache.com/im/pictures/',
  ]
  
  // If URL contains muscache but doesn't match property patterns, it might be non-property
  if (lowerUrl.includes('muscache.com') && !propertyPhotoPatterns.some(p => lowerUrl.includes(p))) {
    // Additional check - if it's in a suspicious path, exclude it
    if (lowerUrl.includes('/im/pictures/') && 
        !lowerUrl.includes('hosting') && 
        !lowerUrl.includes('miso-listing') &&
        !lowerUrl.includes('prohost')) {
      // Could be marketing/illustration content - be cautious
      // But don't exclude all, as some property photos use other paths
    }
  }
  
  return false
}
