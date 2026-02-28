/* ───── Class status config ───── */

export const CLASS_STATUS_OPTIONS = [
  { key: "ALL", label: "Tất cả" },
  { key: "ACTIVE", label: "Đang hoạt động" },
  { key: "COMPLETED", label: "Đã kết thúc" },
  { key: "CANCELLED", label: "Đã hủy" },
] as const

export const CLASS_STATUS_COLOR_MAP: Record<string, "success" | "primary" | "danger" | "default"> = {
  ACTIVE: "success",
  COMPLETED: "primary",
  CANCELLED: "danger",
}

export const CLASS_STATUS_LABEL_MAP: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  COMPLETED: "Đã kết thúc",
  CANCELLED: "Đã hủy",
}

/* ───── Enrollment status config ───── */

export const ENROLLMENT_STATUS_COLOR_MAP: Record<string, "success" | "danger" | "default"> = {
  ENROLLED: "success",
  DROPPED: "danger",
  COMPLETED: "default",
}

export const ENROLLMENT_STATUS_LABEL_MAP: Record<string, string> = {
  ENROLLED: "Đang học",
  DROPPED: "Đã nghỉ",
  COMPLETED: "Hoàn thành",
}

/* ───── Schedule status config ───── */

export const SCHEDULE_STATUS_COLOR_MAP: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
}

export const SCHEDULE_STATUS_LABEL_MAP: Record<string, string> = {
  SCHEDULED: "Đã lên lịch",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
}
