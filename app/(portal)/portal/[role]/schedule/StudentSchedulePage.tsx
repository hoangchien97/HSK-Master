"use client"

import { useState, useEffect } from "react"
import CalendarHeader from "@/app/components/portal/calendar/CalendarHeader"
import ScheduleCalendar from "@/app/components/portal/calendar/ScheduleCalendar"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar.types"
import { toast } from "react-toastify"

export default function StudentSchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("week")

  // Fetch events (student's enrolled classes only)
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/portal/schedules")
      if (!response.ok) throw new Error("Failed to fetch schedules")

      const data = await response.json()

      // Convert date strings to Date objects
      const schedules: ScheduleEvent[] = data.map((schedule: any) => ({
        ...schedule,
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        createdAt: new Date(schedule.createdAt),
        updatedAt: new Date(schedule.updatedAt),
      }))

      setEvents(schedules)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast.error("Không thể tải lịch học")
    } finally {
      setLoading(false)
    }
  }

  // Handle event click - show read-only details
  const handleEventClick = (eventId: string) => {
    console.log("View event details:", eventId)
    // TODO: Show event detail drawer (read-only)
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Filter events by search query
  const filteredEvents = searchQuery
    ? events.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.class?.className.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch học...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <CalendarHeader
        onSearch={handleSearch}
        onViewChange={setCurrentView}
        currentView={currentView}
        isReadOnly={true}
      />

      {/* Calendar */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full overflow-hidden">
          <ScheduleCalendar
            events={filteredEvents}
            onEventClick={handleEventClick}
            isReadOnly={true}
          />
        </div>
      </div>

      {/* TODO: Add read-only event detail drawer */}
    </div>
  )
}
