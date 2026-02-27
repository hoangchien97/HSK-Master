"use client"

/**
 * NotificationProvider — Supabase Realtime push notifications
 *
 * Architecture:
 * - Server writes to `portal_notifications` via Prisma (unchanged)
 * - Client subscribes to Supabase Realtime (Postgres Changes)
 *   filtered by the current user's ID
 * - On INSERT, the new notification is pushed into React state
 * - Badge count is computed from state (no polling needed)
 *
 * Usage:
 *   <NotificationProvider userId={session.user.id}>
 *     <NotificationDropdown />
 *   </NotificationProvider>
 *
 *   const { items, unreadCount, markRead, markAllRead } = useNotifications()
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import {
  fetchNotifications,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notification.actions"
import {
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TABLE,
  NOTIFICATION_FETCH_LIMIT,
} from "@/constants/portal/notification"
import type { RealtimeChannel } from "@supabase/supabase-js"

/* ─── Types ─── */

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  isRead: boolean
  metadata?: Record<string, unknown> | null
  createdAt: string
}

interface NotificationContextValue {
  /** Current notification list (most recent first) */
  items: NotificationItem[]
  /** Number of unread notifications */
  unreadCount: number
  /** Whether initial load is in progress */
  loading: boolean
  /** Mark a single notification as read */
  markRead: (id: string) => Promise<void>
  /** Mark all notifications as read */
  markAllRead: () => Promise<void>
  /** Manually refetch from server */
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

/* ─── Hook ─── */

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error("useNotifications must be used within <NotificationProvider>")
  }
  return ctx
}

/* ─── Provider ─── */

interface ProviderProps {
  userId: string
  children: ReactNode
}

export function NotificationProvider({ userId, children }: ProviderProps) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const userIdRef = useRef(userId)
  userIdRef.current = userId

  /* ── Initial fetch ── */
  const fetchInitial = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchNotifications({ limit: NOTIFICATION_FETCH_LIMIT })
      if (result.success && result.data) {
        setItems(result.data.items as NotificationItem[])
        setUnreadCount(result.data.unreadCount)
      }
    } catch {
      // Silently fail — will retry on next manual refresh
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Subscribe to Supabase Realtime ── */
  useEffect(() => {
    fetchInitial()

    let channel: RealtimeChannel | null = null

    try {
      const supabase = getSupabaseBrowserClient()

      channel = supabase
        .channel(`${NOTIFICATION_CHANNEL}:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: NOTIFICATION_TABLE,
            filter: `userId=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as {
              id: string
              type: string
              title: string
              message: string
              link: string | null
              isRead: boolean
              metadata: Record<string, unknown> | null
              createdAt: string
              userId: string
            }

            // Only accept notifications for current user (double-check)
            if (row.userId !== userIdRef.current) return

            const newItem: NotificationItem = {
              id: row.id,
              type: row.type,
              title: row.title,
              message: row.message,
              link: row.link,
              isRead: row.isRead,
              metadata: row.metadata,
              createdAt: row.createdAt,
            }

            // Prepend to list, cap at NOTIFICATION_FETCH_LIMIT
            setItems((prev) => [newItem, ...prev].slice(0, NOTIFICATION_FETCH_LIMIT))
            setUnreadCount((prev) => prev + 1)
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: NOTIFICATION_TABLE,
            filter: `userId=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as {
              id: string
              isRead: boolean
              userId: string
            }

            if (row.userId !== userIdRef.current) return

            // Update read status in local state
            setItems((prev) =>
              prev.map((item) =>
                item.id === row.id ? { ...item, isRead: row.isRead } : item,
              ),
            )

            // Recompute unread count
            setItems((prev) => {
              setUnreadCount(prev.filter((n) => !n.isRead).length)
              return prev
            })
          },
        )
        .subscribe()

      channelRef.current = channel
    } catch (error) {
      console.warn("Supabase Realtime not available, falling back to initial fetch only:", error)
    }

    return () => {
      if (channel) {
        const supabase = getSupabaseBrowserClient()
        supabase.removeChannel(channel)
      }
      channelRef.current = null
    }
  }, [userId, fetchInitial])

  /* ── Actions ── */

  const markRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    // Server call (fire-and-forget with rollback on error)
    try {
      await markNotificationReadAction(notificationId)
    } catch {
      // Rollback on failure
      setItems((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n)),
      )
      setUnreadCount((prev) => prev + 1)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    // Optimistic update
    const prevItems = items
    const prevCount = unreadCount
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)

    try {
      await markAllNotificationsReadAction()
    } catch {
      // Rollback on failure
      setItems(prevItems)
      setUnreadCount(prevCount)
    }
  }, [items, unreadCount])

  const refresh = useCallback(async () => {
    await fetchInitial()
  }, [fetchInitial])

  return (
    <NotificationContext.Provider
      value={{ items, unreadCount, loading, markRead, markAllRead, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
