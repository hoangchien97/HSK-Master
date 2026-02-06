"use client"

import { cn } from "@/lib/utils"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar.types"
import { EventState } from "@/app/interfaces/portal/calendar.types"
import { getEventStateColor } from "@/app/utils/calendar"
import EventCard from "./EventCard"

interface EventGroupProps {
  title: string
  count: number
  state: EventState
  events: ScheduleEvent[]
  onEventClick: (eventId: string) => void
}

export default function EventGroup({ title, count, state, events, onEventClick }: EventGroupProps) {
  const colors = getEventStateColor(state)

  return (
    <div>
      {/* Group Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", colors.badge)}>
          {count}
        </span>
      </div>

      {/* Event Cards */}
      <div className="space-y-2">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            state={state}
            onClick={() => onEventClick(event.id)}
          />
        ))}
      </div>
    </div>
  )
}
