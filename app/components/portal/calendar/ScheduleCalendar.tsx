"use client"

import { useMemo, useCallback } from "react"
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { vi } from "date-fns/locale"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar"
import { EventState } from "@/app/interfaces/portal/calendar"
import { getEventState } from "@/app/utils/calendar"

const locales = { vi }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

interface BigCalEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: { state: EventState; event: ScheduleEvent }
}

interface ScheduleCalendarProps {
  events: ScheduleEvent[]
  onEventClick?: (eventId: string) => void
  onDateClick?: (date: Date) => void
  onEmptySlotDoubleClick?: (date: Date) => void
  onEventDoubleClick?: (eventId: string) => void
  isReadOnly?: boolean
}

export default function ScheduleCalendar({
  events,
  onEventClick,
  onDateClick,
  onEmptySlotDoubleClick,
  onEventDoubleClick,
  isReadOnly = false,
}: ScheduleCalendarProps) {
  const calendarEvents: BigCalEvent[] = useMemo(
    () =>
      events.map((ev) => {
        const start = new Date(ev.startTime)
        const end = new Date(ev.endTime)
        return {
          id: ev.id,
          title: ev.title,
          start,
          end,
          resource: { state: getEventState(start, end), event: ev },
        }
      }),
    [events]
  )

  const eventPropGetter = useCallback((event: BigCalEvent) => {
    const state = event.resource.state
    let style: React.CSSProperties = {
      borderRadius: "6px",
      border: "none",
      fontSize: "0.8rem",
      padding: "2px 6px",
    }
    switch (state) {
      case EventState.UPCOMING:
        style = { ...style, backgroundColor: "#dc2626", color: "#fff" }
        break
      case EventState.FUTURE:
        style = { ...style, backgroundColor: "#f59e0b", color: "#78350f" }
        break
      case EventState.PAST:
        style = { ...style, backgroundColor: "#d1d5db", color: "#4b5563" }
        break
    }
    return { style }
  }, [])

  const handleSelectEvent = useCallback(
    (event: BigCalEvent) => onEventClick?.(event.id),
    [onEventClick]
  )

  const handleDoubleClickEvent = useCallback(
    (event: BigCalEvent) => onEventDoubleClick?.(event.id),
    [onEventDoubleClick]
  )

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date }) => {
      if (!isReadOnly) {
        onEmptySlotDoubleClick?.(slotInfo.start)
      }
    },
    [isReadOnly, onEmptySlotDoubleClick]
  )

  return (
    <div className="w-full h-full" style={{ minHeight: 600 }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        defaultView={Views.WEEK}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        onSelectEvent={handleSelectEvent}
        onDoubleClickEvent={handleDoubleClickEvent}
        onSelectSlot={handleSelectSlot}
        selectable={!isReadOnly}
        eventPropGetter={eventPropGetter}
        popup
        step={30}
        timeslots={2}
        min={new Date(1970, 0, 1, 7, 0, 0)}
        max={new Date(1970, 0, 1, 21, 0, 0)}
        style={{ height: 600 }}
        formats={{
          timeGutterFormat: (date: Date) => format(date, "HH:mm"),
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
        }}
        messages={{
          allDay: "Cả ngày",
          previous: "Trước",
          next: "Tiếp",
          today: "Hôm nay",
          month: "Tháng",
          week: "Tuần",
          day: "Ngày",
          agenda: "Lịch trình",
          noEventsInRange: "Không có sự kiện nào.",
          showMore: (total: number) => `+${total} thêm`,
        }}
      />
    </div>
  )
}
