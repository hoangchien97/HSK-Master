/**
 * POST /api/portal/chat/session/[sessionId]/truncate
 * Delete messages after a given messageId (for edit & resend)
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params
    const { afterMessageId } = await req.json()

    if (!afterMessageId) {
      return NextResponse.json(
        { error: "afterMessageId is required" },
        { status: 400 }
      )
    }

    // Verify session ownership
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Find the target message to get its createdAt
    const targetMessage = await prisma.chatMessage.findFirst({
      where: { id: afterMessageId, sessionId },
      select: { createdAt: true },
    })

    if (!targetMessage) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      )
    }

    // Delete the target message and all messages after it
    await prisma.chatMessage.deleteMany({
      where: {
        sessionId,
        createdAt: { gte: targetMessage.createdAt },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CHAT TRUNCATE ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
