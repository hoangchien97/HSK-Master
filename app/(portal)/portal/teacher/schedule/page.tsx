import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import ScheduleClient from "./ScheduleClient"

const prisma = new PrismaClient()

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

export default async function TeacherSchedulePage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/portal/student")
  }

  const { schedules, classes } = await getTeacherSchedule(session.user.email)

  return <ScheduleClient schedules={schedules} classes={classes} />
}
