import { ScheduleStatus } from "@/enums/portal"

// Calendar & Schedule Types
export interface ScheduleEvent {
  id: string
  classId: string
  seriesId?: string | null
  teacherId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  meetingLink?: string
  status: ScheduleStatus | string
  googleEventId?: string
  syncedToGoogle: boolean
  isRecurring?: boolean
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

export enum EventState {
  PAST = "PAST",
  UPCOMING = "UPCOMING",
  FUTURE = "FUTURE"
}

export interface RecurrenceDescription {
  text: string // e.g., "Lặp lại vào Thứ 2, Thứ 4, Thứ 6 cho đến 31/12/2026"
  daysText: string // e.g., "Thứ 2, Thứ 4, Thứ 6"
  endDateText: string // e.g., "31/12/2026"
}
