import Stripe from 'stripe';
import { createLogger } from '@/lib/logger';

const logger = createLogger('stripe');

// Lazy initialization to avoid build-time errors when env vars aren't set
let _stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
  return _stripe;
}

// ============================================================================
// Customer Management
// ============================================================================

export async function createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
  try {
    const customer = await getStripeClient().customers.create({
      email,
      name,
      metadata: {
        source: 'creatorstays',
        ...metadata,
      },
    });
    logger.info({ customerId: customer.id }, 'Created Stripe customer');
    return customer;
  } catch (error) {
    logger.error({ error }, 'Failed to create Stripe customer');
    throw error;
  }
}

export async function getOrCreateCustomer(
  email: string,
  existingCustomerId?: string | null,
  name?: string
): Promise<Stripe.Customer> {
  if (existingCustomerId) {
    try {
      const customer = await getStripeClient().customers.retrieve(existingCustomerId);
      if (!customer.deleted) {
        return customer as Stripe.Customer;
      }
    } catch (error) {
      logger.warn({ customerId: existingCustomerId, error }, 'Failed to retrieve existing customer');
    }
  }

  return createCustomer(email, name);
}

// ============================================================================
// Checkout Sessions
// ============================================================================

export async function createListingFeeCheckout(
  customerId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  const priceId = process.env.STRIPE_PRICE_LISTING_FEE;
  if (!priceId) {
    throw new Error('STRIPE_PRICE_LISTING_FEE is not set');
  }

  try {
    const session = await getStripeClient().checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        type: 'listing_fee',
      },
    });
    logger.info({ sessionId: session.id, userId }, 'Created listing fee checkout session');
    return session;
  } catch (error) {
    logger.error({ error }, 'Failed to create checkout session');
    throw error;
  }
}

// ============================================================================
// Connect (Creator Payouts)
// ============================================================================

export async function createConnectAccount(
  userId: string,
  email: string,
  refreshUrl: string,
  returnUrl: string
): Promise<{ accountId: string; onboardingUrl: string }> {
  try {
    const account = await getStripeClient().accounts.create({
      type: 'express',
      email,
      capabilities: {
        transfers: { requested: true },
      },
      metadata: {
        userId,
        source: 'creatorstays',
      },
    });

    const accountLink = await getStripeClient().accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    logger.info({ accountId: account.id, userId }, 'Created Connect account');

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to create Connect account');
    throw error;
  }
}

export async function createConnectLoginLink(accountId: string): Promise<string> {
  try {
    const loginLink = await getStripeClient().accounts.createLoginLink(accountId);
    return loginLink.url;
  } catch (error) {
    logger.error({ accountId, error }, 'Failed to create Connect login link');
    throw error;
  }
}

export async function getConnectAccountStatus(accountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}> {
  try {
    const account = await getStripeClient().accounts.retrieve(accountId);
    return {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    };
  } catch (error) {
    logger.error({ accountId, error }, 'Failed to retrieve Connect account status');
    throw error;
  }
}

// ============================================================================
// Transfers & Payouts
// ============================================================================

export async function createTransfer(
  amount: number,
  destinationAccountId: string,
  metadata: Record<string, string>
): Promise<Stripe.Transfer> {
  try {
    // Convert to cents
    const amountInCents = Math.round(amount * 100);

    const transfer = await getStripeClient().transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: destinationAccountId,
      metadata,
    });

    logger.info({ transferId: transfer.id, amount, destinationAccountId }, 'Created transfer');
    return transfer;
  } catch (error) {
    logger.error({ error, amount, destinationAccountId }, 'Failed to create transfer');
    throw error;
  }
}

// ============================================================================
// Webhook Verification
// ============================================================================

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret);
}

// ============================================================================
// Payment Intents (for future campaign funding)
// ============================================================================

export async function createPaymentIntent(
  amount: number,
  customerId: string,
  metadata: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  try {
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await getStripeClient().paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: customerId,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info({ paymentIntentId: paymentIntent.id, amount }, 'Created payment intent');
    return paymentIntent;
  } catch (error) {
    logger.error({ error, amount, customerId }, 'Failed to create payment intent');
    throw error;
  }
}
