/**
 * GET  /api/portal/chat/session - Get user's chat sessions
 * POST /api/portal/chat/session - Create a new chat session
 */
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("[CHAT SESSION GET ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        title: "Cuộc trò chuyện mới",
      },
    })

    return NextResponse.json({ session: chatSession })
  } catch (error) {
    console.error("[CHAT SESSION POST ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
