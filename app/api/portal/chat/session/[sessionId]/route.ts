/**
 * GET /api/portal/chat/session/[sessionId] - Get messages for a session
 * DELETE /api/portal/chat/session/[sessionId] - Delete a session
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params

    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ session: chatSession })
  } catch (error) {
    console.error("[CHAT SESSION DETAIL ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await params

    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    await prisma.chatSession.delete({ where: { id: sessionId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CHAT SESSION DELETE ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
