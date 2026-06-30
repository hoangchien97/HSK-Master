import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import AttendanceMatrixView from "@/components/portal/attendance/AttendanceMatrixView"
import StudentAttendanceView from "@/components/portal/attendance/StudentAttendanceView"
import { USER_ROLE } from "@/constants/portal/roles"
import { isRouteAllowedForRole } from "@/lib/utils/auth"

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ role: string }>
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  const { role: urlRole } = await params
  if (!isRouteAllowedForRole(urlRole, session.user.role)) {
    notFound()
  }

  // Student gets read-only attendance view
  if (session.user.role === USER_ROLE.STUDENT) {
    return <StudentAttendanceView />
  }

  // Teacher/admin gets full management matrix
  return <AttendanceMatrixView />
}
