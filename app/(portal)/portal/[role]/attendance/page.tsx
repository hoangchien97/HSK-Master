import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AttendanceMatrixView from "@/components/portal/attendance/AttendanceMatrixView"
import StudentAttendanceView from "@/components/portal/attendance/StudentAttendanceView"
import { USER_ROLE } from "@/constants/portal/roles"

export default async function AttendancePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  // Student gets read-only attendance view
  if (session.user.role === USER_ROLE.STUDENT) {
    return <StudentAttendanceView />
  }

  // Teacher/admin gets full management matrix
  return <AttendanceMatrixView />
}
