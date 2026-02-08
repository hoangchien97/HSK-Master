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
