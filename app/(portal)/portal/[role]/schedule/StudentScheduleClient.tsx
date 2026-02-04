"use client"

import { useState, useMemo } from "react"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Video,
  Clock,
  User,
} from "lucide-react"
import { PageHeader, Card, EmptyState } from "@/app/components/portal/shared"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ScheduleData {
  id: string
  title: string
  startTime: Date
  endTime: Date
  location?: string | null
  meetingLink?: string | null
  class: {
    className: string
    classCode: string
  }
  teacher: {
    name: string
    fullName?: string | null
  }
}

interface StudentScheduleClientProps {
  schedules: ScheduleData[]
}

export default function StudentScheduleClient({ schedules }: StudentScheduleClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const schedulesForDate = (date: Date) =>
    schedules.filter((s) => isSameDay(new Date(s.startTime), date))

  const selectedSchedules = schedulesForDate(selectedDate)

  const upcomingSchedules = useMemo(() => {
    const now = new Date()
    return schedules
      .filter((s) => new Date(s.startTime) >= now)
      .slice(0, 5)
  }, [schedules])

  const hasScheduleOnDay = (day: Date) =>
    schedules.some((s) => isSameDay(new Date(s.startTime), day))

  return (
    <div>
      <PageHeader
        title="Lịch học"
        subtitle="Xem lịch học các lớp của bạn"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card padding="none">
            {/* Calendar Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-lg">
                {format(currentMonth, "MMMM yyyy", { locale: vi })}
              </h3>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const hasSchedule = hasScheduleOnDay(day)
                const isSelected = isSameDay(day, selectedDate)

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-2 flex flex-col items-center justify-center relative border-b border-r border-gray-100 hover:bg-gray-50 transition",
                      !isSameMonth(day, currentMonth) && "text-gray-300",
                      isToday(day) && "bg-red-50",
                      isSelected && "bg-red-600 text-white hover:bg-red-700"
                    )}
                  >
                    <span className={cn("text-sm", isSelected && "font-bold")}>
                      {format(day, "d")}
                    </span>
                    {hasSchedule && !isSelected && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Selected Date Schedules */}
          <Card className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold">
                {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
              </h3>
            </div>

            {selectedSchedules.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Không có lịch học"
                description="Không có buổi học nào vào ngày này"
              />
            ) : (
              <div className="space-y-3">
                {selectedSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 border border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50/30 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {schedule.title}
                        </h4>
                        <p className="text-sm text-red-600">
                          {schedule.class.className}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {format(new Date(schedule.startTime), "HH:mm")} -{" "}
                        {format(new Date(schedule.endTime), "HH:mm")}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{schedule.teacher.fullName || schedule.teacher.name || "Giáo viên"}</span>
                      </div>
                      {schedule.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{schedule.location}</span>
                        </div>
                      )}
                      {schedule.meetingLink && (
                        <a
                          href={schedule.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-red-600 hover:underline"
                        >
                          <Video className="w-4 h-4" />
                          <span>Tham gia online</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Upcoming */}
        <div>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold">Sắp tới</h3>
            </div>

            {upcomingSchedules.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Không có lịch học"
                description="Bạn chưa có lịch học nào sắp tới"
              />
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => setSelectedDate(new Date(schedule.startTime))}
                    className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {schedule.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {schedule.class.className}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(schedule.startTime), "dd/MM - HH:mm", {
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
