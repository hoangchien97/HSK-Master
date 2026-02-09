import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import ClassesTable from "@/components/portal/classes/ClassesTable"

export default async function ClassesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/portal/login")
  }

  // Both teacher and admin get full management, student gets read-only
  const isStudent = session.user.role === USER_ROLE.STUDENT

  if (session.user.role === USER_ROLE.TEACHER || session.user.role === USER_ROLE.SYSTEM_ADMIN) {
    return <ClassesTable />
  }

  // Student gets simple list view (read-only)
  return <ClassesTable />
}
