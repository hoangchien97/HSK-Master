"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@heroui/react"
import {
  Calendar,
  MapPin,
  Video,
  Users,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Circle,
  Cloud,
} from "lucide-react"
import type { ScheduleEvent } from "@/interfaces/portal/calendar"
import { EventState } from "@/interfaces/portal/calendar"
import { getEventState, getEventStateColor, formatEventTime } from "@/utils/calendar"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import { CDrawer } from "@/components/portal/common";
import api from "@/lib/http/client";
import { syncScheduleToGoogleCalendar } from "@/actions/schedule.actions";
import { SCHEDULE_STATUS } from "@/constants/portal/roles";
import { SCHEDULE_STATUS_COLOR_MAP, SCHEDULE_STATUS_LABEL_MAP } from "@/constants/portal";

interface EventDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string | null
  onEdit: (eventId: string) => void
  onDelete: (eventId: string) => void
  /** When true, hides edit/delete/sync buttons in footer */
  readOnly?: boolean
}

export default function EventDetailDrawer({
  open,
  onOpenChange,
  eventId,
  onEdit,
  onDelete,
  readOnly = false,
}: EventDetailDrawerProps) {
  const [event, setEvent] = useState<(ScheduleEvent & { seriesId?: string | null; isRecurring?: boolean }) | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Fetch event details
  const fetchEvent = useCallback(async () => {
    if (!eventId) return

    try {
      setIsLoading(true)
      const { data } = await api.get<ScheduleEvent>(`/portal/schedules/${eventId}`, { meta: { loading: false } })

      // Convert date strings to Date objects
      setEvent({
        ...data,
        startTime: new Date(data.startTime as unknown as string),
        endTime: new Date(data.endTime as unknown as string),
        createdAt: new Date(data.createdAt as unknown as string),
        updatedAt: new Date(data.updatedAt as unknown as string),
      })
    } catch (error) {
      console.error("Error fetching event:", error)
      toast.error("Không thể tải thông tin lịch dạy")
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }, [eventId, onOpenChange])

  useEffect(() => {
    if (open && eventId) {
      fetchEvent()
    } else {
      setEvent(null)
    }
  }, [open, eventId, fetchEvent])

  const handleEdit = () => {
    if (event) {
      onEdit(event.id)
      onOpenChange(false)
    }
  }

  const handleDelete = () => {
    if (!event) return
    const eventId = event.id
    onOpenChange(false)
    // Use setTimeout to defer onDelete call so drawer closes without refetching
    setTimeout(() => {
      onDelete(eventId)
    }, 0)
  }

  const openMeetingLink = () => {
    if (event?.meetingLink) {
      window.open(event.meetingLink, "_blank", "noopener,noreferrer")
    }
  }

  const handleSyncToGoogle = async () => {
    if (!event) return

    try {
      setIsSyncing(true)
      const result = await syncScheduleToGoogleCalendar(event.id)

      if (result.success) {
        toast.success(result.message || "Đã đồng bộ với Google Calendar")
        // Update event state to reflect sync
        setEvent(prev => prev ? { ...prev, syncedToGoogle: true, googleEventId: result.googleEventId || undefined } : null)
      } else {
        toast.error(result.error || "Không thể đồng bộ với Google Calendar")
      }
    } catch (error) {
      console.error("Error syncing to Google:", error)
      toast.error("Có lỗi xảy ra khi đồng bộ")
    } finally {
      setIsSyncing(false)
    }
  }

  if (!event && !isLoading) return null

  const eventState = event ? getEventState(event.startTime, event.endTime) : EventState.FUTURE
  const colors = getEventStateColor(eventState)

  return (
    <CDrawer
      isOpen={open}
      onOpenChange={onOpenChange}
      placement="right"
      size="lg"
      title={
        event ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 truncate">
              {event.title}
            </h3>
          </div>
        ) : (
          "Chi tiết lịch học"
        )
      }
      footer={
        event && !readOnly
          ? () => (
              <div className="flex gap-3 w-full flex-wrap">
                {!event.syncedToGoogle && (
                  <Button
                    variant="flat"
                    color="primary"
                    onPress={handleSyncToGoogle}
                    isLoading={isSyncing}
                    className="flex-1 min-w-[140px]"
                  >
                    <Cloud className="mr-2 h-4 w-4" />
                    Đồng bộ Google
                  </Button>
                )}
                <Button
                  variant="bordered"
                  onPress={handleDelete}
                  className="flex-1 min-w-[100px] text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
                <Button
                  onPress={handleEdit}
                  className="flex-1 min-w-[100px] bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </div>
            )
          : undefined
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : event ? (
        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Event State Badge with animation for upcoming */}
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
              colors.badge,
              eventState === EventState.UPCOMING && "animate-pulse shadow-lg shadow-red-200 ring-2 ring-red-500 ring-offset-2"
            )}>
              {eventState === EventState.PAST && "Đã qua"}
              {eventState === EventState.UPCOMING && "🔥 Sắp diễn ra"}
              {eventState === EventState.FUTURE && "Trong tương lai"}
            </span>

            {/* Status Badge */}
            <span
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5",
                SCHEDULE_STATUS_COLOR_MAP[event.status]
              )}
            >
              {event.status === SCHEDULE_STATUS.COMPLETED && (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {SCHEDULE_STATUS_LABEL_MAP[event.status]}
                </>
              )}
              {event.status === SCHEDULE_STATUS.CANCELLED && (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  {SCHEDULE_STATUS_LABEL_MAP[event.status]}
                </>
              )}
              {event.status === SCHEDULE_STATUS.SCHEDULED && (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  {SCHEDULE_STATUS_LABEL_MAP[event.status]}
                </>
              )}
            </span>

            {/* Google Sync */}
            {event.syncedToGoogle && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M18.5 3.5h-13A2 2 0 003.5 5.5v13a2 2 0 002 2h13a2 2 0 002-2v-13a2 2 0 00-2-2z" fill="#fff" />
                  <path d="M18.5 3.5h-13A2 2 0 003.5 5.5V8h17V5.5a2 2 0 00-2-2z" fill="#4285F4" />
                  <rect x="6" y="11" width="3" height="2.5" rx=".5" fill="#EA4335" />
                  <rect x="10.5" y="11" width="3" height="2.5" rx=".5" fill="#FBBC04" />
                  <rect x="15" y="11" width="3" height="2.5" rx=".5" fill="#34A853" />
                  <rect x="6" y="15" width="3" height="2.5" rx=".5" fill="#4285F4" />
                  <rect x="10.5" y="15" width="3" height="2.5" rx=".5" fill="#EA4335" />
                  <rect x="15" y="15" width="3" height="2.5" rx=".5" fill="#34A853" />
                </svg>
                Google Calendar
              </span>
            )}
          </div>

          {/* Class Info */}
          {event.class && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Lớp học
              </h3>
              <div className="space-y-1">
                <p className="text-base font-medium">{event.class.className}</p>
                <p className="text-sm text-gray-600">
                  Mã lớp: <span className="font-mono">{event.class.classCode}</span>
                </p>
                {event.class.level && (
                  <p className="text-sm text-gray-600">
                    Cấp độ: <span className="font-medium">{event.class.level}</span>
                  </p>
                )}
                {event.class.enrollments && (
                  <p className="text-sm text-gray-600">
                    Học viên: <span className="font-medium">{event.class.enrollments.length}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thời gian
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 w-20">Ngày:</span>
                <span className="font-medium">
                  {format(event.startTime, "EEEE, d MMMM yyyy", { locale: vi })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 w-20">Giờ:</span>
                <span className="font-medium">
                  {formatEventTime(event.startTime, event.endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa điểm
              </h3>
              <p className="text-sm text-gray-800">{event.location}</p>
            </div>
          )}

          {/* Meeting Link */}
          {event.meetingLink && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Video className="h-4 w-4" />
                Link họp trực tuyến
              </h3>
              <Button
                variant="bordered"
                onClick={openMeetingLink}
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span className="truncate">{event.meetingLink}</span>
              </Button>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Mô tả</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-1 text-xs text-gray-500">
              <p>
                Tạo lúc: {format(event.createdAt, "d/M/yyyy HH:mm", { locale: vi })}
              </p>
              <p>
                Cập nhật: {format(event.updatedAt, "d/M/yyyy HH:mm", { locale: vi })}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </CDrawer>
  )
}
