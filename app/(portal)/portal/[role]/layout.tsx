import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { roleToRoute, isRouteAllowedForRole } from "@/lib/utils/auth"
import { STATUS } from "@/lib/constants/roles"

type Props = {
  children: React.ReactNode
  params: Promise<{ role: string }>
}

// Valid URL roles
const VALID_URL_ROLES = ["admin", "teacher", "student"]

export default async function RoleLayout({ children, params }: Props) {
  const session = await auth()
  const { role: urlRole } = await params

  // Guard 1: Check authentication
  if (!session?.user) {
    redirect("/portal/login")
  }

  // Guard 2: Validate URL role parameter
  if (!VALID_URL_ROLES.includes(urlRole)) {
    notFound()
  }

  // Guard 3: Check if user status is ACTIVE
  if (session.user.status !== STATUS.ACTIVE) {
    redirect("/portal/login?error=ACCOUNT_LOCKED")
  }

  const userRole = session.user.role

  // Guard 4: Check if role is populated
  if (!userRole) {
    redirect("/portal/login?error=no-role")
  }

  // Guard 5: Validate role matches URL
  if (!isRouteAllowedForRole(urlRole, userRole)) {
    // Redirect to correct role dashboard
    const correctRoute = roleToRoute(userRole)
    redirect(`/portal/${correctRoute}/dashboard`)
  }

  return <>{children}</>
}
