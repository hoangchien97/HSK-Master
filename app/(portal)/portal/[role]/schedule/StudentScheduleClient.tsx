"use client"

import { useState, useMemo } from "react"
import {
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

interface StudentScheduleClientProps {
  schedules: ScheduleData[]
}

export default function StudentScheduleClient({ schedules }: StudentScheduleClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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
        title="Lịch học"
        subtitle="Xem lịch học các lớp của bạn"
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
                <div key={schedule.id} className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="font-medium text-gray-900">{schedule.title}</div>
                  <div className="text-gray-600">{schedule.class.className}</div>
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
    </div>
  )
}
