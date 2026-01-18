import { Resend } from 'resend';
import { createLogger } from '@/lib/logger';

const logger = createLogger('email');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'CreatorStays <noreply@creatorstays.com>';
const REPLY_TO = 'support@creatorstays.com';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!resend) {
    logger.warn('Resend API key not configured, skipping email');
    logger.info({ to: options.to, subject: options.subject }, 'Would have sent email');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || REPLY_TO,
    });

    if (error) {
      logger.error({ error, to: options.to }, 'Failed to send email');
      return false;
    }

    logger.info({ emailId: data?.id, to: options.to }, 'Email sent successfully');
    return true;
  } catch (error) {
    logger.error({ error, to: options.to }, 'Email send error');
    return false;
  }
}

// ============================================================================
// Email Templates
// ============================================================================

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CreatorStays</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f3ef; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .logo { font-family: Georgia, serif; font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 600; margin: 0 0 16px; color: #1a1a1a; }
    p { margin: 0 0 16px; color: #4a4a4a; }
    .button { display: inline-block; padding: 14px 28px; background: #1a1a1a; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 500; margin: 8px 0; }
    .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #888; }
    .highlight { background: #f5f3ef; border-radius: 8px; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">CreatorStays</div>
      ${content}
      <div class="footer">
        <p>© ${new Date().getFullYear()} CreatorStays. All rights reserved.</p>
        <p>You're receiving this because you signed up at CreatorStays.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// ============================================================================
// Specific Email Functions
// ============================================================================

export async function sendWelcomeEmail(to: string, name: string, role: 'HOST' | 'CREATOR') {
  const roleText = role === 'HOST' ? 'host' : 'creator';
  const nextStep =
    role === 'HOST'
      ? 'Add your first property and create an offer to start attracting creators.'
      : 'Complete your profile and start browsing properties with active offers.';

  const html = baseTemplate(`
    <h1>Welcome to CreatorStays, ${name}!</h1>
    <p>Thanks for joining as a ${roleText}. We're excited to have you on board.</p>
    <p>${nextStep}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
  `);

  return sendEmail({
    to,
    subject: `Welcome to CreatorStays!`,
    html,
    text: `Welcome to CreatorStays, ${name}! ${nextStep}`,
  });
}

export async function sendDealProposalEmail(
  to: string,
  creatorName: string,
  propertyTitle: string,
  dealId: string
) {
  const html = baseTemplate(`
    <h1>New Deal Application</h1>
    <p><strong>${creatorName}</strong> has applied to promote your property:</p>
    <div class="highlight">
      <p><strong>${propertyTitle}</strong></p>
    </div>
    <p>Review their profile and approve or decline the application.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/${dealId}" class="button">Review Application</a>
  `);

  return sendEmail({
    to,
    subject: `New deal application from ${creatorName}`,
    html,
    text: `${creatorName} has applied to promote ${propertyTitle}. Review at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/${dealId}`,
  });
}

export async function sendDealApprovedEmail(
  to: string,
  creatorName: string,
  propertyTitle: string,
  trackingLink: string
) {
  const html = baseTemplate(`
    <h1>Your Deal Has Been Approved!</h1>
    <p>Great news, ${creatorName}! Your deal to promote <strong>${propertyTitle}</strong> has been approved.</p>
    <div class="highlight">
      <p><strong>Your Tracking Link:</strong></p>
      <p style="word-break: break-all;"><a href="${trackingLink}">${trackingLink}</a></p>
    </div>
    <p>Use this link in your content to track clicks and earn commissions on bookings.</p>
    <p><strong>FTC Reminder:</strong> Remember to disclose this partnership in all promotional content.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals" class="button">View Deal Details</a>
  `);

  return sendEmail({
    to,
    subject: `Deal approved for ${propertyTitle}`,
    html,
    text: `Your deal to promote ${propertyTitle} has been approved. Your tracking link: ${trackingLink}`,
  });
}

export async function sendBookingClaimNotification(
  to: string,
  hostName: string,
  propertyTitle: string,
  claimId: string
) {
  const html = baseTemplate(`
    <h1>New Booking Claim Submitted</h1>
    <p>${hostName} has submitted a booking claim for <strong>${propertyTitle}</strong>.</p>
    <p>We'll review the claim and update you on your payout status.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payouts" class="button">View Payout Status</a>
  `);

  return sendEmail({
    to,
    subject: `Booking claim submitted for ${propertyTitle}`,
    html,
    text: `${hostName} has submitted a booking claim for ${propertyTitle}.`,
  });
}

export async function sendPayoutApprovedEmail(
  to: string,
  creatorName: string,
  amount: string,
  propertyTitle: string
) {
  const html = baseTemplate(`
    <h1>Payout Approved!</h1>
    <p>Congratulations, ${creatorName}! Your payout has been approved.</p>
    <div class="highlight">
      <p><strong>Amount:</strong> ${amount}</p>
      <p><strong>Property:</strong> ${propertyTitle}</p>
    </div>
    <p>The funds will be transferred to your connected Stripe account within 1-2 business days.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payouts" class="button">View Payout Details</a>
  `);

  return sendEmail({
    to,
    subject: `Payout approved: ${amount}`,
    html,
    text: `Your payout of ${amount} for ${propertyTitle} has been approved.`,
  });
}

export async function sendMagicLinkEmail(to: string, url: string) {
  const html = baseTemplate(`
    <h1>Sign in to CreatorStays</h1>
    <p>Click the button below to sign in to your account. This link expires in 24 hours.</p>
    <a href="${url}" class="button">Sign In</a>
    <p style="margin-top: 24px; font-size: 14px; color: #888;">If you didn't request this email, you can safely ignore it.</p>
  `);

  return sendEmail({
    to,
    subject: 'Sign in to CreatorStays',
    html,
    text: `Sign in to CreatorStays: ${url}`,
  });
}
