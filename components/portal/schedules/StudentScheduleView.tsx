"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { CSpinner } from "@/components/portal/common"
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
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      {/* Calendar — wrapped in relative container for loading overlay */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {isPageLoading && (
          <CSpinner variant="overlay" />
        )}
        <BigCalendarView
          schedules={schedules}
          onEventClick={handleEventClick}
          onEventDoubleClick={handleEventClick}
          onEditEvent={handleEventClick}
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

