import { EventState, type ScheduleEvent, type RecurrenceDescription } from "@/app/interfaces/portal/calendar"
import { addDays, format, isAfter, isBefore, differenceInDays, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"

/**
 * Determine event state based on current time
 * UPCOMING: Event is happening today (same day)
 * PAST: Event has ended
 * FUTURE: Event is in the future but not today
 */
export function getEventState(startTime: Date, endTime: Date): EventState {
  const now = new Date()

  // Check if event has ended
  if (isAfter(now, endTime)) {
    return EventState.PAST
  }

  // Check if event is happening today (same day as now)
  if (isSameDay(startTime, now)) {
    return EventState.UPCOMING
  }

  // Event is in the future but not today
  return EventState.FUTURE
}

/**
 * Get event state color classes
 */
export function getEventStateColor(state: EventState): {
  bg: string
  text: string
  border: string
  badge: string
} {
  switch (state) {
    case EventState.PAST:
      return {
        bg: "bg-[#F3F4F6]",
        text: "text-[#9CA3AF]",
        border: "border-gray-200",
        badge: "bg-[#F3F4F6] text-[#9CA3AF]"
      }
    case EventState.UPCOMING:
      return {
        bg: "bg-[#FEF3C7]",
        text: "text-[#92400E]",
        border: "border-amber-200",
        badge: "bg-[#FEF3C7] text-[#92400E]"
      }
    case EventState.FUTURE:
      return {
        bg: "bg-[#ECFEFF]",
        text: "text-[#065F46]",
        border: "border-teal-200",
        badge: "bg-[#ECFEFF] text-[#065F46]"
      }
  }
}

/**
 * Get event state label
 */
export function getEventStateLabel(state: EventState): string {
  switch (state) {
    case EventState.PAST:
      return "Đã qua"
    case EventState.UPCOMING:
      return "Sắp diễn ra"
    case EventState.FUTURE:
      return "Tương lai"
  }
}

/**
 * Format time range
 */
export function formatTimeRange(startTime: Date, endTime: Date): string {
  return `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatStr: string = "EEEE, dd/MM/yyyy"): string {
  return format(date, formatStr, { locale: vi })
}

/**
 * Format event time range
 */
export function formatEventTime(startTime: Date, endTime: Date): string {
  return `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`
}

/**
 * Get day name in Vietnamese
 */
export function getDayName(dayNumber: number): string {
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
  return days[dayNumber] || ""
}

/**
 * Create recurrence description
 */
export function createRecurrenceDescription(
  days: number[],
  endDate: Date
): RecurrenceDescription {
  const dayNames = days.map(d => getDayName(d)).join(", ")
  const endDateText = format(endDate, "dd/MM/yyyy")
  const text = `Lặp lại vào ${dayNames} cho đến ${endDateText}`

  return {
    text,
    daysText: dayNames,
    endDateText
  }
}

/**
 * Generate recurring events
 */
export function generateRecurringEvents(
  baseEvent: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
    location?: string
    meetingLink?: string
    classId: string
    teacherId: string
  },
  days: number[],
  endDate: Date
): Array<Omit<typeof baseEvent, 'startTime' | 'endTime'> & { startTime: Date; endTime: Date }> {
  const events: Array<typeof baseEvent> = []
  const duration = differenceInDays(baseEvent.endTime, baseEvent.startTime)

  let currentDate = baseEvent.startTime

  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    const dayOfWeek = currentDate.getDay()

    if (days.includes(dayOfWeek)) {
      events.push({
        ...baseEvent,
        startTime: new Date(currentDate),
        endTime: addDays(new Date(currentDate), duration)
      })
    }

    currentDate = addDays(currentDate, 1)
  }

  return events
}

/**
 * Group events by state
 */
export function groupEventsByState(events: ScheduleEvent[]): {
  past: ScheduleEvent[]
  upcoming: ScheduleEvent[]
  future: ScheduleEvent[]
} {
  return events.reduce(
    (acc, event) => {
      const state = getEventState(event.startTime, event.endTime)
      acc[state.toLowerCase() as 'past' | 'upcoming' | 'future'].push(event)
      return acc
    },
    { past: [], upcoming: [], future: [] } as {
      past: ScheduleEvent[]
      upcoming: ScheduleEvent[]
      future: ScheduleEvent[]
    }
  )
}

/**
 * Convert ScheduleEvent to react-big-calendar Event format
 */
export function toBigCalendarEvent(event: ScheduleEvent): {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    scheduleId: string
    status: string
    state: EventState
    classId: string
    className?: string
    level?: string
    description?: string
    location?: string
    meetingLink?: string
    syncedToGoogle: boolean
  }
} {
  const state = getEventState(event.startTime, event.endTime)

  return {
    id: event.id,
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    resource: {
      scheduleId: event.id,
      status: event.status,
      state,
      classId: event.classId,
      className: event.class?.className,
      level: event.class?.level,
      description: event.description,
      location: event.location,
      meetingLink: event.meetingLink,
      syncedToGoogle: event.syncedToGoogle
    }
  }
}
