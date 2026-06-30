import { UserRole } from '@/enums/portal/role';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// Role to route segment mapping
export const ROLE_ROUTES: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: "admin",
  [UserRole.TEACHER]: "teacher",
  [UserRole.STUDENT]: "student",
} as const;

export type RoleRoute = typeof ROLE_ROUTES[UserRole];

/**
 * Convert role to route segment
 */
export function roleToRoute(role: string): RoleRoute {
  return ROLE_ROUTES[role as UserRole] || ROLE_ROUTES[UserRole.STUDENT];
}

/**
 * Convert route segment to role
 */
export function routeToRole(route: string): UserRole {
  const entry = Object.entries(ROLE_ROUTES).find(([, value]) => value === route);
  return (entry?.[0] as UserRole) || UserRole.STUDENT;
}

/**
 * Get dashboard path for a role
 */
export function getDashboardPath(role: string): string {
  const route = roleToRoute(role);
  return `/portal/${route}`;
}

/**
 * Get redirect URL based on role (alias for getDashboardPath)
 */
export function getRoleRedirectUrl(role: string): string {
  return getDashboardPath(role);
}

/**
 * Check if route matches user's role
 */
export function isRouteAllowedForRole(route: string, role: string): boolean {
  const expectedRoute = roleToRoute(role);
  return route === expectedRoute;
}

/**
 * Get an authenticated session or redirect to login
 */
export async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user) redirect('/portal/login');
  return session!;
}

/**
 * Assert the session user has one of the allowed roles; redirect to /portal if not
 */
export function assertRole(session: { user: { role: string } }, allowedRoles: string[]): void {
  if (!allowedRoles.includes(session.user.role)) redirect('/portal');
}

/**
 * Check if the session user has a specific role
 */
export function hasRole(session: { user: { role: string } }, role: string): boolean {
  return session.user.role === role;
}
