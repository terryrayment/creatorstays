import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { constructWebhookEvent } from '@/lib/stripe';
import { createLogger } from '@/lib/logger';

const logger = createLogger('stripe-webhook');

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    logger.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    logger.error({ error }, 'Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  logger.info({ type: event.type, id: event.id }, 'Processing webhook event');

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        logger.info({ transferId: transfer.id }, 'Transfer created');
        break;
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;
        logger.info({ payoutId: payout.id }, 'Payout completed');
        break;
      }

      default:
        logger.info({ type: event.type }, 'Unhandled event type');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ error, eventType: event.type }, 'Error processing webhook');
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, type } = session.metadata || {};

  if (!userId) {
    logger.warn({ sessionId: session.id }, 'No userId in checkout session metadata');
    return;
  }

  if (type === 'listing_fee') {
    // Update host profile to mark listing fee as paid
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { hostProfile: true },
    });

    if (user?.hostProfile) {
      await prisma.hostProfile.update({
        where: { id: user.hostProfile.id },
        data: { hasPaidListingFee: true },
      });

      // Create ledger entry
      await prisma.ledgerEntry.create({
        data: {
          userId,
          type: 'HOST_LISTING_FEE',
          status: 'COMPLETED',
          amount: session.amount_total ? session.amount_total / 100 : 199,
          currency: session.currency?.toUpperCase() || 'USD',
          description: 'One-time listing fee',
          stripeRef: session.payment_intent as string,
        },
      });

      logger.info({ userId, sessionId: session.id }, 'Host listing fee payment recorded');
    }
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  const { userId } = account.metadata || {};

  if (!userId) {
    // Try to find by Connect account ID
    const paymentAccount = await prisma.paymentAccount.findFirst({
      where: { stripeConnectAccountId: account.id },
    });

    if (paymentAccount) {
      await prisma.paymentAccount.update({
        where: { id: paymentAccount.id },
        data: {
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
        },
      });

      logger.info({ accountId: account.id }, 'Connect account updated');
    }
    return;
  }

  // Update payment account status
  await prisma.paymentAccount.upsert({
    where: { userId },
    update: {
      stripeConnectAccountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    },
    create: {
      userId,
      stripeConnectAccountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    },
  });

  logger.info({ userId, accountId: account.id }, 'Connect account status updated');
}
