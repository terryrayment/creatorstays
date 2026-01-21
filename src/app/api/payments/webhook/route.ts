import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { sendEmail, paymentCompleteEmail, paymentReceiptEmail, collaborationCompletedEmail, hostMembershipWelcomeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

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

      // Handle subscription events for Boost and Agency
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
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
  const type = session.metadata?.type
  
  // Handle Property Boost subscription
  if (type === 'property_boost') {
    const propertyId = session.metadata?.propertyId
    if (!propertyId) {
      console.error('[Webhook] No propertyId for property_boost')
      return
    }
    
    console.log(`[Webhook] Activating property boost: ${propertyId}`)
    
    try {
      // Get subscription ID from the session
      const subscriptionId = session.subscription as string
      
      await prisma.property.update({
        where: { id: propertyId },
        data: {
          isBoosted: true,
          boostStripeSubId: subscriptionId,
          boostExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })
      
      console.log(`[Webhook] Property boost activated: ${propertyId}`)
      return
    } catch (error) {
      console.error('[Webhook] Error activating property boost:', error)
      return
    }
  }
  
  // Handle Agency Pro subscription
  if (type === 'agency_subscription') {
    const hostProfileId = session.metadata?.hostProfileId
    const agencyName = session.metadata?.agencyName
    
    if (!hostProfileId) {
      console.error('[Webhook] No hostProfileId for agency_subscription')
      return
    }
    
    console.log(`[Webhook] Activating agency subscription: ${hostProfileId}`)
    
    try {
      const subscriptionId = session.subscription as string
      
      await prisma.hostProfile.update({
        where: { id: hostProfileId },
        data: {
          isAgency: true,
          agencyName: agencyName || 'My Agency',
          agencySubscriptionId: subscriptionId,
          agencySubscribedAt: new Date(),
          agencyExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          teamSeats: 5, // Default 5 team seats
        },
      })
      
      console.log(`[Webhook] Agency subscription activated: ${hostProfileId}`)
      return
    } catch (error) {
      console.error('[Webhook] Error activating agency subscription:', error)
      return
    }
  }

  // Check if this is a host membership payment
  const userId = session.metadata?.userId
  if (userId && !session.metadata?.collaborationId) {
    // This is a host membership payment
    console.log(`[Webhook] Processing host membership for user: ${userId}`)
    
    try {
      const promoCode = session.metadata?.promoCode || null
      const originalAmount = parseInt(session.metadata?.originalAmount || '19900')
      const discountAmount = parseInt(session.metadata?.discountAmount || '0')
      
      await prisma.hostProfile.update({
        where: { userId },
        data: {
          membershipPaid: true,
          membershipPaidAt: new Date(),
          membershipAmount: originalAmount - discountAmount,
          stripePaymentId: session.payment_intent as string,
          promoCodeUsed: promoCode,
          onboardingComplete: true,
        },
      })
      
      // Get host profile with user info for email
      const hostProfile = await prisma.hostProfile.findUnique({
        where: { userId },
        include: { 
          user: true,
          properties: { take: 1 }
        },
      })
      
      // Send welcome email
      if (hostProfile?.user?.email) {
        const emailData = hostMembershipWelcomeEmail({
          hostName: hostProfile.displayName || hostProfile.user.name || 'Host',
          hostEmail: hostProfile.user.email,
          amountPaid: originalAmount - discountAmount,
          promoCodeUsed: promoCode,
          propertyTitle: hostProfile.properties[0]?.title || undefined,
        })
        
        sendEmail({
          to: hostProfile.user.email,
          ...emailData,
        }).catch(err => console.error('[Webhook] Host welcome email error:', err))
        
        console.log(`[Webhook] Welcome email sent to: ${hostProfile.user.email}`)
      }
      
      // If promo code was used, record redemption
      if (promoCode) {
        const promoCodeRecord = await prisma.hostPromoCode.findUnique({
          where: { code: promoCode },
        })
        
        if (promoCodeRecord) {
          const hostProfile = await prisma.hostProfile.findUnique({
            where: { userId },
          })
          
          if (hostProfile) {
            await prisma.hostPromoRedemption.create({
              data: {
                promoCodeId: promoCodeRecord.id,
                hostProfileId: hostProfile.id,
                amountSaved: discountAmount,
              },
            })
            
            await prisma.hostPromoCode.update({
              where: { id: promoCodeRecord.id },
              data: { uses: { increment: 1 } },
            })
          }
        }
      }
      
      console.log(`[Webhook] Host membership activated for user: ${userId}`)
      return
    } catch (error) {
      console.error('[Webhook] Error activating host membership:', error)
      return
    }
  }

  // Otherwise, this is a collaboration payment
  const collaborationId = session.metadata?.collaborationId
  const cashCents = parseInt(session.metadata?.cashCents || '0')
  const hostFeeCents = parseInt(session.metadata?.hostFeeCents || '0')
  const creatorNetCents = parseInt(session.metadata?.creatorNetCents || '0')
  const creatorFeeCents = parseInt(session.metadata?.creatorFeeCents || '0')

  if (!collaborationId) {
    console.error('[Webhook] No collaborationId in session metadata')
    return
  }

  console.log(`[Webhook] Processing payment for collaboration: ${collaborationId}`)

  try {
    const paidAt = new Date()
    
    // Update collaboration
    await prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        paymentStatus: 'completed',
        paymentIntentId: session.payment_intent as string,
        paymentAmount: cashCents + hostFeeCents,
        paidAt,
        status: 'completed',
        completedAt: paidAt,
      },
    })

    // Get collaboration details for emails
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        creator: { include: { user: true } },
        host: { include: { user: true } },
        property: true,
        offer: true,
      },
    })

    if (!collaboration) {
      console.error('[Webhook] Collaboration not found after update')
      return
    }

    console.log(`[Webhook] Payment completed:`)
    console.log(`  - Collaboration: ${collaborationId}`)
    console.log(`  - Host: ${collaboration.host.displayName}`)
    console.log(`  - Creator: ${collaboration.creator.displayName}`)
    console.log(`  - Amount paid: $${((cashCents + hostFeeCents) / 100).toFixed(2)}`)
    console.log(`  - Creator receives: $${(creatorNetCents / 100).toFixed(2)}`)

    // Send payment notification to creator
    if (collaboration.creator.user.email) {
      const emailData = paymentCompleteEmail({
        creatorName: collaboration.creator.displayName,
        hostName: collaboration.host.displayName,
        propertyTitle: collaboration.property.title || 'Property',
        amount: creatorNetCents,
        collaborationId,
      })
      
      sendEmail({
        to: collaboration.creator.user.email,
        ...emailData,
      }).catch(err => console.error('[Webhook] Creator email error:', err))
    }

    // Send payment receipt to host
    if (collaboration.host.user.email) {
      const receiptData = paymentReceiptEmail({
        hostName: collaboration.host.displayName,
        hostEmail: collaboration.host.user.email,
        creatorName: collaboration.creator.displayName,
        creatorHandle: collaboration.creator.handle,
        propertyTitle: collaboration.property.title || 'Property',
        propertyLocation: collaboration.property.cityRegion || undefined,
        dealType: collaboration.offer?.offerType || 'flat',
        baseCashCents: cashCents,
        hostFeeCents: hostFeeCents,
        totalPaidCents: cashCents + hostFeeCents,
        creatorFeeCents: creatorFeeCents || Math.round(cashCents * 0.15),
        creatorNetCents: creatorNetCents,
        deliverables: collaboration.offer?.deliverables || [],
        collaborationId,
        paymentIntentId: session.payment_intent as string || undefined,
        paidAt,
      })
      
      sendEmail({
        to: collaboration.host.user.email,
        ...receiptData,
      }).catch(err => console.error('[Webhook] Host receipt email error:', err))

      // Send review prompt to host
      const hostReviewData = collaborationCompletedEmail({
        recipientName: collaboration.host.displayName,
        recipientRole: 'host',
        otherPartyName: collaboration.creator.displayName,
        propertyTitle: collaboration.property.title || 'Property',
        collaborationId,
      })
      
      sendEmail({
        to: collaboration.host.user.email,
        ...hostReviewData,
      }).catch(err => console.error('[Webhook] Host review email error:', err))
    }

    // Send review prompt to creator (separate from payment notification)
    if (collaboration.creator.user.email) {
      const creatorReviewData = collaborationCompletedEmail({
        recipientName: collaboration.creator.displayName,
        recipientRole: 'creator',
        otherPartyName: collaboration.host.displayName,
        propertyTitle: collaboration.property.title || 'Property',
        collaborationId,
      })
      
      sendEmail({
        to: collaboration.creator.user.email,
        ...creatorReviewData,
      }).catch(err => console.error('[Webhook] Creator review email error:', err))
    }

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

// Handle subscription renewal (invoice.paid)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  if (!subscriptionId) return
  
  console.log(`[Webhook] Invoice paid for subscription: ${subscriptionId}`)
  
  try {
    // Check if this is a property boost renewal
    const boostedProperty = await prisma.property.findFirst({
      where: { boostStripeSubId: subscriptionId },
    })
    
    if (boostedProperty) {
      await prisma.property.update({
        where: { id: boostedProperty.id },
        data: {
          boostExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Extend 30 days
        },
      })
      console.log(`[Webhook] Property boost renewed: ${boostedProperty.id}`)
      return
    }
    
    // Check if this is an agency subscription renewal
    const agencyHost = await prisma.hostProfile.findFirst({
      where: { agencySubscriptionId: subscriptionId },
    })
    
    if (agencyHost) {
      await prisma.hostProfile.update({
        where: { id: agencyHost.id },
        data: {
          agencyExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Extend 30 days
        },
      })
      console.log(`[Webhook] Agency subscription renewed: ${agencyHost.id}`)
      return
    }
  } catch (error) {
    console.error('[Webhook] Error handling invoice.paid:', error)
  }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id
  
  console.log(`[Webhook] Subscription cancelled: ${subscriptionId}`)
  
  try {
    // Check if this is a property boost
    const boostedProperty = await prisma.property.findFirst({
      where: { boostStripeSubId: subscriptionId },
    })
    
    if (boostedProperty) {
      await prisma.property.update({
        where: { id: boostedProperty.id },
        data: {
          isBoosted: false,
          boostStripeSubId: null,
          boostExpiresAt: null,
        },
      })
      console.log(`[Webhook] Property boost cancelled: ${boostedProperty.id}`)
      return
    }
    
    // Check if this is an agency subscription
    const agencyHost = await prisma.hostProfile.findFirst({
      where: { agencySubscriptionId: subscriptionId },
    })
    
    if (agencyHost) {
      await prisma.hostProfile.update({
        where: { id: agencyHost.id },
        data: {
          isAgency: false,
          agencySubscriptionId: null,
          agencyExpiresAt: null,
          teamSeats: 0,
        },
      })
      console.log(`[Webhook] Agency subscription cancelled: ${agencyHost.id}`)
      return
    }
  } catch (error) {
    console.error('[Webhook] Error handling subscription.deleted:', error)
  }
}
