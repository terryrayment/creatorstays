import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { hashString, generateToken } from '@/lib/utils';

const logger = createLogger('tracking');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    // Find the deal by tracking token
    const deal = await prisma.deal.findUnique({
      where: { trackingToken: token },
      include: {
        offer: {
          include: {
            property: true,
          },
        },
        creator: true,
      },
    });

    if (!deal || deal.status !== 'ACTIVE') {
      logger.warn({ token }, 'Invalid or inactive tracking token');
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Get request metadata
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';

    // Generate unique click token
    const clickToken = generateToken(16);

    // Create tracking click record
    const click = await prisma.trackingClick.create({
      data: {
        dealId: deal.id,
        offerId: deal.offerId,
        creatorId: deal.creatorId,
        propertyId: deal.offer.propertyId,
        clickToken,
        ipHash: hashString(ip),
        userAgent: userAgent.substring(0, 500),
        referer: referer.substring(0, 500),
        landingUrl: deal.offer.property.airbnbUrl,
      },
    });

    logger.info(
      {
        dealId: deal.id,
        clickToken,
        offerId: deal.offerId,
      },
      'Tracking click recorded'
    );

    // Check for cookie consent and existing attribution
    const cookieStore = await cookies();
    const consentCookie = cookieStore.get('cs_consent');
    const hasConsent = consentCookie?.value === 'accepted';

    // If user has consented to cookies, set attribution cookie
    if (hasConsent || !deal.offer.cookieRequired) {
      const existingCookieId = cookieStore.get('cs_click')?.value;
      const cookieId = existingCookieId || generateToken(16);
      const attributionDays = deal.offer.attributionWindowDays || 30;

      // Create or update visitor attribution
      await prisma.visitorAttribution.upsert({
        where: { clickId: click.id },
        update: {
          lastSeenAt: new Date(),
          visitCount: { increment: 1 },
          consentStatus: hasConsent ? 'ACCEPTED' : 'UNKNOWN',
        },
        create: {
          clickId: click.id,
          cookieId,
          consentStatus: hasConsent ? 'ACCEPTED' : 'UNKNOWN',
        },
      });

      // Create the response with redirect
      const response = NextResponse.redirect(deal.offer.property.airbnbUrl);

      // Set first-party attribution cookie
      response.cookies.set('cs_click', cookieId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: attributionDays * 24 * 60 * 60, // Convert days to seconds
        path: '/',
      });

      // Also store the most recent click token for attribution
      response.cookies.set('cs_last_click', clickToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: attributionDays * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // No consent - just redirect without setting cookies
    return NextResponse.redirect(deal.offer.property.airbnbUrl);
  } catch (error) {
    logger.error({ error, token }, 'Error processing tracking redirect');
    return NextResponse.redirect(new URL('/', req.url));
  }
}
