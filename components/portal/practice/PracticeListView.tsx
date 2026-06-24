"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui"
import { GraduationCap, BookOpen, Trophy, Clock, ArrowRight, Layers, HelpCircle, Headphones, PenTool } from "lucide-react"
import { PracticeMode } from "@/enums/portal/common"
import { PRACTICE_LABELS } from "@/constants/portal/practice"
import PracticeCourseAccordion from "./PracticeCourseAccordion"

const L = PRACTICE_LABELS

interface LessonItem {
  id: string
  slug?: string | null
  title: string
  titleChinese: string | null
  order: number
  _count: { vocabularies: number }
}

interface CourseItem {
  id: string
  title: string
  slug: string
  level: string | null
  lessonCount: number
  vocabularyCount: number
  hskLevel: { level: number; badge: string; badgeColor: string; accentColor: string } | null
  lessons: LessonItem[]
}

interface ProgressItem {
  lessonId: string
  masteryPercent: number
  learnedCount: number
  masteredCount: number
  totalTimeSec?: number
}

interface LastActiveLesson {
  lessonId: string
  lessonSlug: string | null
  lessonTitle: string
  lessonOrder: number
  courseTitle: string
  levelSlug: string
  mode: string
  lastIndex: number
  totalVocab: number
  masteredCount: number
  totalCount: number
  masteryPercent: number
}

const MODE_ICONS: Record<string, React.ReactNode> = {
  [PracticeMode.FLASHCARD]: <Layers className="w-3.5 h-3.5" />,
  [PracticeMode.QUIZ]: <HelpCircle className="w-3.5 h-3.5" />,
  [PracticeMode.LISTEN]: <Headphones className="w-3.5 h-3.5" />,
  [PracticeMode.WRITE]: <PenTool className="w-3.5 h-3.5" />,
}

interface Props {
  initialCourses: CourseItem[]
  initialProgressMap: Record<string, ProgressItem>
  /** Per-lesson per-mode skill progress: { [lessonId]: { [mode]: PortalLessonSkillProgress } } */
  initialSkillProgressMap?: Record<string, Record<string, { masteredCount: number; totalCount: number }>>
  /** Most recently practiced lesson (for "Continue learning" banner) */
  lastActiveLesson?: LastActiveLesson | null
}

function formatTime(sec: number) {
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} phút`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}p` : `${h} giờ`
}

export default function PracticeListView({ initialCourses, initialProgressMap, initialSkillProgressMap, lastActiveLesson }: Props) {
  const courses = initialCourses
  const progressMap = initialProgressMap

  // Compute overall stats
  const stats = useMemo(() => {
    const allLessonIds = courses.flatMap((c) => c.lessons.map((l) => l.id))
    const totalLessons = allLessonIds.length
    const lessonsStarted = allLessonIds.filter((id) => progressMap[id]?.learnedCount > 0).length
    const lessonsMastered = allLessonIds.filter((id) => (progressMap[id]?.masteryPercent ?? 0) >= 80).length
    const totalTimeSec = Object.values(progressMap).reduce((sum, p) => sum + (p.totalTimeSec ?? 0), 0)
    const avgMastery = totalLessons > 0
      ? allLessonIds.reduce((sum, id) => sum + (progressMap[id]?.masteryPercent ?? 0), 0) / totalLessons
      : 0
    return { totalLessons, lessonsStarted, lessonsMastered, totalTimeSec, avgMastery }
  }, [courses, progressMap])

  return (
    <div className="space-y-5">
      {/* Courses */}
      {courses.length === 0 ? (
        <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-(--color-paper) flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-(--color-muted)" />
            </div>
            <p className="text-(--color-ink) font-semibold text-lg">Chưa có khóa học nào</p>
            <p className="text-sm text-(--color-muted) mt-2 max-w-md mx-auto">
              Bạn cần được đăng ký vào lớp HSK để bắt đầu luyện tập.
              Liên hệ giáo viên để được hỗ trợ.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* "Continue learning" banner */}
          {lastActiveLesson && lastActiveLesson.lessonSlug && (
            <div className="rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20 shadow-sm p-3 sm:p-4">
              <Link
                href={`/portal/student/practice/${lastActiveLesson.levelSlug}/${lastActiveLesson.lessonSlug}?tab=${lastActiveLesson.mode}`}
                className="flex items-center gap-3 sm:gap-4 group"
              >
                {/* Progress ring */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-red-100 dark:text-red-900/40" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-(--color-vermillion)" strokeWidth="2.5" strokeDasharray={`${(lastActiveLesson.masteryPercent / 100) * 94.25}, 94.25`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-(--color-vermillion)">{Math.round(lastActiveLesson.masteryPercent)}%</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 font-medium mb-0.5">
                    Tiếp tục học
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-(--color-ink) truncate group-hover:text-(--color-vermillion) transition-colors">
                    {L.lessonView.lessonPrefix} {lastActiveLesson.lessonOrder}: {lastActiveLesson.lessonTitle}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge size="sm" variant="primary" className="text-[10px] gap-1">
                      {MODE_ICONS[lastActiveLesson.mode]}
                      {L.tabLabels[lastActiveLesson.mode as PracticeMode] ?? lastActiveLesson.mode}
                    </Badge>
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      {lastActiveLesson.masteredCount}/{lastActiveLesson.totalCount} từ thành thạo
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <button type="button" className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )}

          {/* First-time user: suggest first lesson */}
          {!lastActiveLesson && courses.length > 0 && courses[0].lessons.length > 0 && (() => {
            const firstLesson = courses[0].lessons[0]
            const hskLevel = courses[0].hskLevel?.level ?? 0
            return (
              <div className="rounded-xl border border-green-200 dark:border-green-800/40 bg-green-50/50 dark:bg-green-950/20 shadow-sm p-3 sm:p-4">
                <Link
                  href={`/portal/student/practice/hsk${hskLevel}/${firstLesson.slug}`}
                  className="flex items-center gap-3 sm:gap-4 group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium mb-0.5">
                      Bắt đầu luyện tập
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-(--color-ink) truncate group-hover:text-green-600 transition-colors">
                      {L.lessonView.lessonPrefix} {firstLesson.order}: {firstLesson.title}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                      {courses[0].title} · {firstLesson._count.vocabularies} {L.lessonView.wordCountSuffix}
                    </p>
                  </div>
                  <button type="button" className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            )
          })()}

          {/* Overview Stats */}
          {stats.lessonsStarted > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-red-100 dark:border-red-900/30 bg-white p-4 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-(--color-vermillion)" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-(--color-ink) leading-none">{stats.lessonsStarted}<span className="text-xs font-normal text-gray-400">/{stats.totalLessons}</span></p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Bài đã học</p>
                </div>
              </div>
              <div className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-white p-4 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-(--color-ink) leading-none">{stats.lessonsMastered}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Thành thạo</p>
                </div>
              </div>
              <div className="rounded-xl border border-purple-100 dark:border-purple-900/30 bg-white p-4 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-(--color-ink) leading-none">{formatTime(stats.totalTimeSec)}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Thời gian</p>
                </div>
              </div>
              <div className="rounded-xl border border-green-100 dark:border-green-900/30 bg-white p-4 shadow-sm flex items-center gap-3">
                <div className="relative w-9 h-9 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-green-600" strokeWidth="3" strokeDasharray={`${(stats.avgMastery / 100) * 87.96}, 87.96`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-green-600">
                    {Math.round(stats.avgMastery)}%
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-(--color-ink) leading-none">{Math.round(stats.avgMastery)}%</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Tiến độ</p>
                </div>
              </div>
            </div>
          )}

          {/* Course Accordion */}
          <PracticeCourseAccordion courses={courses} progressMap={progressMap} skillProgressMap={initialSkillProgressMap} />
        </>
      )}
    </div>
  )
}
