import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

// Check admin auth
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "true"
}

// GET - List all conversations with messages
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const hostId = searchParams.get("hostId")
  const creatorId = searchParams.get("creatorId")
  const conversationId = searchParams.get("conversationId")

  try {
    // If specific conversation requested, return full message history
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          hostProfile: {
            select: { id: true, displayName: true, contactEmail: true }
          },
          creatorProfile: {
            select: { id: true, displayName: true, email: true, handle: true }
          },
          messages: {
            orderBy: { sentAt: "asc" }
          }
        }
      })

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      return NextResponse.json({ conversation })
    }

    // Build where clause
    const where: any = {}
    if (hostId) where.hostProfileId = hostId
    if (creatorId) where.creatorProfileId = creatorId

    // List all conversations
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        hostProfile: {
          select: { id: true, displayName: true, contactEmail: true }
        },
        creatorProfile: {
          select: { id: true, displayName: true, email: true, handle: true }
        },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1
        }
      },
      orderBy: { lastMessageAt: "desc" },
      take: 100
    })

    // Get all hosts for dropdown
    const hosts = await prisma.hostProfile.findMany({
      select: { id: true, displayName: true, contactEmail: true },
      orderBy: { displayName: "asc" }
    })

    // Get all creators for dropdown
    const creators = await prisma.creatorProfile.findMany({
      select: { id: true, displayName: true, email: true, handle: true },
      orderBy: { displayName: "asc" }
    })

    return NextResponse.json({ 
      conversations, 
      hosts, 
      creators,
      total: conversations.length 
    })
  } catch (error) {
    console.error("Admin messages error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

// POST - Send a message as admin
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { hostId, creatorId, message, senderType } = body

    if (!hostId || !creatorId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        hostProfileId_creatorProfileId: {
          hostProfileId: hostId,
          creatorProfileId: creatorId
        }
      }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          hostProfileId: hostId,
          creatorProfileId: creatorId
        }
      })
    }

    // Create message (admin messages appear as from host by default, or specified sender)
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: senderType || "host",
        senderId: senderType === "creator" ? creatorId : hostId,
        body: `[ADMIN] ${message}`
      }
    })

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        ...(senderType === "creator" 
          ? { hostUnread: { increment: 1 } }
          : { creatorUnread: { increment: 1 } }
        )
      }
    })

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error) {
    console.error("Admin send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
