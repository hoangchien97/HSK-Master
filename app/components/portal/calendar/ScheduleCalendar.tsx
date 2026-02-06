"use client"

import { useEffect, useState, useCallback } from "react"
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react"
import {
  createCalendar,
  viewDay,
  viewWeek,
  viewMonthGrid,
} from "@schedule-x/calendar"
import { createEventsServicePlugin } from "@schedule-x/events-service"
import "@schedule-x/theme-default/dist/index.css"
import "@/app/embla.css"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar.types"
import { EventState } from "@/app/interfaces/portal/calendar.types"
import { toScheduleXEvent, getEventState } from "@/app/utils/calendar"

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
  const [eventsServicePlugin] = useState(() => createEventsServicePlugin())

  const calendar = useCalendarApp({
    views: [viewDay, viewWeek, viewMonthGrid],
    defaultView: viewWeek.name,
    locale: "vi-VN",
    firstDayOfWeek: 1, // Monday
    dayBoundaries: {
      start: "07:00",
      end: "21:00",
    },
    weekOptions: {
      gridHeight: 800,
      nDays: 7,
    },
    calendars: {
      [EventState.PAST]: {
        colorName: EventState.PAST.toLowerCase(),
        lightColors: {
          main: "#9ca3af",
          container: "#f3f4f6",
          onContainer: "#4b5563",
        },
        darkColors: {
          main: "#6b7280",
          onContainer: "#f9fafb",
          container: "#1f2937",
        },
      },
      [EventState.UPCOMING]: {
        colorName: EventState.UPCOMING.toLowerCase(),
        lightColors: {
          main: "#dc2626",
          container: "#fee2e2",
          onContainer: "#7f1d1d",
        },
        darkColors: {
          main: "#ef4444",
          onContainer: "#fef2f2",
          container: "#7f1d1d",
        },
      },
      [EventState.FUTURE]: {
        colorName: EventState.FUTURE.toLowerCase(),
        lightColors: {
          main: "#f59e0b",
          container: "#fef3c7",
          onContainer: "#78350f",
        },
        darkColors: {
          main: "#fbbf24",
          onContainer: "#fefce8",
          container: "#78350f",
        },
      },
    },
    plugins: [eventsServicePlugin],
    callbacks: {
      onEventClick(calendarEvent) {
        if (onEventClick && calendarEvent.id) {
          onEventClick(calendarEvent.id)
        }
      },
      onEventUpdate(updatedEvent) {
        if (isReadOnly) return
        // Handle drag & drop update
        console.log("Event updated:", updatedEvent)
      },
      onDoubleClickEvent(calendarEvent) {
        if (onEventDoubleClick && calendarEvent.id) {
          onEventDoubleClick(calendarEvent.id)
        }
      },
      onDoubleClickDateTime(dateTime) {
        if (onEmptySlotDoubleClick) {
          onEmptySlotDoubleClick(new Date(dateTime))
        }
      },
      onClickDate(date) {
        if (onDateClick) {
          onDateClick(new Date(date))
        }
      },
    },
  })

  // Update events when prop changes
  useEffect(() => {
    if (!eventsServicePlugin) return

    console.log("📅 ScheduleCalendar received events:", events)
    const scheduleXEvents = events.map(toScheduleXEvent)
    console.log("📅 Converted to Schedule-X format:", scheduleXEvents)
    eventsServicePlugin.set(scheduleXEvents)
  }, [events, eventsServicePlugin])

  return (
    <div className="w-full h-full">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}
