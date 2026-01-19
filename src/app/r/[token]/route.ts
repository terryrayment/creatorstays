import { NextRequest, NextResponse } from 'next/server'

// Attribution window in days (configurable)
const ATTRIBUTION_WINDOW_DAYS = 30

// Mock link database - replace with real DB lookup later
const mockLinks: Record<string, { destinationUrl: string; creatorId: string; propertyId: string }> = {
  // Example tokens for testing
  'test-abc123': {
    destinationUrl: 'https://airbnb.com/rooms/123456',
    creatorId: 'creator_1',
    propertyId: 'property_1',
  },
  'demo-xyz789': {
    destinationUrl: 'https://vrbo.com/123456',
    creatorId: 'creator_2', 
    propertyId: 'property_2',
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token
  
  // Look up the link data
  const linkData = mockLinks[token]
  
  if (!linkData) {
    // Token not found - redirect to homepage with error
    return NextResponse.redirect(new URL('/?error=invalid_link', request.url))
  }

  const { destinationUrl, creatorId, propertyId } = linkData

  // Generate a unique click ID for this visit
  const clickId = `${token}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Calculate cookie expiry (30 days from now)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + ATTRIBUTION_WINDOW_DAYS)

  // Create the redirect response
  const response = NextResponse.redirect(destinationUrl)

  // Set the attribution cookie
  // Cookie value contains: token|creatorId|propertyId|clickId|timestamp
  const cookieValue = `${token}|${creatorId}|${propertyId}|${clickId}|${Date.now()}`
  
  response.cookies.set('cs_ref', cookieValue, {
    expires: expiryDate,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // Allow JS access for fallback/analytics
  })

  // Also set individual cookies for easier access
  response.cookies.set('cs_click_id', clickId, {
    expires: expiryDate,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  response.cookies.set('cs_creator', creatorId, {
    expires: expiryDate,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  response.cookies.set('cs_property', propertyId, {
    expires: expiryDate,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Log the click (replace with real analytics/DB insert later)
  console.log('[CreatorStays] Click tracked:', {
    token,
    clickId,
    creatorId,
    propertyId,
    destinationUrl,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
  })

  return response
}
