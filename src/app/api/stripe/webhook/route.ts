import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { sendEmail, paymentCompleteEmail, paymentReceiptEmail } from '@/lib/email'

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
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        console.log('[Stripe Webhook] Checkout completed:', checkoutSession.id)

        // Handle HOST MEMBERSHIP payment
        if (checkoutSession.metadata?.userId && !checkoutSession.metadata?.collaborationId && !checkoutSession.metadata?.type) {
          const userId = checkoutSession.metadata.userId
          const promoCode = checkoutSession.metadata.promoCode || null
          const originalAmount = parseInt(checkoutSession.metadata.originalAmount || '0')
          const discountAmount = parseInt(checkoutSession.metadata.discountAmount || '0')
          
          // Update host profile to mark as paid
          await prisma.hostProfile.update({
            where: { userId },
            data: {
              membershipPaid: true,
              membershipPaidAt: new Date(),
              membershipAmount: checkoutSession.amount_total,
              stripePaymentId: checkoutSession.payment_intent as string,
              promoCodeUsed: promoCode,
            },
          })
          
          // If promo code was used, increment usage
          if (promoCode) {
            await prisma.hostPromoCode.update({
              where: { code: promoCode },
              data: { uses: { increment: 1 } },
            }).catch(err => console.error('[Webhook] Failed to update promo usage:', err))
          }
          
          console.log('[Stripe Webhook] Host membership paid:', userId, 'Amount:', checkoutSession.amount_total)
          break
        }

        // Handle platform fee payment (post-for-stay)
        if (checkoutSession.metadata?.type === 'platform_fee') {
          const collaborationId = checkoutSession.metadata.collaborationId
          if (collaborationId) {
            await prisma.collaboration.update({
              where: { id: collaborationId },
              data: {
                paymentStatus: 'completed',
                paidAt: new Date(),
                paymentNotes: 'Platform fee ($99) paid via Stripe Checkout',
              },
            })
            console.log('[Stripe Webhook] Platform fee paid for collaboration:', collaborationId)
          }
        }
        // Handle regular collaboration payment
        else if (checkoutSession.metadata?.collaborationId) {
          const collaborationId = checkoutSession.metadata.collaborationId
          
          // Get collaboration details for email
          const collaboration = await prisma.collaboration.findUnique({
            where: { id: collaborationId },
            include: {
              creator: { include: { user: true } },
              host: { include: { user: true } },
              property: true,
              offer: true,
            },
          })
          
          // Update collaboration
          await prisma.collaboration.update({
            where: { id: collaborationId },
            data: {
              paymentStatus: 'completed',
              paidAt: new Date(),
            },
          })
          
          // Update status to completed if content was approved
          if (collaboration?.status === 'approved') {
            await prisma.collaboration.update({
              where: { id: collaborationId },
              data: { status: 'completed', completedAt: new Date() },
            })
          }
          
          // Send payment emails
          if (collaboration) {
            const totalCashCents = parseInt(checkoutSession.metadata.totalCashCents || '0') || collaboration.offer.cashCents
            const creatorNetCents = parseInt(checkoutSession.metadata.creatorNetCents || '0') || Math.round(totalCashCents * 0.85)
            
            // Email to creator: Payment received
            if (collaboration.creator.user.email) {
              const emailData = paymentCompleteEmail({
                creatorName: collaboration.creator.displayName,
                hostName: collaboration.host.displayName,
                propertyTitle: collaboration.property.title || 'Property',
                amount: creatorNetCents,
                collaborationId,
              })
              sendEmail({ to: collaboration.creator.user.email, ...emailData })
                .catch(err => console.error('[Webhook] Creator payment email error:', err))
            }
            
            // Email to host: Payment receipt
            const hostEmail = collaboration.host.user?.email || collaboration.host.contactEmail
            if (hostEmail) {
              const baseCashCents = parseInt(checkoutSession.metadata.baseCashCents || '0') || collaboration.offer.cashCents
              const hostFeeCents = parseInt(checkoutSession.metadata.hostFeeCents || '0') || Math.round(baseCashCents * 0.15)
              const bonusEarned = checkoutSession.metadata.bonusEarned === 'true'
              const bonusCents = parseInt(checkoutSession.metadata.bonusCents || '0')
              const totalPaidCents = baseCashCents + hostFeeCents + (bonusEarned ? bonusCents : 0)
              const creatorFeeCents = Math.round((baseCashCents + (bonusEarned ? bonusCents : 0)) * 0.15)
              
              const emailData = paymentReceiptEmail({
                hostName: collaboration.host.displayName,
                hostEmail,
                creatorName: collaboration.creator.displayName,
                creatorHandle: collaboration.creator.handle,
                propertyTitle: collaboration.property.title || 'Property',
                propertyLocation: collaboration.property.cityRegion || undefined,
                dealType: collaboration.offer.offerType,
                baseCashCents: baseCashCents + (bonusEarned ? bonusCents : 0),
                hostFeeCents,
                totalPaidCents,
                creatorFeeCents,
                creatorNetCents,
                deliverables: collaboration.offer.deliverables,
                collaborationId,
                paidAt: new Date(),
              })
              sendEmail({ to: hostEmail, ...emailData })
                .catch(err => console.error('[Webhook] Host receipt email error:', err))
            }
          }
        }
        break
      }

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
