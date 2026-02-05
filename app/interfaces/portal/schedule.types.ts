/**
 * Schedule-related Type Definitions
 */

export interface ISchedule {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  class: {
    id: string;
    name: string;
    code: string;
    level: string;
  };
  syncedToGoogle?: boolean;
  googleEventId?: string;
}

export interface IClass {
  id: string;
  name: string;
  code: string;
  level: string;
  status: string;
}

export interface ICreateScheduleData {
  classId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  recurrence?: IRecurrence;
  syncToGoogle?: boolean;
}

export interface IUpdateScheduleData {
  classId?: string;
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  syncToGoogle?: boolean;
}

export interface IRecurrence {
  interval: number;
  weekdays: number[];
  endDate: string;
}

export interface IScheduleFormData {
  classId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  recurrence?: IRecurrence;
  syncToGoogle?: boolean;
}
