"use client"

import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ScheduleItemProps {
  title: string
  subtitle?: string
  startTime: Date
  endTime?: Date
  location?: string
  status?: "upcoming" | "ongoing" | "completed" | "cancelled"
  className?: string
}

export function ScheduleItem({
  title,
  subtitle,
  startTime,
  endTime,
  location,
  status = "upcoming",
  className,
}: ScheduleItemProps) {
  const statusColors = {
    upcoming: "border-l-blue-500 bg-blue-50/30",
    ongoing: "border-l-green-500 bg-green-50/30",
    completed: "border-l-gray-400 bg-gray-50/30",
    cancelled: "border-l-red-500 bg-red-50/30",
  }

  const statusBadges = {
    upcoming: { text: "Sắp tới", bg: "bg-blue-100 text-blue-700" },
    ongoing: { text: "Đang diễn ra", bg: "bg-green-100 text-green-700" },
    completed: { text: "Hoàn thành", bg: "bg-gray-100 text-gray-700" },
    cancelled: { text: "Đã hủy", bg: "bg-red-100 text-red-700" },
  }

  return (
    <div
      className={cn(
        "border-l-4 rounded-r-lg p-4",
        statusColors[status],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{title}</h4>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {format(startTime, "HH:mm", { locale: vi })}
              {endTime && ` - ${format(endTime, "HH:mm", { locale: vi })}`}
            </span>
            {location && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
            )}
          </div>
        </div>
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
            statusBadges[status].bg
          )}
        >
          {statusBadges[status].text}
        </span>
      </div>
    </div>
  )
}
