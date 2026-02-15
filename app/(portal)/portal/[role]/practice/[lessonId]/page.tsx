import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import LessonPracticeView from "@/components/portal/practice/LessonPracticeView"

type Props = {
  params: Promise<{ role: string; lessonId: string }>
}

export default async function LessonPracticePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.email) redirect("/portal/login")

  const { role: urlRole, lessonId } = await params
  const userRole = session.user.role.toLowerCase()
  if (urlRole !== userRole) notFound()

  // Only students can access practice
  if (userRole !== "student") notFound()

  return <LessonPracticeView lessonId={lessonId} />
}
