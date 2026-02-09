import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { STATUS } from "@/constants/portal/roles"
import { getDashboardPath } from "@/lib/utils/auth"

export default async function PortalPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/portal/login")
  }

  // Check if user status is not active
  if (session.user.status !== STATUS.ACTIVE) {
    redirect("/portal/login?error=ACCOUNT_LOCKED")
  }

  const userRole = session.user.role

  // If role is not populated
  if (!userRole) {
    redirect("/portal/login?error=no-role")
  }

  // Redirect to role-specific dashboard
  const dashboardPath = getDashboardPath(userRole)
  redirect(dashboardPath)
}
