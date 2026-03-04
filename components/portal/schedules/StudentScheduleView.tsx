"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Spinner } from "@heroui/react"
import {
  BigCalendarView,
  EventDetailDrawer,
} from "@/components/portal/calendar"
import { fetchSchedules } from "@/actions/schedule.actions"
import type { ISchedule } from "@/interfaces/portal"

export default function StudentScheduleView() {
  const [schedules, setSchedules] = useState<ISchedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<ISchedule | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      setIsPageLoading(true)
      const result = await fetchSchedules()

      if (!result.success) {
        throw new Error(result.error || "Không thể tải lịch học")
      }

      setSchedules(result.schedules || [])
    } catch (error) {
      console.error("Error loading data:", error)
      const errorMessage = error instanceof Error ? error.message : "Không thể tải dữ liệu"
      toast.error(errorMessage)
    } finally {
      setIsPageLoading(false)
    }
  }

  const handleEventClick = (schedule: ISchedule) => {
    setSelectedSchedule(schedule)
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Calendar — wrapped in relative container for loading overlay */}
      <div className="relative flex-1 min-h-[400px]">
        {/* Inline pill loading — same style as CTable refetch pill */}
        {isPageLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-default-200">
              <Spinner size="sm" color="primary" classNames={{ wrapper: "w-4 h-4" }} />
              <span className="text-xs text-default-500 font-medium">Đang tải lịch học...</span>
            </div>
          </div>
        )}
        <BigCalendarView
          schedules={schedules}
          onEventClick={handleEventClick}
          onEventDoubleClick={handleEventClick}
          onEditEvent={handleEventClick}
          onCreateSchedule={() => {}}
          readOnly
        />
      </div>

      {/* Event Detail Drawer — view only (no edit/delete buttons) */}
      <EventDetailDrawer
        open={!!selectedSchedule}
        onOpenChange={(open) => !open && setSelectedSchedule(null)}
        eventId={selectedSchedule?.id || null}
        onEdit={() => {}}
        onDelete={() => {}}
        readOnly
      />
    </div>
  )
}

