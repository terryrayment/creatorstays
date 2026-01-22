import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get host profile
    const hostProfile = await prisma.hostProfile.findFirst({
      where: {
        user: { email: session.user.email }
      },
      include: { user: true }
    })

    if (!hostProfile) {
      return NextResponse.json({ error: "Host profile not found" }, { status: 404 })
    }

    // Check if already agency
    if (hostProfile.isAgency) {
      return NextResponse.json({ error: "Already on Agency plan" }, { status: 400 })
    }

    // Create Stripe checkout session for agency upgrade
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "CreatorStays Agency Plan",
              description: "Unlimited properties, team members, and priority support",
            },
            unit_amount: 14900, // $149.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/beta/dashboard/host/properties?upgraded=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/beta/dashboard/host/properties`,
      metadata: {
        hostProfileId: hostProfile.id,
        type: "agency_upgrade",
      },
    })

    return NextResponse.json({ checkoutUrl: checkoutSession.url })
  } catch (error) {
    console.error("Agency upgrade error:", error)
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
  }
}
