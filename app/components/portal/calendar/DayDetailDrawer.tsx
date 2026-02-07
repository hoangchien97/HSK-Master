"use client"

import { useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@heroui/react"
import { Calendar, Plus } from "lucide-react"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar"
import { EventState } from "@/app/interfaces/portal/calendar"
import { getEventState } from "@/app/utils/calendar"
import EventGroup from "./DayDetail/EventGroup"
import { CDrawer } from "@/app/components/portal/common";

interface DayDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  events: ScheduleEvent[]
  onEventClick: (eventId: string) => void
  onCreateClick: (date: Date) => void
}

interface EventsByState {
  [EventState.PAST]: ScheduleEvent[]
  [EventState.UPCOMING]: ScheduleEvent[]
  [EventState.FUTURE]: ScheduleEvent[]
}

export default function DayDetailDrawer({
  open,
  onOpenChange,
  date,
  events,
  onEventClick,
  onCreateClick,
}: DayDetailDrawerProps) {
  // Filter events for selected date and group by state
  const { eventsByState, totalCount } = useMemo(() => {
    if (!date) {
      return { eventsByState: { [EventState.PAST]: [], [EventState.UPCOMING]: [], [EventState.FUTURE]: [] }, totalCount: 0 }
    }

    const dayEvents = events.filter(event =>
      isSameDay(new Date(event.startTime), date)
    )

    const grouped: EventsByState = {
      [EventState.PAST]: [],
      [EventState.UPCOMING]: [],
      [EventState.FUTURE]: [],
    }

    dayEvents.forEach(event => {
      const state = getEventState(new Date(event.startTime), new Date(event.endTime))
      grouped[state].push(event)
    })

    // Sort events by time within each group
    Object.keys(grouped).forEach(key => {
      grouped[key as EventState].sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
    })

    return {
      eventsByState: grouped,
      totalCount: dayEvents.length,
    }
  }, [date, events])

  const handleCreateClick = () => {
    if (date) {
      onCreateClick(date)
      onOpenChange(false)
    }
  }

  if (!date) return null

  return (
    <CDrawer
      isOpen={open}
      onOpenChange={onOpenChange}
      placement="right"
      size="md"
      title={
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">
            {format(date, "EEEE, d MMMM yyyy", { locale: vi })}
          </h3>
          <p className="text-sm text-gray-600">
            {totalCount === 0
              ? "Không có lịch dạy"
              : `${totalCount} lịch dạy trong ngày`}
          </p>
        </div>
      }
      footer={
        (onClose) => (
          <Button
            onPress={handleCreateClick}
            className="w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm lịch học mới
          </Button>
        )
      }
    >
      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Calendar className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">Không có lịch dạy</p>
          <p className="text-sm">Nhấn nút trên để tạo lịch mới</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* UPCOMING Events */}
          {eventsByState[EventState.UPCOMING].length > 0 && (
            <EventGroup
              title="Sắp diễn ra"
              count={eventsByState[EventState.UPCOMING].length}
              state={EventState.UPCOMING}
              events={eventsByState[EventState.UPCOMING]}
              onEventClick={onEventClick}
            />
          )}

          {/* FUTURE Events */}
          {eventsByState[EventState.FUTURE].length > 0 && (
            <EventGroup
              title="Trong tương lai"
              count={eventsByState[EventState.FUTURE].length}
              state={EventState.FUTURE}
              events={eventsByState[EventState.FUTURE]}
              onEventClick={onEventClick}
            />
          )}

          {/* PAST Events */}
          {eventsByState[EventState.PAST].length > 0 && (
            <EventGroup
              title="Đã qua"
              count={eventsByState[EventState.PAST].length}
              state={EventState.PAST}
              events={eventsByState[EventState.PAST]}
              onEventClick={onEventClick}
            />
          )}
        </div>
      )}
    </CDrawer>
  )
}
