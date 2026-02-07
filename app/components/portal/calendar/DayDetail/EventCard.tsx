"use client"

import { Clock, MapPin, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar"
import { EventState } from "@/app/interfaces/portal/calendar"
import { getEventStateColor, formatEventTime } from "@/app/utils/calendar"

interface EventCardProps {
  event: ScheduleEvent
  state: EventState
  onClick: () => void
}

export default function EventCard({ event, state, onClick }: EventCardProps) {
  const colors = getEventStateColor(state)

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all hover:shadow-md",
        colors.bg,
        colors.border,
        "hover:border-gray-400"
      )}
    >
      {/* Title & Class */}
      <div className="mb-2">
        <h4 className={cn("font-semibold text-sm mb-1", colors.text)}>
          {event.title}
        </h4>
        {event.class && (
          <p className="text-xs text-gray-600">
            {event.class.className} ({event.class.classCode})
          </p>
        )}
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-600">
        <Clock className="h-3.5 w-3.5" />
        <span>{formatEventTime(new Date(event.startTime), new Date(event.endTime))}</span>
      </div>

      {/* Location & Meeting Link */}
      <div className="space-y-1">
        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        {event.meetingLink && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <Video className="h-3.5 w-3.5" />
            <span className="truncate">Link họp</span>
          </div>
        )}
      </div>

      {/* Google Sync Indicator */}
      {event.syncedToGoogle && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="h-3 w-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.46 12c0-.77-.07-1.52-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
            </svg>
            Đã đồng bộ Google Calendar
          </span>
        </div>
      )}
    </button>
  )
}
