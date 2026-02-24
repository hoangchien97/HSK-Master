/**
 * Practice Detail Page — SSR + CSR hybrid
 *
 * ┌─────────────────────────────────────────────────┐
 * │  SERVER (this file)                              │
 * │  • Auth guard                                    │
 * │  • Fetch lesson, vocabularies, progress,         │
 * │    item-progress, siblings via Prisma            │
 * │  • Generate <head> metadata (SEO)                │
 * │  • Serialize & pass everything as props ↓        │
 * ├─────────────────────────────────────────────────┤
 * │  CLIENT (LessonPracticeView)                     │
 * │  • Header + ProgressCard (hydrated from props)   │
 * │  • Tabs: Lookup | Flashcard | Quiz | Listen |    │
 * │    Write — all interactive, lazy-loaded          │
 * │  • Web Speech API (useSpeech)                    │
 * │  • hanzi-writer (WriteTab)                       │
 * │  • Server Actions for progress updates           │
 * └─────────────────────────────────────────────────┘
 */

import { Metadata } from "next"
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
  params: Promise<{ role: string; slug: string }>
}

/* ───────── SEO Metadata (SSR) ───────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lesson = await getLessonWithVocabularies(slug)

  if (!lesson) {
    return { title: "Bài luyện tập không tồn tại" }
  }

  const title = `Bài ${lesson.order}: ${lesson.title} — Luyện tập`
  const description = lesson.description
    || `Luyện tập ${lesson.vocabularies.length} từ vựng HSK: Flashcard, Quiz, Nghe, Viết`

  return {
    title,
    description,
    openGraph: { title, description },
  }
}

/* ───────── Page Component (SSR — async server component) ───────── */

export default async function LessonPracticePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.email) redirect("/portal/login")

  const { role: urlRole, slug } = await params
  const userRole = session.user.role.toLowerCase()
  if (urlRole !== userRole) notFound()
  if (userRole !== "student") notFound()

  /* ── SSR data fetching — all Prisma queries run on server ── */
  const lesson = await getLessonWithVocabularies(slug)
  if (!lesson) notFound()

  const [progress, itemProgress, siblings] = await Promise.all([
    getStudentLessonProgress(session.user.id, lesson.id),
    getStudentItemProgressForLesson(session.user.id, lesson.id),
    getSiblingLessons(lesson.courseId),
  ])

  /* ── Serialize for client boundary (Date → string, strip non-serializable) ── */
  return (
    <LessonPracticeView
      lessonSlug={slug}
      initialLesson={JSON.parse(JSON.stringify(lesson))}
      initialProgress={JSON.parse(JSON.stringify(progress))}
      initialItemProgress={JSON.parse(JSON.stringify(itemProgress))}
      initialSiblings={siblings.map((s) => ({ id: s.id, slug: s.slug, title: s.title, order: s.order }))}
    />
  )
}
