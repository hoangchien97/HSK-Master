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
} from "lucide-react"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar"
import { EventState } from "@/app/interfaces/portal/calendar"
import { getEventState, getEventStateColor, formatEventTime } from "@/app/utils/calendar"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import { CDrawer } from "@/app/components/portal/common";

interface EventDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string | null
  onEdit: (eventId: string) => void
  onDelete: (eventId: string) => void
}

export default function EventDetailDrawer({
  open,
  onOpenChange,
  eventId,
  onEdit,
  onDelete,
}: EventDetailDrawerProps) {
  const [event, setEvent] = useState<ScheduleEvent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch event details
  const fetchEvent = useCallback(async () => {
    if (!eventId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/portal/schedules/${eventId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch event")
      }

      const data = await response.json()

      // Convert date strings to Date objects
      setEvent({
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
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

  const handleDelete = async () => {
    if (!event) return

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa lịch dạy này?\n\nThao tác này không thể hoàn tác."
    )

    if (!confirmed) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/portal/schedules/${event.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      toast.success("Đã xóa lịch dạy thành công")
      onDelete(event.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Không thể xóa lịch dạy")
    } finally {
      setIsDeleting(false)
    }
  }

  const openMeetingLink = () => {
    if (event?.meetingLink) {
      window.open(event.meetingLink, "_blank", "noopener,noreferrer")
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
        event
          ? () => (
              <div className="flex gap-3 w-full">
                <Button
                  variant="bordered"
                  onPress={handleDelete}
                  isDisabled={isDeleting}
                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </>
                  )}
                </Button>
                <Button onPress={handleEdit} className="flex-1 bg-red-600 hover:bg-red-700 text-white cursor-pointer">
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
                event.status === "COMPLETED" && "bg-green-100 text-green-700",
                event.status === "CANCELLED" && "bg-red-100 text-red-700",
                event.status === "SCHEDULED" && "bg-blue-100 text-blue-700"
              )}
            >
              {event.status === "COMPLETED" && (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đã hoàn thành
                </>
              )}
              {event.status === "CANCELLED" && (
                <>
                  <XCircle className="h-3.5 w-3.5" />
                  Đã hủy
                </>
              )}
              {event.status === "SCHEDULED" && (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  Đã lên lịch
                </>
              )}
            </span>

            {/* Google Sync */}
            {event.syncedToGoogle && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.46 12c0-.77-.07-1.52-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
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
                    Học viên: <span className="font-medium">{event.class.enrollments.length}/{event.class.maxStudents}</span>
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
