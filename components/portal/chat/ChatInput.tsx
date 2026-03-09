"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

const MAX_TEXTAREA_HEIGHT = 120 // px — matches ~5 lines

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize with max-height → overflow scroll
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    const next = Math.min(ta.scrollHeight, MAX_TEXTAREA_HEIGHT)
    ta.style.height = `${next}px`
    ta.style.overflowY = ta.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden"
  }, [value])

  return (
    <div className="flex items-end gap-2 p-3 border-t border-gray-200 bg-white rounded-b-2xl">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tin nhắn..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400
                   disabled:opacity-50 placeholder:text-gray-400 transition-colors"
        style={{ maxHeight: `${MAX_TEXTAREA_HEIGHT}px` }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="shrink-0 w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center
                   hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {disabled ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
