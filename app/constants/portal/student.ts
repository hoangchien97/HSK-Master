/* ───── HSK level options ───── */

export const HSK_LEVELS = [
  { key: "ALL", label: "Tất cả trình độ" },
  { key: "HSK1", label: "HSK 1" },
  { key: "HSK2", label: "HSK 2" },
  { key: "HSK3", label: "HSK 3" },
  { key: "HSK4", label: "HSK 4" },
  { key: "HSK5", label: "HSK 5" },
  { key: "HSK6", label: "HSK 6" },
] as const

/* ───── Student status config ───── */

export const STUDENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: "success" | "warning" | "primary" | "default" }
> = {
  ACTIVE: { label: "Đang học", color: "success" },
  INACTIVE: { label: "Tạm nghỉ", color: "warning" },
  GRADUATED: { label: "Tốt nghiệp", color: "primary" },
}
