import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { AdminDashboard, TeacherDashboard, StudentDashboard } from "@/app/components/portal/dashboards"
import { ROLES } from "@/lib/constants/roles"

type Props = {
  params: Promise<{ role: string }>
}

// Map database role to URL role
const DB_TO_URL_ROLE: Record<string, string> = {
  [ROLES.SYSTEM_ADMIN]: "admin",
  [ROLES.TEACHER]: "teacher",
  [ROLES.STUDENT]: "student",
}

// Valid URL roles
const VALID_URL_ROLES = ["admin", "teacher", "student"]

export default async function DashboardPage({ params }: Props) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  const { role: urlRole } = await params

  // Validate URL role parameter
  if (!VALID_URL_ROLES.includes(urlRole)) {
    notFound()
  }

  const userRole = session.user.role

  // If role is not populated, check if user is accessing correct dashboard based on URL
  if (!userRole) {
    redirect("/portal/unauthorized?reason=no-role")
  }

  // Check if user status is locked
  if (session.user.status === "LOCKED") {
    redirect("/portal/unauthorized?reason=locked")
  }

  const expectedUrlRole = DB_TO_URL_ROLE[userRole]

  // Validate role matches URL
  if (urlRole !== expectedUrlRole) {
    // Redirect to correct role dashboard
    if (expectedUrlRole) {
      redirect(`/portal/${expectedUrlRole}`)
    }
    redirect("/portal/unauthorized?reason=forbidden")
  }

  // Render based on role
  switch (userRole) {
    case ROLES.SYSTEM_ADMIN:
      return <AdminDashboard />
    case ROLES.TEACHER:
      return <TeacherDashboard teacherName={session.user.name || undefined} />
    case ROLES.STUDENT:
      return <StudentDashboard studentName={session.user.name || undefined} />
    default:
      notFound()
  }
}
