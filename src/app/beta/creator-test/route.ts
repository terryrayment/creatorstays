import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Test user constants
const TEST_USER_EMAIL = 'creator-test@creatorstays.com'
const TEST_USER_NAME = 'Creator Test'
const TEST_USER_HANDLE = 'creator-test'

// Rate limiting (in-memory, resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // max requests
const RATE_WINDOW = 60 * 1000 // 1 minute in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return false
  }
  
  if (entry.count >= RATE_LIMIT) {
    return true
  }
  
  entry.count++
  return false
}

/**
 * GET /beta/creator-test?key=DEV_CREATOR_TEST_KEY
 * 
 * Production-safe owner test access for Creator dashboard.
 * - Requires exact key match from env var
 * - Rate limited (10 req/min per IP)
 * - Returns 404 for invalid/missing key (security through obscurity)
 * - Creates test user + session and redirects to dashboard
 */
export async function GET(request: NextRequest) {
  // Get IP for rate limiting and logging
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const timestamp = new Date().toISOString()
  const { searchParams } = new URL(request.url)
  const providedKey = searchParams.get('key')
  
  // Rate limit check
  if (isRateLimited(ip)) {
    console.log(`[Creator Test] RATE LIMITED - IP: ${ip}, Time: ${timestamp}`)
    // Return 404 to not reveal rate limiting
    return new NextResponse('Not Found', { status: 404 })
  }
  
  // Get expected key from env
  const expectedKey = process.env.DEV_CREATOR_TEST_KEY
  
  // Validation: Key must exist in env AND match provided key
  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    console.log(`[Creator Test] INVALID ACCESS - IP: ${ip}, Time: ${timestamp}, KeyProvided: ${!!providedKey}`)
    // Return 404 to not reveal that this route exists
    return new NextResponse('Not Found', { status: 404 })
  }
  
  console.log(`[Creator Test] AUTHORIZED ACCESS - IP: ${ip}, Time: ${timestamp}`)
  
  try {
    // Find or create test user
    let user = await prisma.user.findUnique({
      where: { email: TEST_USER_EMAIL },
      include: { creatorProfile: true },
    })
    
    if (!user) {
      // Create user
      user = await prisma.user.create({
        data: {
          email: TEST_USER_EMAIL,
          name: TEST_USER_NAME,
          emailVerified: new Date(),
        },
        include: { creatorProfile: true },
      })
      console.log(`[Creator Test] Created test user: ${user.id}`)
    }
    
    // Ensure creator profile exists with complete onboarding
    if (!user.creatorProfile) {
      await prisma.creatorProfile.create({
        data: {
          userId: user.id,
          handle: TEST_USER_HANDLE,
          displayName: TEST_USER_NAME,
          bio: 'Test creator account for platform development and QA.',
          location: 'San Francisco, CA',
          niches: ['Travel', 'Lifestyle'],
          instagramHandle: 'creatortest',
          instagramFollowers: 10000,
          tiktokHandle: 'creatortest',
          tiktokFollowers: 5000,
          dealTypes: ['flat', 'post-for-stay'],
          deliverables: ['Instagram Reels', 'Instagram Stories', 'TikTok Video'],
          minimumFlatFee: 500,
          openToGiftedStays: true,
          profileComplete: 100,
          onboardingComplete: true,
          isBeta: true,
          inviteTokenUsed: 'OWNER_TEST_ACCESS',
        },
      })
      console.log(`[Creator Test] Created creator profile for user: ${user.id}`)
    } else if (!user.creatorProfile.onboardingComplete) {
      // Update to ensure onboarding is complete
      await prisma.creatorProfile.update({
        where: { userId: user.id },
        data: {
          onboardingComplete: true,
          profileComplete: 100,
        },
      })
      console.log(`[Creator Test] Updated creator profile to complete: ${user.id}`)
    }
    
    // Create a new session (NextAuth database strategy)
    const sessionToken = generateSessionToken()
    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    // Delete any existing sessions for this test user (keep it clean)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })
    
    // Create new session
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: sessionExpiry,
      },
    })
    console.log(`[Creator Test] Created session for user: ${user.id}`)
    
    // Set the session cookie (NextAuth uses this name)
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieName = isProduction 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token'
    
    cookieStore.set(cookieName, sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      expires: sessionExpiry,
    })
    
    // Redirect to creator dashboard
    const baseUrl = process.env.NEXTAUTH_URL || 'https://creatorstays.com'
    return NextResponse.redirect(`${baseUrl}/beta/dashboard/creator?test=true`)
    
  } catch (error) {
    console.error(`[Creator Test] ERROR - IP: ${ip}, Time: ${timestamp}`, error)
    // Return 404 even on error to not reveal implementation details
    return new NextResponse('Not Found', { status: 404 })
  }
}

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
