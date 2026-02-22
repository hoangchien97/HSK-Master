"use client"

import { useMemo } from "react"
import { Accordion, AccordionItem, Chip, Progress } from "@heroui/react"
import PracticeLessonItem from "./PracticeLessonItem"

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
}

interface Props {
  courses: CourseItem[]
  progressMap: Record<string, ProgressItem>
}

function getLevelColor(level: number): "warning" | "danger" | "secondary" {
  if (level <= 2) return "warning"
  if (level <= 4) return "danger"
  return "secondary"
}

export default function PracticeCourseAccordion({ courses, progressMap }: Props) {
  // Compute per-course progress
  const courseProgress = useMemo(() => {
    const map: Record<string, { avgMastery: number; started: number; total: number }> = {}
    for (const course of courses) {
      const lessonIds = course.lessons.map((l) => l.id)
      const total = lessonIds.length
      const started = lessonIds.filter((id) => progressMap[id]?.learnedCount > 0).length
      const avgMastery = total > 0
        ? lessonIds.reduce((sum, id) => sum + (progressMap[id]?.masteryPercent ?? 0), 0) / total
        : 0
      map[course.id] = { avgMastery, started, total }
    }
    return map
  }, [courses, progressMap])

  return (
    <Accordion variant="splitted" defaultExpandedKeys={[courses[0]?.id]}>
      {courses.map((course) => {
        const hskLevel = course.hskLevel?.level ?? 0
        const cp = courseProgress[course.id]

        return (
          <AccordionItem
            key={course.id}
            aria-label={course.title}
            title={
              <div className="flex items-center gap-2 flex-wrap w-full">
                <Chip
                  size="sm"
                  color={getLevelColor(hskLevel)}
                  variant="flat"
                  className="font-bold"
                >
                  HSK {hskLevel}
                </Chip>
                <span className="font-semibold text-sm sm:text-base">{course.title}</span>
                <span className="text-xs text-default-400 hidden sm:inline">
                  ({course.lessons.length} bài · {course.vocabularyCount} từ vựng)
                </span>
                {cp && cp.started > 0 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Progress
                      value={cp.avgMastery}
                      size="sm"
                      color={cp.avgMastery >= 70 ? "success" : cp.avgMastery >= 30 ? "warning" : "primary"}
                      className="w-20 hidden sm:block"
                      aria-label="Tiến độ khóa học"
                    />
                    <span className="text-xs font-medium text-default-500">
                      {Math.round(cp.avgMastery)}%
                    </span>
                  </div>
                )}
              </div>
            }
          >
            <div className="grid gap-2 pb-2">
              {course.lessons.map((lesson) => (
                <PracticeLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  progress={progressMap[lesson.id]}
                />
              ))}
            </div>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
