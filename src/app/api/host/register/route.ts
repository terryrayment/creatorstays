import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * POST /api/host/register
 * 
 * Creates a new host account:
 * 1. Creates User record
 * 2. Creates HostProfile linked to User
 * 3. Optionally creates initial Property if airbnbUrl provided
 * 4. Sends magic link email for authentication
 * 
 * This bypasses the typical NextAuth flow to allow immediate profile creation
 * while still using NextAuth for actual sign-in via magic link.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      fullName, 
      phone,
      companyName,
      cityRegion, 
      listingUrl,
      listingTitle,
      listingPhotos,
      listingBeds,
      listingBaths,
      listingGuests,
      listingPropertyType,
    } = body

    // Validate required fields
    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { hostProfile: true, creatorProfile: true },
    })

    if (existingUser) {
      // User exists - check if they already have a host profile
      if (existingUser.hostProfile) {
        return NextResponse.json(
          { 
            error: 'An account with this email already exists. Please sign in instead.',
            alreadyExists: true,
            hasHostProfile: true,
          },
          { status: 409 }
        )
      }
      
      // User exists but no host profile - we could add one, but for security
      // let's require them to sign in first
      return NextResponse.json(
        { 
          error: 'An account with this email already exists. Please sign in to add a host profile.',
          alreadyExists: true,
          hasHostProfile: false,
        },
        { status: 409 }
      )
    }

    // Create User + HostProfile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: fullName,
        },
      })

      // 2. Create HostProfile
      const hostProfile = await tx.hostProfile.create({
        data: {
          userId: user.id,
          displayName: fullName,
          contactEmail: normalizedEmail,
          location: cityRegion || null,
          bio: companyName ? `${companyName}` : null,
        },
      })

      // 3. Create initial Property if airbnbUrl provided
      let property = null
      if (listingUrl) {
        property = await tx.property.create({
          data: {
            hostProfileId: hostProfile.id,
            airbnbUrl: listingUrl,
            title: listingTitle || null,
            cityRegion: cityRegion || null,
            photos: listingPhotos || [],
            heroImageUrl: listingPhotos?.[0] || null,
            beds: listingBeds ? parseInt(listingBeds) : null,
            baths: listingBaths ? parseFloat(listingBaths) : null,
            guests: listingGuests ? parseInt(listingGuests) : null,
            venueType: listingPropertyType || null,
            isDraft: true,
            isActive: true,
          },
        })
      }

      return { user, hostProfile, property }
    })

    // 4. Create a verification token for magic link sign-in
    // NextAuth hashes tokens before storing, so we need to match that format
    const rawToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Hash the token the same way NextAuth does (SHA256)
    const encoder = new TextEncoder()
    const data = encoder.encode(`${rawToken}${process.env.NEXTAUTH_SECRET || ''}`)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedToken = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: hashedToken,
        expires,
      },
    })

    // 5. Send welcome email with magic link (use raw token in URL - NextAuth will hash it to verify)
    const baseUrl = process.env.NEXTAUTH_URL || 'https://creatorstays.com'
    const magicLink = `${baseUrl}/api/auth/callback/email?callbackUrl=${encodeURIComponent('/beta/dashboard/host')}&token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`

    let emailSent = false
    try {
      const emailResult = await sendEmail({
        to: normalizedEmail,
        subject: 'Welcome to CreatorStays! 🏠',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Welcome to CreatorStays, ${fullName}!</h1>
            <p>Your host account has been created. Click the button below to sign in and complete your setup:</p>
            <div style="margin: 30px 0;">
              <a href="${magicLink}" style="background: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                Complete Your Setup →
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #666; font-size: 12px;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
        `,
      })
      emailSent = emailResult.success
      if (!emailResult.success) {
        console.error('[Host Register] Email send failed:', emailResult.error)
      }
    } catch (emailError) {
      console.error('[Host Register] Failed to send welcome email:', emailError)
      // Don't fail the registration if email fails - user can still sign in via login page
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Account created! Check your email for a sign-in link.'
        : 'Account created! Email delivery may be delayed - you can also sign in via the login page.',
      emailSent,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      hostProfile: {
        id: result.hostProfile.id,
        displayName: result.hostProfile.displayName,
      },
      property: result.property ? {
        id: result.property.id,
        title: result.property.title,
      } : null,
      // Include magic link in dev mode OR if email failed (for debugging)
      ...((process.env.NODE_ENV === 'development' || !emailSent) ? { magicLink } : {}),
    })

  } catch (error) {
    console.error('[Host Register] Error:', error)
    console.error('[Host Register] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // Check for specific Prisma errors
    const prismaError = error as { code?: string; meta?: { target?: string[] }; message?: string }
    
    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      const target = prismaError.meta?.target?.[0] || 'field'
      return NextResponse.json(
        { error: `An account with this ${target} already exists.` },
        { status: 409 }
      )
    }
    
    if (prismaError.code === 'P2003') {
      // Foreign key constraint
      return NextResponse.json(
        { error: 'Database constraint error. Please contact support.' },
        { status: 500 }
      )
    }
    
    // Always return the actual error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: `Failed to create account: ${errorMessage}` },
      { status: 500 }
    )
  }
}
