"use client"

import { useRouter } from "next/navigation"
import { Chip, Progress } from "@heroui/react"
import { ChevronRight, CheckCircle2, BookOpen } from "lucide-react"

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

interface Props {
  lesson: LessonItem
  progress?: ProgressItem | null
}

export default function PracticeLessonItem({ lesson, progress }: Props) {
  const router = useRouter()
  const vocabCount = lesson._count.vocabularies
  const mastery = progress?.masteryPercent ?? 0
  const isTest = lesson.title.includes("KIỂM TRA") || lesson.title.includes("ÔN TẬP")
  const isMastered = mastery >= 80
  const isStarted = mastery > 0

  return (
    <button
      onClick={() => router.push(`/portal/student/practice/${lesson.slug || lesson.id}`)}
      className={`w-full text-left p-3 rounded-lg border transition-all group ${
        isMastered
          ? "border-success-200 bg-success-50/30 dark:bg-success-950/10 hover:border-success-400"
          : isStarted
            ? "border-primary-200 bg-primary-50/20 dark:bg-primary-950/10 hover:border-primary-400"
            : "border-default-200 hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-950/20"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Order badge */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          isMastered
            ? "bg-success-100 dark:bg-success-900/30"
            : isStarted
              ? "bg-primary-100 dark:bg-primary-900/30"
              : "bg-default-100 dark:bg-default-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30"
        }`}>
          {isMastered ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <span className={`text-xs font-bold ${
              isStarted ? "text-primary" : "text-default-600 group-hover:text-primary"
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
            {isMastered && (
              <Chip size="sm" variant="flat" color="success" className="text-[10px] h-5">
                Thành thạo
              </Chip>
            )}
          </div>
          {lesson.titleChinese && (
            <p className="text-xs text-default-400 truncate">{lesson.titleChinese}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-default-400 flex items-center gap-0.5">
              <BookOpen className="w-3 h-3" />
              {vocabCount} từ vựng
            </span>
            {mastery > 0 && (
              <>
                <span className="text-default-300">·</span>
                <Progress
                  value={mastery}
                  size="sm"
                  color={mastery >= 80 ? "success" : mastery >= 40 ? "warning" : "primary"}
                  className="max-w-25"
                  aria-label="Tiến độ bài học"
                />
                <span className={`text-[10px] font-semibold ${
                  mastery >= 80 ? "text-success" : mastery >= 40 ? "text-warning" : "text-primary"
                }`}>
                  {Math.round(mastery)}%
                </span>
              </>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-default-300 group-hover:text-primary shrink-0 transition-colors" />
      </div>
    </button>
  )
}
