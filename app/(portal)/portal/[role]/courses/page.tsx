import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import CoursesTable from "@/components/portal/admin/courses/CoursesTable"

export default async function CoursesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal")
  }
  return <CoursesTable />
}
