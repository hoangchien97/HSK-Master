"use client"

import { useMemo } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatSessionItem } from "./types"

interface SessionSidebarProps {
  sessions: ChatSessionItem[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
  onClose: () => void
}

/* ─── Date grouping helpers ──────────────────────────────────── */
function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000)
  const startOf7DaysAgo = new Date(startOfToday.getTime() - 7 * 86_400_000)
  const startOf30DaysAgo = new Date(startOfToday.getTime() - 30 * 86_400_000)

  if (date >= startOfToday) return "Hôm nay"
  if (date >= startOfYesterday) return "Hôm qua"
  if (date >= startOf7DaysAgo) return "7 ngày trước"
  if (date >= startOf30DaysAgo) return "30 ngày trước"
  return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function groupByDate(sessions: ChatSessionItem[]) {
  const groups: { label: string; items: ChatSessionItem[] }[] = []
  const map = new Map<string, ChatSessionItem[]>()

  for (const s of sessions) {
    const label = getDateLabel(s.createdAt)
    if (!map.has(label)) {
      const items: ChatSessionItem[] = []
      map.set(label, items)
      groups.push({ label, items })
    }
    map.get(label)!.push(s)
  }
  return groups
}

export default function SessionSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClose,
}: SessionSidebarProps) {
  const grouped = useMemo(() => groupByDate(sessions), [sessions])

  return (
    <div className="absolute inset-0 z-10 bg-white flex flex-col rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Lịch sử trò chuyện</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* New chat button */}
      <div className="p-2">
        <button
          onClick={onNewSession}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Cuộc trò chuyện mới
        </button>
      </div>

      {/* Session list grouped by date */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Chưa có lịch sử</p>
        )}

        {grouped.map((group) => (
          <div key={group.label} className="mb-2">
            {/* Group date label */}
            <p className="px-3 pt-2 pb-1 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              {group.label}
            </p>

            {group.items.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center justify-between group px-3 py-2 rounded-lg cursor-pointer transition-colors mb-0.5",
                  s.id === currentSessionId
                    ? "bg-red-50 text-red-700"
                    : "hover:bg-gray-50 text-gray-700"
                )}
              >
                <button
                  onClick={() => onSelectSession(s.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <span className="block text-sm truncate">
                    {s.title || "Cuộc trò chuyện"}
                  </span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">
                    {formatTime(s.createdAt)}
                    {s._count?.messages > 0 && ` · ${s._count.messages} tin nhắn`}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteSession(s.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
