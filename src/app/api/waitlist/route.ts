import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/waitlist
 * Save a waitlist submission to the database
 * Optionally sync to MailerLite if API key is configured
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      email,
      name,
      userType = 'creator', // 'creator' or 'host'
      handle,
      platform,
      niche,
      audienceSize,
      instagramUrl,
      tiktokUrl,
      youtubeUrl,
      // Host-specific fields
      propertyLocation,
      propertyType,
      listingUrl,
      // Tracking
      source,
      referredBy,
    } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already on waitlist', alreadyExists: true },
        { status: 409 }
      )
    }

    // Create waitlist entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        userType,
        handle: handle || null,
        platform: platform || null,
        niche: niche || null,
        audienceSize: audienceSize || null,
        instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null,
        youtubeUrl: youtubeUrl || null,
        propertyLocation: propertyLocation || null,
        propertyType: propertyType || null,
        listingUrl: listingUrl || null,
        source: source || 'organic',
        referredBy: referredBy || null,
        status: 'pending',
      },
    })

    // Sync to MailerLite if configured
    const mailerliteApiKey = process.env.MAILERLITE_API_KEY
    
    // Determine which group to use (no host waitlist - hosts go straight to signup)
    let mailerliteGroupId: string | undefined
    if (source === 'footer' || userType === 'newsletter') {
      // Newsletter signups go to the newsletter group
      mailerliteGroupId = process.env.MAILERLITE_GROUP_ID_NEWSLETTER
    } else if (userType === 'creator') {
      mailerliteGroupId = process.env.MAILERLITE_GROUP_ID_CREATORS
    }
    // Note: No host waitlist - hosts sign up directly

    if (mailerliteApiKey && mailerliteGroupId) {
      try {
        await syncToMailerLite({
          email: entry.email,
          name: entry.name,
          userType,
          groupId: mailerliteGroupId,
          apiKey: mailerliteApiKey,
          fields: {
            handle: handle || '',
            platform: platform || '',
            niche: niche || '',
            audience_size: audienceSize || '',
          },
        })
        console.log('[CreatorStays] Synced to MailerLite:', entry.email)
      } catch (mailerliteError) {
        // Log but don't fail the request
        console.error('[CreatorStays] MailerLite sync failed:', mailerliteError)
      }
    }

    console.log('[CreatorStays] Waitlist entry created:', {
      id: entry.id,
      email: entry.email,
      userType: entry.userType,
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      entry: {
        id: entry.id,
        email: entry.email,
        userType: entry.userType,
        createdAt: entry.createdAt,
      },
    })
  } catch (error) {
    console.error('[CreatorStays] Waitlist error:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/waitlist
 * Get waitlist stats (admin only - add auth check in production)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get('userType')

    const where = userType ? { userType } : {}

    const [total, creators, hosts, recent] = await Promise.all([
      prisma.waitlistEntry.count({ where }),
      prisma.waitlistEntry.count({ where: { userType: 'creator' } }),
      prisma.waitlistEntry.count({ where: { userType: 'host' } }),
      prisma.waitlistEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          userType: true,
          platform: true,
          niche: true,
          audienceSize: true,
          status: true,
          createdAt: true,
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        total,
        creators,
        hosts,
      },
      recent,
    })
  } catch (error) {
    console.error('[CreatorStays] Waitlist stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get waitlist stats' },
      { status: 500 }
    )
  }
}

/**
 * Sync subscriber to MailerLite
 */
async function syncToMailerLite(params: {
  email: string
  name: string | null
  userType: string
  groupId: string
  apiKey: string
  fields?: Record<string, string>
}) {
  const { email, name, groupId, apiKey, fields } = params

  const response = await fetch(`https://connect.mailerlite.com/api/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email,
      fields: {
        name: name || '',
        ...fields,
      },
      groups: [groupId],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`MailerLite error: ${error}`)
  }

  return response.json()
}
