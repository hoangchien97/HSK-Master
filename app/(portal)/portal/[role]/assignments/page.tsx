import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import StudentAssignmentsClient from "./StudentAssignmentsClient"
import TeacherAssignmentsClient from "./TeacherAssignmentsClient"

const prisma = new PrismaClient()

type Props = {
  params: Promise<{ role: string }>
}

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

export default async function AssignmentsPage({ params }: Props) {
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
    const { assignments, studentId } = await getStudentAssignments(session.user.email)
    return <StudentAssignmentsClient assignments={assignments} studentId={studentId || ""} />
  }

  if (userRole === "teacher") {
    const { assignments, classes } = await getTeacherAssignments(session.user.email)
    return <TeacherAssignmentsClient assignments={assignments} classes={classes} />
  }

  notFound()
}
