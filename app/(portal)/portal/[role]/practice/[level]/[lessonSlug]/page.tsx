/**
 * Practice Detail Page — /portal/[role]/practice/[level]/[lessonSlug]
 *
 * Example: /portal/student/practice/hsk1/gioi-thieu-lam-quen-tieng-trung
 * Breadcrumb: Luyện tập → HSK 1 → 1. Giới thiệu làm quen Tiếng Trung
 */

import { Metadata } from "next"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import {
  getLessonWithVocabularies,
  getSiblingLessons,
} from "@/services/portal/practice.service"
import { getLessonAllModeSkillProgress, getLessonProgressFromSkills } from "@/services/portal/practice-skill.service"
import { levelSlugToLabel } from "@/utils/practice"
import { serializeDates } from "@/utils/serialize"
import LessonPracticeView from "@/components/portal/practice/LessonPracticeView"
import { ROLE_ROUTES } from "@/lib/utils/auth"

type Props = {
  params: Promise<{ role: string; level: string; lessonSlug: string }>
}

/* ───────── Metadata ───────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level, lessonSlug } = await params
  const lesson = await getLessonWithVocabularies(lessonSlug)
  if (!lesson) return { title: "Bài luyện tập không tồn tại" }

  const levelLabel = levelSlugToLabel(level)
  const title = `Bài ${lesson.order}: ${lesson.title} — ${levelLabel}`
  const description =
    lesson.description ||
    `Luyện tập ${lesson.vocabularies.length} từ vựng ${levelLabel}: Flashcard, Quiz, Nghe, Viết`

  return { title, description, openGraph: { title, description } }
}

/* ───────── Page ───────── */

export default async function PracticeDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.email) redirect("/portal/login")

  const { role: urlRole, level, lessonSlug } = await params
  const userRole = session.user.role.toLowerCase()
  if (urlRole !== userRole || userRole !== ROLE_ROUTES.STUDENT) notFound()

  const lesson = await getLessonWithVocabularies(lessonSlug)
  if (!lesson) notFound()

  const [progress, siblings, skillProgress] = await Promise.all([
    getLessonProgressFromSkills(session.user.id, lesson.id),
    getSiblingLessons(lesson.courseId),
    getLessonAllModeSkillProgress(session.user.id, lesson.id),
  ])

  return (
    <LessonPracticeView
      levelSlug={level}
      lessonSlug={lessonSlug}
      initialLesson={serializeDates(lesson)}
      initialProgress={serializeDates(progress)}
      initialItemProgress={{}}
      initialSiblings={siblings.map((s) => ({ id: s.id, slug: s.slug, title: s.title, order: s.order }))}
      initialSkillProgress={serializeDates(skillProgress)}
    />
  )
}
