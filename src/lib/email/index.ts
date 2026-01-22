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
      <span style="display: inline-block; background: #FFD84A; color: #000; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 8px; vertical-align: middle;">BETA</span>
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
 * Offer Sent Confirmation Email (to Host)
 * Confirms to the host that their offer was successfully sent
 */
export function offerSentConfirmationEmail(data: {
  hostName: string
  creatorName: string
  creatorHandle: string
  propertyTitle: string
  propertyLocation: string
  dealType: string
  cashAmount: number
  stayNights?: number | null
  bonusEnabled?: boolean
  bonusAmount?: number
  bonusThreshold?: number
  deliverables: string[]
  offerId: string
}): { subject: string; html: string; text: string } {
  const { 
    hostName, 
    creatorName, 
    creatorHandle, 
    propertyTitle, 
    propertyLocation,
    dealType, 
    cashAmount, 
    stayNights, 
    bonusEnabled,
    bonusAmount,
    bonusThreshold,
    deliverables, 
    offerId 
  } = data

  const dealTypeLabel = dealType === 'post-for-stay' ? 'Post-for-Stay' :
                        dealType === 'flat-with-bonus' ? 'Flat Fee + Bonus' : 'Flat Fee'

  const formattedAmount = cashAmount > 0 
    ? `$${(cashAmount / 100).toFixed(0)}`
    : null

  const compensationLine = dealType === 'post-for-stay'
    ? `${stayNights || 3} nights complimentary stay`
    : formattedAmount || 'Custom deal'

  const subject = `✓ Offer sent to @${creatorHandle}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Offer Sent Successfully!</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${hostName}, your offer has been delivered.</p>
    
    <div style="${styles.card}">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Sent To</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 4px;">${creatorName}</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 16px;">@${creatorHandle}</p>
      
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Property</p>
      <p style="font-size: 16px; font-weight: 600; margin: 0;">${propertyTitle}</p>
      ${propertyLocation ? `<p style="font-size: 14px; color: #666; margin: 4px 0 16px;">${propertyLocation}</p>` : ''}
      
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Deal</p>
      <p style="margin: 0 0 4px;">
        <span style="background: #FFD84A; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 700;">${dealTypeLabel}</span>
      </p>
      <p style="font-size: 20px; font-weight: 900; margin: 8px 0 0;">${compensationLine}</p>
      ${bonusEnabled && bonusAmount && bonusThreshold ? `
        <p style="font-size: 14px; color: #28D17C; margin: 8px 0 0;">+ $${bonusAmount / 100} bonus at ${bonusThreshold.toLocaleString()} clicks</p>
      ` : ''}
      
      ${deliverables.length > 0 ? `
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 16px 0 8px;">Deliverables</p>
        <p style="margin: 0;">${deliverables.join(' · ')}</p>
      ` : ''}
    </div>
    
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 12px;">What happens next?</p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>1.</strong> ${creatorName} will receive an email notification
      </p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>2.</strong> They have 14 days to accept, counter, or decline
      </p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        <strong>3.</strong> You'll be notified as soon as they respond
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/host/offers" style="${styles.button}">View All Offers →</a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      Offer ID: ${offerId}
    </p>
  `)

  const text = `
Offer Sent Successfully!

Hi ${hostName}, your offer has been delivered.

SENT TO
${creatorName} (@${creatorHandle})

PROPERTY
${propertyTitle}${propertyLocation ? ` - ${propertyLocation}` : ''}

DEAL
${dealTypeLabel}: ${compensationLine}
${bonusEnabled && bonusAmount && bonusThreshold ? `+ $${bonusAmount / 100} bonus at ${bonusThreshold.toLocaleString()} clicks` : ''}

DELIVERABLES
${deliverables.join(', ')}

WHAT HAPPENS NEXT?
1. ${creatorName} will receive an email notification
2. They have 14 days to accept, counter, or decline
3. You'll be notified as soon as they respond

View all offers: ${BASE_URL}/dashboard/host/offers

Offer ID: ${offerId}
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

/**
 * Payment Receipt Email (to Host)
 * Detailed receipt with breakdown for business records/taxes
 */
export function paymentReceiptEmail(data: {
  hostName: string
  hostEmail: string
  creatorName: string
  creatorHandle: string
  propertyTitle: string
  propertyLocation?: string
  dealType: string
  baseCashCents: number      // Base payment to creator
  hostFeeCents: number       // 15% platform fee from host
  totalPaidCents: number     // Total charged to host
  creatorFeeCents: number    // 15% platform fee from creator (for transparency)
  creatorNetCents: number    // What creator receives
  deliverables: string[]
  collaborationId: string
  paymentIntentId?: string
  paidAt: Date
}): { subject: string; html: string; text: string } {
  const { 
    hostName, 
    hostEmail,
    creatorName, 
    creatorHandle, 
    propertyTitle, 
    propertyLocation,
    dealType,
    baseCashCents, 
    hostFeeCents, 
    totalPaidCents,
    creatorFeeCents,
    creatorNetCents,
    deliverables,
    collaborationId,
    paymentIntentId,
    paidAt
  } = data

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const receiptDate = paidAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  const receiptNumber = `CS-${collaborationId.slice(-8).toUpperCase()}`
  
  const dealTypeLabel = dealType === 'post-for-stay' ? 'Post-for-Stay' :
                        dealType === 'flat-with-bonus' ? 'Flat Fee + Bonus' : 'Flat Fee'

  const subject = `Receipt: ${formatCurrency(totalPaidCents)} payment to @${creatorHandle}`

  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Payment Receipt</h1>
      <p style="color: #666; margin: 0;">Thank you for your payment</p>
    </div>
    
    <!-- Receipt Header -->
    <div style="background: #f9f9f9; border: 2px solid #000; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%;">
        <tr>
          <td>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 4px;">Receipt Number</p>
            <p style="font-size: 14px; font-weight: 700; margin: 0;">${receiptNumber}</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 4px;">Date</p>
            <p style="font-size: 14px; font-weight: 700; margin: 0;">${receiptDate}</p>
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Bill To / Paid To -->
    <table style="width: 100%; margin-bottom: 24px;">
      <tr>
        <td style="width: 48%; vertical-align: top;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Billed To</p>
          <p style="font-size: 14px; font-weight: 700; margin: 0;">${hostName}</p>
          <p style="font-size: 13px; color: #666; margin: 4px 0 0;">${hostEmail}</p>
        </td>
        <td style="width: 4%;"></td>
        <td style="width: 48%; vertical-align: top;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Paid To</p>
          <p style="font-size: 14px; font-weight: 700; margin: 0;">${creatorName}</p>
          <p style="font-size: 13px; color: #666; margin: 4px 0 0;">@${creatorHandle}</p>
        </td>
      </tr>
    </table>
    
    <!-- Service Details -->
    <div style="${styles.card}; margin-bottom: 24px;">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 12px;">Service Details</p>
      
      <p style="font-size: 16px; font-weight: 700; margin: 0 0 4px;">${propertyTitle}</p>
      ${propertyLocation ? `<p style="font-size: 13px; color: #666; margin: 0 0 12px;">${propertyLocation}</p>` : ''}
      
      <p style="margin: 12px 0 8px;">
        <span style="background: #FFD84A; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700;">${dealTypeLabel}</span>
      </p>
      
      ${deliverables.length > 0 ? `
        <p style="font-size: 12px; color: #666; margin: 16px 0 8px;">Deliverables:</p>
        <p style="font-size: 13px; margin: 0;">${deliverables.join(' · ')}</p>
      ` : ''}
    </div>
    
    <!-- Payment Breakdown -->
    <div style="background: #fff; border: 2px solid #000; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <div style="padding: 16px 20px; border-bottom: 1px solid #eee;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 4px;">Payment Breakdown</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 20px; border-bottom: 1px solid #eee;">Creator Payment</td>
          <td style="padding: 12px 20px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${formatCurrency(baseCashCents)}</td>
        </tr>
        <tr>
          <td style="padding: 12px 20px; border-bottom: 1px solid #eee;">
            Platform Fee (15%)
            <span style="font-size: 11px; color: #666; display: block;">Service fee for payment processing & platform</span>
          </td>
          <td style="padding: 12px 20px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${formatCurrency(hostFeeCents)}</td>
        </tr>
        <tr style="background: #000;">
          <td style="padding: 16px 20px; color: #fff; font-weight: 700;">Total Paid</td>
          <td style="padding: 16px 20px; text-align: right; color: #fff; font-weight: 900; font-size: 18px;">${formatCurrency(totalPaidCents)}</td>
        </tr>
      </table>
    </div>
    
    <!-- Creator Payment Info (for transparency) -->
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="font-size: 12px; color: #666; margin: 0 0 8px;">
        <strong>Creator receives:</strong> ${formatCurrency(creatorNetCents)} (after 15% creator platform fee)
      </p>
      <p style="font-size: 11px; color: #999; margin: 0;">
        Funds are transferred to ${creatorName}'s connected Stripe account within 2-3 business days.
      </p>
    </div>
    
    <!-- Reference Info -->
    <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 16px; margin-bottom: 24px;">
      <p style="margin: 0 0 4px;"><strong>Collaboration ID:</strong> ${collaborationId}</p>
      ${paymentIntentId ? `<p style="margin: 0;"><strong>Stripe Reference:</strong> ${paymentIntentId}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/host/collaborations" style="${styles.button}">View Collaboration →</a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center; margin-top: 24px;">
      This receipt serves as confirmation of your payment. For tax purposes, please consult with your accountant.<br>
      Questions? Contact us at support@creatorstays.com
    </p>
  `)

  const text = `
PAYMENT RECEIPT
================

Receipt Number: ${receiptNumber}
Date: ${receiptDate}

BILLED TO
${hostName}
${hostEmail}

PAID TO
${creatorName} (@${creatorHandle})

SERVICE DETAILS
Property: ${propertyTitle}${propertyLocation ? ` - ${propertyLocation}` : ''}
Deal Type: ${dealTypeLabel}
${deliverables.length > 0 ? `Deliverables: ${deliverables.join(', ')}` : ''}

PAYMENT BREAKDOWN
Creator Payment:     ${formatCurrency(baseCashCents)}
Platform Fee (15%):  ${formatCurrency(hostFeeCents)}
---------------------------------
TOTAL PAID:          ${formatCurrency(totalPaidCents)}

Creator receives ${formatCurrency(creatorNetCents)} (after 15% creator platform fee).

REFERENCE
Collaboration ID: ${collaborationId}
${paymentIntentId ? `Stripe Reference: ${paymentIntentId}` : ''}

View collaboration: ${BASE_URL}/dashboard/host/collaborations

This receipt serves as confirmation of your payment. For tax purposes, please consult with your accountant.
Questions? Contact us at support@creatorstays.com
`

  return { subject, html, text }
}

/**
 * Collaboration Completed Email (to both parties)
 * Sent when collaboration is marked complete, prompts for review
 */
export function collaborationCompletedEmail(data: {
  recipientName: string
  recipientRole: 'host' | 'creator'
  otherPartyName: string
  propertyTitle: string
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { recipientName, recipientRole, otherPartyName, propertyTitle, collaborationId } = data

  const subject = `✅ Collaboration complete — share your experience!`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Collaboration Complete! 🎉</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${recipientName},</p>
    
    <p style="margin: 0 0 16px;">
      Your collaboration with <strong>${otherPartyName}</strong> for <strong>${propertyTitle}</strong> is now complete.
    </p>
    
    <div style="${styles.card}; background: #FFD84A;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 8px;">⭐ How was your experience?</p>
      <p style="font-size: 13px; color: #333; margin: 0;">
        Your review helps build trust in the CreatorStays community and helps ${recipientRole === 'host' ? 'other hosts find great creators' : 'creators find great hosts'}.
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.button}">Leave a Review →</a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Thank you for using CreatorStays. We hope to see you again soon!
    </p>
  `)

  const text = `
Collaboration Complete! 🎉

Hi ${recipientName},

Your collaboration with ${otherPartyName} for ${propertyTitle} is now complete.

How was your experience? Your review helps build trust in the CreatorStays community.

Leave a review: ${BASE_URL}/dashboard/collaborations/${collaborationId}

Thank you for using CreatorStays!
`

  return { subject, html, text }
}

/**
 * Offer Countered Email (to Host)
 */
export function offerCounteredEmail(data: {
  hostName: string
  creatorName: string
  creatorHandle: string
  propertyTitle: string
  originalAmount: number // in cents
  counterAmount: number // in cents
  counterMessage?: string
  offerId: string
}): { subject: string; html: string; text: string } {
  const { hostName, creatorName, creatorHandle, propertyTitle, originalAmount, counterAmount, counterMessage } = data

  const originalFormatted = `$${(originalAmount / 100).toLocaleString()}`
  const counterFormatted = `$${(counterAmount / 100).toLocaleString()}`
  const difference = counterAmount - originalAmount
  const differenceFormatted = difference > 0 ? `+$${(difference / 100).toLocaleString()}` : `-$${(Math.abs(difference) / 100).toLocaleString()}`

  const subject = `💬 ${creatorName} countered your offer`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Counter Offer Received</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${hostName},</p>
    
    <div style="${styles.card}">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 4px;">${creatorName}</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 16px;">@${creatorHandle}</p>
      <p style="margin: 0 0 16px;">has countered your offer for <strong>${propertyTitle}</strong></p>
      
      <table style="width: 100%; margin-top: 16px;">
        <tr>
          <td style="padding: 12px; background: #f0f0f0; border-radius: 8px; width: 48%;">
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 4px;">Your offer</p>
            <p style="font-size: 20px; font-weight: 700; margin: 0; text-decoration: line-through; color: #999;">${originalFormatted}</p>
          </td>
          <td style="width: 4%;"></td>
          <td style="padding: 12px; background: #4AA3FF; border-radius: 8px; border: 2px solid #000; width: 48%;">
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #000; margin: 0 0 4px;">Counter</p>
            <p style="font-size: 20px; font-weight: 900; margin: 0;">${counterFormatted}</p>
            <p style="font-size: 12px; margin: 4px 0 0; color: #000;">${differenceFormatted}</p>
          </td>
        </tr>
      </table>
    </div>
    
    ${counterMessage ? `
    <div style="${styles.card}; background: #fff;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Their message</p>
      <p style="margin: 0; font-style: italic;">"${counterMessage}"</p>
    </div>
    ` : ''}
    
    <p style="margin: 24px 0;">
      You can <strong>accept</strong> the counter offer, <strong>decline</strong> it, or send a new offer with different terms.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/host/offers" style="${styles.buttonYellow}">Respond to Counter →</a>
    </div>
  `)

  const text = `
Counter Offer Received

Hi ${hostName},

${creatorName} (@${creatorHandle}) has countered your offer for ${propertyTitle}.

Your offer: ${originalFormatted}
Counter offer: ${counterFormatted} (${differenceFormatted})
${counterMessage ? `\nTheir message: "${counterMessage}"` : ''}

Respond: ${BASE_URL}/dashboard/host/offers
`

  return { subject, html, text }
}

/**
 * Offer Declined Email (to Host)
 */
export function offerDeclinedEmail(data: {
  hostName: string
  creatorName: string
  creatorHandle: string
  propertyTitle: string
}): { subject: string; html: string; text: string } {
  const { hostName, creatorName, creatorHandle, propertyTitle } = data

  const subject = `${creatorName} declined your offer`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Offer Declined</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${hostName},</p>
    
    <div style="${styles.card}">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 4px;">${creatorName}</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 16px;">@${creatorHandle}</p>
      <p style="margin: 0;">has declined your offer for <strong>${propertyTitle}</strong></p>
    </div>
    
    <p style="margin: 24px 0;">
      Don't worry! You can browse other creators or adjust your offer terms and try again.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/host/search-creators" style="${styles.button}">Find Creators →</a>
    </div>
  `)

  const text = `
Offer Declined

Hi ${hostName},

${creatorName} (@${creatorHandle}) has declined your offer for ${propertyTitle}.

Find other creators: ${BASE_URL}/dashboard/host/search-creators
`

  return { subject, html, text }
}

/**
 * Offer Withdrawn Email (to Creator)
 */
export function offerWithdrawnEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle } = data

  const subject = `Offer from ${hostName} has been withdrawn`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Offer Withdrawn</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName},</p>
    
    <div style="${styles.card}">
      <p style="margin: 0 0 8px;"><strong>${hostName}</strong> has withdrawn their offer for:</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0;">${propertyTitle}</p>
    </div>
    
    <p style="margin: 24px 0;">
      This sometimes happens when hosts' circumstances change. Don't worry — you may receive new offers from other hosts soon!
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/creator" style="${styles.button}">View Dashboard →</a>
    </div>
  `)

  const text = `
Offer Withdrawn

Hi ${creatorName},

${hostName} has withdrawn their offer for ${propertyTitle}.

This sometimes happens when hosts' circumstances change. You may receive new offers from other hosts soon!

View dashboard: ${BASE_URL}/dashboard/creator
`

  return { subject, html, text }
}

/**
 * Collaboration Cancellation Request Email (to other party)
 */
export function cancellationRequestEmail(data: {
  recipientName: string
  requesterName: string
  requesterRole: 'host' | 'creator'
  propertyTitle: string
  reason?: string
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { recipientName, requesterName, requesterRole, propertyTitle, reason, collaborationId } = data

  const subject = `⚠️ ${requesterName} requested to cancel collaboration`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Cancellation Requested</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${recipientName},</p>
    
    <div style="${styles.card}; border-color: #FF6B6B;">
      <p style="margin: 0 0 8px;"><strong>${requesterName}</strong> (${requesterRole}) has requested to cancel the collaboration for:</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0;">${propertyTitle}</p>
    </div>
    
    ${reason ? `
    <div style="${styles.card}; background: #fff;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Reason provided</p>
      <p style="margin: 0; font-style: italic;">"${reason}"</p>
    </div>
    ` : ''}
    
    <p style="margin: 24px 0;">
      You can <strong>accept</strong> the cancellation to end the collaboration, or <strong>decline</strong> to keep it active and discuss further.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.buttonYellow}">Review Request →</a>
    </div>
  `)

  const text = `
Cancellation Requested

Hi ${recipientName},

${requesterName} (${requesterRole}) has requested to cancel the collaboration for ${propertyTitle}.
${reason ? `\nReason: "${reason}"` : ''}

You can accept the cancellation or decline to keep it active.

Review: ${BASE_URL}/dashboard/collaborations/${collaborationId}
`

  return { subject, html, text }
}

/**
 * Collaboration Cancelled Email (to both parties)
 */
export function collaborationCancelledEmail(data: {
  recipientName: string
  otherPartyName: string
  propertyTitle: string
  cancelledBy: 'mutual' | 'host' | 'creator'
}): { subject: string; html: string; text: string } {
  const { recipientName, otherPartyName, propertyTitle, cancelledBy } = data

  const cancelReason = cancelledBy === 'mutual' 
    ? 'Both parties agreed to cancel'
    : `Cancelled by ${cancelledBy}`

  const subject = `Collaboration cancelled: ${propertyTitle}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Collaboration Cancelled</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${recipientName},</p>
    
    <div style="${styles.card}; background: #f5f5f5;">
      <p style="margin: 0 0 8px;">The collaboration for <strong>${propertyTitle}</strong> has been cancelled.</p>
      <p style="font-size: 14px; color: #666; margin: 0;">${cancelReason}</p>
    </div>
    
    <p style="margin: 24px 0;">
      We hope you'll find other great collaboration opportunities on CreatorStays!
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard" style="${styles.button}">Go to Dashboard →</a>
    </div>
  `)

  const text = `
Collaboration Cancelled

Hi ${recipientName},

The collaboration for ${propertyTitle} has been cancelled.
${cancelReason}

We hope you'll find other great opportunities on CreatorStays!

Dashboard: ${BASE_URL}/dashboard
`

  return { subject, html, text }
}

/**
 * Cancellation Declined Email (to requester)
 */
export function cancellationDeclinedEmail(data: {
  recipientName: string
  otherPartyName: string
  propertyTitle: string
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { recipientName, otherPartyName, propertyTitle, collaborationId } = data

  const subject = `Cancellation declined — ${propertyTitle}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Cancellation Request Declined</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${recipientName},</p>
    
    <p style="margin: 0 0 16px;">
      <strong>${otherPartyName}</strong> has declined your cancellation request for <strong>${propertyTitle}</strong>.
    </p>
    
    <div style="${styles.card}; background: #FFD84A;">
      <p style="font-size: 14px; font-weight: 700; margin: 0;">The collaboration remains active.</p>
    </div>
    
    <p style="margin: 24px 0; color: #666; font-size: 14px;">
      If you're having issues with this collaboration, consider reaching out to ${otherPartyName} directly to discuss, or contact our support team for assistance.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.button}">View Collaboration →</a>
    </div>
  `)

  const text = `
Cancellation Request Declined

Hi ${recipientName},

${otherPartyName} has declined your cancellation request for ${propertyTitle}.

The collaboration remains active.

If you're having issues, consider reaching out to ${otherPartyName} directly or contact our support team.

View: ${BASE_URL}/dashboard/collaborations/${collaborationId}
`

  return { subject, html, text }
}

/**
 * Counter Offer Accepted Email (to Creator)
 */
export function counterAcceptedEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  acceptedAmount: number // in cents
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, acceptedAmount, collaborationId } = data

  const formattedAmount = `$${(acceptedAmount / 100).toLocaleString()}`
  const subject = `✅ ${hostName} accepted your counter offer!`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Counter Offer Accepted!</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName}, great news!</p>
    
    <div style="${styles.card}; background: #28D17C;">
      <p style="font-size: 14px; margin: 0 0 8px;"><strong>${hostName}</strong> accepted your counter offer</p>
      <p style="font-size: 24px; font-weight: 900; margin: 0 0 8px;">${formattedAmount}</p>
      <p style="font-size: 14px; margin: 0;">for <strong>${propertyTitle}</strong></p>
    </div>
    
    <p style="margin: 24px 0;">
      <strong>Next step:</strong> Both parties need to sign the collaboration agreement before work begins.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.button}">View & Sign Agreement →</a>
    </div>
  `)

  const text = `
Counter Offer Accepted!

Hi ${creatorName}, great news!

${hostName} accepted your counter offer of ${formattedAmount} for ${propertyTitle}.

Next step: Sign the collaboration agreement to get started.

View: ${BASE_URL}/dashboard/collaborations/${collaborationId}
`

  return { subject, html, text }
}

/**
 * Counter Offer Declined Email (to Creator)
 */
export function counterDeclinedEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  counterAmount: number // in cents
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, counterAmount } = data

  const formattedAmount = `$${(counterAmount / 100).toLocaleString()}`
  const subject = `${hostName} declined your counter offer`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Counter Offer Declined</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName},</p>
    
    <div style="${styles.card}">
      <p style="margin: 0 0 8px;"><strong>${hostName}</strong> has declined your counter offer of <strong>${formattedAmount}</strong> for:</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0;">${propertyTitle}</p>
    </div>
    
    <p style="margin: 24px 0;">
      Don't be discouraged! You may receive new offers from other hosts, or ${hostName} may reach out with a revised offer.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/creator/offers" style="${styles.button}">View Your Offers →</a>
    </div>
  `)

  const text = `
Counter Offer Declined

Hi ${creatorName},

${hostName} has declined your counter offer of ${formattedAmount} for ${propertyTitle}.

You may receive new offers from other hosts, or ${hostName} may reach out with a revised offer.

View your offers: ${BASE_URL}/dashboard/creator/offers
`

  return { subject, html, text }
}

/**
 * Content Changes Requested Email (to Creator)
 */
export function changesRequestedEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  feedback?: string
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, feedback, collaborationId } = data

  const subject = `📝 ${hostName} requested changes to your content`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Changes Requested</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName},</p>
    
    <p style="margin: 0 0 24px;">
      <strong>${hostName}</strong> has reviewed your content for <strong>${propertyTitle}</strong> and requested some changes.
    </p>
    
    ${feedback ? `
    <div style="${styles.card}">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Feedback</p>
      <p style="margin: 0; font-style: italic;">"${feedback}"</p>
    </div>
    ` : ''}
    
    <p style="margin: 24px 0;">
      Please review the feedback and resubmit your updated content when ready.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.buttonYellow}">View & Resubmit →</a>
    </div>
  `)

  const text = `
Changes Requested

Hi ${creatorName},

${hostName} has reviewed your content for ${propertyTitle} and requested some changes.
${feedback ? `\nFeedback: "${feedback}"` : ''}

Please review and resubmit your updated content.

View: ${BASE_URL}/dashboard/collaborations/${collaborationId}
`

  return { subject, html, text }
}

/**
 * Offer Expiring Soon Email (to Creator) - sent 2 days before expiration
 */
export function offerExpiringSoonEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  propertyLocation: string
  cashAmount: number
  expiresAt: Date
  offerId: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, propertyLocation, cashAmount, expiresAt, offerId } = data

  const expiresDate = expiresAt.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  })
  const formattedAmount = cashAmount > 0 
    ? (cashAmount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : null

  const subject = `⏰ Offer expires soon: ${propertyTitle}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Your Offer Expires Soon</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName},</p>
    
    <div style="${styles.card}; border-color: #FFD84A; background: #FFFDF0;">
      <p style="margin: 0 0 4px; font-size: 12px; color: #666;">EXPIRING ${expiresDate.toUpperCase()}</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 4px;">${propertyTitle}</p>
      <p style="color: #666; margin: 0 0 12px;">${propertyLocation}</p>
      <p style="margin: 0;">
        <strong>From:</strong> ${hostName}
        ${formattedAmount ? `<br><strong>Offer:</strong> ${formattedAmount}` : ''}
      </p>
    </div>
    
    <p style="margin: 24px 0;">
      Don't miss out! This offer will expire on <strong>${expiresDate}</strong>. 
      Review and respond before it's too late.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/creator/offers" style="${styles.buttonYellow}">Review Offer →</a>
    </div>
  `)

  const text = `
Your Offer Expires Soon

Hi ${creatorName},

You have an offer from ${hostName} for ${propertyTitle} that expires on ${expiresDate}.
${formattedAmount ? `Offer amount: ${formattedAmount}` : ''}

Don't miss out — review and respond before it's too late!

Review offer: ${BASE_URL}/dashboard/creator/offers
`

  return { subject, html, text }
}

/**
 * Offer Expired Email (to Creator)
 */
export function offerExpiredToCreatorEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle } = data

  const subject = `Offer expired: ${propertyTitle}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Offer Expired</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName},</p>
    
    <div style="${styles.card}; border-color: #999; background: #f5f5f5;">
      <p style="margin: 0 0 8px;"><strong>${hostName}'s</strong> offer for:</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0;">${propertyTitle}</p>
      <p style="margin: 8px 0 0; color: #666;">has expired.</p>
    </div>
    
    <p style="margin: 24px 0;">
      If you're still interested, the host may choose to send a new offer. 
      You'll receive a notification if they do.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/creator" style="${styles.button}">View Dashboard →</a>
    </div>
  `)

  const text = `
Offer Expired

Hi ${creatorName},

The offer from ${hostName} for ${propertyTitle} has expired.

If you're still interested, the host may choose to send a new offer. You'll receive a notification if they do.

View dashboard: ${BASE_URL}/dashboard/creator
`

  return { subject, html, text }
}

/**
 * Offer Expired Email (to Host)
 */
export function offerExpiredToHostEmail(data: {
  hostName: string
  creatorName: string
  creatorHandle: string
  propertyTitle: string
  offerId: string
}): { subject: string; html: string; text: string } {
  const { hostName, creatorName, creatorHandle, propertyTitle, offerId } = data

  const subject = `Your offer to @${creatorHandle} has expired`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Offer Expired</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${hostName},</p>
    
    <div style="${styles.card}; border-color: #999; background: #f5f5f5;">
      <p style="margin: 0 0 8px;">Your offer to <strong>@${creatorHandle}</strong> for:</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0;">${propertyTitle}</p>
      <p style="margin: 8px 0 0; color: #666;">has expired without a response.</p>
    </div>
    
    <p style="margin: 24px 0;">
      No worries — you can resend this offer to give ${creatorName} another chance to respond, 
      or find other creators who might be a great fit.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/host/offers" style="${styles.buttonYellow}">Resend Offer →</a>
    </div>
    
    <p style="text-align: center; margin: 16px 0;">
      <a href="${BASE_URL}/dashboard/host/search-creators" style="color: #000; text-decoration: underline;">Or find new creators</a>
    </p>
  `)

  const text = `
Offer Expired

Hi ${hostName},

Your offer to @${creatorHandle} for ${propertyTitle} has expired without a response.

No worries — you can resend this offer to give ${creatorName} another chance to respond, or find other creators.

Resend offer: ${BASE_URL}/dashboard/host/offers
Find creators: ${BASE_URL}/dashboard/host/search-creators
`

  return { subject, html, text }
}

/**
 * Offer Resent Email (to Creator)
 */
export function offerResentEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  propertyLocation: string
  dealType: string
  cashAmount: number
  stayNights: number | null
  deliverables: string[]
  offerId: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, propertyLocation, dealType, cashAmount, stayNights, deliverables, offerId } = data

  const formattedAmount = cashAmount > 0 
    ? (cashAmount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : null
  
  const dealTypeLabel = dealType === 'post-for-stay' ? 'Post-for-Stay' :
                        dealType === 'flat-with-bonus' ? 'Flat Fee + Bonus' : 'Flat Fee'

  const compensationLine = dealType === 'post-for-stay'
    ? `<strong>Complimentary Stay:</strong> ${stayNights} nights`
    : formattedAmount
    ? `<strong>Payment:</strong> ${formattedAmount}${stayNights ? ` + ${stayNights} nights stay` : ''}`
    : `<strong>Stay:</strong> ${stayNights} nights`

  const subject = `🔄 ${hostName} resent their offer for ${propertyTitle}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">You Have Another Chance!</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName},</p>
    
    <p style="margin: 0 0 24px;">
      Great news! <strong>${hostName}</strong> has resent their offer for a collaboration. 
      They're still interested in working with you!
    </p>
    
    <div style="${styles.card}">
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 4px;">${propertyTitle}</p>
      <p style="color: #666; margin: 0 0 16px;">${propertyLocation}</p>
      
      <p style="margin: 0 0 8px;">
        <span style="background: #FFD84A; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 700;">${dealTypeLabel}</span>
      </p>
      
      <p style="margin: 16px 0 8px;">${compensationLine}</p>
      
      ${deliverables.length > 0 ? `
        <p style="margin: 16px 0 8px; font-size: 14px; color: #666;"><strong>Deliverables:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          ${deliverables.map(d => `<li style="margin: 4px 0;">${d}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/creator/offers" style="${styles.buttonGreen}">Review Offer →</a>
    </div>
    
    <p style="text-align: center; font-size: 14px; color: #666;">
      This offer expires in 14 days.
    </p>
  `)

  const text = `
You Have Another Chance!

Hi ${creatorName},

${hostName} has resent their offer for ${propertyTitle}. They're still interested in working with you!

Property: ${propertyTitle}
Location: ${propertyLocation}
Deal Type: ${dealTypeLabel}
${formattedAmount ? `Payment: ${formattedAmount}` : ''}
${stayNights ? `Stay: ${stayNights} nights` : ''}
${deliverables.length > 0 ? `Deliverables: ${deliverables.join(', ')}` : ''}

This offer expires in 14 days.

Review offer: ${BASE_URL}/dashboard/creator/offers
`

  return { subject, html, text }
}

/**
 * Agreement Copy Email
 * Sends a copy of the agreement to a party for their records
 */
export function agreementCopyEmail(data: {
  recipientName: string
  recipientRole: 'host' | 'creator'
  agreementId: string
  hostName: string
  hostEmail: string
  creatorName: string
  creatorHandle: string
  creatorEmail: string
  propertyTitle: string
  propertyLocation?: string
  dealType: string
  cashAmount: number
  stayNights?: number | null
  deliverables: string[]
  isFullyExecuted: boolean
  executedAt?: Date | null
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const {
    recipientName,
    recipientRole,
    agreementId,
    hostName,
    hostEmail,
    creatorName,
    creatorHandle,
    creatorEmail,
    propertyTitle,
    propertyLocation,
    dealType,
    cashAmount,
    stayNights,
    deliverables,
    isFullyExecuted,
    executedAt,
    collaborationId,
  } = data

  const dealTypeLabel = dealType === 'post-for-stay' 
    ? 'Post-for-Stay' 
    : dealType === 'flat-with-bonus' 
      ? 'Flat Fee + Performance Bonus' 
      : 'Flat Fee'

  const formattedAmount = cashAmount > 0 ? `$${(cashAmount / 100).toFixed(2)}` : null
  const status = isFullyExecuted ? 'Fully Executed' : 'Pending Signatures'
  const statusColor = isFullyExecuted ? '#28D17C' : '#FFD84A'

  const subject = `Your Agreement Copy: ${propertyTitle} (${agreementId})`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Agreement Copy</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${recipientName}, here's a copy of your collaboration agreement for your records.</p>
    
    <div style="${styles.card}; background: #f9f9f9;">
      <table style="width: 100%;">
        <tr>
          <td>
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0;">Agreement ID</p>
            <p style="font-size: 14px; font-weight: 700; margin: 4px 0 0;">${agreementId}</p>
          </td>
          <td style="text-align: right;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0;">Status</p>
            <p style="font-size: 14px; font-weight: 700; color: ${statusColor}; margin: 4px 0 0;">${status}</p>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="${styles.card}">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 12px;">Parties</p>
      <p style="margin: 0;"><strong>Host:</strong> ${hostName} (${hostEmail})</p>
      <p style="margin: 8px 0 0;"><strong>Creator:</strong> ${creatorName} @${creatorHandle} (${creatorEmail})</p>
    </div>
    
    <div style="${styles.card}">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 12px;">Property</p>
      <p style="font-size: 16px; font-weight: 700; margin: 0;">${propertyTitle}</p>
      ${propertyLocation ? `<p style="color: #666; margin: 4px 0 0;">${propertyLocation}</p>` : ''}
    </div>
    
    <div style="${styles.card}">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 12px;">Deal Terms</p>
      <p style="margin: 0;"><strong>Type:</strong> ${dealTypeLabel}</p>
      ${formattedAmount ? `<p style="margin: 8px 0 0;"><strong>Payment:</strong> ${formattedAmount}</p>` : ''}
      ${stayNights ? `<p style="margin: 8px 0 0;"><strong>Stay:</strong> ${stayNights} nights</p>` : ''}
      
      ${deliverables.length > 0 ? `
        <p style="margin: 16px 0 8px;"><strong>Deliverables:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          ${deliverables.map(d => `<li style="margin: 4px 0;">${d}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
    
    ${isFullyExecuted && executedAt ? `
      <div style="${styles.card}; background: ${statusColor};">
        <p style="font-weight: 700; margin: 0;">✓ Agreement Fully Executed</p>
        <p style="font-size: 14px; margin: 8px 0 0;">Signed on ${new Date(executedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
      </div>
    ` : ''}
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/api/collaborations/${collaborationId}/agreement/pdf" style="${styles.button}">Download PDF →</a>
    </div>
    
    <p style="font-size: 12px; color: #666; text-align: center;">
      This email serves as your copy of the agreement. You can also download the PDF at any time from your dashboard.
    </p>
  `)

  const text = `
Agreement Copy

Hi ${recipientName},

Here's a copy of your collaboration agreement for your records.

Agreement ID: ${agreementId}
Status: ${status}

PARTIES
Host: ${hostName} (${hostEmail})
Creator: ${creatorName} @${creatorHandle} (${creatorEmail})

PROPERTY
${propertyTitle}
${propertyLocation || ''}

DEAL TERMS
Type: ${dealTypeLabel}
${formattedAmount ? `Payment: ${formattedAmount}` : ''}
${stayNights ? `Stay: ${stayNights} nights` : ''}
${deliverables.length > 0 ? `Deliverables: ${deliverables.join(', ')}` : ''}

${isFullyExecuted && executedAt ? `✓ Agreement fully executed on ${new Date(executedAt).toLocaleDateString()}` : 'Status: Pending signatures'}

Download PDF: ${BASE_URL}/api/collaborations/${collaborationId}/agreement/pdf
View in dashboard: ${BASE_URL}/dashboard/collaborations/${collaborationId}
`

  return { subject, html, text }
}


// =============================================================================
// CONTENT DEADLINE EMAILS
// =============================================================================

/**
 * Email to creator when content deadline is approaching (3 days warning)
 */
export function contentDeadlineWarningEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  deadline: Date
  daysLeft: number
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, deadline, daysLeft, collaborationId } = data

  const deadlineStr = deadline.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const subject = `⏰ ${daysLeft} days left to submit content for ${propertyTitle}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Content Deadline Approaching</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName}, this is a friendly reminder about your upcoming deadline.</p>
    
    <div style="${styles.card}; background: #FFF3CD; border-color: #FFD84A;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 8px;">⏰ ${daysLeft} Days Remaining</p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        Your content for <strong>${propertyTitle}</strong> is due by <strong>${deadlineStr}</strong>.
      </p>
    </div>
    
    <div style="${styles.card}">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Collaboration Details</p>
      <p style="font-size: 16px; font-weight: 600; margin: 0 0 4px;">${propertyTitle}</p>
      <p style="font-size: 14px; color: #666; margin: 0;">with ${hostName}</p>
    </div>
    
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 12px;">Need more time?</p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        If you need an extension, message ${hostName} directly through the platform to discuss. 
        Extensions require mutual agreement.
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}/submit" style="${styles.buttonYellow}">Submit Content Now →</a>
    </div>
  `)

  const text = `Content Deadline Approaching

Hi ${creatorName},

This is a friendly reminder that your content for "${propertyTitle}" is due in ${daysLeft} days.

DEADLINE: ${deadlineStr}

Collaboration with: ${hostName}

Need more time? Message ${hostName} through the platform to discuss an extension.

Submit your content: ${BASE_URL}/dashboard/collaborations/${collaborationId}/submit`

  return { subject, html, text }
}

/**
 * Email to creator when content deadline has passed
 */
export function contentDeadlinePassedToCreatorEmail(data: {
  creatorName: string
  hostName: string
  propertyTitle: string
  deadline: Date
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { creatorName, hostName, propertyTitle, deadline, collaborationId } = data

  const deadlineStr = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const subject = `⚠️ Content deadline passed for ${propertyTitle}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Content Deadline Has Passed</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${creatorName}, the deadline for your collaboration has passed.</p>
    
    <div style="${styles.card}; background: #FEE2E2; border-color: #EF4444;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 8px;">⚠️ Deadline Passed</p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        Content for <strong>${propertyTitle}</strong> was due on <strong>${deadlineStr}</strong>.
      </p>
    </div>
    
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 12px;">What happens now?</p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>1.</strong> ${hostName} has been notified and may request to cancel the collaboration
      </p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>2.</strong> You can still submit content if the collaboration remains active
      </p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        <strong>3.</strong> We recommend messaging ${hostName} immediately to discuss next steps
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.button}">View Collaboration →</a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      Repeated deadline misses may affect your standing on CreatorStays.
    </p>
  `)

  const text = `Content Deadline Has Passed

Hi ${creatorName},

The deadline for your collaboration with ${hostName} for "${propertyTitle}" has passed.

The deadline was: ${deadlineStr}

WHAT HAPPENS NOW:
1. ${hostName} has been notified and may request to cancel
2. You can still submit content if the collaboration remains active
3. We recommend messaging ${hostName} immediately to discuss next steps

View collaboration: ${BASE_URL}/dashboard/collaborations/${collaborationId}`

  return { subject, html, text }
}

/**
 * Email to host when content deadline has passed
 */
export function contentDeadlinePassedToHostEmail(data: {
  hostName: string
  creatorName: string
  creatorHandle: string
  propertyTitle: string
  deadline: Date
  collaborationId: string
}): { subject: string; html: string; text: string } {
  const { hostName, creatorName, creatorHandle, propertyTitle, deadline, collaborationId } = data

  const deadlineStr = deadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const subject = `⚠️ @${creatorHandle} missed the content deadline`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Content Deadline Passed</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${hostName}, the creator has not submitted content by the deadline.</p>
    
    <div style="${styles.card}; background: #FEE2E2; border-color: #EF4444;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 8px;">⚠️ Deadline Missed</p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        <strong>${creatorName}</strong> (@${creatorHandle}) has not submitted content for <strong>${propertyTitle}</strong>.
        <br>The deadline was <strong>${deadlineStr}</strong>.
      </p>
    </div>
    
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 12px;">Your options:</p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>1. Grant an extension</strong> — Message the creator to agree on a new deadline
      </p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>2. Request cancellation</strong> — If you'd like to cancel, you can request it from the collaboration page
      </p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        <strong>3. Wait</strong> — The creator may still submit; you'll be notified when they do
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.button}">View Collaboration →</a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      No payment is required until you approve submitted content.
    </p>
  `)

  const text = `Content Deadline Passed

Hi ${hostName},

${creatorName} (@${creatorHandle}) has not submitted content for "${propertyTitle}" by the deadline.

The deadline was: ${deadlineStr}

YOUR OPTIONS:
1. Grant an extension - Message the creator to agree on a new deadline
2. Request cancellation - You can request it from the collaboration page
3. Wait - The creator may still submit; you'll be notified when they do

View collaboration: ${BASE_URL}/dashboard/collaborations/${collaborationId}

No payment is required until you approve submitted content.`

  return { subject, html, text }
}

// =============================================================================
// HOST MEMBERSHIP EMAILS
// =============================================================================

/**
 * Welcome email sent when host completes membership payment
 */
export function hostMembershipWelcomeEmail(data: {
  hostName: string
  hostEmail: string
  amountPaid: number // in cents
  promoCodeUsed?: string | null
  propertyTitle?: string
}): { subject: string; html: string; text: string } {
  const { hostName, hostEmail, amountPaid, promoCodeUsed, propertyTitle } = data

  const amountDisplay = amountPaid === 0 ? 'Free (Promo Code)' : `$${(amountPaid / 100).toFixed(2)}`
  const subject = `Welcome to CreatorStays! 🎉`

  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: #28D17C; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 16px;">
        <span style="font-size: 40px;">✓</span>
      </div>
      <h1 style="font-size: 32px; font-weight: 900; margin: 0 0 8px;">You're in!</h1>
      <p style="color: #666; margin: 0;">Welcome to the CreatorStays host community, ${hostName}.</p>
    </div>
    
    <div style="${styles.card}">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Payment Receipt</p>
      <p style="font-size: 28px; font-weight: 900; margin: 0 0 4px;">${amountDisplay}</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 16px;">Host Membership — Lifetime Access</p>
      
      ${promoCodeUsed ? `<p style="font-size: 13px; color: #28D17C; margin: 0;">Promo code applied: ${promoCodeUsed}</p>` : ''}
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
      
      <p style="font-size: 12px; color: #999; margin: 0;">
        Billed to: ${hostEmail}<br>
        Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
    
    <div style="background: #FFFDF7; border: 2px solid #000; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 16px;">What's included in your membership:</p>
      <p style="font-size: 14px; margin: 0 0 12px;">✓ &nbsp; Access to our creator directory</p>
      <p style="font-size: 14px; margin: 0 0 12px;">✓ &nbsp; Send unlimited collaboration offers</p>
      <p style="font-size: 14px; margin: 0 0 12px;">✓ &nbsp; Tracked affiliate links & performance analytics</p>
      <p style="font-size: 14px; margin: 0 0 12px;">✓ &nbsp; Secure payment processing</p>
      <p style="font-size: 14px; margin: 0;">✓ &nbsp; Priority support</p>
    </div>
    
    ${propertyTitle ? `
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Your Property</p>
      <p style="font-size: 16px; font-weight: 600; margin: 0;">${propertyTitle}</p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/host" style="${styles.buttonGreen}">Go to Dashboard →</a>
    </div>
    
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 12px;">Next steps:</p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>1.</strong> Browse the creator directory and find creators that match your property
      </p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>2.</strong> Send your first collaboration offer
      </p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        <strong>3.</strong> Get amazing content for your property!
      </p>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      Questions? Reply to this email or visit our <a href="${BASE_URL}/help" style="color: #666;">Help Center</a>.
    </p>
  `)

  const text = `Welcome to CreatorStays!

Hi ${hostName},

You're in! Your host membership is now active.

PAYMENT RECEIPT
Amount: ${amountDisplay}
Plan: Host Membership — Lifetime Access
${promoCodeUsed ? `Promo code: ${promoCodeUsed}` : ''}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Billed to: ${hostEmail}

WHAT'S INCLUDED:
✓ Access to our creator directory
✓ Send unlimited collaboration offers
✓ Tracked affiliate links & performance analytics
✓ Secure payment processing
✓ Priority support

NEXT STEPS:
1. Browse the creator directory and find creators that match your property
2. Send your first collaboration offer
3. Get amazing content for your property!

Go to your dashboard: ${BASE_URL}/dashboard/host

Questions? Reply to this email or visit ${BASE_URL}/help`

  return { subject, html, text }
}

// =============================================================================
// DISPUTE / ESCALATION EMAILS
// =============================================================================

/**
 * Email confirming dispute has been submitted
 */
export function disputeSubmittedEmail(data: {
  recipientName: string
  disputeId: string
  collaborationId: string
  propertyTitle: string
  otherPartyName: string
  reason: string
}): { subject: string; html: string; text: string } {
  const { recipientName, disputeId, collaborationId, propertyTitle, otherPartyName, reason } = data

  const subject = `Your dispute has been submitted — Case #${disputeId.slice(0, 8)}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Dispute Submitted</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${recipientName}, we've received your dispute and will review it promptly.</p>
    
    <div style="${styles.card}">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Case ID</p>
      <p style="font-size: 18px; font-weight: 700; font-family: monospace; margin: 0 0 16px;">#${disputeId.slice(0, 8).toUpperCase()}</p>
      
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Collaboration</p>
      <p style="font-size: 16px; font-weight: 600; margin: 0 0 4px;">${propertyTitle}</p>
      <p style="font-size: 14px; color: #666; margin: 0 0 16px;">with ${otherPartyName}</p>
      
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Your Concern</p>
      <p style="font-size: 14px; margin: 0; white-space: pre-wrap;">${reason}</p>
    </div>
    
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 12px;">What happens next?</p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>1.</strong> Our team will review your case within 1-2 business days
      </p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        <strong>2.</strong> We may reach out to both parties for additional information
      </p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        <strong>3.</strong> You'll receive updates via email as we work toward resolution
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.button}">View Collaboration →</a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      Questions? Reply to this email or contact support@creatorstays.com
    </p>
  `)

  const text = `Dispute Submitted

Hi ${recipientName},

We've received your dispute and will review it promptly.

CASE ID: #${disputeId.slice(0, 8).toUpperCase()}

COLLABORATION: ${propertyTitle} with ${otherPartyName}

YOUR CONCERN:
${reason}

WHAT HAPPENS NEXT:
1. Our team will review your case within 1-2 business days
2. We may reach out to both parties for additional information
3. You'll receive updates via email as we work toward resolution

View collaboration: ${BASE_URL}/dashboard/collaborations/${collaborationId}

Questions? Reply to this email or contact support@creatorstays.com`

  return { subject, html, text }
}

/**
 * Email notifying other party of dispute
 */
export function disputeNotificationEmail(data: {
  recipientName: string
  disputeId: string
  collaborationId: string
  propertyTitle: string
  filedByName: string
  filedByRole: 'host' | 'creator'
}): { subject: string; html: string; text: string } {
  const { recipientName, disputeId, collaborationId, propertyTitle, filedByName, filedByRole } = data

  const subject = `A dispute has been filed — Case #${disputeId.slice(0, 8)}`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">Dispute Notice</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi ${recipientName}, a dispute has been filed regarding your collaboration.</p>
    
    <div style="${styles.card}; background: #FEF3C7; border-color: #F59E0B;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 8px;">⚠️ Dispute Filed</p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        <strong>${filedByName}</strong> (${filedByRole}) has filed a dispute regarding the collaboration for <strong>${propertyTitle}</strong>.
      </p>
    </div>
    
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 12px;">What this means:</p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        • The collaboration is now under review by CreatorStays
      </p>
      <p style="font-size: 13px; color: #666; margin: 0 0 8px;">
        • Our team may contact you for your side of the story
      </p>
      <p style="font-size: 13px; color: #666; margin: 0;">
        • Please keep any relevant documentation (screenshots, messages, etc.)
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${BASE_URL}/dashboard/collaborations/${collaborationId}" style="${styles.button}">View Collaboration →</a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      Case ID: #${disputeId.slice(0, 8).toUpperCase()}<br>
      Questions? Contact support@creatorstays.com
    </p>
  `)

  const text = `Dispute Notice

Hi ${recipientName},

A dispute has been filed regarding your collaboration.

${filedByName} (${filedByRole}) has filed a dispute for "${propertyTitle}".

Case ID: #${disputeId.slice(0, 8).toUpperCase()}

WHAT THIS MEANS:
• The collaboration is now under review by CreatorStays
• Our team may contact you for your side of the story
• Please keep any relevant documentation (screenshots, messages, etc.)

View collaboration: ${BASE_URL}/dashboard/collaborations/${collaborationId}

Questions? Contact support@creatorstays.com`

  return { subject, html, text }
}

// =============================================================================
// TEAM INVITE EMAILS
// =============================================================================

/**
 * Team Member Invite Email
 */
export function teamInviteEmail(data: {
  inviteeName: string
  inviteeEmail: string
  inviterName: string
  agencyName: string
  role: string
  inviteToken?: string
}): { subject: string; html: string; text: string } {
  const { inviteeName, inviteeEmail, inviterName, agencyName, role, inviteToken } = data

  const acceptUrl = inviteToken 
    ? `${BASE_URL}/join/team/${inviteToken}` 
    : `${BASE_URL}/login/host`

  const subject = `You've been invited to join ${agencyName} on CreatorStays`

  const html = emailWrapper(`
    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px;">You're Invited!</h1>
    <p style="color: #666; margin: 0 0 24px;">Hi${inviteeName ? ` ${inviteeName}` : ''}, you've been invited to join a team on CreatorStays.</p>
    
    <div style="${styles.card}">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Invited by</p>
      <p style="font-size: 18px; font-weight: 700; margin: 0 0 16px;">${inviterName}</p>
      
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Agency</p>
      <p style="font-size: 16px; font-weight: 600; margin: 0 0 16px;">${agencyName}</p>
      
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px;">Your Role</p>
      <p style="font-size: 16px; font-weight: 600; margin: 0;">
        <span style="display: inline-block; background: ${role === 'editor' ? '#FFD84A' : '#f5f5f5'}; border: 2px solid #000; border-radius: 50px; padding: 4px 12px; font-size: 12px; font-weight: 700;">
          ${role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      </p>
    </div>
    
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="font-size: 14px; font-weight: 700; margin: 0 0 12px;">What you'll be able to do:</p>
      ${role === 'editor' ? `
        <p style="font-size: 13px; color: #666; margin: 0 0 8px;">✓ Manage properties and listings</p>
        <p style="font-size: 13px; color: #666; margin: 0 0 8px;">✓ Send offers to creators</p>
        <p style="font-size: 13px; color: #666; margin: 0;">✓ View analytics and collaborations</p>
      ` : `
        <p style="font-size: 13px; color: #666; margin: 0 0 8px;">✓ View properties and listings</p>
        <p style="font-size: 13px; color: #666; margin: 0;">✓ View collaborations and analytics</p>
      `}
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${acceptUrl}" style="${styles.buttonGreen}">Accept Invitation →</a>
    </div>
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      This invitation was sent to ${inviteeEmail}.<br>
      If you weren't expecting this, you can safely ignore this email.
    </p>
  `)

  const text = `You're Invited to CreatorStays!

Hi${inviteeName ? ` ${inviteeName}` : ''},

${inviterName} has invited you to join ${agencyName} on CreatorStays.

YOUR ROLE: ${role.charAt(0).toUpperCase() + role.slice(1)}

${role === 'editor' ? `WHAT YOU CAN DO:
✓ Manage properties and listings
✓ Send offers to creators
✓ View analytics and collaborations` : `WHAT YOU CAN DO:
✓ View properties and listings
✓ View collaborations and analytics`}

Accept your invitation: ${acceptUrl}

This invitation was sent to ${inviteeEmail}.
If you weren't expecting this, you can safely ignore this email.`

  return { subject, html, text }
}
