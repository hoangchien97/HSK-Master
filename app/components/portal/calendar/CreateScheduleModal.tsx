"use client"

import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Button, Input, Switch, Textarea } from "@heroui/react"
import { createRecurrenceDescription } from "@/app/utils/calendar"
import { Calendar, Clock, MapPin, Video, Repeat, PlusCircle } from "lucide-react"
import { CModal } from "@/app/components/portal/common";

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
  } = useForm({
    mode: "onChange",
    defaultValues: {
      classId: "",
      title: "",
      description: "",
      isRecurring: false,
      syncToGoogle: false,
      startTime: defaultDate || new Date(),
      endTime: defaultDate ? new Date(defaultDate.getTime() + 90 * 60000) : new Date(),
      location: "",
      meetingLink: "",
      recurrenceDays: [] as number[],
      recurrenceEndDate: undefined as Date | undefined,
    },
  })

  const isRecurring = watch("isRecurring")
  const recurrenceDays = watch("recurrenceDays") || []
  const recurrenceEndDate = watch("recurrenceEndDate")

  useEffect(() => {
    if (open) {
      fetchClasses()
      if (defaultDate) {
        const endTime = new Date(defaultDate.getTime() + 90 * 60000)
        setValue("startTime", defaultDate)
        setValue("endTime", endTime)
      }
    }
  }, [open, defaultDate, setValue])

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

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      setLoading(true)
      if (!data.classId) { toast.error("Vui lòng chọn lớp học"); return }
      if (!data.title) { toast.error("Vui lòng nhập tiêu đề"); return }
      if (!data.startTime || !data.endTime) { toast.error("Vui lòng chọn thời gian"); return }

      const startTime = new Date(data.startTime as string)
      const endTime = new Date(data.endTime as string)
      if (endTime <= startTime) { toast.error("Giờ kết thúc phải sau giờ bắt đầu"); return }

      if (data.isRecurring && (!data.recurrenceDays || (data.recurrenceDays as number[]).length === 0)) {
        toast.error("Vui lòng chọn ít nhất một ngày lặp lại"); return
      }
      if (data.isRecurring && !data.recurrenceEndDate) {
        toast.error("Vui lòng chọn ngày kết thúc lặp lại"); return
      }

      const payload: Record<string, unknown> = {
        classId: data.classId,
        title: data.title,
        description: data.description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: data.location,
        meetingLink: data.meetingLink,
        syncToGoogle: data.syncToGoogle,
      }

      if (data.isRecurring) {
        payload.recurrence = {
          days: data.recurrenceDays,
          endDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate as string).toISOString() : undefined,
        }
      }

      const response = await fetch("/api/portal/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create schedule")
      }

      toast.success(data.isRecurring ? "Tạo lịch lặp lại thành công!" : "Tạo lịch học thành công!")
      reset()
      onSuccess()
      onClose()
    } catch (error: unknown) {
      console.error("Error creating schedule:", error)
      toast.error(error instanceof Error ? error.message : "Không thể tạo lịch học")
    } finally {
      setLoading(false)
    }
  }

  const handleDayToggle = (day: number) => {
    const current = recurrenceDays || []
    const updated = current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort()
    setValue("recurrenceDays", updated)
  }

  const handleClose = () => {
    if (!loading) { reset(); onClose() }
  }

  const recurrenceDescription =
    isRecurring && recurrenceDays.length > 0 && recurrenceEndDate
      ? createRecurrenceDescription(recurrenceDays, recurrenceEndDate)
      : null

  return (
    <CModal
      isOpen={open}
      onClose={handleClose}
      size="2xl"
      isDismissable={!loading}
      hideCloseButton={loading}
      closeIcon={PlusCircle}
      title={
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          Tạo lịch học mới
        </div>
      }
      footer={
        <>
          <Button variant="bordered" onPress={handleClose} isDisabled={loading}>Hủy</Button>
          <Button type="submit" form="create-schedule-form" isDisabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Đang tạo...</>
            ) : "Tạo lịch học"}
          </Button>
        </>
      }
    >
      <form id="create-schedule-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Class Selection */}
            <div className="space-y-2">
              <label htmlFor="classId" className="text-sm font-medium text-gray-700">
                Lớp học <span className="text-red-500">*</span>
              </label>
              <select
                {...register("classId")}
                disabled={loadingClasses}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">{loadingClasses ? "Đang tải..." : "Chọn lớp học"}</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className} ({cls.classCode}){cls.level && ` - ${cls.level}`}
                  </option>
                ))}
              </select>
              {errors.classId && <p className="text-sm text-red-600">{errors.classId.message}</p>}
            </div>

            {/* Title */}
            <Input
              label="Tiêu đề buổi học"
              isRequired
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
                isRequired
                type="datetime-local"
                startContent={<Clock className="w-4 h-4 text-gray-400" />}
                {...register("startTime", { setValueAs: (v) => (v ? new Date(v) : undefined) })}
                isInvalid={!!errors.startTime}
                errorMessage={errors.startTime?.message}
              />
              <Input
                label="Giờ kết thúc"
                isRequired
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

            {/* Recurring Toggle */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Repeat className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Lặp lại hàng tuần</p>
                    <p className="text-sm text-gray-600">Tạo lịch định kỳ cho nhiều buổi học</p>
                  </div>
                </div>
                <Switch isSelected={isRecurring} onValueChange={(val) => setValue("isRecurring", val)} />
              </div>

              {isRecurring && (
                <div className="mt-4 space-y-4 p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-800">CHỌN CÁC NGÀY TRONG TUẦN</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { day: 1, label: "T2" }, { day: 2, label: "T3" }, { day: 3, label: "T4" },
                        { day: 4, label: "T5" }, { day: 5, label: "T6" }, { day: 6, label: "T7" },
                        { day: 0, label: "CN" },
                      ].map(({ day, label }) => (
                        <button key={day} type="button" onClick={() => handleDayToggle(day)}
                          className={`flex-1 min-w-15 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            recurrenceDays.includes(day)
                              ? "bg-red-600 text-white shadow-md scale-105"
                              : "bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50"
                          }`}
                        >{label}</button>
                      ))}
                    </div>
                    {errors.recurrenceDays && <p className="text-sm text-red-600 font-medium">{errors.recurrenceDays.message}</p>}
                  </div>

                  <Input
                    label="Ngày kết thúc lặp lại"
                    type="date"
                    {...register("recurrenceEndDate", { setValueAs: (v) => (v ? new Date(v) : undefined) })}
                    className="bg-white"
                    isInvalid={!!errors.recurrenceEndDate}
                    errorMessage={errors.recurrenceEndDate?.message}
                  />

                  {recurrenceDescription && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">📅 {recurrenceDescription.text}</p>
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
                      <path fill="#4285F4" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">Đồng bộ Google Calendar</p>
                    <p className="text-sm text-gray-600">Tự động thêm vào lịch có nhãn</p>
                  </div>
                </div>
                <Switch isSelected={watch("syncToGoogle")} onValueChange={(val) => setValue("syncToGoogle", val)} />
              </div>
            </div>
          </form>
    </CModal>
  )
}
