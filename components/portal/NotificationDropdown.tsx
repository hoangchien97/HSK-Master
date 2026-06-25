"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dropdown } from "@/components/ui"
import {
  Bell,
  CheckCheck,
  FileText,
  Star,
  Upload,
  ExternalLink,
  BookOpen,
  Calendar,
  Trash2,
  UserCheck,
  UserX,
  CalendarX,
  ClipboardCheck,
  AlertCircle,
  Trophy,
  Flame,
  Megaphone,
  UserCog,
} from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"
import { useNotifications, type NotificationItem } from "@/providers/notification-provider"
import { NotificationType } from "@/enums/portal/common"
import { NOTIFICATION_MAX_BADGE } from "@/constants/portal/notification"
import { HEADER_LABELS } from "@/constants/portal/messages"
import { CSpinner } from "@/components/portal/common"

dayjs.locale("vi")
dayjs.extend(relativeTime)

/* ─── Icon map ─── */

const TYPE_ICON: Record<string, React.ReactNode> = {
  // Assignments
  [NotificationType.ASSIGNMENT_PUBLISHED]: <FileText className="w-4 h-4 text-(--color-vermillion)" />,
  [NotificationType.ASSIGNMENT_DEADLINE]: <AlertCircle className="w-4 h-4 text-red-600" />,
  [NotificationType.ASSIGNMENT_DELETED]: <Trash2 className="w-4 h-4 text-red-600" />,
  // Submissions
  [NotificationType.SUBMISSION_SUBMITTED]: <Upload className="w-4 h-4 text-amber-600" />,
  [NotificationType.SUBMISSION_RESUBMITTED]: <Upload className="w-4 h-4 text-gray-500" />,
  [NotificationType.SUBMISSION_GRADED]: <Star className="w-4 h-4 text-green-600" />,
  [NotificationType.SUBMISSION_RETURNED]: <FileText className="w-4 h-4 text-red-600" />,
  // Classes
  [NotificationType.CLASS_ENROLLED]: <BookOpen className="w-4 h-4 text-gray-500" />,
  [NotificationType.CLASS_REMOVED]: <UserX className="w-4 h-4 text-red-600" />,
  [NotificationType.CLASS_COMPLETED]: <CheckCheck className="w-4 h-4 text-green-600" />,
  // Schedule
  [NotificationType.SCHEDULE_CREATED]: <Calendar className="w-4 h-4 text-(--color-vermillion)" />,
  [NotificationType.SCHEDULE_UPDATED]: <Calendar className="w-4 h-4 text-amber-600" />,
  [NotificationType.SCHEDULE_CANCELLED]: <CalendarX className="w-4 h-4 text-red-600" />,
  [NotificationType.SCHEDULE_REMINDER]: <Calendar className="w-4 h-4 text-gray-500" />,
  // Attendance
  [NotificationType.ATTENDANCE_RECORDED]: <ClipboardCheck className="w-4 h-4 text-green-600" />,
  [NotificationType.ATTENDANCE_ABSENT]: <UserCheck className="w-4 h-4 text-red-600" />,
  // Practice milestones
  [NotificationType.PRACTICE_LESSON_MASTERED]: <Trophy className="w-4 h-4 text-amber-600" />,
  [NotificationType.PRACTICE_STREAK]: <Flame className="w-4 h-4 text-amber-600" />,
  // System
  [NotificationType.SYSTEM_ANNOUNCEMENT]: <Megaphone className="w-4 h-4 text-(--color-vermillion)" />,
  [NotificationType.PROFILE_UPDATED]: <UserCog className="w-4 h-4 text-gray-500" />,
}

/* ─── Badge formatter ─── */

function formatBadge(count: number): string {
  if (count <= 0) return ""
  if (count > NOTIFICATION_MAX_BADGE) return `${NOTIFICATION_MAX_BADGE}+`
  return String(count)
}

/* ─── Component ─── */

export default function NotificationDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { items, unreadCount, loading, markRead, markAllRead, refresh } = useNotifications()

  const handleOpen = () => {
    setIsOpen(true)
    refresh()
  }

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const badgeText = formatBadge(unreadCount)

  return (
    <div className="relative">
      <Dropdown
        trigger={
          <button
            type="button"
            onClick={handleOpen}
            className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {badgeText}
              </span>
            )}
          </button>
        }
        items={[]}
        align="end"
      />
      {/* Custom dropdown panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-96 overflow-y-auto rounded-md border bg-white shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{HEADER_LABELS.NOTIFICATIONS}</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-(--color-vermillion) hover:opacity-80 transition-opacity"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {HEADER_LABELS.MARK_ALL_READ}
                </button>
              )}
            </div>

            {/* Body */}
            {loading && items.length === 0 ? (
              <CSpinner size="sm" className="py-4" />
            ) : items.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">{HEADER_LABELS.NO_NOTIFICATIONS}</p>
              </div>
            ) : (
              <div>
                {items.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notification.isRead ? "bg-red-50" : ""}`}
                    onClick={() => { handleClick(notification); setIsOpen(false) }}
                  >
                    <div className="shrink-0 mt-0.5">
                      {TYPE_ICON[notification.type] || <Bell className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <p className={`text-sm leading-tight ${!notification.isRead ? "font-semibold" : ""}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-(--color-muted) line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">{dayjs(notification.createdAt).fromNow()}</p>
                    </div>
                    {notification.link && (
                      <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
