/**
 * Email Service
 * 
 * Uses Resend for transactional emails.
 * Set RESEND_API_KEY in environment variables.
 * 
 * Fallback: If no API key, logs emails to console (dev mode)
 */

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

interface SendResult {
  success: boolean
  id?: string
  error?: string
}

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM || 'CreatorStays <notifications@creatorstays.com>'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorstays.com'

/**
 * Send an email via Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  const { to, subject, html, text, replyTo } = options

  // Dev mode: log to console if no API key
  if (!RESEND_API_KEY) {
    console.log('\n📧 [EMAIL - DEV MODE]')
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${text || html.substring(0, 200)}...`)
    console.log('---\n')
    return { success: true, id: 'dev-mode' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to: replyTo,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Email] Send failed:', data)
      return { success: false, error: data.message || 'Failed to send email' }
    }

    console.log('[Email] Sent successfully:', data.id)
    return { success: true, id: data.id }
  } catch (error) {
    console.error('[Email] Error:', error)
    return { success: false, error: 'Network error sending email' }
  }
}

/**
 * Email Templates
 */

// Common styles
const styles = {
  container: 'max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
  header: 'background: #000; padding: 24px; text-align: center;',
  logo: 'color: #fff; font-size: 24px; font-weight: 900; text-decoration: none;',
  body: 'padding: 32px 24px; background: #fff;',
  footer: 'padding: 24px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666;',
  button: 'display: inline-block; background: #000; color: #fff; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px;',
  buttonGreen: 'display: inline-block; background: #28D17C; color: #000; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; border: 2px solid #000;',
  buttonYellow: 'display: inline-block; background: #FFD84A; color: #000; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; border: 2px solid #000;',
  card: 'background: #f9f9f9; border: 2px solid #000; border-radius: 12px; padding: 20px; margin: 20px 0;',
}

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #f0f0f0;">
  <div style="${styles.container}">
    <div style="${styles.header}">
      <a href="${BASE_URL}" style="${styles.logo}">CreatorStays</a>
    </div>
    <div style="${styles.body}">
      ${content}
    </div>
    <div style="${styles.footer}">
      <p>© ${new Date().getFullYear()} CreatorStays. All rights reserved.</p>
      <p>
        <a href="${BASE_URL}/help" style="color: #666;">Help</a> · 
        <a href="${BASE_URL}/privacy" style="color: #666;">Privacy</a> · 
        <a href="${BASE_URL}/terms" style="color: #666;">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}

/**
 * New Offer Email (to Creator)
 */
export function newOfferEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  propertyLocation: string
  dealType: string
  cashAmount: number
  stayNights?: number
  deliverables: string[]
  offerId: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, propertyLocation, dealType, cashAmount, stayNights, deliverables, offerId } = data

  const dealDescription = dealType === 'post-for-stay' 
    ? `${stayNights} nights complimentary stay`
    : `$${(cashAmount / 100).toFixed(0)} flat fee`

  const subject = `🎉 New offer from ${hostName} for ${propertyTitle}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">New Collaboration Offer!</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName}, you've received a new offer.</p>
    
    <div style="${styles.card}">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">From</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 16px;">${hostName}</p>
      
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Property</p>
      <p style="font-size: 16px; font-weight: 600; margin: 0;">${propertyTitle}</p>
      <p style="font-size: 14px; color: #666; margin: 4px 0 16px;">${propertyLocation}</p>
      
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Compensation</p>
      <p style="font-size: 24px; font-weight: 900; margin: 0 0 16px;">${dealDescription}</p>
      
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Deliverables</p>
      <p style="margin: 0;">${deliverables.join(' · ')}</p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/creator/offers" style="${styles.buttonGreen}">View Offer →</a>
    </div>
    
    <p style="font-size: 13px; color: #666;">
      You can accept, counter, or decline this offer from your dashboard.
    </p>
  `)

  const text = `
New Collaboration Offer!

Hi ${creatorName}, you've received a new offer from ${hostName}.

Property: ${propertyTitle} (${propertyLocation})
Compensation: ${dealDescription}
Deliverables: ${deliverables.join(', ')}

View and respond: ${BASE_URL}/dashboard/creator/offers
`

  return { subject, html, text }
}

/**
 * Offer Accepted Email (to Host)
 */
export function offerAcceptedEmail(data: {
  hostName: string
  creatorName: string
  creatorHandle: string
  propertyTitle: string
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { hostName, creatorName, creatorHandle, propertyTitle, collaborationId } = data

  const subject = `✅ ${creatorName} accepted your offer!`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Offer Accepted!</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${hostName}, great news!</p>
    
    <div style="${styles.card}">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 4px;">${creatorName}</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 16px;">@${creatorHandle}</p>
      <p style="margin: 0;">has accepted your offer for <strong>${propertyTitle}</strong></p>
    </div>
    
    <p style="margin: 24px 0;">
      <strong>Next step:</strong> Both parties need to sign the collaboration agreement before work begins.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.button}">View & Sign Agreement →</a>
    </div>
  `)

  const text = `
Offer Accepted!

Hi ${hostName}, great news!

${creatorName} (@${creatorHandle}) has accepted your offer for ${propertyTitle}.

Next step: Both parties need to sign the collaboration agreement.

View agreement: ${BASE_URL}/dashboard/collaborations/${collaborationId}
`

  return { subject, html, text }
}

/**
 * Agreement Signed Email (to other party)
 */
export function agreementSignedEmail(data: {
  recipientName: string
  signerName: string
  signerRole: 'host' | 'creator'
  propertyTitle: string
  collaborationId: string
  isFullyExecuted: boolean
}): { subject: string; html: string; text: string } {
  const { recipientName, signerName, signerRole, propertyTitle, collaborationId, isFullyExecuted } = data

  const subject = isFullyExecuted 
    ? `✅ Agreement fully signed - ${propertyTitle}`
    : `📝 ${signerName} signed the agreement`

  const content = isFullyExecuted
    ? `
      <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Agreement Fully Executed! 🎉</h1>
      <p style="color: #666; margin: 0 0 24px;">Hi ${recipientName}, the collaboration is now active.</p>
      
      <div style="${styles.card}; background: #28D17C;">
        <p style="font-size: 14px; font-weight: 700; margin: 0 0 8px;">Both parties have signed</p>
        <p style="font-size: 18px; font-weight: 900; margin: 0;">${propertyTitle}</p>
      </div>
      
      <p style="margin: 24px 0;">
        The creator can now begin working on content. Your unique tracking link is ready in the dashboard.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.buttonGreen}">View Collaboration →</a>
      </div>
    `
    : `
      <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Agreement Signed</h1>
      <p style="color: #666; margin: 0 0 24px;">Hi ${recipientName},</p>
      
      <div style="${styles.card}">
        <p style="margin: 0 0 8px;"><strong>${signerName}</strong> (${signerRole}) has signed the agreement for:</p>
        <p style="font-size: 18px; font-weight: 700; margin: 0;">${propertyTitle}</p>
      </div>
      
      <p style="margin: 24px 0;">
        <strong>Your turn!</strong> Please sign the agreement to activate this collaboration.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.buttonYellow}">Sign Agreement →</a>
      </div>
    `

  const html = emailWrapper(content)

  const text = isFullyExecuted
    ? `Agreement Fully Executed!\n\nHi ${recipientName}, both parties have signed. The collaboration for ${propertyTitle} is now active.\n\nView: ${BASE_URL}/dashboard/collaborations/${collaborationId}`
    : `Agreement Signed\n\nHi ${recipientName}, ${signerName} has signed the agreement for ${propertyTitle}. Please sign to activate.\n\nSign: ${BASE_URL}/dashboard/collaborations/${collaborationId}`

  return { subject, html, text }
}

/**
 * Content Submitted Email (to Host)
 */
export function contentSubmittedEmail(data: {
  hostName: string
  creatorName: string
  propertyTitle: string
  contentLinks: string[]
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { hostName, creatorName, propertyTitle, contentLinks, collaborationId } = data

  const subject = `📱 ${creatorName} submitted content for review`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Content Ready for Review!</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${hostName},</p>
    
    <p style="margin: 0 0 24px;">
      <strong>${creatorName}</strong> has submitted ${contentLinks.length} piece${contentLinks.length > 1 ? 's' : ''} of content for <strong>${propertyTitle}</strong>.
    </p>
    
    <div style="${styles.card}">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 12px;">Content Links</p>
      ${contentLinks.map((link, i) => `<p style="margin: 8px 0;"><a href="${link}" style="color: #4AA3FF;">Content ${i + 1} →</a></p>`).join('')}
    </div>
    
    <p style="margin: 24px 0;">
      Please review and approve the content, or request changes if needed.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.button}">Review Content →</a>
    </div>
  `)

  const text = `
Content Ready for Review!

Hi ${hostName},

${creatorName} has submitted ${contentLinks.length} piece(s) of content for ${propertyTitle}.

Links:
${contentLinks.map((link, i) => `${i + 1}. ${link}`).join('\n')}

Review: ${BASE_URL}/dashboard/collaborations/${collaborationId}
`

  return { subject, html, text }
}

/**
 * Content Approved Email (to Creator)
 */
export function contentApprovedEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, collaborationId } = data

  const subject = `✅ Your content was approved!`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Content Approved! 🎉</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName},</p>
    
    <div style="${styles.card}; background: #28D17C;">
      <p style="font-weight: 700; margin: 0 0 8px;">${hostName} approved your content</p>
      <p style="font-size: 18px; font-weight: 900; margin: 0;">${propertyTitle}</p>
    </div>
    
    <p style="margin: 24px 0;">
      Great work! Payment will be processed shortly and sent to your connected Stripe account.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.buttonGreen}">View Details →</a>
    </div>
  `)

  const text = `
Content Approved! 🎉

Hi ${creatorName},

${hostName} approved your content for ${propertyTitle}.

Payment will be processed shortly.

View: ${BASE_URL}/dashboard/collaborations/${collaborationId}
`

  return { subject, html, text }
}

/**
 * Payment Complete Email (to Creator)
 */
export function paymentCompleteEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  amount: number // in cents
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, amount, collaborationId } = data

  const formattedAmount = `$${(amount / 100).toFixed(2)}`
  const subject = `💰 Payment received: ${formattedAmount}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Payment Received!</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName},</p>
    
    <div style="${styles.card}; background: #28D17C;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">You earned</p>
      <p style="font-size: 36px; font-weight: 900; margin: 0;">${formattedAmount}</p>
    </div>
    
    <p style="margin: 24px 0;">
      <strong>${hostName}</strong> paid for your collaboration on <strong>${propertyTitle}</strong>.
    </p>
    
    <p style="color: #666; font-size: 14px;">
      The payment has been sent to your connected Stripe account. It typically arrives within 2-3 business days.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/creator/settings" style="${styles.button}">View Earnings →</a>
    </div>
  `)

  const text = `
Payment Received!

Hi ${creatorName},

You earned ${formattedAmount} from ${hostName} for ${propertyTitle}.

The payment has been sent to your Stripe account and typically arrives within 2-3 business days.

View: ${BASE_URL}/dashboard/creator/settings
`

  return { subject, html, text }
}
