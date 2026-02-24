/**
 * Portal Enums — Common statuses
 */

/* ───────── Notification Types ───────── */

export enum NotificationType {
  // Assignments
  ASSIGNMENT_PUBLISHED = "ASSIGNMENT_PUBLISHED",
  ASSIGNMENT_DEADLINE = "ASSIGNMENT_DEADLINE",
  ASSIGNMENT_DELETED = "ASSIGNMENT_DELETED",
  // Submissions
  SUBMISSION_SUBMITTED = "SUBMISSION_SUBMITTED",
  SUBMISSION_RESUBMITTED = "SUBMISSION_RESUBMITTED",
  SUBMISSION_GRADED = "SUBMISSION_GRADED",
  SUBMISSION_RETURNED = "SUBMISSION_RETURNED",
  // Classes
  CLASS_ENROLLED = "CLASS_ENROLLED",
  CLASS_REMOVED = "CLASS_REMOVED",
  CLASS_COMPLETED = "CLASS_COMPLETED",
  // Schedule
  SCHEDULE_CREATED = "SCHEDULE_CREATED",
  SCHEDULE_UPDATED = "SCHEDULE_UPDATED",
  SCHEDULE_CANCELLED = "SCHEDULE_CANCELLED",
  SCHEDULE_REMINDER = "SCHEDULE_REMINDER",
  // Attendance
  ATTENDANCE_RECORDED = "ATTENDANCE_RECORDED",
  ATTENDANCE_ABSENT = "ATTENDANCE_ABSENT",
  // Practice milestones
  PRACTICE_LESSON_MASTERED = "PRACTICE_LESSON_MASTERED",
  PRACTICE_STREAK = "PRACTICE_STREAK",
  // System
  SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
  PROFILE_UPDATED = "PROFILE_UPDATED",
}

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
  MCQ_EXAMPLE = "MCQ_EXAMPLE",
  TYPE_PINYIN = "TYPE_PINYIN",
  TYPE_HANZI = "TYPE_HANZI",
  LISTEN_MCQ = "LISTEN_MCQ",
  FLASHCARD = "FLASHCARD",
}

/** Part-of-Speech codes (aligned with CC-CEDICT / HSK standard) */
export enum WordType {
  NOUN = "n",
  VERB = "v",
  ADJ = "a",
  ADV = "d",
  PRONOUN = "r",
  NUMERAL = "m",
  MEASURE = "q",
  CONJ = "c",
  PREP = "p",
  PARTICLE = "u",
  IDIOM = "i",       // 成语/惯用语
  PHRASE = "phr",     // 短语
}

/** Map WordType code → Vietnamese label */
export const WORD_TYPE_LABELS: Record<string, string> = {
  [WordType.NOUN]: "Danh từ",
  [WordType.VERB]: "Động từ",
  [WordType.ADJ]: "Tính từ",
  [WordType.ADV]: "Phó từ",
  [WordType.PRONOUN]: "Đại từ",
  [WordType.NUMERAL]: "Số từ",
  [WordType.MEASURE]: "Lượng từ",
  [WordType.CONJ]: "Liên từ",
  [WordType.PREP]: "Giới từ",
  [WordType.PARTICLE]: "Trợ từ",
  [WordType.IDIOM]: "Thành ngữ",
  [WordType.PHRASE]: "Cụm từ",
}

/** Map Vietnamese label → WordType code (for seed migration) */
export const WORD_TYPE_VI_TO_CODE: Record<string, string> = {
  "danh từ": WordType.NOUN,
  "động từ": WordType.VERB,
  "tính từ": WordType.ADJ,
  "phó từ": WordType.ADV,
  "đại từ": WordType.PRONOUN,
  "số từ": WordType.NUMERAL,
  "lượng từ": WordType.MEASURE,
  "liên từ": WordType.CONJ,
  "giới từ": WordType.PREP,
  "trợ từ": WordType.PARTICLE,
  "thành ngữ": WordType.IDIOM,
  "cụm từ": WordType.PHRASE,
}

/** HeroUI color for each WordType code */
export const WORD_TYPE_COLORS: Record<string, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
  [WordType.PRONOUN]: "primary",
  [WordType.NOUN]: "secondary",
  [WordType.VERB]: "success",
  [WordType.ADJ]: "warning",
  [WordType.ADV]: "danger",
  [WordType.NUMERAL]: "default",
  [WordType.PARTICLE]: "default",
  [WordType.IDIOM]: "primary",
  [WordType.PREP]: "secondary",
  [WordType.CONJ]: "warning",
  [WordType.MEASURE]: "danger",
  [WordType.PHRASE]: "default",
}

/** Status label + color config */
export const STATUS_LABELS: Record<string, { label: string; color: "default" | "warning" | "success" }> = {
  [ItemProgressStatus.NEW]: { label: "Mới", color: "default" },
  [ItemProgressStatus.LEARNING]: { label: "Đang học", color: "warning" },
  [ItemProgressStatus.MASTERED]: { label: "Thành thạo", color: "success" },
}

/** Get display meaning: prefer Vietnamese, fallback to English */
export function getDisplayMeaning(vocab: { meaningVi?: string | null; meaning: string }): string {
  return vocab.meaningVi || vocab.meaning
}
