import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import StudentAssignmentsView from "@/components/portal/assignments/StudentAssignmentsView"
import AssignmentsTable from "@/components/portal/assignments/AssignmentsTable"
import { ROLE_ROUTES } from "@/lib/utils/auth"

type Props = {
  params: Promise<{ role: string }>
}

export default async function AssignmentsPage({ params }: Props) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  const { role: urlRole } = await params
  const userRole = session.user.role.toLowerCase()

  // Validate role matches URL
  if (urlRole !== userRole) {
    notFound()
  }

  // Student view: fetches data via server action (role-aware)
  if (userRole === ROLE_ROUTES.STUDENT) {
    return <StudentAssignmentsView />
  }

  // Teacher view: client-side table with server action
  if (userRole === ROLE_ROUTES.TEACHER) {
    return <AssignmentsTable role={userRole} />
  }

  notFound()
}
