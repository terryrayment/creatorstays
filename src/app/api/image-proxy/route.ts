import { NextRequest, NextResponse } from 'next/server'

// Allowed image domains for security
const ALLOWED_DOMAINS = [
  'a0.muscache.com',
  'z1.muscache.com', 
  'a1.muscache.com',
  'a2.muscache.com',
  'muscache.com',
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  try {
    const url = new URL(imageUrl)
    
    // Security: Only allow specific domains
    const isAllowed = ALLOWED_DOMAINS.some(domain => url.hostname.endsWith(domain))
    if (!isAllowed) {
      return new NextResponse('Domain not allowed', { status: 403 })
    }

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.airbnb.com/',
      },
    })

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Failed to proxy image', { status: 500 })
  }
}
