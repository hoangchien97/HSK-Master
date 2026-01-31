import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import StudentScheduleClient from "./ScheduleClient"

const prisma = new PrismaClient()

async function getStudentSchedules(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      student: {
        include: {
          enrollments: {
            include: {
              class: {
                include: {
                  schedules: {
                    where: {
                      startTime: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                      },
                    },
                    orderBy: { startTime: "asc" },
                  },
                  teacher: {
                    include: { user: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const schedules =
    user?.student?.enrollments.flatMap((e) =>
      e.class.schedules.map((s) => ({
        ...s,
        class: {
          className: e.class.className,
          classCode: e.class.classCode,
        },
        teacher: e.class.teacher,
      }))
    ) || []

  return schedules.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
}

export default async function StudentSchedulePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== "STUDENT" && session.user.role !== "ADMIN") {
    redirect("/portal/teacher")
  }

  const schedules = await getStudentSchedules(session.user.email)

  return <StudentScheduleClient schedules={schedules} />
}
