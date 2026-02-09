import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import StudentAssignmentsView from "@/components/portal/assignments/StudentAssignmentsView"
import AssignmentsTable from "@/components/portal/assignments/AssignmentsTable"

type Props = {
  params: Promise<{ role: string }>
}

async function getStudentAssignments(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
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
  })

  const studentId = user?.id
  const submittedIds = new Set(user?.submissions.map((s) => s.assignmentId) || [])

  const assignments =
    user?.enrollments.flatMap((e) =>
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
        submission: user?.submissions.find((s) => s.assignmentId === a.id),
      }))
    ) || []

  return { assignments, studentId }
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

  // Student view: server-fetched assignments
  if (userRole === "student") {
    const { assignments, studentId } = await getStudentAssignments(session.user.email)
    return <StudentAssignmentsView assignments={assignments} studentId={studentId || ""} />
  }

  // Teacher view: client-side table with API fetch
  if (userRole === "teacher") {
    return <AssignmentsTable role={userRole} />
  }

  notFound()
}
