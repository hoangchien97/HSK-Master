"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, User, Pencil, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { ChatMessageData, ChatUserInfo } from "./types"

interface ChatMessageBubbleProps {
  message: ChatMessageData
  user?: ChatUserInfo
  /** Called when the user edits a message and clicks "Gửi" */
  onEdit?: (messageId: string, newContent: string) => void
  /** Whether this message can be edited (only user messages, and only the last user msg) */
  editable?: boolean
}

const MAX_EDIT_HEIGHT = 100

export default function ChatMessageBubble({
  message,
  user,
  onEdit,
  editable = false,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user"
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(message.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize edit textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta || !isEditing) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, MAX_EDIT_HEIGHT)}px`
    ta.style.overflowY = ta.scrollHeight > MAX_EDIT_HEIGHT ? "auto" : "hidden"
    ta.focus()
    ta.setSelectionRange(ta.value.length, ta.value.length)
  }, [isEditing, editValue])

  const handleSubmitEdit = () => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === message.content) {
      setIsEditing(false)
      setEditValue(message.content)
      return
    }
    onEdit?.(message.id, trimmed)
    setIsEditing(false)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitEdit()
    }
    if (e.key === "Escape") {
      setIsEditing(false)
      setEditValue(message.content)
    }
  }

  return (
    <div className={cn("group flex gap-2 mb-3", isUser ? "justify-end" : "justify-start")}>
      {/* Bot avatar */}
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center mt-1">
          <Bot className="w-4 h-4 text-red-600" />
        </div>
      )}

      <div className="flex flex-col items-end max-w-[80%]">
        {/* Editing mode */}
        {isUser && isEditing ? (
          <div className="w-full flex flex-col gap-1.5">
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
              style={{ maxHeight: `${MAX_EDIT_HEIGHT}px` }}
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => { setIsEditing(false); setEditValue(message.content) }}
                className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 inline mr-0.5" />
                Hủy
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={!editValue.trim() || editValue.trim() === message.content}
                className="px-2.5 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5 inline mr-0.5" />
                Gửi
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Message bubble */}
            <div
              className={cn(
                "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word",
                isUser
                  ? "bg-red-600 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              )}
            >
              {message.content}
            </div>

            {/* Edit button — only on hover for editable user messages */}
            {isUser && editable && onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-0.5 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                title="Chỉnh sửa"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* User avatar */}
      {isUser && !isEditing && (
        <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center mt-1 ring-1 ring-red-100">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
      )}
    </div>
  )
}
