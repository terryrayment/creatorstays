import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

// Check admin auth
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "true"
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // === SUBSCRIPTIONS ===
    
    // Total paid hosts
    const totalPaidHosts = await prisma.hostProfile.count({
      where: { membershipPaid: true }
    })

    // Hosts paid this month
    const hostsPaidThisMonth = await prisma.promoCodeRedemption.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    })

    // Revenue from memberships (assuming $199 per membership)
    const membershipRevenue = totalPaidHosts * 199

    // Free memberships (promo codes with 100% off)
    const freeMemberships = await prisma.promoCodeRedemption.count({
      where: {
        promoCode: { discountType: "full" }
      }
    })

    // Paid memberships
    const paidMemberships = totalPaidHosts - freeMemberships

    // Recent subscriptions with details
    const recentSubscriptions = await prisma.hostProfile.findMany({
      where: { membershipPaid: true },
      select: {
        id: true,
        displayName: true,
        contactEmail: true,
        membershipPaidAt: true,
        promoCodeUsed: true,
        user: {
          select: { createdAt: true }
        }
      },
      orderBy: { membershipPaidAt: "desc" },
      take: 20
    })

    // === CREATOR DEALS ===

    // All collaborations with payment info
    const collaborations = await prisma.collaboration.findMany({
      where: {
        status: { in: ["active", "content-submitted", "completed", "paid"] }
      },
      select: {
        id: true,
        status: true,
        paymentCents: true,
        platformFeeCents: true,
        createdAt: true,
        completedAt: true,
        hostProfile: {
          select: { displayName: true }
        },
        creatorProfile: {
          select: { displayName: true, handle: true }
        },
        property: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    // Total deal volume
    const totalDealVolume = collaborations.reduce((sum, c) => sum + (c.paymentCents || 0), 0)
    const totalPlatformFees = collaborations.reduce((sum, c) => sum + (c.platformFeeCents || 0), 0)

    // Completed deals
    const completedDeals = collaborations.filter(c => c.status === "completed" || c.status === "paid").length
    const activeDeals = collaborations.filter(c => c.status === "active").length
    const pendingDeals = collaborations.filter(c => c.status === "content-submitted").length

    // === FORECASTING ===

    // Monthly growth rate (compare this month signups to last month)
    const thisMonthSignups = await prisma.hostProfile.count({
      where: { 
        membershipPaid: true,
        membershipPaidAt: { gte: startOfMonth }
      }
    })

    const lastMonthSignups = await prisma.hostProfile.count({
      where: {
        membershipPaid: true,
        membershipPaidAt: { gte: startOfLastMonth, lt: startOfMonth }
      }
    })

    const growthRate = lastMonthSignups > 0 
      ? ((thisMonthSignups - lastMonthSignups) / lastMonthSignups * 100).toFixed(1)
      : "N/A"

    // Project next month revenue
    const projectedNewHosts = thisMonthSignups * 1.2 // Assume 20% growth
    const projectedMembershipRevenue = Math.round(projectedNewHosts * 199)

    // Average deal size
    const avgDealSize = completedDeals > 0 
      ? Math.round(totalDealVolume / completedDeals)
      : 0

    // Project deal revenue (based on current pipeline)
    const projectedDealRevenue = Math.round(activeDeals * avgDealSize * 0.15) // 15% platform fee

    // === AFFILIATE LINKS ===
    
    const affiliateLinks = await prisma.affiliateLink.findMany({
      select: {
        id: true,
        token: true,
        destinationUrl: true,
        clickCount: true,
        uniqueClickCount: true,
        isActive: true,
        createdAt: true,
        expiresAt: true,
        campaignName: true
      },
      orderBy: { clickCount: "desc" },
      take: 50
    })

    const totalClicks = affiliateLinks.reduce((sum, l) => sum + l.clickCount, 0)
    const totalUniqueClicks = affiliateLinks.reduce((sum, l) => sum + l.uniqueClickCount, 0)

    return NextResponse.json({
      subscriptions: {
        totalPaidHosts,
        paidMemberships,
        freeMemberships,
        membershipRevenue,
        hostsPaidThisMonth,
        recentSubscriptions
      },
      deals: {
        totalDealVolume,
        totalPlatformFees,
        completedDeals,
        activeDeals,
        pendingDeals,
        avgDealSize,
        recentCollaborations: collaborations
      },
      forecasting: {
        thisMonthSignups,
        lastMonthSignups,
        growthRate,
        projectedNewHosts: Math.round(projectedNewHosts),
        projectedMembershipRevenue,
        projectedDealRevenue,
        projectedTotalRevenue: projectedMembershipRevenue + projectedDealRevenue
      },
      affiliateLinks: {
        links: affiliateLinks,
        totalClicks,
        totalUniqueClicks,
        activeLinks: affiliateLinks.filter(l => l.isActive).length
      }
    })
  } catch (error) {
    console.error("Admin financials error:", error)
    return NextResponse.json({ error: "Failed to fetch financials" }, { status: 500 })
  }
}
