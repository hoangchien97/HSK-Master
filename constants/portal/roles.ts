// Role constants matching Prisma UserRole enum
export const USER_ROLE = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE]

// Status constants matching Prisma UserStatus enum
export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
} as const

export type UserStatus = typeof STATUS[keyof typeof STATUS]

// Class Status
export const CLASS_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

// Assignment Status
export const ASSIGNMENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const

// Schedule Status
export const SCHEDULE_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

// Enrollment Status
export const ENROLLMENT_STATUS = {
  ENROLLED: 'ENROLLED',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED',
} as const

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  EXCUSED: 'EXCUSED',
} as const

// Submission Status
export const SUBMISSION_STATUS = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  SUBMITTED: 'SUBMITTED',
  RESUBMITTED: 'RESUBMITTED',
  GRADED: 'GRADED',
  RETURNED: 'RETURNED',
} as const
