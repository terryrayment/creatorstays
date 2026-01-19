import { NextRequest, NextResponse } from 'next/server'
import { 
  collaborations, 
  clicks, 
  mockHosts,
  generateToken,
  type Click 
} from '@/lib/collaboration-types'

// Attribution window in days
const ATTRIBUTION_WINDOW_DAYS = 30

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token
  
  // Look up the collaboration by affiliate token
  const collaboration = collaborations.find(c => c.affiliateToken === token)
  
  if (!collaboration) {
    // Token not found - redirect to homepage with error
    return NextResponse.redirect(new URL('/?error=invalid_link', request.url))
  }

  // Get destination URL from property
  const host = mockHosts.find(h => h.id === collaboration.hostId)
  const property = host?.properties.find(p => p.id === collaboration.propertyId)
  
  if (!property) {
    return NextResponse.redirect(new URL('/?error=property_not_found', request.url))
  }

  const destinationUrl = property.listingUrl

  // Check for existing visitor (revisit detection)
  const visitorCookie = request.cookies.get(`cs_visitor_${token}`)
  const isRevisit = !!visitorCookie
  const visitorId = visitorCookie?.value || generateToken()

  // Record the click
  const click: Click = {
    id: `click-${generateToken()}`,
    collaborationId: collaboration.id,
    affiliateToken: token,
    clickedAt: new Date(),
    visitorId,
    isUnique: !isRevisit,
    isRevisit,
    device: detectDevice(request.headers.get('user-agent') || ''),
    referer: request.headers.get('referer') || undefined,
  }
  
  clicks.push(click)

  // Calculate cookie expiry (30 days from now)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + ATTRIBUTION_WINDOW_DAYS)

  // Create the redirect response
  const response = NextResponse.redirect(destinationUrl)

  // Set visitor cookie for revisit tracking
  response.cookies.set(`cs_visitor_${token}`, visitorId, {
    expires: expiryDate,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Set attribution cookie
  const cookieValue = `${token}|${collaboration.creatorId}|${collaboration.propertyId}|${click.id}|${Date.now()}`
  
  response.cookies.set('cs_ref', cookieValue, {
    expires: expiryDate,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  })

  console.log('[CreatorStays] Click tracked:', {
    collaborationId: collaboration.id,
    token,
    clickId: click.id,
    isRevisit,
    destinationUrl,
    timestamp: new Date().toISOString(),
  })

  return response
}

function detectDevice(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile'
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  return 'desktop'
}
