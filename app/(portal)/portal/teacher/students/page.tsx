import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import StudentsClient from "./StudentsClient"

const prisma = new PrismaClient()

async function getTeacherStudents(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      teacher: {
        include: {
          classes: {
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
        },
      },
    },
  })

  // Flatten students from all classes
  const studentsMap = new Map()
  user?.teacher?.classes.forEach((classItem) => {
    classItem.enrollments.forEach((enrollment) => {
      if (!studentsMap.has(enrollment.student.id)) {
        studentsMap.set(enrollment.student.id, {
          ...enrollment.student,
          classes: [classItem],
        })
      } else {
        const existing = studentsMap.get(enrollment.student.id)
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

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/portal/student")
  }

  const students = await getTeacherStudents(session.user.email)

  return <StudentsClient students={students} />
}
