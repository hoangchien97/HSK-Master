// Role constants matching Prisma UserRole enum
export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

// Status constants matching Prisma UserStatus enum
export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
} as const

export type UserStatus = typeof STATUS[keyof typeof STATUS]

// Role display names in Vietnamese
export const ROLE_LABELS: Record<UserRole, string> = {
  [ROLES.SYSTEM_ADMIN]: 'Quản trị viên',
  [ROLES.TEACHER]: 'Giáo viên',
  [ROLES.STUDENT]: 'Học viên',
}

// Role-based route prefixes
export const ROLE_ROUTES: Record<UserRole, string> = {
  [ROLES.SYSTEM_ADMIN]: '/portal/admin',
  [ROLES.TEACHER]: '/portal/teacher',
  [ROLES.STUDENT]: '/portal/student',
}

// Role badge colors
export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  [ROLES.SYSTEM_ADMIN]: { bg: 'bg-purple-100', text: 'text-purple-700' },
  [ROLES.TEACHER]: { bg: 'bg-blue-100', text: 'text-blue-700' },
  [ROLES.STUDENT]: { bg: 'bg-green-100', text: 'text-green-700' },
}

// Check if user has required role
export function hasRole(userRole: string, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole as UserRole)
}

// Get redirect URL based on role
export function getRoleRedirectUrl(role: string): string {
  return ROLE_ROUTES[role as UserRole] || '/portal/student'
}
