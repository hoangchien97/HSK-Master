/**
 * POST /api/portal/chat
 * Send a message to the AI chatbot and get a streaming response
 */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { buildMessages, streamLLM, callLLM } from "@/lib/ai/chat-service"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { message, sessionId, stream = true } = body

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Check AI config upfront
    if (!process.env.AI_API_KEY) {
      return NextResponse.json(
        { error: "AI chưa được cấu hình. Vui lòng liên hệ quản trị viên." },
        { status: 503 }
      )
    }

    // Rate limit: max 30 messages per minute per user
    const oneMinuteAgo = new Date(Date.now() - 60_000)
    const recentCount = await prisma.chatMessage.count({
      where: {
        session: { userId: session.user.id },
        role: "user",
        createdAt: { gte: oneMinuteAgo },
      },
    })

    if (recentCount >= 30) {
      return NextResponse.json(
        { error: "Bạn gửi tin nhắn quá nhanh. Vui lòng đợi một chút." },
        { status: 429 }
      )
    }

    // Create or verify session
    let chatSessionId = sessionId
    if (!chatSessionId) {
      const newSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 60),
        },
      })
      chatSessionId = newSession.id
    } else {
      const existing = await prisma.chatSession.findFirst({
        where: { id: chatSessionId, userId: session.user.id },
      })
      if (!existing) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        )
      }
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSessionId,
        role: "user",
        content: message.trim(),
      },
    })

    // Build messages with RAG context
    const messages = await buildMessages(chatSessionId, message.trim())

    if (stream) {
      try {
        const llmStream = await streamLLM(messages)
        let fullResponse = ""

        const transformStream = new TransformStream({
          transform(chunk, controller) {
            const text = new TextDecoder().decode(chunk)
            fullResponse += text
            controller.enqueue(chunk)
          },
          async flush() {
            if (fullResponse.trim()) {
              await prisma.chatMessage.create({
                data: {
                  sessionId: chatSessionId,
                  role: "assistant",
                  content: fullResponse.trim(),
                },
              })
            }
          },
        })

        const responseStream = llmStream.pipeThrough(transformStream)

        return new Response(responseStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Chat-Session-Id": chatSessionId,
          },
        })
      } catch (streamError) {
        console.error("[CHAT STREAM ERROR]", streamError)
        // If the error is a known user-facing message (e.g. billing), return it directly
        const streamErrMsg = streamError instanceof Error ? streamError.message : ""
        if (
          streamErrMsg.includes("hạn mức") ||
          streamErrMsg.includes("không hợp lệ") ||
          streamErrMsg.includes("quá tải")
        ) {
          return NextResponse.json(
            { error: streamErrMsg },
            { status: 502, headers: { "X-Chat-Session-Id": chatSessionId } }
          )
        }
        // Otherwise try non-streaming fallback
        try {
          const reply = await callLLM(messages)
          await prisma.chatMessage.create({
            data: {
              sessionId: chatSessionId,
              role: "assistant",
              content: reply,
            },
          })
          return NextResponse.json(
            { sessionId: chatSessionId, message: reply },
            { headers: { "X-Chat-Session-Id": chatSessionId } }
          )
        } catch (llmError) {
          console.error("[CHAT LLM FALLBACK ERROR]", llmError)
          const errorMsg = llmError instanceof Error
            ? llmError.message
            : "Xin lỗi, AI hiện không phản hồi được. Vui lòng thử lại sau."
          return NextResponse.json(
            { error: errorMsg },
            { status: 502, headers: { "X-Chat-Session-Id": chatSessionId } }
          )
        }
      }
    } else {
      try {
        const reply = await callLLM(messages)
        await prisma.chatMessage.create({
          data: {
            sessionId: chatSessionId,
            role: "assistant",
            content: reply,
          },
        })
        return NextResponse.json({
          sessionId: chatSessionId,
          message: reply,
        })
      } catch (llmError) {
        console.error("[CHAT LLM ERROR]", llmError)
        const errorMsg = llmError instanceof Error
          ? llmError.message
          : "AI hiện không phản hồi được. Vui lòng thử lại sau."
        return NextResponse.json(
          { error: errorMsg },
          { status: 502 }
        )
      }
    }
  } catch (error) {
    console.error("[CHAT API ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
