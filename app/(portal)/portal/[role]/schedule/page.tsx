import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import StudentScheduleClient from "./StudentScheduleClient"
import TeacherScheduleClient from "./TeacherScheduleClient"

const prisma = new PrismaClient()

type Props = {
  params: Promise<{ role: string }>
}

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

async function getTeacherSchedule(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      teacher: {
        include: {
          schedules: {
            include: {
              class: true,
            },
            orderBy: { startTime: "asc" },
          },
          classes: {
            where: { status: "ACTIVE" },
            select: { id: true, className: true, classCode: true },
          },
        },
      },
    },
  })

  return {
    schedules: user?.teacher?.schedules || [],
    classes: user?.teacher?.classes || [],
  }
}

export default async function SchedulePage({ params }: Props) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  const { role: urlRole } = await params
  const userRole = session.user.role.toLowerCase()

  // Validate role matches URL
  if (urlRole !== userRole) {
    notFound()
  }

  // Render based on role
  if (userRole === "student") {
    const schedules = await getStudentSchedules(session.user.email)
    return <StudentScheduleClient schedules={schedules} />
  }

  if (userRole === "teacher") {
    const { schedules, classes } = await getTeacherSchedule(session.user.email)
    return <TeacherScheduleClient schedules={schedules} classes={classes} />
  }

  notFound()
}
