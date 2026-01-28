import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/newsletter
 * Subscribe to the newsletter
 * - Adds to MailerLite newsletter group
 * - Stores in database
 * - Sends confirmation email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source = 'footer' } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if already subscribed
    const existing = await prisma.waitlistEntry.findFirst({
      where: { 
        email: normalizedEmail,
        userType: 'newsletter'
      },
    })

    if (existing) {
      // Already subscribed - return success (don't reveal this to user)
      console.log('[Newsletter] Already subscribed:', normalizedEmail)
      return NextResponse.json({
        success: true,
        message: 'Thanks for subscribing!',
        alreadyExists: true,
      })
    }

    // Create newsletter subscriber record
    const entry = await prisma.waitlistEntry.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        userType: 'newsletter',
        source,
        status: 'active',
      },
    })

    console.log('[Newsletter] New subscriber:', entry.id, normalizedEmail)

    // Sync to MailerLite newsletter group
    const mailerliteApiKey = process.env.MAILERLITE_API_KEY
    const mailerliteGroupId = process.env.MAILERLITE_GROUP_ID_NEWSLETTER

    if (mailerliteApiKey && mailerliteGroupId) {
      try {
        const mlResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mailerliteApiKey}`,
          },
          body: JSON.stringify({
            email: normalizedEmail,
            fields: {
              name: name || '',
            },
            groups: [mailerliteGroupId],
          }),
        })

        if (!mlResponse.ok) {
          const error = await mlResponse.text()
          console.error('[Newsletter] MailerLite sync failed:', error)
        } else {
          console.log('[Newsletter] Synced to MailerLite:', normalizedEmail)
        }
      } catch (mlError) {
        console.error('[Newsletter] MailerLite error:', mlError)
        // Don't fail the request
      }
    }

    // Send confirmation email via Resend
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'CreatorStays <hello@creatorstays.com>',
            to: normalizedEmail,
            subject: 'Welcome to the CreatorStays Newsletter',
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #ffffff; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-weight: bold; font-size: 14px;">CS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFD84A; border-radius: 12px; border: 3px solid #000000;">
                <tr>
                  <td style="padding: 32px 24px;">
                    <p style="margin: 0 0 8px 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #000000;">
                      You're In
                    </p>
                    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-weight: bold; line-height: 1.2; color: #000000;">
                      Thanks for subscribing to the CreatorStays newsletter
                    </p>
                    <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000;">
                      You'll receive creator marketing tips, platform updates, and industry insights. We keep it short and useful - no spam, ever.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 16px;">
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #666666;">
                CreatorStays - Connecting hosts with creators
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
          }),
        })

        if (emailResponse.ok) {
          console.log('[Newsletter] Confirmation email sent:', normalizedEmail)
        } else {
          const error = await emailResponse.text()
          console.error('[Newsletter] Email send failed:', error)
        }
      } catch (emailError) {
        console.error('[Newsletter] Email error:', emailError)
        // Don't fail the request
      }
    }

    // Log analytics event
    console.log('[Analytics] newsletter_signup', {
      subscriberId: entry.id,
      source,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing!',
    })
  } catch (error) {
    console.error('[Newsletter] Error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
