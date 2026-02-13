import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import ClassesTable from "@/components/portal/classes/ClassesTable"
import StudentClassesView from "@/components/portal/classes/StudentClassesView"

export default async function ClassesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/portal/login")
  }

  // Student gets read-only card view
  if (session.user.role === USER_ROLE.STUDENT) {
    return <StudentClassesView />
  }

  // Teacher/admin gets full management table
  return <ClassesTable />
}
