import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Disable body parsing, we need the raw body for webhook verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('[Stripe Webhook] Payment succeeded:', paymentIntent.id)

        // Update collaboration payment status
        if (paymentIntent.metadata.collaborationId) {
          await prisma.collaboration.update({
            where: { id: paymentIntent.metadata.collaborationId },
            data: {
              paymentStatus: 'completed',
              paidAt: new Date(),
            },
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('[Stripe Webhook] Payment failed:', paymentIntent.id)

        if (paymentIntent.metadata.collaborationId) {
          await prisma.collaboration.update({
            where: { id: paymentIntent.metadata.collaborationId },
            data: {
              paymentStatus: 'failed',
            },
          })
        }
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        console.log('[Stripe Webhook] Account updated:', account.id)

        // Update creator's Stripe status
        if (account.metadata?.creatorId) {
          await prisma.creatorProfile.update({
            where: { id: account.metadata.creatorId },
            data: {
              stripeOnboardingComplete: account.details_submitted,
              stripeChargesEnabled: account.charges_enabled,
              stripePayoutsEnabled: account.payouts_enabled,
            },
          })
        }
        break
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        console.log('[Stripe Webhook] Transfer created:', transfer.id)
        break
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout
        console.log('[Stripe Webhook] Payout completed:', payout.id)
        break
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
