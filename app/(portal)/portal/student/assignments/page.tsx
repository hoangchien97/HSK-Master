import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import StudentAssignmentsClient from "./AssignmentsClient"

const prisma = new PrismaClient()

async function getStudentAssignments(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      student: {
        include: {
          enrollments: {
            include: {
              class: {
                include: {
                  assignments: {
                    orderBy: { dueDate: "asc" },
                    include: {
                      submissions: true,
                    },
                  },
                },
              },
            },
          },
          submissions: {
            include: {
              assignment: true,
            },
          },
        },
      },
    },
  })

  const studentId = user?.student?.id
  const submittedIds = new Set(user?.student?.submissions.map((s) => s.assignmentId) || [])

  const assignments =
    user?.student?.enrollments.flatMap((e) =>
      e.class.assignments.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        type: a.assignmentType,
        dueDate: a.dueDate,
        maxScore: a.maxScore,
        class: {
          className: e.class.className,
          classCode: e.class.classCode,
        },
        submitted: submittedIds.has(a.id),
        submission: user?.student?.submissions.find((s) => s.assignmentId === a.id),
      }))
    ) || []

  return { assignments, studentId }
}

export default async function StudentAssignmentsPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  if (session.user.role !== "STUDENT" && session.user.role !== "ADMIN") {
    redirect("/portal/teacher")
  }

  const { assignments, studentId } = await getStudentAssignments(session.user.email)

  return <StudentAssignmentsClient assignments={assignments} studentId={studentId || ""} />
}
