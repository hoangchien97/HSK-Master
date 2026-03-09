/**
 * AI Chat Service - RAG pipeline for HSK learning assistant
 *
 * Architecture:
 *   User message → Search knowledge base → Inject context → LLM → Response
 */

import prisma from "@/lib/prisma"

// ─── Types ────────────────────────────────────────────────────────
export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface VocabMatch {
  word: string
  pinyin: string | null
  meaning: string
  exampleSentence: string | null
  examplePinyin: string | null
  exampleMeaning: string | null
}

// ─── System prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a friendly and knowledgeable Chinese teacher helping students prepare for HSK exams.

Your role:
- Explain Chinese grammar clearly with examples
- Provide vocabulary meaning, pinyin, HSK level and usage
- Generate example sentences with pinyin and Vietnamese/English meaning
- Correct Chinese sentences and explain mistakes
- Give pronunciation tips when relevant

Rules:
- Always explain step by step
- Use simple, clear language
- Provide pinyin for all Chinese text
- Give examples whenever possible
- If vocabulary context is provided, use it in your answer
- Respond in the same language the student used (Vietnamese or English)
- Use emoji occasionally to keep it friendly 😊`

// ─── Knowledge retrieval (simple RAG) ─────────────────────────────
async function retrieveVocabularyContext(query: string): Promise<string> {
  // Search vocabulary by word or meaning
  const vocabs = await prisma.vocabulary.findMany({
    where: {
      OR: [
        { word: { contains: query, mode: "insensitive" } },
        { meaning: { contains: query, mode: "insensitive" } },
        { pinyin: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 5,
    select: {
      word: true,
      pinyin: true,
      meaning: true,
      exampleSentence: true,
      examplePinyin: true,
      exampleMeaning: true,
    },
  })

  if (vocabs.length === 0) return ""

  const context = vocabs
    .map(
      (v: VocabMatch) =>
        `📝 ${v.word} (${v.pinyin || "?"}) - ${v.meaning}${
          v.exampleSentence
            ? `\n   Example: ${v.exampleSentence} (${v.examplePinyin || ""}) - ${v.exampleMeaning || ""}`
            : ""
        }`
    )
    .join("\n")

  return `\n\n[Vocabulary from our database]\n${context}\n`
}

// ─── Build messages with context ──────────────────────────────────
export async function buildMessages(
  sessionId: string,
  userMessage: string
): Promise<ChatCompletionMessage[]> {
  // 1. Get chat history (last 10 messages for context window)
  const history = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  })

  // 2. Retrieve relevant vocabulary (simple RAG)
  const vocabContext = await retrieveVocabularyContext(userMessage)

  // 3. Build message array
  const messages: ChatCompletionMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ]

  // Add retrieved context if any
  if (vocabContext) {
    messages.push({
      role: "system",
      content: `Here is relevant vocabulary context from the HSK database:${vocabContext}\nUse this information to enrich your answer if relevant.`,
    })
  }

  // Add chat history
  for (const msg of history) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })
  }

  // Add current user message
  messages.push({ role: "user", content: userMessage })

  return messages
}

// ─── Call LLM (DeepSeek / OpenAI compatible) ──────────────────────
export async function callLLM(
  messages: ChatCompletionMessage[]
): Promise<string> {
  const apiKey = process.env.AI_API_KEY
  const baseUrl =
    process.env.AI_BASE_URL || "https://api.deepseek.com"
  const model = process.env.AI_MODEL || "deepseek-chat"

  if (!apiKey) {
    throw new Error(
      "AI_API_KEY is not configured. Please set it in your .env file."
    )
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: false,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("LLM API error:", response.status, errorText)

    // Parse specific error messages from the API
    let userMessage = `LLM API error: ${response.status}`
    try {
      const errorJson = JSON.parse(errorText)
      const msg = errorJson?.error?.message || ""
      if (response.status === 402 || msg.toLowerCase().includes("insufficient balance")) {
        userMessage = "Tài khoản AI đã hết hạn mức. Vui lòng liên hệ quản trị viên để nạp thêm."
      } else if (response.status === 401) {
        userMessage = "API key AI không hợp lệ. Vui lòng kiểm tra lại cấu hình."
      } else if (response.status === 429) {
        userMessage = "AI đang quá tải. Vui lòng thử lại sau vài giây."
      } else if (msg) {
        userMessage = msg
      }
    } catch {
      // couldn't parse error JSON — use default
    }
    throw new Error(userMessage)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || "Xin lỗi, tôi không thể trả lời lúc này."
}

// ─── Stream LLM response ──────────────────────────────────────────
export async function streamLLM(
  messages: ChatCompletionMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.AI_API_KEY
  const baseUrl =
    process.env.AI_BASE_URL || "https://api.deepseek.com"
  const model = process.env.AI_MODEL || "deepseek-chat"

  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured.")
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
      stream: true,
    }),
  })

  if (!response.ok || !response.body) {
    let userMessage = `LLM stream error: ${response.status}`
    try {
      const errorText = await response.text()
      console.error("LLM stream error:", response.status, errorText)
      const errorJson = JSON.parse(errorText)
      const msg = errorJson?.error?.message || ""
      if (response.status === 402 || msg.toLowerCase().includes("insufficient balance")) {
        userMessage = "Tài khoản AI đã hết hạn mức. Vui lòng liên hệ quản trị viên để nạp thêm."
      } else if (response.status === 401) {
        userMessage = "API key AI không hợp lệ. Vui lòng kiểm tra lại cấu hình."
      } else if (response.status === 429) {
        userMessage = "AI đang quá tải. Vui lòng thử lại sau vài giây."
      } else if (msg) {
        userMessage = msg
      }
    } catch {
      // couldn't parse — use default
    }
    throw new Error(userMessage)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "))

        for (const line of lines) {
          const data = line.slice(6).trim()
          if (data === "[DONE]") {
            controller.close()
            return
          }
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              controller.enqueue(new TextEncoder().encode(content))
            }
          } catch {
            // skip parse errors for incomplete chunks
          }
        }
      }
    },
  })
}
