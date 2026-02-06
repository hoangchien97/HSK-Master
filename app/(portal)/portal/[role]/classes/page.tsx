import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/lib/constants/roles"
import TeacherClassManagement from "@/app/components/portal/classes/TeacherClassManagement"
import ClassesClient from "./ClassesClient"

export default async function ClassesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/portal/login")
  }

  const isStudent = session.user.role === USER_ROLE.STUDENT

  // Teacher gets full management interface
  if (session.user.role === USER_ROLE.TEACHER || session.user.role === USER_ROLE.SYSTEM_ADMIN) {
    return <TeacherClassManagement />
  }

  // Student gets simple list view
  return <ClassesClient classes={[]} isStudent={isStudent} />
}
