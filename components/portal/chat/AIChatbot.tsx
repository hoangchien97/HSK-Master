"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { BotMessageSquare, X, Minus, RotateCcw, Bot, History, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessageData, ChatSessionItem, ChatUserInfo } from "./types"
import ChatMessageBubble from "./ChatMessageBubble"
import ChatInput from "./ChatInput"
import SessionSidebar from "./SessionSidebar"
import WelcomeMessage from "./WelcomeMessage"
import { StreamingIndicator, TypingIndicator } from "./ChatIndicators"

interface AIChatbotProps {
  user?: ChatUserInfo
}

export default function AIChatbot({ user }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [sessions, setSessions] = useState<ChatSessionItem[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  // ─── Scroll helpers ───────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current
    if (!el) return
    const threshold = 100
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    setShowScrollBtn(!isNearBottom)
  }, [])

  // ─── Fetch sessions on open ───────────────────────────────────
  useEffect(() => {
    if (isOpen) fetchSessions()
  }, [isOpen])

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/portal/chat/session")
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions || [])
      }
    } catch {
      /* silently ignore */
    }
  }

  const loadSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/portal/chat/session/${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.session.messages || [])
        setCurrentSessionId(sessionId)
        setShowHistory(false)
      }
    } catch {
      /* silently ignore */
    }
  }

  const startNewSession = () => {
    setMessages([])
    setCurrentSessionId(null)
    setShowHistory(false)
    setStreamingContent("")
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/portal/chat/session/${sessionId}`, { method: "DELETE" })
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (currentSessionId === sessionId) startNewSession()
    } catch {
      /* silently ignore */
    }
  }

  // ─── Send message ─────────────────────────────────────────────
  const handleSend = async (content: string) => {
    if (isLoading) return

    const userMsg: ChatMessageData = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setStreamingContent("")

    await sendToAPI(content)
  }

  // ─── Edit & resend ────────────────────────────────────────────
  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (isLoading) return

    // Find the index of the message being edited
    const idx = messages.findIndex((m) => m.id === messageId)
    if (idx === -1) return

    // Truncate: keep messages up to (but not including) the edited one, then add the edited version
    const truncated = messages.slice(0, idx)
    const editedMsg: ChatMessageData = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: newContent,
    }
    setMessages([...truncated, editedMsg])
    setIsLoading(true)
    setStreamingContent("")

    // If we have a session, delete subsequent messages from DB
    if (currentSessionId) {
      try {
        await fetch(`/api/portal/chat/session/${currentSessionId}/truncate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ afterMessageId: messageId }),
        })
      } catch {
        /* best-effort — the new message will be saved by the send call */
      }
    }

    await sendToAPI(newContent)
  }

  // ─── Core API call (shared by send & edit-resend) ─────────────
  const sendToAPI = async (content: string) => {
    try {
      const res = await fetch("/api/portal/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          sessionId: currentSessionId,
          stream: true,
        }),
      })

      // Capture new session ID
      const newSessionId = res.headers.get("X-Chat-Session-Id")
      if (newSessionId && !currentSessionId) {
        setCurrentSessionId(newSessionId)
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Có lỗi xảy ra")
      }

      const contentType = res.headers.get("Content-Type") || ""

      if (contentType.includes("text/plain") && res.body) {
        // Streaming
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullContent += decoder.decode(value, { stream: true })
          setStreamingContent(fullContent)
        }

        if (fullContent.trim()) {
          setMessages((prev) => [
            ...prev,
            { id: `assistant-${Date.now()}`, role: "assistant", content: fullContent.trim() },
          ])
        }
        setStreamingContent("")
      } else {
        // JSON fallback
        const data = await res.json()
        if (data.sessionId && !currentSessionId) setCurrentSessionId(data.sessionId)
        setMessages((prev) => [
          ...prev,
          { id: `assistant-${Date.now()}`, role: "assistant", content: data.message },
        ])
      }

      fetchSessions()
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            error instanceof Error ? `⚠️ ${error.message}` : "⚠️ Có lỗi xảy ra, vui lòng thử lại.",
        },
      ])
      setStreamingContent("")
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Find last user message id (for editable flag) ───────────
  const lastUserMsgId = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].id
    }
    return null
  })()

  // ─── Render ───────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Bubble ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 min-[426px]:w-14 min-[426px]:h-14
                     rounded-full bg-linear-to-br from-red-500 to-red-600 text-white
                     shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                     transition-all flex items-center justify-center group cursor-pointer"
          aria-label="Mở trợ lý AI"
        >
          <BotMessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className={cn(
            // Base
            "fixed z-50 flex flex-col bg-white shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300",
            // Mobile: full-screen overlay
            "inset-0 rounded-none",
            // Tablet (≥426px): positioned panel, bottom-right
            "min-[426px]:inset-auto min-[426px]:bottom-6 min-[426px]:right-6 min-[426px]:rounded-2xl",
            isMinimized
              ? "min-[426px]:w-80 min-[426px]:h-14"
              : "min-[426px]:w-85 min-[426px]:h-150 min-[426px]:max-h-[85vh] xl:w-95 xl:h-170"
          )}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-red-600 to-red-700 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-none">AI Trợ lý HSK</h3>
                <span className="text-[10px] text-red-200 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online
                </span>
              </div>
            </div>

            {/* Actions — min 44×44 touch targets on mobile */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2.5 min-[426px]:p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer min-w-11 min-h-11 min-[426px]:min-w-0 min-[426px]:min-h-0 flex items-center justify-center"
                title="Lịch sử"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={startNewSession}
                className="p-2.5 min-[426px]:p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer min-w-11 min-h-11 min-[426px]:min-w-0 min-[426px]:min-h-0 flex items-center justify-center"
                title="Cuộc trò chuyện mới"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {/* Minimize — hidden on mobile (already full-screen) */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden min-[426px]:flex p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer items-center justify-center"
                title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsMinimized(false) }}
                className="p-2.5 min-[426px]:p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer min-w-11 min-h-11 min-[426px]:min-w-0 min-[426px]:min-h-0 flex items-center justify-center"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          {!isMinimized && (
            <>
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-3 relative"
              >
                {/* Session history overlay */}
                {showHistory && (
                  <SessionSidebar
                    sessions={sessions}
                    currentSessionId={currentSessionId}
                    onSelectSession={loadSession}
                    onNewSession={startNewSession}
                    onDeleteSession={deleteSession}
                    onClose={() => setShowHistory(false)}
                  />
                )}

                {messages.length === 0 && !streamingContent ? (
                  <WelcomeMessage userName={user?.name} onSuggestionClick={handleSend} />
                ) : (
                  <>
                    {messages.map((msg) => (
                      <ChatMessageBubble
                        key={msg.id}
                        message={msg}
                        user={user}
                        editable={!isLoading && msg.id === lastUserMsgId}
                        onEdit={handleEditMessage}
                      />
                    ))}
                    {streamingContent && <StreamingIndicator content={streamingContent} />}
                    {isLoading && !streamingContent && <TypingIndicator />}
                  </>
                )}

                <div ref={messagesEndRef} />

                {/* ── Scroll-to-bottom button ── */}
                {showScrollBtn && !showHistory && (
                  <button
                    onClick={scrollToBottom}
                    className="sticky bottom-2 left-1/2 -translate-x-1/2 z-20
                               w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md
                               flex items-center justify-center
                               hover:bg-gray-50 hover:shadow-lg transition-all"
                    aria-label="Cuộn xuống"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>

              <ChatInput onSend={handleSend} disabled={isLoading} />
            </>
          )}
        </div>
      )}
    </>
  )
}
