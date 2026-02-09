/**
 * Portal Enums — Common statuses
 */
export enum ClassStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ScheduleStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum EnrollmentStatus {
  ENROLLED = "ENROLLED",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

export enum AssignmentStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
}

export enum SubmissionStatus {
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  LATE = "LATE",
}

export enum EventState {
  PAST = "PAST",
  UPCOMING = "UPCOMING",
  FUTURE = "FUTURE",
}
