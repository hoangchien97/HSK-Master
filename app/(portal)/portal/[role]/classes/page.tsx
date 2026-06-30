import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { USER_ROLE } from "@/constants/portal/roles"
import ClassesTable from "@/components/portal/classes/ClassesTable"
import StudentClassesView from "@/components/portal/classes/StudentClassesView"
import { isRouteAllowedForRole } from "@/lib/utils/auth"

export default async function ClassesPage({
  params,
}: {
  params: Promise<{ role: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/portal/login")
  }

  const { role: urlRole } = await params
  if (!isRouteAllowedForRole(urlRole, session.user.role)) {
    notFound()
  }

  // Student gets read-only card view
  if (session.user.role === USER_ROLE.STUDENT) {
    return <StudentClassesView />
  }

  // Teacher/admin gets full management table
  return <ClassesTable />
}
