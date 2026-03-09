"use client"

import { useRouter } from "next/navigation"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Badge,
  Button,
} from "@heroui/react"
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
  [NotificationType.ASSIGNMENT_PUBLISHED]: <FileText className="w-4 h-4 text-primary" />,
  [NotificationType.ASSIGNMENT_DEADLINE]: <AlertCircle className="w-4 h-4 text-danger" />,
  [NotificationType.ASSIGNMENT_DELETED]: <Trash2 className="w-4 h-4 text-danger" />,
  // Submissions
  [NotificationType.SUBMISSION_SUBMITTED]: <Upload className="w-4 h-4 text-warning" />,
  [NotificationType.SUBMISSION_RESUBMITTED]: <Upload className="w-4 h-4 text-secondary" />,
  [NotificationType.SUBMISSION_GRADED]: <Star className="w-4 h-4 text-success" />,
  [NotificationType.SUBMISSION_RETURNED]: <FileText className="w-4 h-4 text-danger" />,
  // Classes
  [NotificationType.CLASS_ENROLLED]: <BookOpen className="w-4 h-4 text-secondary" />,
  [NotificationType.CLASS_REMOVED]: <UserX className="w-4 h-4 text-danger" />,
  [NotificationType.CLASS_COMPLETED]: <CheckCheck className="w-4 h-4 text-success" />,
  // Schedule
  [NotificationType.SCHEDULE_CREATED]: <Calendar className="w-4 h-4 text-primary" />,
  [NotificationType.SCHEDULE_UPDATED]: <Calendar className="w-4 h-4 text-warning" />,
  [NotificationType.SCHEDULE_CANCELLED]: <CalendarX className="w-4 h-4 text-danger" />,
  [NotificationType.SCHEDULE_REMINDER]: <Calendar className="w-4 h-4 text-secondary" />,
  // Attendance
  [NotificationType.ATTENDANCE_RECORDED]: <ClipboardCheck className="w-4 h-4 text-success" />,
  [NotificationType.ATTENDANCE_ABSENT]: <UserCheck className="w-4 h-4 text-danger" />,
  // Practice milestones
  [NotificationType.PRACTICE_LESSON_MASTERED]: <Trophy className="w-4 h-4 text-warning" />,
  [NotificationType.PRACTICE_STREAK]: <Flame className="w-4 h-4 text-warning" />,
  // System
  [NotificationType.SYSTEM_ANNOUNCEMENT]: <Megaphone className="w-4 h-4 text-primary" />,
  [NotificationType.PROFILE_UPDATED]: <UserCog className="w-4 h-4 text-secondary" />,
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
  const { items, unreadCount, loading, markRead, markAllRead, refresh } = useNotifications()

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <Dropdown placement="bottom-end" onOpenChange={(open) => open && refresh()}>
      <DropdownTrigger>
        <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <Badge
            content={formatBadge(unreadCount)}
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
        aria-label={HEADER_LABELS.NOTIFICATIONS}
        className="w-[calc(100vw-2rem)] sm:w-96 max-h-96 overflow-y-auto"
        emptyContent={
          <div className="py-6 text-center text-gray-500">
            <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">{HEADER_LABELS.NO_NEW_NOTIFICATIONS}</p>
          </div>
        }
      >
        <DropdownSection showDivider>
          <DropdownItem key="header" isReadOnly className="opacity-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{HEADER_LABELS.NOTIFICATIONS}</h3>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  startContent={<CheckCheck className="w-3.5 h-3.5" />}
                  onPress={markAllRead}
                  className="text-xs -mr-2"
                >
                  {HEADER_LABELS.MARK_ALL_READ}
                </Button>
              )}
            </div>
          </DropdownItem>
        </DropdownSection>

        <DropdownSection>
          {loading && items.length === 0 ? (
            <DropdownItem key="loading" isReadOnly className="opacity-100">
              <CSpinner size="sm" className="py-4" />
            </DropdownItem>
          ) : items.length === 0 ? (
            <DropdownItem key="empty" isReadOnly className="opacity-100">
              <div className="py-6 text-center text-gray-500">
                <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">{HEADER_LABELS.NO_NOTIFICATIONS}</p>
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
