import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AssignmentDetailView from "@/components/portal/assignments/AssignmentDetailView"

type Props = { params: Promise<{ role: string; id: string }> }

export default async function AssignmentDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.email || !session?.user?.id) redirect("/portal/login")

  const { role: urlRole, id } = await params
  const userRole = session.user.role.toLowerCase()
  if (urlRole !== userRole) notFound()

  // Fetch the assignment with full details
  const assignment = await prisma.portalAssignment.findUnique({
    where: { id },
    include: {
      class: {
        select: {
          id: true,
          className: true,
          classCode: true,
          enrollments: {
            select: {
              studentId: true,
              student: {
                select: { id: true, name: true, email: true, image: true, username: true },
              },
            },
          },
        },
      },
      teacher: {
        select: { id: true, name: true, email: true, image: true },
      },
      submissions: {
        include: {
          student: {
            select: { id: true, name: true, email: true, image: true, username: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  })

  if (!assignment) notFound()

  // Authorization: teacher must own, student must be enrolled
  if (userRole === "teacher" && assignment.teacherId !== session.user.id) {
    notFound()
  }

  if (userRole === "student") {
    // Students can only see PUBLISHED assignments
    if (assignment.status !== "PUBLISHED") notFound()

    const isEnrolled = assignment.class.enrollments.some(
      (e) => e.studentId === session.user!.id
    )
    if (!isEnrolled) notFound()
  }

  // Serialize dates for client component
  const serializedAssignment = {
    ...assignment,
    dueDate: assignment.dueDate?.toISOString() || null,
    publishedAt: assignment.publishedAt?.toISOString() || null,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
    submissions: assignment.submissions.map((s) => ({
      ...s,
      submittedAt: s.submittedAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
  }

  return (
    <AssignmentDetailView
      assignment={serializedAssignment}
      currentUserId={session.user.id}
      userRole={userRole}
    />
  )
}
