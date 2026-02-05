"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/common/Dialog"
import { Button, Input, Label, Select, Switch, Textarea } from "@/app/components/common"
import { createScheduleSchema, type CreateScheduleFormData } from "@/app/utils/validation/schedule.validation"
import { createRecurrenceDescription, getDayName } from "@/app/utils/calendar"
import { Calendar, Clock, MapPin, Video, Repeat, X } from "lucide-react"

interface CreateScheduleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  defaultDate?: Date | null
}

interface ClassOption {
  id: string
  className: string
  classCode: string
  level?: string
}

export default function CreateScheduleModal({
  open,
  onClose,
  onSuccess,
  defaultDate,
}: CreateScheduleModalProps) {
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateScheduleFormData>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      isRecurring: false,
      syncToGoogle: false,
      startTime: defaultDate || new Date(),
      endTime: defaultDate ? new Date(defaultDate.getTime() + 90 * 60000) : new Date(), // +90 min
    },
  })

  const isRecurring = watch("isRecurring")
  const recurrenceDays = watch("recurrenceDays") || []
  const recurrenceEndDate = watch("recurrenceEndDate")

  // Fetch teacher's classes
  useEffect(() => {
    if (open) {
      fetchClasses()

      // Reset form when modal opens
      if (defaultDate) {
        const endTime = new Date(defaultDate.getTime() + 90 * 60000)
        setValue("startTime", defaultDate)
        setValue("endTime", endTime)
      }
    }
  }, [open, defaultDate])

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true)
      const response = await fetch("/api/portal/classes")
      if (!response.ok) throw new Error("Failed to fetch classes")

      const data = await response.json()
      setClasses(data)
    } catch (error) {
      console.error("Error fetching classes:", error)
      toast.error("Không thể tải danh sách lớp học")
    } finally {
      setLoadingClasses(false)
    }
  }

  const onSubmit = async (data: CreateScheduleFormData) => {
    try {
      setLoading(true)

      // Prepare payload
      const payload = {
        classId: data.classId,
        title: data.title,
        description: data.description,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        location: data.location,
        meetingLink: data.meetingLink,
        syncToGoogle: data.syncToGoogle,
        ...(data.isRecurring && {
          recurrence: {
            days: data.recurrenceDays,
            endDate: data.recurrenceEndDate?.toISOString(),
          },
        }),
      }

      const response = await fetch("/api/portal/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create schedule")
      }

      toast.success(
        data.isRecurring
          ? "Tạo lịch lặp lại thành công!"
          : "Tạo lịch học thành công!"
      )

      reset()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Error creating schedule:", error)
      toast.error(error.message || "Không thể tạo lịch học")
    } finally {
      setLoading(false)
    }
  }

  const handleDayToggle = (day: number) => {
    const current = recurrenceDays || []
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort()
    setValue("recurrenceDays", updated)
  }

  const handleClose = () => {
    if (!loading) {
      reset()
      onClose()
    }
  }

  // Generate recurrence description
  const recurrenceDescription =
    isRecurring && recurrenceDays.length > 0 && recurrenceEndDate
      ? createRecurrenceDescription(recurrenceDays, recurrenceEndDate)
      : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Tạo lịch học mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="classId" required>
              Lớp học
            </Label>
            <Select {...register("classId")} disabled={loadingClasses}>
              <option value="">
                {loadingClasses ? "Đang tải..." : "Chọn lớp học"}
              </option>
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
            <Label htmlFor="title" required>
              Tiêu đề buổi học
            </Label>
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
              <Label htmlFor="startTime" required>
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
              <Label htmlFor="endTime" required>
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

          {/* Recurring Toggle */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Repeat className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <Label className="text-base font-semibold text-gray-900">Lặp lại hàng tuần</Label>
                  <p className="text-sm text-gray-600">
                    Tạo lịch định kỳ cho nhiều buổi học
                  </p>
                </div>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
              />
            </div>

            {isRecurring && (
              <div className="mt-4 space-y-4 p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                {/* Days of week */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800">
                    CHỌN CÁC NGÀY TRONG TUẦN
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { day: 1, label: "T2" },
                      { day: 2, label: "T3" },
                      { day: 3, label: "T4" },
                      { day: 4, label: "T5" },
                      { day: 5, label: "T6" },
                      { day: 6, label: "T7" },
                      { day: 0, label: "CN" },
                    ].map(({ day, label }) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`flex-1 min-w-[60px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          recurrenceDays.includes(day)
                            ? "bg-red-600 text-white shadow-md scale-105"
                            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.recurrenceDays && (
                    <p className="text-sm text-red-600 font-medium">
                      {errors.recurrenceDays.message}
                    </p>
                  )}
                </div>

                {/* End date */}
                <div className="space-y-2">
                  <Label htmlFor="recurrenceEndDate" className="text-sm font-semibold text-gray-800">
                    Ngày kết thúc lặp lại
                  </Label>
                  <Input
                    type="date"
                    {...register("recurrenceEndDate", {
                      setValueAs: (v) => (v ? new Date(v) : undefined),
                    })}
                    className="bg-white"
                  />
                  {errors.recurrenceEndDate && (
                    <p className="text-sm text-red-600 font-medium">
                      {errors.recurrenceEndDate.message}
                    </p>
                  )}
                </div>

                {/* Recurrence description */}
                {recurrenceDescription && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      📅 {recurrenceDescription.text}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Google Calendar Sync */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"
                    />
                  </svg>
                </div>
                <div>
                  <Label className="text-base font-semibold text-gray-900">
                    Đồng bộ Google Calendar
                  </Label>
                  <p className="text-sm text-gray-600">
                    Tự động thêm vào lịch có nhãn
                  </p>
                </div>
              </div>
              <Switch
                checked={watch("syncToGoogle")}
                onCheckedChange={(checked) => setValue("syncToGoogle", checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                "Tạo lịch học"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
