"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Video,
} from "lucide-react"
import { PageHeader, Card, ScheduleList, EmptyState } from "@/app/components/portal/shared"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ClassInfo {
  id: string
  className: string
  classCode: string
}

interface ScheduleData {
  id: string
  title: string
  description?: string | null
  startTime: Date
  endTime: Date
  location?: string | null
  meetingLink?: string | null
  status: string
  class: ClassInfo
}

interface ScheduleClientProps {
  schedules: ScheduleData[]
  classes: ClassInfo[]
}

export default function ScheduleClient({ schedules, classes }: ScheduleClientProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "list">("month")
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Get calendar days for current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = startDate
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentDate])

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) =>
      isSameDay(new Date(schedule.startTime), date)
    )
  }

  // Get selected date schedules
  const selectedDateSchedules = selectedDate
    ? getSchedulesForDate(selectedDate)
    : []

  // Map schedules to ScheduleList format
  const mappedSchedules = selectedDateSchedules.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.class.className,
    startTime: new Date(s.startTime),
    endTime: new Date(s.endTime),
    location: s.location || undefined,
    status: s.status === "COMPLETED"
      ? "completed" as const
      : s.status === "CANCELLED"
      ? "cancelled" as const
      : new Date(s.startTime) > new Date()
      ? "upcoming" as const
      : "ongoing" as const,
  }))

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

  return (
    <div>
      <PageHeader
        title="Lịch giảng dạy"
        subtitle="Quản lý lịch dạy và các buổi học"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("month")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition",
                  viewMode === "month"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Tháng
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition",
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Danh sách
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Thêm lịch
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card padding="none" className="lg:col-span-2">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(currentDate, "MMMM yyyy", { locale: vi })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Hôm nay
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const daySchedules = getSchedulesForDate(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isCurrentMonth = isSameMonth(day, currentDate)

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[80px] md:min-h-[100px] p-2 border-b border-r border-gray-100 text-left transition hover:bg-gray-50",
                    !isCurrentMonth && "bg-gray-50",
                    isSelected && "bg-red-50 hover:bg-red-50"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                      isToday(day) && "bg-red-600 text-white",
                      !isToday(day) && isCurrentMonth && "text-gray-900",
                      !isToday(day) && !isCurrentMonth && "text-gray-400"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {daySchedules.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {daySchedules.slice(0, 2).map((schedule) => (
                        <div
                          key={schedule.id}
                          className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded truncate"
                        >
                          {format(new Date(schedule.startTime), "HH:mm")} -{" "}
                          {schedule.class.classCode}
                        </div>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-500 px-1.5">
                          +{daySchedules.length - 2} khác
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Selected date details */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">
              {selectedDate
                ? format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })
                : "Chọn ngày để xem chi tiết"}
            </h3>
          </div>

          {selectedDate ? (
            <ScheduleList
              items={mappedSchedules}
              emptyMessage="Không có lịch nào trong ngày này"
            />
          ) : (
            <EmptyState
              icon={CalendarIcon}
              title="Chọn một ngày"
              description="Nhấp vào ngày trong lịch để xem chi tiết"
            />
          )}

          {selectedDate && selectedDateSchedules.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Chi tiết buổi học</h4>
              {selectedDateSchedules.map((schedule) => (
                <div key={schedule.id} className="space-y-2 text-sm">
                  {schedule.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{schedule.location}</span>
                    </div>
                  )}
                  {schedule.meetingLink && (
                    <a
                      href={schedule.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Video className="w-4 h-4" />
                      <span>Tham gia online</span>
                    </a>
                  )}
                  {schedule.description && (
                    <p className="text-gray-500 mt-2">{schedule.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <CreateScheduleModal
          classes={classes}
          selectedDate={selectedDate}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}

function CreateScheduleModal({
  classes,
  selectedDate,
  onClose,
}: {
  classes: ClassInfo[]
  selectedDate: Date | null
  onClose: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: classes[0]?.id || "",
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    startTime: "09:00",
    endTime: "10:30",
    location: "",
    meetingLink: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`)

      const response = await fetch("/api/portal/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      })

      if (response.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error("Error creating schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Thêm lịch giảng dạy</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề buổi học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Bài 5: Ngữ pháp cơ bản"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lớp học <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa điểm
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Phòng 301 hoặc Online"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link học online
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Ghi chú cho buổi học..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Thêm lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
