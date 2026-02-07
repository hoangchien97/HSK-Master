"use client"

import { useState, useEffect } from "react"
import CalendarHeader from "@/app/components/portal/calendar/CalendarHeader"
import ScheduleCalendar from "@/app/components/portal/calendar/ScheduleCalendar"
import CreateScheduleModal from "@/app/components/portal/calendar/CreateScheduleModal"
import EditScheduleModal from "@/app/components/portal/calendar/EditScheduleModal"
import DayDetailDrawer from "@/app/components/portal/calendar/DayDetailDrawer"
import EventDetailDrawer from "@/app/components/portal/calendar/EventDetailDrawer"
import type { ScheduleEvent } from "@/app/interfaces/portal/calendar"
import { toast } from "react-toastify"

export default function TeacherSchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("week")

  // State for modals and drawers
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDayDrawer, setShowDayDrawer] = useState(false)
  const [showEventDrawer, setShowEventDrawer] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Fetch events
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/portal/schedules")
      if (!response.ok) throw new Error("Failed to fetch schedules")

      const data = await response.json()
      console.log("📅 Fetched schedules:", data)

      // Convert date strings to Date objects
      const schedules: ScheduleEvent[] = data.map((schedule: ScheduleEvent) => ({
        ...schedule,
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        createdAt: new Date(schedule.createdAt),
        updatedAt: new Date(schedule.updatedAt),
      }))

      console.log("✅ Converted schedules:", schedules)
      setEvents(schedules)
    } catch (error) {
      console.error("❌ Error fetching events:", error)
      toast.error("Không thể tải lịch dạy")
    } finally {
      setLoading(false)
    }
  }

  // Handle create event
  const handleCreateEvent = () => {
    setShowCreateModal(true)
  }

  // Handle event click (single click opens drawer)
  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId)
    setShowEventDrawer(true)
  }

  // Handle event double click (opens edit modal)
  const handleEventDoubleClick = (eventId: string) => {
    setSelectedEventId(eventId)
    setShowEditModal(true)
  }

  // Handle date click (opens day drawer)
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowDayDrawer(true)
  }

  // Handle empty slot double click
  const handleEmptySlotDoubleClick = (date: Date) => {
    setSelectedDate(date)
    setShowCreateModal(true)
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // TODO: Implement search filter
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
          <p className="text-gray-600">Đang tải lịch dạy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <CalendarHeader
        onCreateEvent={handleCreateEvent}
        onSearch={handleSearch}
        onViewChange={setCurrentView}
        currentView={currentView}
      />

      {/* Calendar */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full overflow-hidden">
          <ScheduleCalendar
            events={filteredEvents}
            onEventClick={handleEventClick}
            onEventDoubleClick={handleEventDoubleClick}
            onDateClick={handleDateClick}
            onEmptySlotDoubleClick={handleEmptySlotDoubleClick}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateScheduleModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedDate(null)
        }}
        onSuccess={fetchEvents}
        defaultDate={selectedDate}
      />

      <EditScheduleModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedEventId(null)
        }}
        onSuccess={fetchEvents}
        eventId={selectedEventId}
      />

      {/* Drawers */}
      <DayDetailDrawer
        open={showDayDrawer}
        onOpenChange={(open) => {
          setShowDayDrawer(open)
          if (!open) setSelectedDate(null)
        }}
        date={selectedDate}
        events={filteredEvents}
        onEventClick={handleEventClick}
        onCreateClick={(date) => {
          setSelectedDate(date)
          setShowCreateModal(true)
        }}
      />

      <EventDetailDrawer
        open={showEventDrawer}
        onOpenChange={(open) => {
          setShowEventDrawer(open)
          if (!open) setSelectedEventId(null)
        }}
        eventId={selectedEventId}
        onEdit={(eventId) => {
          setShowEventDrawer(false)
          setSelectedEventId(eventId)
          setShowEditModal(true)
        }}
        onDelete={() => {
          fetchEvents()
        }}
      />
    </div>
  )
}
