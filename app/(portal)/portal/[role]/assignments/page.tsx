import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import StudentAssignmentsView from "@/app/components/portal/assignments/StudentAssignmentsView"
import AssignmentsTable from "@/app/components/portal/assignments/AssignmentsTable"
import { STATUS } from "@/app/constants/portal/roles"

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

async function getTeacherAssignments(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
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
        where: { status: STATUS.ACTIVE },
        select: { id: true, className: true, classCode: true },
      },
    },
  })

  return {
    assignments: user?.assignments || [],
    classes: user?.classes || [],
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
    return <StudentAssignmentsView assignments={assignments} studentId={studentId || ""} />
  }

  if (userRole === "teacher") {
    const { assignments, classes } = await getTeacherAssignments(session.user.email)
    return <AssignmentsTable assignments={assignments} classes={classes} role={userRole} />
  }

  notFound()
}
