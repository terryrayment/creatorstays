import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST /api/collaborations/[id]/content/upload - Upload content for approval (creator)
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
    const { contentUrls, notes } = body

    if (!contentUrls || !Array.isArray(contentUrls) || contentUrls.length === 0) {
      return NextResponse.json({ error: 'Content URLs required' }, { status: 400 })
    }

    const collaboration = await prisma.collaboration.findUnique({
      where: { id: params.id },
      include: { 
        agreement: true,
        host: { include: { user: true } },
        creator: true,
        property: true,
        offer: true,
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
      return NextResponse.json({ error: 'Only the creator can upload content' }, { status: 403 })
    }

    // Check collaboration status - must be active (agreement signed)
    if (collaboration.status !== 'active' && collaboration.status !== 'content-uploaded') {
      return NextResponse.json({ 
        error: `Cannot upload content. Collaboration status: ${collaboration.status}` 
      }, { status: 400 })
    }

    // Update collaboration with uploaded content
    const updated = await prisma.collaboration.update({
      where: { id: params.id },
      data: {
        uploadedContentUrls: contentUrls,
        uploadedContentNotes: notes || null,
        contentUploadedAt: new Date(),
        status: 'content-uploaded',
        // Clear any previous rejection feedback
        contentRejectedAt: null,
      },
    })

    // Send email to host about content ready for review
    const hostEmail = collaboration.host.user?.email || collaboration.host.contactEmail
    if (hostEmail) {
      await sendEmail({
        to: hostEmail,
        subject: `Content Ready for Review - ${collaboration.property.title}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #FF7A00; padding: 24px; border-radius: 12px; border: 2px solid #000;">
              <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #000;">📦 Content Ready for Review</h1>
              <p style="margin: 0; color: #000;">
                ${collaboration.creator.displayName} has uploaded content for your approval.
              </p>
            </div>
            
            <div style="padding: 24px 0;">
              <p><strong>Property:</strong> ${collaboration.property.title}</p>
              <p><strong>Creator:</strong> @${collaboration.creator.handle}</p>
              <p><strong>Files Uploaded:</strong> ${contentUrls.length}</p>
              ${notes ? `<p><strong>Creator Notes:</strong> ${notes}</p>` : ''}
              
              <div style="margin-top: 24px;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard/collaborations/${params.id}" 
                   style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">
                  Review Content →
                </a>
              </div>
              
              <p style="margin-top: 24px; color: #666; font-size: 14px;">
                Review the content and approve it or request changes. Once approved, the creator will receive their tracking link to post the content live.
              </p>
            </div>
          </div>
        `,
      }).catch(err => console.error('[Content Upload API] Email error:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Content uploaded! Waiting for host approval.',
      collaboration: updated,
    })
  } catch (error) {
    console.error('[Content Upload API] POST error:', error)
    return NextResponse.json({ error: 'Failed to upload content' }, { status: 500 })
  }
}
