import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import AssignmentsClient from "./AssignmentsClient"

const prisma = new PrismaClient()

async function getTeacherAssignments(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      teacher: {
        include: {
          assignments: {
            include: {
              class: true,
              submissions: {
                include: {
                  student: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
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
    assignments: user?.teacher?.assignments || [],
    classes: user?.teacher?.classes || [],
  }
}

export default async function TeacherAssignmentsPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/portal/student")
  }

  const { assignments, classes } = await getTeacherAssignments(session.user.email)

  return <AssignmentsClient assignments={assignments} classes={classes} />
}
