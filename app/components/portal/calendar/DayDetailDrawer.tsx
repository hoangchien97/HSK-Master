"use client"

import { useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer"
import Button from "@/app/components/common/Button"
import { Calendar, Plus, X } from "lucide-react"
import type { ScheduleEvent, EventState } from "@/app/interfaces/portal/calendar.types"
import { getEventState } from "@/app/utils/calendar"
import { cn } from "@/lib/utils"
import EventGroup from "./DayDetail/EventGroup"

interface DayDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  events: ScheduleEvent[]
  onEventClick: (eventId: string) => void
  onCreateClick: (date: Date) => void
}

interface EventsByState {
  PAST: ScheduleEvent[]
  UPCOMING: ScheduleEvent[]
  FUTURE: ScheduleEvent[]
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
      return { eventsByState: { PAST: [], UPCOMING: [], FUTURE: [] }, totalCount: 0 }
    }

    const dayEvents = events.filter(event =>
      isSameDay(new Date(event.startTime), date)
    )

    const grouped: EventsByState = {
      PAST: [],
      UPCOMING: [],
      FUTURE: [],
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
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 w-full max-w-md rounded-none border-l">
        {/* Header */}
        <DrawerHeader className="border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold">
                {format(date, "EEEE, d MMMM yyyy", { locale: vi })}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-gray-600">
                {totalCount === 0
                  ? "Không có lịch dạy"
                  : `${totalCount} lịch dạy trong ngày`}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>

          {/* Create button */}
          <Button
            onClick={handleCreateClick}
            className="w-full mt-4 bg-red-600 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm lịch học mới
          </Button>
        </DrawerHeader>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto p-4">
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Calendar className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Không có lịch dạy</p>
              <p className="text-sm">Nhấn nút trên để tạo lịch mới</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* UPCOMING Events */}
              {eventsByState.UPCOMING.length > 0 && (
                <EventGroup
                  title="Sắp diễn ra"
                  count={eventsByState.UPCOMING.length}
                  state="UPCOMING"
                  events={eventsByState.UPCOMING}
                  onEventClick={onEventClick}
                />
              )}

              {/* FUTURE Events */}
              {eventsByState.FUTURE.length > 0 && (
                <EventGroup
                  title="Trong tương lai"
                  count={eventsByState.FUTURE.length}
                  state="FUTURE"
                  events={eventsByState.FUTURE}
                  onEventClick={onEventClick}
                />
              )}

              {/* PAST Events */}
              {eventsByState.PAST.length > 0 && (
                <EventGroup
                  title="Đã qua"
                  count={eventsByState.PAST.length}
                  state="PAST"
                  events={eventsByState.PAST}
                  onEventClick={onEventClick}
                />
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
