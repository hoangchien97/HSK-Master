import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import AttendanceClient from "./AttendanceClient"
import { USER_ROLE, STATUS } from "@/lib/constants/roles"

const prisma = new PrismaClient()

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

  return <AttendanceClient classes={classes} recentAttendances={recentAttendances} />
}
