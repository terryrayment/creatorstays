import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  VISITOR_COOKIE,
  ATTRIBUTION_COOKIE,
  DEFAULT_ATTRIBUTION_WINDOW_DAYS,
  generateVisitorId,
  hashIp,
  hashUserAgent,
  truncateReferer,
  getClientIp,
  isValidToken,
  getVisitorCookieOptions,
  getAttributionCookieOptions,
} from '@/lib/affiliates'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  
  // Validate token format
  if (!isValidToken(token)) {
    return NextResponse.redirect(new URL('/shortlink/gone', request.url))
  }

  try {
    // Look up the affiliate link by token
    const link = await prisma.affiliateLink.findUnique({
      where: { token },
    })

    // If not found or inactive
    if (!link || !link.isActive) {
      return NextResponse.redirect(new URL('/shortlink/gone', request.url))
    }

    // Check if link has expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.redirect(new URL('/shortlink/gone', request.url))
    }

    // Get or create visitor ID from cookie
    const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value
    const visitorId = existingVisitorId || generateVisitorId()
    const isRevisit = !!existingVisitorId

    // Get request metadata
    const referer = truncateReferer(request.headers.get('referer'))
    const userAgentHash = hashUserAgent(request.headers.get('user-agent'))
    const ipHash = hashIp(getClientIp(request.headers))

    // Determine if this is a unique click (first time this visitor clicks this link)
    let isUnique = true
    if (existingVisitorId) {
      const existingClick = await prisma.linkClick.findFirst({
        where: {
          linkId: link.id,
          visitorId: existingVisitorId,
        },
      })
      isUnique = !existingClick
    }

    // Upsert visitor record
    await prisma.linkVisitor.upsert({
      where: { id: visitorId },
      create: {
        id: visitorId,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        lastLinkId: link.id,
        lastClickAt: new Date(),
      },
      update: {
        lastSeenAt: new Date(),
        lastLinkId: link.id,
        lastClickAt: new Date(),
      },
    })

    // Record the click
    await prisma.linkClick.create({
      data: {
        linkId: link.id,
        visitorId,
        referer,
        userAgentHash,
        ipHash,
        isUnique,
        isRevisit,
      },
    })

    // Update link stats (denormalized counters)
    await prisma.affiliateLink.update({
      where: { id: link.id },
      data: {
        clickCount: { increment: 1 },
        ...(isUnique ? { uniqueClickCount: { increment: 1 } } : {}),
      },
    })

    // Calculate attribution window
    const attributionDays = link.attributionWindowDays || DEFAULT_ATTRIBUTION_WINDOW_DAYS

    // Create the redirect response
    const response = NextResponse.redirect(link.destinationUrl)

    // Set visitor cookie
    response.cookies.set(VISITOR_COOKIE, visitorId, getVisitorCookieOptions(attributionDays))

    // Set attribution cookie with link token
    response.cookies.set(ATTRIBUTION_COOKIE, token, getAttributionCookieOptions(attributionDays))

    console.log('[crtrstys] Click tracked:', {
      linkId: link.id,
      token,
      visitorId,
      isUnique,
      isRevisit,
      destinationUrl: link.destinationUrl,
      timestamp: new Date().toISOString(),
    })

    return response
  } catch (error) {
    console.error('[crtrstys] Redirect error:', error)
    return NextResponse.redirect(new URL('/shortlink/gone', request.url))
  }
}
