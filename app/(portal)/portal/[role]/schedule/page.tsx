import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import StudentScheduleView from "@/app/components/portal/schedules/StudentScheduleView"
import TeacherScheduleCalendar from "@/app/components/portal/schedules/TeacherScheduleCalendar"
import { USER_ROLE, STATUS } from "@/app/constants/portal/roles"

type Props = {
  params: Promise<{ role: string }>
}

async function getStudentSchedules(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
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
              teacher: true,
            },
          },
        },
      },
    },
  })

  const schedules =
    user?.enrollments.flatMap((e) =>
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
      schedules: {
        include: {
          class: true,
        },
        orderBy: { startTime: "asc" },
      },
      classes: {
        where: { status: STATUS.ACTIVE },
        select: { id: true, className: true, classCode: true },
      },
    },
  })

  return {
    schedules: user?.schedules || [],
    classes: user?.classes || [],
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
    return <StudentScheduleView />
  }

  if (userRole === "teacher") {
    return <TeacherScheduleCalendar />
  }

  notFound()
}
