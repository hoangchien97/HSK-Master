import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClassDetailView from "@/components/portal/classes/ClassDetailView"

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string; role: string }>
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/portal")
  }

  const { classId, role } = await params

  return <ClassDetailView classId={classId} role={role} />
}
