"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Button, Input, Select, SelectItem, Switch, Textarea, Spinner } from "@heroui/react"
import { updateScheduleSchema, type UpdateScheduleFormData } from "@/app/utils/validation/schedule.validation"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar"
import { getEventState, getEventStateLabel, getEventStateColor } from "@/app/utils/calendar"
import { Calendar, Clock, MapPin, Video, Trash2, AlertCircle, FileEdit } from "lucide-react"
import { CModal } from "@/app/components/portal/common";

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
        headers: { "Content-Type": "application/json" },
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
    } catch (error: unknown) {
      console.error("Error updating schedule:", error)
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật lịch học")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!eventId) return
    if (!confirm("Bạn có chắc chắn muốn xóa lịch học này?")) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/portal/schedules/${eventId}`, { method: "DELETE" })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete schedule")
      }

      toast.success("Xóa lịch học thành công!")
      reset()
      onSuccess()
      onClose()
    } catch (error: unknown) {
      console.error("Error deleting schedule:", error)
      toast.error(error instanceof Error ? error.message : "Không thể xóa lịch học")
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
      <CModal isOpen={open} onClose={handleClose} title="Đang tải...">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" color="danger" label="Đang tải thông tin..." />
        </div>
      </CModal>
    )
  }

  if (!event) return null

  const eventState = getEventState(event.startTime, event.endTime)
  const stateColors = getEventStateColor(eventState)

  return (
    <CModal
      isOpen={open}
      onClose={handleClose}
      size="2xl"
      closeIcon={FileEdit}
      title={
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          Chỉnh sửa lịch học
        </div>
      }
      footer={
        <>
          <Button
            variant="bordered"
            onPress={handleDelete}
            isDisabled={deleting || loading}
            className="text-red-600 border-red-300 hover:bg-red-50 mr-auto"
            startContent={!deleting && <Trash2 className="w-4 h-4" />}
          >
            {deleting ? "Đang xóa..." : "Xóa lịch học"}
          </Button>
          <Button variant="bordered" onPress={handleClose} isDisabled={loading || deleting}>Hủy</Button>
          <Button
            type="submit"
            form="edit-schedule-form"
            isDisabled={loading || deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </>
      }
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

          <form id="edit-schedule-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Class Selection */}
            <Select
              label="Lớp học"
              {...register("classId")}
              isInvalid={!!errors.classId}
              errorMessage={errors.classId?.message}
            >
              {classes.map((cls) => (
                <SelectItem key={cls.id} textValue={`${cls.className} (${cls.classCode})${cls.level ? ` - ${cls.level}` : ''}`}>
                  {cls.className} ({cls.classCode}){cls.level && ` - ${cls.level}`}
                </SelectItem>
              ))}
            </Select>

            {/* Title */}
            <Input
              label="Tiêu đề buổi học"
              {...register("title")}
              placeholder="VD: Bài 5: Ngữ pháp cơ bản"
              isInvalid={!!errors.title}
              errorMessage={errors.title?.message}
            />

            {/* Description */}
            <Textarea
              label="Ghi chú"
              {...register("description")}
              placeholder="Nội dung chi tiết buổi học..."
              minRows={3}
            />

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Giờ bắt đầu"
                type="datetime-local"
                startContent={<Clock className="w-4 h-4 text-gray-400" />}
                {...register("startTime", { setValueAs: (v) => (v ? new Date(v) : undefined) })}
                isInvalid={!!errors.startTime}
                errorMessage={errors.startTime?.message}
              />
              <Input
                label="Giờ kết thúc"
                type="datetime-local"
                startContent={<Clock className="w-4 h-4 text-gray-400" />}
                {...register("endTime", { setValueAs: (v) => (v ? new Date(v) : undefined) })}
                isInvalid={!!errors.endTime}
                errorMessage={errors.endTime?.message}
              />
            </div>

            {/* Location */}
            <Input
              label="Địa điểm"
              startContent={<MapPin className="w-4 h-4 text-gray-400" />}
              {...register("location")}
              placeholder="VD: Phòng 301, Tòa A"
            />

            {/* Meeting Link */}
            <Input
              label="Link meeting"
              startContent={<Video className="w-4 h-4 text-gray-400" />}
              {...register("meetingLink")}
              type="url"
              placeholder="https://meet.google.com/..."
              isInvalid={!!errors.meetingLink}
              errorMessage={errors.meetingLink?.message}
            />

            {/* Google Calendar Sync */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Đồng bộ Google Calendar</p>
                  <p className="text-xs text-gray-500">Cập nhật thay đổi lên Google Calendar</p>
                </div>
              </div>
              <Switch
                isSelected={watch("syncToGoogle")}
                onValueChange={(val) => setValue("syncToGoogle", val)}
              />
            </div>
          </form>
    </CModal>
  )
}
