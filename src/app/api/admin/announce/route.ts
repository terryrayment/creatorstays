import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// POST /api/admin/announce - Send announcement emails to hosts
export async function POST(request: Request) {
  try {
    // Check admin session cookie
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json()

    if (type === 'creators_live') {
      // Get all hosts with paid memberships
      const hosts = await prisma.hostProfile.findMany({
        where: {
          membershipPaid: true,
        },
        include: {
          user: { select: { email: true } }
        }
      })

      if (hosts.length === 0) {
        return NextResponse.json({ error: 'No hosts to notify' }, { status: 400 })
      }

      // Send emails via Resend
      const RESEND_API_KEY = process.env.RESEND_API_KEY
      
      if (!RESEND_API_KEY) {
        // Log emails instead of sending (dev mode)
        console.log('[Announce] Would send "Creators Live" email to:')
        hosts.forEach(h => console.log(`  - ${h.user.email} (${h.displayName})`))
        return NextResponse.json({ 
          success: true, 
          count: hosts.length,
          message: 'Emails logged (dev mode - no RESEND_API_KEY)'
        })
      }

      // Send emails in batches of 10 to avoid rate limits
      const batchSize = 10
      let sentCount = 0
      let failedCount = 0

      for (let i = 0; i < hosts.length; i += batchSize) {
        const batch = hosts.slice(i, i + batchSize)
        
        const emailPromises = batch.map(async (host) => {
          try {
            const response = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: 'CreatorStays <hello@creatorstays.com>',
                to: host.user.email,
                subject: '🎉 Creators are now live on CreatorStays!',
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="display: inline-block; background: #FFD84A; border: 2px solid #000; border-radius: 50px; padding: 8px 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                        ✨ Beta Update
                      </div>
                    </div>
                    
                    <h1 style="color: #000; font-size: 28px; margin-bottom: 20px; text-align: center;">
                      Creators Are Live! 🚀
                    </h1>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                      Hi ${host.displayName || 'there'},
                    </p>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                      Great news! We've onboarded our first batch of creators to CreatorStays. You can now browse real creator profiles and send collaboration offers.
                    </p>
                    
                    <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                      As a beta host, you're first in line. Log in now to start connecting with creators who match your property.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://creatorstays.com/dashboard/host/search-creators" 
                         style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px;">
                        Browse Creators →
                      </a>
                    </div>
                    
                    <div style="background: #FAFAFA; border: 2px solid #E5E5E5; border-radius: 12px; padding: 20px; margin: 30px 0;">
                      <p style="color: #666; font-size: 14px; margin: 0;">
                        <strong>What's next?</strong><br>
                        Browse creator profiles → Send offers → Start collaborating
                      </p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 30px 0;" />
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                      CreatorStays - Connecting creators with vacation rental hosts<br>
                      <a href="https://creatorstays.com" style="color: #999;">creatorstays.com</a>
                    </p>
                  </div>
                `,
              }),
            })

            if (response.ok) {
              sentCount++
              console.log(`[Announce] Sent to ${host.user.email}`)
            } else {
              failedCount++
              const error = await response.text()
              console.error(`[Announce] Failed for ${host.user.email}:`, error)
            }
          } catch (e) {
            failedCount++
            console.error(`[Announce] Error for ${host.user.email}:`, e)
          }
        })

        await Promise.all(emailPromises)
        
        // Small delay between batches
        if (i + batchSize < hosts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      console.log(`[Announce] Complete: ${sentCount} sent, ${failedCount} failed`)

      return NextResponse.json({ 
        success: true, 
        count: sentCount,
        failed: failedCount,
        message: `Sent ${sentCount} emails${failedCount > 0 ? `, ${failedCount} failed` : ''}`
      })
    }

    return NextResponse.json({ error: 'Unknown announcement type' }, { status: 400 })
  } catch (error) {
    console.error('[Admin Announce API] Error:', error)
    return NextResponse.json({ error: 'Failed to send announcements' }, { status: 500 })
  }
}
