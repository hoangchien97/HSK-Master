import { ScheduleStatus, EventState } from "@/enums/portal";

export interface ISchedule {
  id: string;
  classId?: string;
  teacherId?: string;
  title: string;
  description?: string | null;
  startTime: Date | string;
  endTime: Date | string;
  location?: string | null;
  meetingLink?: string | null;
  status: ScheduleStatus | string;
  googleEventId?: string | null;
  syncedToGoogle?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  class?: {
    id: string;
    className: string;
    classCode: string;
    level?: string | null;
    maxStudents?: number;
  };
}

export interface IRecurrence {
  interval: number;
  weekdays: number[];
  endDate: string;
}

export interface ICreateScheduleData {
  classId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingLink?: string;
  recurrence?: IRecurrence;
  syncToGoogle?: boolean;
}

export interface IUpdateScheduleData {
  classId?: string;
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  meetingLink?: string;
  status?: ScheduleStatus;
  syncToGoogle?: boolean;
}

export interface IScheduleFormData {
  classId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingLink?: string;
  recurrence?: IRecurrence;
  syncToGoogle?: boolean;
}

/** Calendar event format */
export interface ICalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  resource?: {
    scheduleId: string;
    status: ScheduleStatus;
    state: EventState;
    classId: string;
    className: string;
    level?: string;
    syncedToGoogle: boolean;
  };
}
