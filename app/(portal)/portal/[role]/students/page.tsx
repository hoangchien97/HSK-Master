import { auth } from "@/auth"
import { redirect } from "next/navigation"
import StudentsTable from "@/app/components/portal/students/StudentsTable"
import { USER_ROLE } from "@/app/constants/portal/roles"

export default async function TeacherStudentsPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== USER_ROLE.TEACHER && session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal/student")
  }

  return <StudentsTable />
}
