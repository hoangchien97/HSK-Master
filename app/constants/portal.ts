/**
 * Portal-specific constants
 * UI-related constants for portal (labels, colors, etc.)
 */

import { type UserRole } from "@/lib/constants/roles"

// Re-export UserRole for convenience
export type { UserRole }

// Role display names in Vietnamese
export const ROLE_LABELS: Record<UserRole, string> = {
  SYSTEM_ADMIN: 'Quản trị viên',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học viên',
}

// Role badge colors
export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  SYSTEM_ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700' },
  TEACHER: { bg: 'bg-blue-100', text: 'text-blue-700' },
  STUDENT: { bg: 'bg-green-100', text: 'text-green-700' },
}

// Check if user has required role
export function hasRole(userRole: string, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole as UserRole)
}
