/**
 * Deadline status for assignments.
 * Used to determine visual styling (color, label) in tables and badges.
 */
export const DEADLINE_STATUS = {
  /** Due date has passed — assignment is overdue */
  OVERDUE: "OVERDUE",
  /** Due within 24 hours — urgent */
  DUE_SOON: "DUE_SOON",
  /** Due within 3 days — approaching */
  APPROACHING: "APPROACHING",
  /** More than 3 days away — on time */
  ON_TIME: "ON_TIME",
  /** No due date set */
  NO_DEADLINE: "NO_DEADLINE",
} as const

export type DeadlineStatus = (typeof DEADLINE_STATUS)[keyof typeof DEADLINE_STATUS]

export const DEADLINE_STATUS_LABEL: Record<DeadlineStatus, string> = {
  [DEADLINE_STATUS.OVERDUE]: "Quá hạn",
  [DEADLINE_STATUS.DUE_SOON]: "Sắp hết hạn",
  [DEADLINE_STATUS.APPROACHING]: "Sắp đến hạn",
  [DEADLINE_STATUS.ON_TIME]: "Còn hạn",
  [DEADLINE_STATUS.NO_DEADLINE]: "Không có hạn",
}

export const DEADLINE_STATUS_COLOR: Record<
  DeadlineStatus,
  "danger" | "warning" | "primary" | "success" | "default"
> = {
  [DEADLINE_STATUS.OVERDUE]: "danger",
  [DEADLINE_STATUS.DUE_SOON]: "warning",
  [DEADLINE_STATUS.APPROACHING]: "primary",
  [DEADLINE_STATUS.ON_TIME]: "success",
  [DEADLINE_STATUS.NO_DEADLINE]: "default",
}

/**
 * Calculate the deadline status based on a due date.
 * @param dueDate The assignment due date
 * @param assignmentStatus Current assignment status (e.g. PUBLISHED, DRAFT)
 * @returns DeadlineStatus
 */
export function getDeadlineStatus(
  dueDate: Date | string | null | undefined,
  assignmentStatus?: string,
): DeadlineStatus {
  if (!dueDate) return DEADLINE_STATUS.NO_DEADLINE

  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  // Only show OVERDUE if assignment is still published (not closed/draft)
  if (diffMs < 0) {
    if (!assignmentStatus || assignmentStatus === "PUBLISHED") {
      return DEADLINE_STATUS.OVERDUE
    }
    return DEADLINE_STATUS.ON_TIME // closed/draft — don't mark as overdue
  }

  if (diffHours <= 24) return DEADLINE_STATUS.DUE_SOON
  if (diffHours <= 72) return DEADLINE_STATUS.APPROACHING
  return DEADLINE_STATUS.ON_TIME
}
