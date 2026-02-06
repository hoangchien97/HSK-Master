import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ClassDetailClient from "./ClassDetailClient"

export default async function ClassDetailPage({
  params,
}: {
  params: { classId: string }
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/portal")
  }

  return <ClassDetailClient classId={params.classId} />
}
