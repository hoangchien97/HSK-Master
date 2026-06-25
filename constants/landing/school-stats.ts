/**
 * Canonical school-wide statistics — single source of truth.
 * Update here and all landing sections stay in sync.
 * These are the fallback values; admin can override via CtaStat CMS records.
 */
export const SCHOOL_STATS = {
  yearsActive: { value: "5+", label: "Năm hoạt động" },
  students: { value: "500+", label: "Học viên" },
  passRate: { value: "98%", label: "Đậu HSK/HSKK" },
} as const;
