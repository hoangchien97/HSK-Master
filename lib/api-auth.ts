/**
 * API Auth Middleware — reusable auth guard for API routes
 *
 * Usage:
 *   const { error, session } = await requireAuth(["TEACHER", "SYSTEM_ADMIN"]);
 *   if (error) return error;
 *   // ...proceed with session.user
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

interface AuthSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    status?: string;
    username?: string;
  };
}

type AuthResult =
  | { error: NextResponse; session: null }
  | { error: null; session: AuthSession };

/**
 * Require authentication and optionally specific roles.
 * Returns `{ error, session }` — if error is non-null, return it directly from the route handler.
 */
export async function requireAuth(roles?: string[]): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized — please log in" },
        { status: 401 }
      ),
      session: null,
    };
  }

  if (roles && roles.length > 0 && !roles.includes((session.user as AuthSession["user"]).role || "")) {
    return {
      error: NextResponse.json(
        { error: "Forbidden — insufficient permissions" },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session: session as AuthSession };
}

/**
 * Require a specific user to match the session — prevents users from accessing other users' data.
 */
export async function requireSelf(userId: string): Promise<AuthResult> {
  const result = await requireAuth();
  if (result.error) return result;

  if (result.session.user?.id !== userId) {
    return {
      error: NextResponse.json(
        { error: "Forbidden — cannot access another user's data" },
        { status: 403 }
      ),
      session: null,
    };
  }

  return result;
}
