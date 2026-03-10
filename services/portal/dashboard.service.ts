/**
 * Dashboard Service — real data for Student Dashboard
 *
 * Replaces the hardcoded demo data with actual DB queries.
 */

import { prisma } from "@/lib/prisma"

/* ─────────── Types ─────────── */

export interface DashboardStats {
  wordsLearned: number
  streakDays: number
  completedLessons: number
  pendingAssignments: number
  overallProgress: number
}

export interface ContinueLearning {
  lessonId: string
  lessonSlug: string | null
  lessonTitle: string
  lessonOrder: number
  courseSlug: string | null
  courseLevel: string | null
  mode: string
  masteredCount: number
  totalCount: number
}

export interface UpcomingClass {
  id: string
  className: string
  teacher: string
  startTime: string
  endTime: string
  room: string | null
}

export interface PendingAssignment {
  id: string
  title: string
  className: string
  dueDate: string | null
  type: string
}

export interface RecentVocab {
  word: string
  pinyin: string | null
  meaning: string
  status: string
  masteryScore: number
}

export interface LearningProgressItem {
  skill: string
  progress: number
  color: string
}

/* ─────────── Queries ─────────── */

/**
 * Get dashboard stats for a student.
 */
export async function getStudentDashboardStats(studentId: string): Promise<DashboardStats> {
  const [wordsLearned, completedLessons, pendingAssignments, allSkillProgress] = await Promise.all([
    // Words with any progress (seen at least once)
    prisma.portalItemProgress.count({
      where: { studentId, seenCount: { gt: 0 } },
    }),
    // Lessons with mastery >= 80%
    prisma.portalLessonProgress.count({
      where: { studentId, masteryPercent: { gte: 80 } },
    }),
    // Assignments not submitted (via submissions)
    prisma.portalAssignment.count({
      where: {
        class: {
          enrollments: {
            some: { studentId, status: "ACTIVE" },
          },
        },
        submissions: {
          none: { studentId },
        },
      },
    }),
    // Overall skill progress for computing average
    prisma.portalLessonSkillProgress.findMany({
      where: { studentId },
      select: { masteryPercent: true },
    }),
  ])

  // Compute streak: count consecutive days with practice sessions
  const streakDays = await computeStreak(studentId)

  // Overall progress: average across all lesson-mode combinations
  const overallProgress = allSkillProgress.length > 0
    ? Math.round(allSkillProgress.reduce((sum, p) => sum + p.masteryPercent, 0) / allSkillProgress.length)
    : 0

  return {
    wordsLearned,
    streakDays,
    completedLessons,
    pendingAssignments,
    overallProgress,
  }
}

/**
 * Get the last active lesson session for "Continue Learning" banner.
 */
export async function getLastActiveLesson(studentId: string): Promise<ContinueLearning | null> {
  try {
    const session = await prisma.portalLessonSessionState.findFirst({
      where: { studentId, isCompleted: false },
      orderBy: { id: "desc" },
      select: {
        lessonId: true,
        mode: true,
        lesson: {
          select: {
            slug: true,
            title: true,
            order: true,
            course: { select: { slug: true, level: true } },
            _count: { select: { vocabularies: true } },
          },
        },
      },
    })

    if (!session?.lesson) return null

    // Get mastered count for this lesson + mode
    const skillProgress = await prisma.portalLessonSkillProgress.findUnique({
      where: {
        studentId_lessonId_mode: {
          studentId,
          lessonId: session.lessonId,
          mode: session.mode,
        },
      },
      select: { masteredCount: true, totalCount: true },
    })

    return {
      lessonId: session.lessonId,
      lessonSlug: session.lesson.slug,
      lessonTitle: session.lesson.title,
      lessonOrder: session.lesson.order,
      courseSlug: session.lesson.course.slug,
      courseLevel: session.lesson.course.level,
      mode: session.mode,
      masteredCount: skillProgress?.masteredCount ?? 0,
      totalCount: skillProgress?.totalCount ?? session.lesson._count.vocabularies,
    }
  } catch {
    return null
  }
}

/**
 * Get upcoming scheduled classes for a student.
 */
export async function getUpcomingClasses(studentId: string, limit = 3): Promise<UpcomingClass[]> {
  try {
    const schedules = await prisma.portalSchedule.findMany({
      where: {
        startAt: { gte: new Date() },
        status: "SCHEDULED",
        class: {
          enrollments: {
            some: { studentId, status: "ENROLLED" },
          },
        },
      },
      orderBy: { startAt: "asc" },
      take: limit,
      select: {
        id: true,
        startAt: true,
        endAt: true,
        location: true,
        class: {
          select: {
            className: true,
            teacher: { select: { name: true } },
          },
        },
      },
    })

    return schedules.map((s) => ({
      id: s.id,
      className: s.class?.className ?? "Lớp học",
      teacher: s.class?.teacher?.name ?? "Giáo viên",
      startTime: s.startAt.toISOString(),
      endTime: s.endAt.toISOString(),
      room: s.location,
    }))
  } catch {
    return []
  }
}

/**
 * Get pending assignments for a student.
 */
export async function getPendingAssignments(studentId: string, limit = 3): Promise<PendingAssignment[]> {
  try {
    const assignments = await prisma.portalAssignment.findMany({
      where: {
        status: "PUBLISHED",
        class: {
          enrollments: {
            some: { studentId, status: "ENROLLED" },
          },
        },
        submissions: {
          none: { studentId },
        },
      },
      orderBy: { dueDate: "asc" },
      take: limit,
      select: {
        id: true,
        title: true,
        dueDate: true,
        assignmentType: true,
        class: { select: { className: true } },
      },
    })

    return assignments.map((a) => ({
      id: a.id,
      title: a.title,
      className: a.class?.className ?? "",
      dueDate: a.dueDate ? a.dueDate.toISOString() : null,
      type: a.assignmentType,
    }))
  } catch {
    return []
  }
}

/**
 * Get recently seen vocabulary.
 */
export async function getRecentVocabulary(studentId: string, limit = 5): Promise<RecentVocab[]> {
  try {
    const items = await prisma.portalItemProgress.findMany({
      where: { studentId, seenCount: { gt: 0 } },
      orderBy: { lastSeenAt: "desc" },
      take: limit,
      select: {
        status: true,
        masteryScore: true,
        vocabulary: {
          select: { word: true, pinyin: true, meaning: true },
        },
      },
    })

    return items.map((item) => ({
      word: item.vocabulary.word,
      pinyin: item.vocabulary.pinyin,
      meaning: item.vocabulary.meaning,
      status: item.status,
      masteryScore: item.masteryScore,
    }))
  } catch {
    return []
  }
}

/**
 * Get learning progress by mode across all lessons.
 */
export async function getLearningProgressByMode(studentId: string): Promise<LearningProgressItem[]> {
  try {
    const skillData = await prisma.portalLessonSkillProgress.groupBy({
      by: ["mode"],
      where: { studentId },
      _avg: { masteryPercent: true },
    })

    const modeConfig: Record<string, { label: string; color: string }> = {
      FLASHCARD: { label: "Flashcard", color: "bg-blue-500" },
      QUIZ: { label: "Quiz", color: "bg-green-500" },
      LISTEN: { label: "Nghe", color: "bg-purple-500" },
      WRITE: { label: "Viết", color: "bg-orange-500" },
    }

    return Object.entries(modeConfig).map(([mode, config]) => {
      const data = skillData.find((d) => d.mode === mode)
      return {
        skill: config.label,
        progress: Math.round(data?._avg?.masteryPercent ?? 0),
        color: config.color,
      }
    })
  } catch {
    return [
      { skill: "Flashcard", progress: 0, color: "bg-blue-500" },
      { skill: "Quiz", progress: 0, color: "bg-green-500" },
      { skill: "Nghe", progress: 0, color: "bg-purple-500" },
      { skill: "Viết", progress: 0, color: "bg-orange-500" },
    ]
  }
}

/* ─────────── Helpers ─────────── */

/**
 * Compute consecutive days streak from practice sessions.
 */
async function computeStreak(studentId: string): Promise<number> {
  try {
    const sessions = await prisma.portalPracticeSession.findMany({
      where: { studentId },
      select: { startedAt: true },
      orderBy: { startedAt: "desc" },
    })

    if (sessions.length === 0) return 0

    // Get unique dates (YYYY-MM-DD)
    const dates = new Set(
      sessions.map((s) => s.startedAt.toISOString().slice(0, 10))
    )
    const sortedDates = [...dates].sort().reverse()

    // Check if today or yesterday is included
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) {
      return 0
    }

    // Count consecutive days
    let streak = 0
    let currentDate = new Date(sortedDates[0])

    for (const dateStr of sortedDates) {
      const expected = currentDate.toISOString().slice(0, 10)
      if (dateStr === expected) {
        streak++
        currentDate = new Date(currentDate.getTime() - 86400000)
      } else {
        break
      }
    }

    return streak
  } catch {
    return 0
  }
}
