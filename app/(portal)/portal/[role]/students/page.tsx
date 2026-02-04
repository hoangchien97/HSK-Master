import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import StudentsClient from "./StudentsClient"
import { USER_ROLE } from "@/lib/constants/roles"

const prisma = new PrismaClient()

async function getTeacherStudents(email: string) {
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
      },
    },
  })

  // Flatten students from all classes
  const studentsMap = new Map()
  user?.classes.forEach((classItem) => {
    classItem.enrollments.forEach((enrollment) => {
      if (!studentsMap.has(enrollment.studentId)) {
        studentsMap.set(enrollment.studentId, {
          ...enrollment.student,
          classes: [classItem],
        })
      } else {
        const existing = studentsMap.get(enrollment.studentId)
        existing.classes.push(classItem)
      }
    })
  })

  return Array.from(studentsMap.values())
}

export default async function TeacherStudentsPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== USER_ROLE.TEACHER && session.user.role !== USER_ROLE.SYSTEM_ADMIN) {
    redirect("/portal/student")
  }

  const students = await getTeacherStudents(session.user.email)

  return <StudentsClient students={students} />
}
