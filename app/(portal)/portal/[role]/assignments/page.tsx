import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import StudentAssignmentsView from "@/components/portal/assignments/StudentAssignmentsView"
import AssignmentsTable from "@/components/portal/assignments/AssignmentsTable"

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
  if (userRole === "student") {
    return <StudentAssignmentsView />
  }

  // Teacher view: client-side table with server action
  if (userRole === "teacher") {
    return <AssignmentsTable role={userRole} />
  }

  notFound()
}
