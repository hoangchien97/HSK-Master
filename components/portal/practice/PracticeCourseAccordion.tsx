"use client"

import { useMemo, useState, useCallback } from "react"
import { Badge, Progress } from "@/components/ui"
import { ChevronDown } from "lucide-react"
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
  /** Per-lesson per-mode skill progress: { [lessonId]: { [mode]: { masteredCount, totalCount } } } */
  skillProgressMap?: Record<string, Record<string, { masteredCount: number; totalCount: number }>>
}

function getLevelBadgeVariant(level: number): "warning" | "danger" | "default" {
  if (level <= 2) return "warning"
  if (level <= 4) return "danger"
  return "default"
}

export default function PracticeCourseAccordion({ courses, progressMap, skillProgressMap }: Props) {
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

  // Smart default: expand the course with the most progress that isn't yet mastered.
  // If none started, expand the first course.
  const defaultExpanded = useMemo(() => {
    let best: string | null = null
    let bestScore = -1
    for (const c of courses) {
      const cp = courseProgress[c.id]
      if (!cp || cp.started === 0) continue
      // Prefer the course that is in-progress (not 100% mastered) with most lessons started
      const score = cp.avgMastery < 80 ? cp.started * 1000 + cp.avgMastery : cp.started
      if (score > bestScore) {
        bestScore = score
        best = c.id
      }
    }
    return best ?? courses[0]?.id ?? ""
  }, [courses, courseProgress])

  // Controlled expanded keys
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([defaultExpanded]))

  const toggle = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  return (
    <div className="flex flex-col gap-3">
      {courses.map((course) => {
        const hskLevel = course.hskLevel?.level ?? 0
        const cp = courseProgress[course.id]
        const isOpen = expandedKeys.has(course.id)

        return (
          <div key={course.id} className="rounded-xl shadow-sm border border-(--color-smoke) dark:border-gray-700/50 bg-white overflow-hidden">
            {/* Trigger */}
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(course.id)}
              className="w-full text-left py-3 px-4 flex items-center gap-2 flex-wrap hover:bg-(--color-paper) transition-colors"
            >
              <Badge
                size="sm"
                variant={getLevelBadgeVariant(hskLevel)}
                className="font-bold"
              >
                HSK {hskLevel}
              </Badge>
              <span className="font-semibold text-sm sm:text-base">{course.title}</span>
              <span className="text-xs text-gray-400 hidden sm:inline">
                {course.lessons.length} bài · {course.vocabularyCount} từ vựng
              </span>
              {cp && cp.started > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <Progress
                    value={cp.avgMastery}
                    size="sm"
                    variant={cp.avgMastery >= 70 ? "success" : cp.avgMastery >= 30 ? "warning" : "default"}
                    className="w-20 hidden sm:block"
                  />
                  <span className="text-xs font-semibold tabular-nums text-(--color-muted)">
                    {Math.round(cp.avgMastery)}%
                  </span>
                </div>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-auto shrink-0 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Content */}
            {isOpen && (
              <div className="px-3 pb-3">
                <div className="grid gap-2 pb-2">
                  {course.lessons.map((lesson) => {
                    // Build per-mode skill progress for this lesson
                    const rawSkill = skillProgressMap?.[lesson.id]
                    const lessonSkill = rawSkill
                      ? Object.fromEntries(
                          Object.entries(rawSkill).map(([mode, v]) => [
                            mode,
                            {
                              masteryPercent: v.totalCount > 0 ? Math.round((v.masteredCount / v.totalCount) * 100) : 0,
                              masteredCount: v.masteredCount,
                              totalCount: v.totalCount,
                            },
                          ]),
                        )
                      : undefined
                    return (
                      <PracticeLessonItem
                        key={lesson.id}
                        lesson={lesson}
                        progress={progressMap[lesson.id]}
                        levelSlug={`hsk${hskLevel || 0}`}
                        skillProgress={lessonSkill}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
