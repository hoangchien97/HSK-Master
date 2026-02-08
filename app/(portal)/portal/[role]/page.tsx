import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { AdminDashboard, TeacherDashboard, StudentDashboard } from "@/app/components/portal/dashboards"
import { routeToRole } from "@/app/lib/utils/auth"
import { USER_ROLE } from "@/app/constants/portal/roles"

type Props = {
  params: Promise<{ role: string }>
}

export default async function DashboardPage({ params }: Props) {
  const session = await auth()
  const { role: urlRole } = await params

  // Get role from URL route (guards already handled in layout)
  const userRole = routeToRole(urlRole)

  // Render based on role
  switch (userRole) {
    case USER_ROLE.SYSTEM_ADMIN:
      return <AdminDashboard />
    case USER_ROLE.TEACHER:
      return <TeacherDashboard teacherName={session?.user?.fullName || session?.user?.name || undefined} />
    case USER_ROLE.STUDENT:
      return <StudentDashboard studentName={session?.user?.fullName || session?.user?.name || undefined} />
    default:
      notFound()
  }
}
