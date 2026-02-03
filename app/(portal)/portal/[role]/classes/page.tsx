import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import ClassesClient from "./ClassesClient"

const prisma = new PrismaClient()

async function getTeacherClasses(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      teacher: {
        include: {
          classes: {
            include: {
              enrollments: {
                include: {
                  student: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })
  return user?.teacher?.classes || []
}

export default async function TeacherClassesPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/portal/student")
  }

  const classes = await getTeacherClasses(session.user.email)

  return <ClassesClient classes={classes} />
}
