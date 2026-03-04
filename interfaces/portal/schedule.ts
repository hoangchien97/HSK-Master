import { ScheduleStatus } from "@/enums/portal";

// ══════════════════════════════════════════════════════════════════
// V2: Repeat Rule
// ══════════════════════════════════════════════════════════════════

export interface RepeatRuleJson {
  freq: 'WEEKLY';
  byWeekDays: string[];    // ["MO","TU",...]
  untilDateLocal: string;  // "YYYY-MM-DD"
}

// ══════════════════════════════════════════════════════════════════
// V2: Schedule Series (template / recurring rule)
// ══════════════════════════════════════════════════════════════════

export interface IScheduleSeries {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  meetingLink?: string | null;
  timezone: string;
  startTimeLocal: string;  // "HH:mm"
  endTimeLocal: string;    // "HH:mm"
  startDateLocal: string;  // "YYYY-MM-DD"
  isRecurring: boolean;
  repeatRule?: RepeatRuleJson | null;
  isGoogleSynced: boolean;
  googleCalendarId?: string | null;
  googleEventId?: string | null;
  lastSyncError?: string | null;
  syncedAt?: Date | string | null;
  isDeleted: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  class?: {
    id: string;
    className: string;
    classCode: string;
    level?: string | null;
  };
  sessions?: ISchedule[];
}

// ══════════════════════════════════════════════════════════════════
// ISchedule — UI-facing session type
// Mapped from Schedule; keeps startTime/endTime names for
// backward compat with BigCalendarView, EventDetailDrawer, etc.
// ════════════════════════════════════════════════════════════════

export interface ISchedule {
  id: string;
  classId?: string;
  seriesId?: string | null;
  teacherId?: string;
  title: string;
  description?: string | null;
  startTime: Date | string;   // mapped from Schedule.startAt
  endTime: Date | string;     // mapped from Schedule.endAt
  location?: string | null;
  meetingLink?: string | null;
  status: ScheduleStatus | string;
  isOverride?: boolean;
  overrideType?: string | null;
  // From series (populated)
  isGoogleSynced?: boolean;
  syncedToGoogle?: boolean;    // alias
  googleEventId?: string | null;
  isRecurring?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  class?: {
    id: string;
    className: string;
    classCode: string;
    level?: string | null;
    enrollments?: Array<{
      id: string;
      student: { id: string; name: string; image?: string | null };
    }>;
  };
}

// ══════════════════════════════════════════════════════════════════
// Form Data (ScheduleModal → TeacherScheduleCalendar → Action)
// ══════════════════════════════════════════════════════════════════

export interface IScheduleFormData {
  classId: string;
  title: string;
  description?: string;
  startDate: string;      // "YYYY-MM-DD"
  startTime: string;      // "HH:mm"
  endTime: string;        // "HH:mm"
  location?: string;
  meetingLink?: string;
  isRecurring?: boolean;
  weekdays?: number[];    // JS weekday numbers [0..6]
  endDate?: string;       // "YYYY-MM-DD" recurrence end
  syncToGoogle?: boolean;
}

// ══════════════════════════════════════════════════════════════════
// Server DTOs (Action → Service)
// ══════════════════════════════════════════════════════════════════

export interface ICreateScheduleData {
  classId: string;
  title: string;
  description?: string;
  startDateLocal: string;  // "YYYY-MM-DD"
  startTimeLocal: string;  // "HH:mm"
  endTimeLocal: string;    // "HH:mm"
  location?: string;
  meetingLink?: string;
  isRecurring: boolean;
  repeatRule?: RepeatRuleJson;
  syncToGoogle?: boolean;
}

export interface IUpdateScheduleData {
  title?: string;
  description?: string;
  startDateLocal?: string;
  startTimeLocal?: string;
  endTimeLocal?: string;
  location?: string;
  meetingLink?: string;
}

// ══════════════════════════════════════════════════════════════════
// Calendar Event (for BigCalendar — kept for backward compat)
// ══════════════════════════════════════════════════════════════════

export interface ICalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  resource?: {
    scheduleId: string;
    seriesId?: string | null;
    status: ScheduleStatus | string;
    classId: string;
    className: string;
    level?: string;
    syncedToGoogle: boolean;
    isRecurring?: boolean;
  };
}
