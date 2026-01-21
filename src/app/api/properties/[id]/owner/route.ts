import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// GET /api/properties/[id]/owner - List owners with access to this property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify user owns this property
    const property = await prisma.property.findUnique({
      where: { id },
      include: { hostProfile: true },
    })

    if (!property || property.hostProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Get all owners with access
    const owners = await prisma.propertyOwner.findMany({
      where: { propertyId: id },
      orderBy: { invitedAt: 'desc' },
    })

    return NextResponse.json({ owners })
  } catch (error) {
    console.error('[Property Owner] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch owners' }, { status: 500 })
  }
}

// POST /api/properties/[id]/owner - Invite an owner to view this property
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name required' }, { status: 400 })
    }

    // Get host profile and verify ownership
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile) {
      return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })
    }

    // Check if agency (only agencies can invite owners)
    if (!hostProfile.isAgency) {
      return NextResponse.json({ 
        error: 'Owner access portals are an Agency Pro feature. Upgrade to invite property owners.',
        code: 'AGENCY_REQUIRED'
      }, { status: 403 })
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id },
      include: { hostProfile: true },
    })

    if (!property || property.hostProfileId !== hostProfile.id) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check if already invited
    const existing = await prisma.propertyOwner.findUnique({
      where: {
        email_propertyId: {
          email: email.toLowerCase().trim(),
          propertyId: id,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'This email already has access to this property' }, { status: 400 })
    }

    // Create owner invite
    const owner = await prisma.propertyOwner.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        propertyId: id,
        invitedById: hostProfile.id,
      },
    })

    // Send invite email
    const baseUrl = process.env.NEXTAUTH_URL || 'https://creatorstays.com'
    const accessUrl = `${baseUrl}/owner/${owner.accessToken}`

    await sendEmail({
      to: owner.email,
      subject: `View your property's creator campaigns on CreatorStays`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border: 3px solid #000000; border-radius: 16px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #FFD84A; padding: 24px; text-align: center; border-bottom: 3px solid #000000;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #000000; letter-spacing: -0.5px;">
                        CREATORSTAYS
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px 24px;">
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #000000;">
                        Hi ${name},
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #000000; line-height: 1.5;">
                        <strong>${hostProfile.displayName}</strong> has invited you to view creator campaigns for your property:
                      </p>
                      
                      <!-- Property Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; border: 2px solid #000000; border-radius: 12px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: #000000;">
                              ${property.title || 'Your Property'}
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #666666;">
                              ${property.cityRegion || 'Location not set'}
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 24px 0; font-size: 14px; color: #666666; line-height: 1.5;">
                        You'll be able to see:
                      </p>
                      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #000000; font-size: 14px; line-height: 1.8;">
                        <li>Active creator collaborations</li>
                        <li>Content submitted by creators</li>
                        <li>Performance stats (clicks, views)</li>
                        <li>Campaign history</li>
                      </ul>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${accessUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.5px;">
                              View Your Property
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 24px; background-color: #f5f5f5; border-top: 2px solid #e5e5e5;">
                      <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                        This is a read-only view. You won't be able to make changes.
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

    return NextResponse.json({ 
      success: true,
      owner,
      message: `Invite sent to ${owner.email}`,
    })
  } catch (error) {
    console.error('[Property Owner] POST error:', error)
    return NextResponse.json({ error: 'Failed to invite owner' }, { status: 500 })
  }
}

// DELETE /api/properties/[id]/owner - Remove owner access
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { ownerId } = await request.json()

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID required' }, { status: 400 })
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id },
      include: { hostProfile: true },
    })

    if (!property || property.hostProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Delete owner access
    await prisma.propertyOwner.delete({
      where: { id: ownerId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Property Owner] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to remove owner' }, { status: 500 })
  }
}
