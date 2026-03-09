// ─── Shared types for AI Chat components ──────────────────────────
export interface ChatMessageData {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt?: string
}

export interface ChatSessionItem {
  id: string
  title: string | null
  createdAt: string
  _count: { messages: number }
}

export interface ChatUserInfo {
  name: string
  image?: string | null
}
