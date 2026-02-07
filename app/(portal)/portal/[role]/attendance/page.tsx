import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AttendanceView from "@/app/components/portal/attendance/AttendanceView"
import { USER_ROLE, STATUS } from "@/app/constants/portal/roles"

async function getTeacherAttendanceData(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      classes: {
        where: { status: STATUS.ACTIVE },
        include: {
          enrollments: {
            include: {
              student: true,
            },
          },
        },
      },
      teacherAttendances: {
        orderBy: { date: "desc" },
        take: 100,
        include: {
          student: true,
          class: true,
        },
      },
    },
  })

  return {
    classes: user?.classes || [],
    recentAttendances: user?.teacherAttendances || [],
  }
}

export default async function TeacherAttendancePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== USER_ROLE.TEACHER && session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal/student")
  }

  const { classes, recentAttendances } = await getTeacherAttendanceData(session.user.email)

  return <AttendanceView classes={classes} recentAttendances={recentAttendances} />
}
