"use client"

import { useRouter } from "next/navigation"
import { Chip, Progress, Tooltip } from "@heroui/react"
import { ChevronRight, CheckCircle2, BookOpen, Layers, HelpCircle, Headphones, PenLine } from "lucide-react"

interface LessonItem {
  id: string
  slug?: string | null
  title: string
  titleChinese: string | null
  order: number
  _count: { vocabularies: number }
}

interface ProgressItem {
  masteryPercent: number
  learnedCount?: number
  masteredCount?: number
}

interface SkillModeInfo {
  masteryPercent: number
  masteredCount: number
  totalCount: number
}

interface Props {
  lesson: LessonItem
  progress?: ProgressItem | null
  levelSlug: string
  /** Per-mode skill progress keyed by mode string (FLASHCARD, QUIZ, LISTEN, WRITE) */
  skillProgress?: Record<string, SkillModeInfo>
}

const MODE_ICONS: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  FLASHCARD: { icon: <Layers className="w-3 h-3" />, label: "Flashcard", color: "text-primary", bg: "bg-primary-50 dark:bg-primary-900/20" },
  QUIZ: { icon: <HelpCircle className="w-3 h-3" />, label: "Quiz", color: "text-secondary", bg: "bg-secondary-50 dark:bg-secondary-900/20" },
  LISTEN: { icon: <Headphones className="w-3 h-3" />, label: "Nghe", color: "text-warning", bg: "bg-warning-50 dark:bg-warning-900/20" },
  WRITE: { icon: <PenLine className="w-3 h-3" />, label: "Viết", color: "text-danger", bg: "bg-danger-50 dark:bg-danger-900/20" },
}

export default function PracticeLessonItem({ lesson, progress, levelSlug, skillProgress }: Props) {
  const router = useRouter()
  const vocabCount = lesson._count.vocabularies
  const mastery = progress?.masteryPercent ?? 0
  const isTest = lesson.title.includes("KIỂM TRA") || lesson.title.includes("ÔN TẬP")
  const isMastered = mastery >= 80
  const isStarted = mastery > 0

  return (
    <button
      onClick={() => router.push(`/portal/student/practice/${levelSlug}/${lesson.slug}`)}
      className={`w-full text-left p-3 rounded-xl border transition-all group cursor-pointer ${
        isMastered
          ? "border-success-200 bg-success-50/40 dark:bg-success-950/10 hover:border-success-300 hover:shadow-sm"
          : isStarted
            ? "border-primary-100 bg-primary-50/30 dark:bg-primary-950/10 hover:border-primary-300 hover:shadow-sm"
            : "border-default-200 hover:border-primary-200 hover:bg-default-50 dark:hover:bg-default-800/50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Order badge */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          isMastered
            ? "bg-success-100 dark:bg-success-900/30"
            : isStarted
              ? "bg-primary-100 dark:bg-primary-900/30"
              : "bg-default-100 dark:bg-default-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20"
        }`}>
          {isMastered ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <span className={`text-xs font-bold ${
              isStarted ? "text-primary" : "text-default-500 group-hover:text-primary"
            }`}>
              {lesson.order}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{lesson.title}</p>
            {isTest && (
              <Chip size="sm" variant="flat" color="danger" className="text-[10px] h-5">
                {lesson.title.includes("KIỂM TRA") ? "Kiểm tra" : "Ôn tập"}
              </Chip>
            )}
          </div>
          {lesson.titleChinese && (
            <p className="text-xs text-default-400 truncate mt-0.5">{lesson.titleChinese}</p>
          )}

          {/* Meta row: vocab count + progress */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-default-400 flex items-center gap-0.5">
              <BookOpen className="w-3 h-3" />
              {vocabCount} từ
            </span>
            {mastery > 0 && (
              <>
                <span className="text-default-200">·</span>
                <div className="flex items-center gap-1.5 flex-1 max-w-32">
                  <Progress
                    value={mastery}
                    size="sm"
                    color={mastery >= 80 ? "success" : mastery >= 40 ? "warning" : "primary"}
                    className="flex-1"
                    aria-label="Tiến độ bài học"
                  />
                  <span className={`text-[10px] font-semibold tabular-nums ${
                    mastery >= 80 ? "text-success" : mastery >= 40 ? "text-warning" : "text-primary"
                  }`}>
                    {Math.round(mastery)}%
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Per-mode skill badges */}
          {skillProgress && Object.keys(skillProgress).length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {Object.entries(MODE_ICONS).map(([mode, { icon, label, color, bg }]) => {
                const sp = skillProgress[mode]
                if (!sp) return null
                return (
                  <Tooltip key={mode} content={`${label}: ${sp.masteredCount}/${sp.totalCount} thành thạo`} size="sm">
                    <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md ${bg} ${color}`}>
                      {icon}
                      <span className="font-medium tabular-nums">{sp.masteryPercent}%</span>
                    </span>
                  </Tooltip>
                )
              })}
            </div>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-default-300 group-hover:text-primary shrink-0 transition-colors" />
      </div>
    </button>
  )
}
