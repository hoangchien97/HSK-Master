"use client"

import { Accordion, AccordionItem, Chip } from "@heroui/react"
import PracticeLessonItem from "./PracticeLessonItem"

interface LessonItem {
  id: string
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
  return (
    <Accordion variant="splitted" defaultExpandedKeys={[courses[0]?.id]}>
      {courses.map((course) => {
        const hskLevel = course.hskLevel?.level ?? 0

        return (
          <AccordionItem
            key={course.id}
            aria-label={course.title}
            title={
              <div className="flex items-center gap-2 flex-wrap">
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
