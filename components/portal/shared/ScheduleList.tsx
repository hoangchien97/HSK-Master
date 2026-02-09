"use client"

import { cn } from "@/lib/utils"
import { ScheduleItem } from "./ScheduleItem"

interface ScheduleListProps {
  items: Array<{
    id: string
    title: string
    subtitle?: string
    startTime: Date
    endTime?: Date
    location?: string
    status?: "upcoming" | "ongoing" | "completed" | "cancelled"
  }>
  emptyMessage?: string
  className?: string
}

export function ScheduleList({
  items,
  emptyMessage = "Không có lịch học nào",
  className,
}: ScheduleListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <ScheduleItem key={item.id} {...item} />
      ))}
    </div>
  )
}
