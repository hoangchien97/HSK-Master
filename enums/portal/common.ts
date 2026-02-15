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
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum SubmissionStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  SUBMITTED = "SUBMITTED",
  RESUBMITTED = "RESUBMITTED",
  GRADED = "GRADED",
  RETURNED = "RETURNED",
}

export enum EventState {
  PAST = "PAST",
  UPCOMING = "UPCOMING",
  FUTURE = "FUTURE",
}

export enum PracticeMode {
  LOOKUP = "LOOKUP",
  FLASHCARD = "FLASHCARD",
  QUIZ = "QUIZ",
  LISTEN = "LISTEN",
  WRITE = "WRITE",
}

export enum ItemProgressStatus {
  NEW = "NEW",
  LEARNING = "LEARNING",
  MASTERED = "MASTERED",
}

export enum QuestionType {
  MCQ_MEANING = "MCQ_MEANING",
  MCQ_HANZI = "MCQ_HANZI",
  MCQ_PINYIN = "MCQ_PINYIN",
  TYPE_PINYIN = "TYPE_PINYIN",
  TYPE_HANZI = "TYPE_HANZI",
  LISTEN_MCQ = "LISTEN_MCQ",
  FLASHCARD = "FLASHCARD",
}
