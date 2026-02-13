"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Badge,
  Button,
  Spinner,
} from "@heroui/react"
import {
  Bell,
  CheckCheck,
  FileText,
  Star,
  Upload,
  ExternalLink,
} from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"
import {
  fetchNotifications,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notification.actions"

dayjs.locale("vi")
dayjs.extend(relativeTime)

/* ─── Types ─── */

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  ASSIGNMENT_CREATED: <FileText className="w-4 h-4 text-primary" />,
  SUBMISSION_RECEIVED: <Upload className="w-4 h-4 text-warning" />,
  SUBMISSION_GRADED: <Star className="w-4 h-4 text-success" />,
}

/* ─── Component ─── */

export default function NotificationDropdown() {
  const router = useRouter()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchNotifications({ limit: 15 })
      if (result.success && result.data) {
        setItems(result.data.items as NotificationItem[])
        setUnreadCount(result.data.unreadCount)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on mount and periodically
  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [loadNotifications])

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markNotificationReadAction(notification.id)
      setItems((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction()
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <Dropdown placement="bottom-end" onOpenChange={(open) => open && loadNotifications()}>
      <DropdownTrigger>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <Badge
            content={unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : ""}
            color="danger"
            shape="circle"
            size="sm"
            placement="top-right"
            isInvisible={unreadCount === 0}
          >
            <Bell className="w-6 h-6" />
          </Badge>
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Thông báo"
        className="w-96 max-h-96 overflow-y-auto"
        emptyContent={
          <div className="py-6 text-center text-gray-500">
            <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">Chưa có thông báo mới</p>
          </div>
        }
      >
        <DropdownSection showDivider>
          <DropdownItem key="header" isReadOnly className="opacity-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  startContent={<CheckCheck className="w-3.5 h-3.5" />}
                  onPress={handleMarkAllRead}
                  className="text-xs -mr-2"
                >
                  Đọc tất cả
                </Button>
              )}
            </div>
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          {loading && items.length === 0 ? (
            <DropdownItem key="loading" isReadOnly className="opacity-100">
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            </DropdownItem>
          ) : items.length === 0 ? (
            <DropdownItem key="empty" isReadOnly className="opacity-100">
              <div className="py-6 text-center text-gray-500">
                <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">Chưa có thông báo nào</p>
              </div>
            </DropdownItem>
          ) : (
            items.map((notification) => (
              <DropdownItem
                key={notification.id}
                className={`py-3 ${!notification.isRead ? "bg-primary-50" : ""}`}
                onPress={() => handleClick(notification)}
                startContent={
                  <div className="shrink-0 mt-0.5">
                    {TYPE_ICON[notification.type] || <Bell className="w-4 h-4 text-default-400" />}
                  </div>
                }
                endContent={
                  notification.link ? (
                    <ExternalLink className="w-3.5 h-3.5 text-default-300 shrink-0" />
                  ) : undefined
                }
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className={`text-sm leading-tight ${!notification.isRead ? "font-semibold" : ""}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-default-500 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-default-400">{dayjs(notification.createdAt).fromNow()}</p>
                </div>
              </DropdownItem>
            ))
          )}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}
