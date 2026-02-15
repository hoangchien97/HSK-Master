import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import PracticeListView from "@/components/portal/practice/PracticeListView"

type Props = {
  params: Promise<{ role: string }>
}

export default async function PracticePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.email) redirect("/portal/login")

  const { role: urlRole } = await params
  const userRole = session.user.role.toLowerCase()
  if (urlRole !== userRole) notFound()

  // Only students can access practice
  if (userRole !== "student") notFound()

  return <PracticeListView />
}
