import { EventState } from "@/interfaces/portal/calendar"
import { format, isAfter, isSameDay } from "date-fns"

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
 * Format event time range
 */
export function formatEventTime(startTime: Date, endTime: Date): string {
  return `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`
}
