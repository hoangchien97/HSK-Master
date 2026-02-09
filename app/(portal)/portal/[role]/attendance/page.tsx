import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AttendanceMatrixView from "@/components/portal/attendance/AttendanceMatrixView"
import { USER_ROLE } from "@/constants/portal/roles"

export default async function TeacherAttendancePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== USER_ROLE.TEACHER && session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal/student")
  }

  return <AttendanceMatrixView />
}
