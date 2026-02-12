// Calendar & Schedule Types
export interface ScheduleEvent {
  id: string
  classId: string
  teacherId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  meetingLink?: string
  status: ScheduleStatus
  googleEventId?: string
  syncedToGoogle: boolean
  createdAt: Date
  updatedAt: Date

  // Populated fields
  class?: {
    id: string
    className: string
    classCode: string
    level?: string
    enrollments?: {
      id: string
      student: {
        id: string
        name: string
        image?: string
      }
    }[]
  }
}

export type ScheduleStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED"

export enum EventState {
  PAST = "PAST",
  UPCOMING = "UPCOMING",
  FUTURE = "FUTURE"
}

export interface CreateScheduleInput {
  classId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  meetingLink?: string
  syncToGoogle?: boolean

  // Recurrence fields
  isRecurring?: boolean
  recurrenceDays?: number[] // 0=Sunday, 1=Monday, ... 6=Saturday
  recurrenceEndDate?: Date
}

export interface UpdateScheduleInput {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  location?: string
  meetingLink?: string
  status?: ScheduleStatus
  syncToGoogle?: boolean
}

export interface DayDetail {
  date: Date
  events: ScheduleEvent[]
  pastCount: number
  upcomingCount: number
  futureCount: number
}

export interface CalendarView {
  mode: "day" | "week" | "month"
  currentDate: Date
}

// react-big-calendar event format
export interface BigCalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: {
    scheduleId: string
    status: ScheduleStatus
    state: EventState
    classId: string
    className?: string
    level?: string
    description?: string
    location?: string
    meetingLink?: string
    syncedToGoogle: boolean
  }
}

// Recurrence helper types
export interface RecurrenceRule {
  days: number[]
  endDate: Date
}

export interface RecurrenceDescription {
  text: string // e.g., "Lặp lại vào Thứ 2, Thứ 4, Thứ 6 cho đến 31/12/2026"
  daysText: string // e.g., "Thứ 2, Thứ 4, Thứ 6"
  endDateText: string // e.g., "31/12/2026"
}
