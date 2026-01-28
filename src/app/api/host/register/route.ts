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
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff;">
          
          <!-- Logo Row -->
          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid #000000; text-align: center; vertical-align: middle;">
                    <span style="color: #000000; font-weight: 700; font-size: 12px; letter-spacing: -0.5px;">CS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td style="padding: 0 16px 16px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFD84A; border-radius: 12px; border: 3px solid #000000;">
                <tr>
                  <td style="padding: 32px 24px;">
                    <!-- Welcome Text -->
                    <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #000000;">
                      Welcome to CreatorStays
                    </p>
                    <p style="margin: 0 0 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 900; line-height: 1.1; letter-spacing: -1px; color: #000000;">
                      ${fullName}
                    </p>
                    <p style="margin: 0 0 28px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5; color: #000000;">
                      Your host account is ready. Complete your setup to start connecting with creators.
                    </p>
                    
                    <!-- CTA Button - GREEN -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #28D17C; border-radius: 50px; border: 2px solid #000000;">
                          <a href="${magicLink}" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #000000; text-decoration: none;">
                            Complete Setup →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Expiry Note -->
                    <p style="margin: 24px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #000000; opacity: 0.6;">
                      Link expires in 24 hours
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 16px 24px 32px 24px;">
              <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #999999;">
                Didn't create this account? Ignore this email.
              </p>
              <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 10px; color: #999999;">
                © ${new Date().getFullYear()} CreatorStays
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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

    // 6. Send admin notification email for new signup
    const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'hello@creatorstays.com'
    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `🎉 New Host Signup: ${fullName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #28D17C; padding: 16px 24px; border-radius: 8px 8px 0 0;">
              <h2 style="color: #000; margin: 0; font-size: 18px;">🎉 New Host Signup!</h2>
            </div>
            <div style="background: #fff; padding: 24px; border: 2px solid #000; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 16px 0;"><strong>Name:</strong> ${fullName}</p>
              <p style="margin: 0 0 16px 0;"><strong>Email:</strong> ${normalizedEmail}</p>
              <p style="margin: 0 0 16px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p style="margin: 0 0 16px 0;"><strong>Company:</strong> ${companyName || 'Not provided'}</p>
              <p style="margin: 0 0 16px 0;"><strong>Location:</strong> ${cityRegion || 'Not provided'}</p>
              ${listingUrl ? `<p style="margin: 0 0 16px 0;"><strong>Listing:</strong> <a href="${listingUrl}">${listingUrl}</a></p>` : ''}
              <p style="margin: 16px 0 0 0; color: #666; font-size: 12px;">
                Signed up: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT
              </p>
            </div>
          </div>
        `,
      })
      console.log('[Host Register] Admin notification sent to', ADMIN_EMAIL)
    } catch (notifyError) {
      console.error('[Host Register] Failed to send admin notification:', notifyError)
      // Don't fail - admin notification is non-critical
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
