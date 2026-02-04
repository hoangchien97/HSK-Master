import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ROLES } from "@/lib/constants/roles"

// Map database role to URL role
const ROLE_REDIRECT: Record<string, string> = {
  [ROLES.SYSTEM_ADMIN]: "/portal/admin",
  [ROLES.TEACHER]: "/portal/teacher",
  [ROLES.STUDENT]: "/portal/student",
}

export default async function PortalPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/portal/login")
  }

  // Check if user status is locked
  if (session.user.status === "LOCKED") {
    redirect("/portal/unauthorized?reason=locked")
  }

  const userRole = session.user.role

  // If role is not populated
  if (!userRole) {
    redirect("/portal/unauthorized?reason=no-role")
  }

  const redirectUrl = ROLE_REDIRECT[userRole] || "/portal/student"

  redirect(redirectUrl)
}
