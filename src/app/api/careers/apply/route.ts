import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, jobTitle, name, email, phone, linkedin, answers } = body

    // Validate required fields
    if (!name || !email || !linkedin || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Format the answers for the email
    const answersHtml = Object.entries(answers)
      .map(([questionId, answer]) => `
        <div style="margin-bottom: 16px;">
          <p style="font-weight: bold; margin: 0 0 4px; color: #666; font-size: 12px; text-transform: uppercase;">${questionId}</p>
          <p style="margin: 0; white-space: pre-wrap;">${answer}</p>
        </div>
      `)
      .join('')

    const answersText = Object.entries(answers)
      .map(([questionId, answer]) => `${questionId}:\n${answer}`)
      .join('\n\n')

    // Build the email
    const subject = `🎯 New Application: ${jobTitle} - ${name}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #000; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <span style="color: #fff; font-size: 24px; font-weight: 900;">CreatorStays</span>
    </div>
    <div style="background: #fff; padding: 32px; border: 2px solid #000; border-top: none; border-radius: 0 0 12px 12px;">
      <div style="background: #4AA3FF; border: 2px solid #000; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; font-weight: bold; color: rgba(0,0,0,0.6);">New Application</p>
        <h1 style="margin: 0; font-size: 24px; font-weight: 900;">${jobTitle}</h1>
      </div>

      <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 2px solid #000; padding-bottom: 8px;">Contact Information</h2>
      
      <table style="width: 100%; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Name</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            ${name}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Email</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <a href="mailto:${email}" style="color: #4AA3FF;">${email}</a>
          </td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>Phone</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            ${phone}
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong>LinkedIn</strong>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <a href="${linkedin.startsWith('http') ? linkedin : 'https://' + linkedin}" style="color: #4AA3FF;">${linkedin}</a>
          </td>
        </tr>
      </table>

      <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 2px solid #000; padding-bottom: 8px;">Role-Specific Questions</h2>
      
      <div style="background: #f9f9f9; border: 2px solid #000; border-radius: 12px; padding: 20px; margin-top: 16px;">
        ${answersHtml}
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #eee; text-align: center;">
        <a href="mailto:${email}?subject=Re: Your Application for ${encodeURIComponent(jobTitle)}" style="display: inline-block; background: #28D17C; color: #000; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; border: 2px solid #000;">
          Reply to ${name.split(' ')[0]} →
        </a>
      </div>
    </div>
    <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
      <p>Application submitted via CreatorStays Careers</p>
    </div>
  </div>
</body>
</html>
`

    const text = `
NEW JOB APPLICATION
==================

Position: ${jobTitle}
Job ID: ${jobId}

CONTACT INFORMATION
-------------------
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
LinkedIn: ${linkedin}

ROLE-SPECIFIC QUESTIONS
-----------------------
${answersText}

---
Application submitted via CreatorStays Careers
`

    // Send the email
    const result = await sendEmail({
      to: 'hello@creatorstays.com',
      subject,
      html,
      text,
      replyTo: email,
    })

    if (!result.success) {
      console.error('[Careers API] Email failed:', result.error)
      return NextResponse.json(
        { error: 'Failed to send application. Please try again.' },
        { status: 500 }
      )
    }

    console.log('[Careers API] Application sent:', { jobTitle, name, email })

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    })
  } catch (error) {
    console.error('[Careers API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
