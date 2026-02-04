import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import ClassesClient from "./ClassesClient"
import { USER_ROLE } from "@/lib/constants/roles"

const prisma = new PrismaClient()

async function getTeacherClasses(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
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
  })
  return user?.classes || []
}

export default async function TeacherClassesPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== USER_ROLE.TEACHER && session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal/student")
  }

  const classes = await getTeacherClasses(session.user.email)

  return <ClassesClient classes={classes} />
}
