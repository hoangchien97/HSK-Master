"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import {
  BigCalendarView,
  EventDetailDrawer,
} from "@/components/portal/calendar"
import { fetchSchedules } from "@/actions/schedule.actions"
import { usePortalUI } from "@/providers/portal-ui-provider"
import type { ISchedule } from "@/interfaces/portal"

export default function StudentScheduleView() {
  const [schedules, setSchedules] = useState<ISchedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<ISchedule | null>(null)
  const { startLoading, stopLoading } = usePortalUI()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      startLoading()
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
      stopLoading()
    }
  }

  const handleEventClick = (schedule: ISchedule) => {
    setSelectedSchedule(schedule)
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Calendar — read-only (no create/edit/slot handlers) */}
      <BigCalendarView
        schedules={schedules}
        onEventClick={handleEventClick}
        onEventDoubleClick={handleEventClick}
        onEditEvent={handleEventClick}
        onCreateSchedule={() => {}}
        readOnly
      />

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
