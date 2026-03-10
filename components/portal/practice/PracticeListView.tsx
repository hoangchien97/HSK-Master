"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Card, CardBody, Progress, Chip, Button } from "@heroui/react"
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
        <Card>
          <CardBody className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-default-400" />
            </div>
            <p className="text-default-700 font-semibold text-lg">Chưa có khóa học nào</p>
            <p className="text-sm text-default-400 mt-2 max-w-md mx-auto">
              Bạn cần được đăng ký vào lớp HSK để bắt đầu luyện tập.
              Liên hệ giáo viên để được hỗ trợ.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* "Continue learning" banner */}
          {lastActiveLesson && lastActiveLesson.lessonSlug && (
            <Card
              className="border border-primary-200 dark:border-primary-800/40 bg-primary-50/50 dark:bg-primary-950/20 shadow-sm"
            >
              <CardBody className="p-3 sm:p-4">
                <Link
                  href={`/portal/student/practice/${lastActiveLesson.levelSlug}/${lastActiveLesson.lessonSlug}?tab=${lastActiveLesson.mode}`}
                  className="flex items-center gap-3 sm:gap-4 group"
                >
                  {/* Progress ring */}
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-primary-100 dark:text-primary-900/40" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeDasharray={`${(lastActiveLesson.masteryPercent / 100) * 94.25}, 94.25`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{Math.round(lastActiveLesson.masteryPercent)}%</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-primary-600 dark:text-primary-400 font-medium mb-0.5">
                      Tiếp tục học
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-default-800 dark:text-default-200 truncate group-hover:text-primary transition-colors">
                      {L.lessonView.lessonPrefix} {lastActiveLesson.lessonOrder}: {lastActiveLesson.lessonTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Chip size="sm" variant="flat" color="primary" className="text-[10px]" startContent={MODE_ICONS[lastActiveLesson.mode]}>
                        {L.tabLabels[lastActiveLesson.mode as PracticeMode] ?? lastActiveLesson.mode}
                      </Chip>
                      <span className="text-[10px] sm:text-xs text-default-400">
                        {lastActiveLesson.masteredCount}/{lastActiveLesson.totalCount} từ thành thạo
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <Button
                    as="span"
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="shrink-0 group-hover:bg-primary group-hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardBody>
            </Card>
          )}

          {/* First-time user: suggest first lesson */}
          {!lastActiveLesson && courses.length > 0 && courses[0].lessons.length > 0 && (() => {
            const firstLesson = courses[0].lessons[0]
            const hskLevel = courses[0].hskLevel?.level ?? 0
            return (
              <Card className="border border-success-200 dark:border-success-800/40 bg-success-50/50 dark:bg-success-950/20 shadow-sm">
                <CardBody className="p-3 sm:p-4">
                  <Link
                    href={`/portal/student/practice/hsk${hskLevel}/${firstLesson.slug}`}
                    className="flex items-center gap-3 sm:gap-4 group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs text-success-600 dark:text-success-400 font-medium mb-0.5">
                        Bắt đầu luyện tập
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-default-800 dark:text-default-200 truncate group-hover:text-success transition-colors">
                        {L.lessonView.lessonPrefix} {firstLesson.order}: {firstLesson.title}
                      </p>
                      <p className="text-[10px] sm:text-xs text-default-400 mt-0.5">
                        {courses[0].title} · {firstLesson._count.vocabularies} {L.lessonView.wordCountSuffix}
                      </p>
                    </div>
                    <Button
                      as="span"
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="success"
                      className="shrink-0 group-hover:bg-success group-hover:text-white transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            )
          })()}

          {/* Overview Stats */}
          {stats.lessonsStarted > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card shadow="sm" className="border border-primary-100 dark:border-primary-900/30">
                <CardBody className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-default-800 leading-none">{stats.lessonsStarted}<span className="text-xs font-normal text-default-400">/{stats.totalLessons}</span></p>
                    <p className="text-[11px] text-default-400 mt-0.5">Bài đã học</p>
                  </div>
                </CardBody>
              </Card>
              <Card shadow="sm" className="border border-warning-100 dark:border-warning-900/30">
                <CardBody className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center shrink-0">
                    <Trophy className="w-4.5 h-4.5 text-warning" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-default-800 leading-none">{stats.lessonsMastered}</p>
                    <p className="text-[11px] text-default-400 mt-0.5">Thành thạo</p>
                  </div>
                </CardBody>
              </Card>
              <Card shadow="sm" className="border border-secondary-100 dark:border-secondary-900/30">
                <CardBody className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center shrink-0">
                    <Clock className="w-4.5 h-4.5 text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-default-800 leading-none">{formatTime(stats.totalTimeSec)}</p>
                    <p className="text-[11px] text-default-400 mt-0.5">Thời gian</p>
                  </div>
                </CardBody>
              </Card>
              <Card shadow="sm" className="border border-success-100 dark:border-success-900/30">
                <CardBody className="p-3 flex items-center gap-3">
                  <div className="relative w-9 h-9 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-default-200 dark:text-default-700" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-success" strokeWidth="3" strokeDasharray={`${(stats.avgMastery / 100) * 87.96}, 87.96`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-success">
                      {Math.round(stats.avgMastery)}%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-default-800 leading-none">{Math.round(stats.avgMastery)}%</p>
                    <p className="text-[11px] text-default-400 mt-0.5">Tiến độ</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Course Accordion */}
          <PracticeCourseAccordion courses={courses} progressMap={progressMap} skillProgressMap={initialSkillProgressMap} />
        </>
      )}
    </div>
  )
}
