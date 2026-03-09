/**
 * Portal API & Page Routes
 * Centralised route constants to avoid hardcoded path strings.
 */

/* ═══════════════════════════════════════════════════════════
   PAGE ROUTES
   ═══════════════════════════════════════════════════════════ */

export const PORTAL_ROUTES = {
  HOME: "/portal",
  LOGIN: "/portal/login",
  REGISTER: "/portal/register",
  ERROR: "/portal/error",
  UNAUTHORIZED: "/portal/unauthorized",
  PROFILE: "/portal/profile",
  SETTINGS: "/portal/settings",
  HELP: "/portal/help",
} as const

/** Build a role-prefixed portal route */
export function portalRoleRoute(role: string, path = "") {
  const slug = role.toLowerCase().replace("system_admin", "admin")
  return `/portal/${slug}${path ? `/${path}` : ""}`
}

/* ═══════════════════════════════════════════════════════════
   API ROUTES
   ═══════════════════════════════════════════════════════════ */

export const API_ROUTES = {
  AUTH: {
    REGISTER: "/api/auth/register",
  },
  PORTAL: {
    CLASSES: "/api/portal/classes",
    STUDENTS: "/api/portal/students",
    ASSIGNMENTS: "/api/portal/assignments",
    SUBMISSIONS: "/api/portal/submissions",
    ATTENDANCE: "/api/portal/attendance",
    ATTENDANCE_EXPORT: "/api/portal/attendance/export",
    SCHEDULES: "/api/portal/schedules",
    PROFILE: "/api/portal/profile",
    ENROLLMENTS: "/api/portal/enrollments",
    VOCABULARY_PROGRESS: "/api/portal/vocabulary-progress",
    USERS_SEARCH: "/api/portal/users/search",
  },
  CALENDAR: {
    CONNECT: "/api/portal/calendar/connect",
    STATUS: "/api/portal/calendar/status",
    SYNC: "/api/portal/google-calendar/sync",
  },
  UPLOAD: {
    AVATAR: "/api/portal/upload/avatar",
    FILE: "/api/portal/upload/file",
  },
} as const
