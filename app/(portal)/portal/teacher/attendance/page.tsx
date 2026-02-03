import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import AttendanceClient from "./AttendanceClient"

const prisma = new PrismaClient()

async function getTeacherAttendanceData(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      teacher: {
        include: {
          classes: {
            where: { status: "ACTIVE" },
            include: {
              enrollments: {
                include: {
                  student: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
          attendances: {
            orderBy: { date: "desc" },
            take: 100,
            include: {
              student: true,
              class: true,
            },
          },
        },
      },
    },
  })

  return {
    classes: user?.teacher?.classes || [],
    recentAttendances: user?.teacher?.attendances || [],
  }
}

export default async function TeacherAttendancePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/portal/student")
  }

  const { classes, recentAttendances } = await getTeacherAttendanceData(session.user.email)

  return <AttendanceClient classes={classes} recentAttendances={recentAttendances} />
}
