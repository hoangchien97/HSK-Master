/**
 * Portal UI Constants
 * Centralised values for UI-related magic numbers and configurations.
 */

/* ───────── Sidebar ───────── */
export const SIDEBAR = {
  /** Width in pixels — must be synced with Tailwind class `w-64` / `pl-64` */
  WIDTH: 256,
  /** Tailwind class for sidebar width */
  WIDTH_CLASS: "w-64",
  /** Tailwind class for content left padding (must match WIDTH_CLASS) */
  CONTENT_OFFSET_CLASS: "lg:pl-64",
} as const

/* ───────── Tooltip delays (ms) ───────── */
export const TOOLTIP_DELAY = {
  DEFAULT: 300,
  LONG: 500,
  PROVIDER: 200,
  SKIP: 100,
} as const

/* ───────── Toast / Notification durations (ms) ───────── */
export const TOAST_DURATION = {
  DEFAULT: 5000,
  LONG: 8000,
  SHORT: 3000,
} as const

/* ───────── Score & Mastery thresholds ───────── */
export const SCORE_THRESHOLD = {
  EXCELLENT: 80,
  GOOD: 50,
  AVERAGE: 30,
} as const

export const MASTERY_THRESHOLD = {
  MASTERED: 80,
  HIGH: 70,
  MEDIUM: 40,
  LOW: 30,
} as const

export const ATTENDANCE_THRESHOLD = {
  GOOD: 90,
  WARNING: 80,
} as const

/* ───────── Chart colors ───────── */
export const CHART_COLORS = {
  TRACK: "#e5e7eb",
  PRIMARY: "#ef4444",
  SUCCESS: "#22c55e",
  WARNING: "#f59e0b",
} as const

/* ───────── HanziWriter config ───────── */
export const HANZI_WRITER = {
  CANVAS_SIZE: 200,
  PADDING: 10,
  STROKE_DELAY_PRACTICE: 500,
  STROKE_DELAY_ANIMATION: 800,
  HINT_AFTER_MISSES: 2,
  DRAWING_WIDTH: 6,
  STROKE_COLOR: "#333",
  OUTLINE_COLOR: "#ddd",
  HIGHLIGHT_COLOR: "#3b82f6",
} as const

/* ───────── Assignment defaults ───────── */
export const ASSIGNMENT_DEFAULTS = {
  MAX_SCORE: 100,
} as const

/* ───────── Session ───────── */
export const SESSION_REFETCH_INTERVAL_SEC = 300

/* ───────── ISR ───────── */
export const ISR_REVALIDATE_SECONDS = 600

/* ───────── OG Image ───────── */
export const OG_IMAGE = {
  WIDTH: 1200,
  HEIGHT: 630,
} as const

/* ───────── Filter sentinel ───────── */
export const FILTER_ALL = "ALL" as const
