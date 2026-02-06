"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { BaseModal, Button, Input, Label, Select, Switch, Textarea } from "@/app/components/common"
import { updateScheduleSchema, type UpdateScheduleFormData } from "@/app/utils/validation/schedule.validation"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar.types"
import { getEventState, getEventStateLabel, getEventStateColor } from "@/app/utils/calendar"
import { Calendar, Clock, MapPin, Video, Trash2, AlertCircle } from "lucide-react"

interface EditScheduleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  eventId: string | null
}

interface ClassOption {
  id: string
  className: string
  classCode: string
  level?: string
}

export default function EditScheduleModal({
  open,
  onClose,
  onSuccess,
  eventId,
}: EditScheduleModalProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(false)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [event, setEvent] = useState<ScheduleEvent | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UpdateScheduleFormData>({
    resolver: zodResolver(updateScheduleSchema),
  })

  // Fetch event data and classes
  useEffect(() => {
    if (open && eventId) {
      fetchEvent()
      fetchClasses()
    }
  }, [open, eventId])

  const fetchEvent = async () => {
    try {
      setLoadingEvent(true)
      const response = await fetch(`/api/portal/schedules/${eventId}`)
      if (!response.ok) throw new Error("Failed to fetch event")

      const data = await response.json()
      const scheduleEvent: ScheduleEvent = {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }

      setEvent(scheduleEvent)

      // Pre-fill form
      setValue("classId", scheduleEvent.classId)
      setValue("title", scheduleEvent.title)
      setValue("description", scheduleEvent.description || "")
      setValue("startTime", scheduleEvent.startTime)
      setValue("endTime", scheduleEvent.endTime)
      setValue("location", scheduleEvent.location || "")
      setValue("meetingLink", scheduleEvent.meetingLink || "")
      setValue("syncToGoogle", scheduleEvent.syncedToGoogle)
    } catch (error) {
      console.error("Error fetching event:", error)
      toast.error("Không thể tải thông tin lịch học")
      onClose()
    } finally {
      setLoadingEvent(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/portal/classes")
      if (!response.ok) throw new Error("Failed to fetch classes")

      const data = await response.json()
      setClasses(data)
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const onSubmit = async (data: UpdateScheduleFormData) => {
    if (!eventId) return

    try {
      setLoading(true)

      // Prepare payload
      const payload = {
        ...(data.classId && { classId: data.classId }),
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startTime && { startTime: data.startTime.toISOString() }),
        ...(data.endTime && { endTime: data.endTime.toISOString() }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.meetingLink !== undefined && { meetingLink: data.meetingLink }),
        ...(data.syncToGoogle !== undefined && { syncToGoogle: data.syncToGoogle }),
      }

      const response = await fetch(`/api/portal/schedules/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update schedule")
      }

      toast.success("Cập nhật lịch học thành công!")

      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Error updating schedule:", error)
      toast.error(error.message || "Không thể cập nhật lịch học")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!eventId) return

    if (!confirm("Bạn có chắc chắn muốn xóa lịch học này?")) {
      return
    }

    try {
      setDeleting(true)

      const response = await fetch(`/api/portal/schedules/${eventId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete schedule")
      }

      toast.success("Xóa lịch học thành công!")

      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Error deleting schedule:", error)
      toast.error(error.message || "Không thể xóa lịch học")
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (!loading && !deleting) {
      reset()
      setEvent(null)
      onClose()
    }
  }

  if (loadingEvent) {
    return (
      <BaseModal
        isOpen={open}
        onClose={handleClose}
        title="Đang tải thông tin..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </BaseModal>
    )
  }

  if (!event) return null

  const eventState = getEventState(event.startTime, event.endTime)
  const stateColors = getEventStateColor(eventState)

  return (
    <BaseModal
      isOpen={open}
      onClose={handleClose}
      header={
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa lịch học</h3>
        </div>
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={deleting || loading}
            className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer mr-auto"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1" />
                Xóa lịch học
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading || deleting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading || deleting}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            onClick={handleSubmit(onSubmit)}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </>
      }
      maxWidth="2xl"
    >
      {/* Event Status Badge */}
      <div className={`flex items-center gap-2 p-3 rounded-lg ${stateColors.bg} ${stateColors.border} border`}>
        <AlertCircle className={`w-5 h-5 ${stateColors.text}`} />
          <div>
            <p className={`text-sm font-medium ${stateColors.text}`}>
              Trạng thái: {getEventStateLabel(eventState)}
            </p>
            {event.syncedToGoogle && (
              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                </svg>
                Đã đồng bộ Google Calendar
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="classId">Lớp học</Label>
            <Select {...register("classId")}>
              <option value="">Chọn lớp học</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className} ({cls.classCode})
                  {cls.level && ` - ${cls.level}`}
                </option>
              ))}
            </Select>
            {errors.classId && (
              <p className="text-sm text-red-600">{errors.classId.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề buổi học</Label>
            <Input
              {...register("title")}
              placeholder="VD: Bài 5: Ngữ pháp cơ bản"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Ghi chú</Label>
            <Textarea
              {...register("description")}
              placeholder="Nội dung chi tiết buổi học..."
              rows={3}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ bắt đầu
              </Label>
              <Input
                type="datetime-local"
                {...register("startTime", {
                  setValueAs: (v) => (v ? new Date(v) : undefined),
                })}
              />
              {errors.startTime && (
                <p className="text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ kết thúc
              </Label>
              <Input
                type="datetime-local"
                {...register("endTime", {
                  setValueAs: (v) => (v ? new Date(v) : undefined),
                })}
              />
              {errors.endTime && (
                <p className="text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="w-4 h-4 inline mr-1" />
              Địa điểm
            </Label>
            <Input
              {...register("location")}
              placeholder="VD: Phòng 301, Tòa A"
            />
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meetingLink">
              <Video className="w-4 h-4 inline mr-1" />
              Link meeting
            </Label>
            <Input
              {...register("meetingLink")}
              type="url"
              placeholder="https://meet.google.com/..."
            />
            {errors.meetingLink && (
              <p className="text-sm text-red-600">{errors.meetingLink.message}</p>
            )}
          </div>

          {/* Google Calendar Sync */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"
                />
              </svg>
              <div>
                <Label>Đồng bộ Google Calendar</Label>
                <p className="text-xs text-gray-500">
                  Cập nhật thay đổi lên Google Calendar
                </p>
              </div>
            </div>
            <Switch
              checked={watch("syncToGoogle")}
              onCheckedChange={(checked) => setValue("syncToGoogle", checked)}
            />
          </div>
        </form>
      </BaseModal>
  )
}
