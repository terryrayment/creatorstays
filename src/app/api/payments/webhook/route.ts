import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Disable body parsing for webhook (we need raw body for signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
}

async function getRawBody(req: NextRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = []
  const reader = req.body?.getReader()
  
  if (!reader) {
    throw new Error('No request body')
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }

  return Buffer.concat(chunks)
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await getRawBody(request)
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('[Webhook] Payment intent succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        console.log('[Webhook] Transfer created:', transfer.id)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const collaborationId = session.metadata?.collaborationId
  const cashCents = parseInt(session.metadata?.cashCents || '0')
  const hostFeeCents = parseInt(session.metadata?.hostFeeCents || '0')
  const creatorNetCents = parseInt(session.metadata?.creatorNetCents || '0')

  if (!collaborationId) {
    console.error('[Webhook] No collaborationId in session metadata')
    return
  }

  console.log(`[Webhook] Processing payment for collaboration: ${collaborationId}`)

  try {
    // Update collaboration
    await prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        paymentStatus: 'completed',
        paymentIntentId: session.payment_intent as string,
        paymentAmount: cashCents + hostFeeCents,
        paidAt: new Date(),
        status: 'completed',
        completedAt: new Date(),
      },
    })

    // Get collaboration details for logging
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        creator: true,
        host: true,
      },
    })

    console.log(`[Webhook] Payment completed:`)
    console.log(`  - Collaboration: ${collaborationId}`)
    console.log(`  - Host: ${collaboration?.host.displayName}`)
    console.log(`  - Creator: ${collaboration?.creator.displayName}`)
    console.log(`  - Amount paid: $${((cashCents + hostFeeCents) / 100).toFixed(2)}`)
    console.log(`  - Creator receives: $${(creatorNetCents / 100).toFixed(2)}`)

    // TODO: Send email notifications to host and creator
    // TODO: If creator doesn't have Stripe connected, hold funds

  } catch (error) {
    console.error('[Webhook] Failed to update collaboration:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const collaborationId = paymentIntent.metadata?.collaborationId

  if (!collaborationId) {
    console.error('[Webhook] No collaborationId in payment intent metadata')
    return
  }

  console.log(`[Webhook] Payment failed for collaboration: ${collaborationId}`)

  try {
    await prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        paymentStatus: 'failed',
        paymentNotes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
      },
    })
  } catch (error) {
    console.error('[Webhook] Failed to update collaboration:', error)
  }
}
