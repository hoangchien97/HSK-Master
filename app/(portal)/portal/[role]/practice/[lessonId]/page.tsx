import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import {
  getLessonWithVocabularies,
  getSiblingLessons,
  getStudentLessonProgress,
  getStudentItemProgressForLesson,
} from "@/services/portal/practice.service"
import LessonPracticeView from "@/components/portal/practice/LessonPracticeView"

type Props = {
  params: Promise<{ role: string; lessonId: string }>
}

export default async function LessonPracticePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.email) redirect("/portal/login")

  const { role: urlRole, lessonId: lessonIdOrSlug } = await params
  const userRole = session.user.role.toLowerCase()
  if (urlRole !== userRole) notFound()
  if (userRole !== "student") notFound()

  // Fetch all data server-side (SSR) — no client POST needed
  const lesson = await getLessonWithVocabularies(lessonIdOrSlug)
  if (!lesson) notFound()

  const [progress, itemProgress, siblings] = await Promise.all([
    getStudentLessonProgress(session.user.id, lesson.id),
    getStudentItemProgressForLesson(session.user.id, lesson.id),
    getSiblingLessons(lesson.courseId),
  ])

  // Serialize for client (strip Date objects, non-serializable fields)
  const lessonData = {
    ...lesson,
    vocabularies: lesson.vocabularies.map((v) => ({ ...v, createdAt: undefined })),
  }

  return (
    <LessonPracticeView
      lessonSlug={lessonIdOrSlug}
      initialLesson={JSON.parse(JSON.stringify(lessonData))}
      initialProgress={JSON.parse(JSON.stringify(progress))}
      initialItemProgress={JSON.parse(JSON.stringify(itemProgress))}
      initialSiblings={siblings.map((s) => ({ id: s.id, slug: s.slug, title: s.title, order: s.order }))}
    />
  )
}
