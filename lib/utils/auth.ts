// Role to route segment mapping
export const ROLE_ROUTES = {
  SYSTEM_ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export type UserRole = keyof typeof ROLE_ROUTES;
export type RoleRoute = typeof ROLE_ROUTES[UserRole];

/**
 * Convert role to route segment
 */
export function roleToRoute(role: string): RoleRoute {
  return ROLE_ROUTES[role as UserRole] || "student";
}

/**
 * Convert route segment to role
 */
export function routeToRole(route: string): UserRole {
  const entry = Object.entries(ROLE_ROUTES).find(([, value]) => value === route);
  return (entry?.[0] as UserRole) || "STUDENT";
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
