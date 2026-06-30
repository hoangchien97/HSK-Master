import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ClassDetailView from "@/components/portal/classes/ClassDetailView"
import { roleToRoute } from "@/lib/utils/auth"
import { USER_ROLE } from "@/constants/portal/roles"

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string; role: string }>
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/portal")
  }

  const { classId, role: urlRole } = await params

  const classRecord = await prisma.portalClass.findUnique({
    where: { id: classId },
    select: {
      id: true,
      teacherId: true,
      enrollments: {
        where: { studentId: session.user.id },
        select: { id: true },
      },
    },
  })

  if (!classRecord) notFound()

  if (urlRole === roleToRoute(USER_ROLE.TEACHER) && classRecord.teacherId !== session.user.id) {
    notFound()
  }
  if (urlRole === roleToRoute(USER_ROLE.STUDENT) && classRecord.enrollments.length === 0) {
    notFound()
  }

  return <ClassDetailView classId={classId} role={urlRole} />
}
