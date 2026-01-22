import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/collaborations/[id]/content - Confirm content is live (creator)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentLinks } = body

    if (!contentLinks || !Array.isArray(contentLinks) || contentLinks.length === 0) {
      return NextResponse.json({ error: 'Content links required' }, { status: 400 })
    }

    // Validate URLs
    for (const link of contentLinks) {
      try {
        new URL(link)
      } catch {
        return NextResponse.json({ error: `Invalid URL: ${link}` }, { status: 400 })
      }
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: { 
        host: { include: { user: true } },
        creator: true,
        property: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify user is the creator
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!creatorProfile || creatorProfile.id !== collaboration.creatorId) {
      return NextResponse.json({ error: 'Only the creator can confirm content is live' }, { status: 403 })
    }

    // Check collaboration status - must be approved (content approved, waiting to go live)
    if (collaboration.status !== 'approved') {
      return NextResponse.json({ 
        error: `Cannot confirm live content. Collaboration status: ${collaboration.status}. Content must be approved first.` 
      }, { status: 400 })
    }

    // Update collaboration with live content links
    const updated = await prisma.collaboration.update({
      where: { id: params.id },
      data: {
        contentLinks: contentLinks,
        contentSubmittedAt: new Date(),
        status: 'content-live',
      },
    })

    // Send email to host
    const hostEmail = collaboration.host.user?.email || collaboration.host.contactEmail
    if (hostEmail) {
      await sendEmail({
        to: hostEmail,
        subject: `🎉 Content is Live! - ${collaboration.property.title}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #28D17C; padding: 24px; border-radius: 12px; border: 2px solid #000;">
              <h1 style="margin: 0 0 8px 0; font-size: 24px;">🚀 Content is Now Live!</h1>
              <p style="margin: 0; color: #333;">
                ${collaboration.creator.displayName} has posted the approved content.
              </p>
            </div>
            
            <div style="padding: 24px 0;">
              <p><strong>Property:</strong> ${collaboration.property.title}</p>
              <p><strong>Creator:</strong> @${collaboration.creator.handle}</p>
              <p><strong>Live Content Links:</strong></p>
              <ul>
                ${contentLinks.map(link => `<li><a href="${link}">${link}</a></li>`).join('')}
              </ul>
              
              <div style="margin-top: 24px;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard/collaborations/${params.id}" 
                   style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">
                  View Analytics →
                </a>
              </div>
              
              <p style="margin-top: 24px; color: #666; font-size: 14px;">
                The tracking link is now active. Monitor clicks and engagement in your dashboard.
              </p>
            </div>
          </div>
        `,
      }).catch(err => console.error('[Content API] Email error:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Content is live! Tracking is now active.',
      collaboration: updated,
    })
  } catch (error) {
    console.error('[Content API] POST error:', error)
    return NextResponse.json({ error: 'Failed to confirm live content' }, { status: 500 })
  }
}

// PATCH /api/collaborations/[id]/content - Approve/reject uploaded content (host)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, feedback } = body // action: 'approve' | 'request-changes'

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: {
        host: true,
        creator: { include: { user: true } },
        property: true,
        offer: true,
      },
    })

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 })
    }

    // Verify user is the host
    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!hostProfile || hostProfile.id !== collaboration.hostId) {
      return NextResponse.json({ error: 'Only the host can review content' }, { status: 403 })
    }

    // Check collaboration status - must be content-uploaded
    if (collaboration.status !== 'content-uploaded') {
      return NextResponse.json({ 
        error: `Cannot review. Collaboration status: ${collaboration.status}` 
      }, { status: 400 })
    }

    if (action === 'approve') {
      const updated = await prisma.collaboration.update({
        where: { id: params.id },
        data: {
          status: 'approved',
          contentApprovedAt: new Date(),
          hostFeedback: feedback || 'Content approved!',
        },
      })

      // Send approval email to creator with tracking link
      if (collaboration.creator.user.email) {
        const trackingLink = collaboration.affiliateToken 
          ? `https://crtrstys.com/${collaboration.affiliateToken}`
          : 'Link will be generated shortly'

        await sendEmail({
          to: collaboration.creator.user.email,
          subject: `✅ Content Approved! Here's Your Tracking Link`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #28D17C; padding: 24px; border-radius: 12px; border: 2px solid #000;">
                <h1 style="margin: 0 0 8px 0; font-size: 24px;">🎉 Your Content is Approved!</h1>
                <p style="margin: 0; color: #333;">
                  ${collaboration.host.displayName} approved your content for ${collaboration.property.title}
                </p>
              </div>
              
              <div style="padding: 24px 0;">
                <h2 style="margin: 0 0 12px 0;">Your Tracking Link</h2>
                <div style="background: #FFD84A; padding: 16px; border-radius: 8px; border: 2px solid #000;">
                  <code style="font-size: 16px; word-break: break-all;">${trackingLink}</code>
                </div>
                
                <h3 style="margin: 24px 0 12px 0;">📱 How to Post</h3>
                <ol style="padding-left: 20px; color: #333;">
                  <li style="margin-bottom: 8px;"><strong>Add the tracking link</strong> to your bio, link sticker, or caption</li>
                  <li style="margin-bottom: 8px;"><strong>Post your content</strong> on the agreed platforms</li>
                  <li style="margin-bottom: 8px;"><strong>Include</strong> #ad or #sponsored as required by FTC</li>
                  <li style="margin-bottom: 8px;"><strong>Confirm it's live</strong> in your dashboard with the post URLs</li>
                </ol>
                
                <div style="margin-top: 24px;">
                  <a href="${process.env.NEXTAUTH_URL}/dashboard/collaborations/${params.id}" 
                     style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">
                    Go to Dashboard →
                  </a>
                </div>
                
                ${feedback ? `<p style="margin-top: 24px; padding: 12px; background: #f5f5f5; border-radius: 8px;"><strong>Host note:</strong> ${feedback}</p>` : ''}
              </div>
            </div>
          `,
        }).catch(err => console.error('[Content API] Approval email error:', err))
      }

      return NextResponse.json({
        success: true,
        message: 'Content approved! Creator has been notified with their tracking link.',
        collaboration: updated,
      })
    }

    if (action === 'request-changes') {
      if (!feedback || feedback.trim().length < 10) {
        return NextResponse.json({ 
          error: 'Please provide specific feedback (at least 10 characters)' 
        }, { status: 400 })
      }

      const updated = await prisma.collaboration.update({
        where: { id: params.id },
        data: {
          status: 'active', // Back to active for creator to re-upload
          contentRejectedAt: new Date(),
          hostFeedback: feedback,
        },
      })

      // Send email to creator about requested changes
      if (collaboration.creator.user.email) {
        await sendEmail({
          to: collaboration.creator.user.email,
          subject: `Changes Requested - ${collaboration.property.title}`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #FFD84A; padding: 24px; border-radius: 12px; border: 2px solid #000;">
                <h1 style="margin: 0 0 8px 0; font-size: 24px;">📝 Changes Requested</h1>
                <p style="margin: 0; color: #333;">
                  ${collaboration.host.displayName} has requested some changes to your content.
                </p>
              </div>
              
              <div style="padding: 24px 0;">
                <p><strong>Property:</strong> ${collaboration.property.title}</p>
                
                <div style="margin: 16px 0; padding: 16px; background: #f5f5f5; border-radius: 8px; border-left: 4px solid #FFD84A;">
                  <p style="margin: 0;"><strong>Feedback from host:</strong></p>
                  <p style="margin: 8px 0 0 0;">${feedback}</p>
                </div>
                
                <div style="margin-top: 24px;">
                  <a href="${process.env.NEXTAUTH_URL}/dashboard/collaborations/${params.id}/submit" 
                     style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">
                    Upload Revised Content →
                  </a>
                </div>
                
                <p style="margin-top: 24px; color: #666; font-size: 14px;">
                  Make the requested changes and re-upload your content for approval.
                </p>
              </div>
            </div>
          `,
        }).catch(err => console.error('[Content API] Changes email error:', err))
      }

      return NextResponse.json({
        success: true,
        message: 'Change request sent to creator.',
        collaboration: updated,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[Content API] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to review content' }, { status: 500 })
  }
}
