"use client"

import { useRouter } from "next/navigation"
import { Chip, Progress } from "@heroui/react"
import { ChevronRight } from "lucide-react"

interface LessonItem {
  id: string
  title: string
  titleChinese: string | null
  order: number
  _count: { vocabularies: number }
}

interface ProgressItem {
  masteryPercent: number
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

  return (
    <button
      onClick={() => router.push(`/portal/student/practice/${lesson.id}`)}
      className="w-full text-left p-3 rounded-lg border border-default-200 hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-all group"
    >
      <div className="flex items-center gap-3">
        {/* Order badge */}
        <div className="w-8 h-8 rounded-lg bg-default-100 dark:bg-default-800 flex items-center justify-center shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
          <span className="text-xs font-bold text-default-600 group-hover:text-primary">
            {lesson.order}
          </span>
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
            <p className="text-xs text-default-400 truncate">{lesson.titleChinese}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-default-400">{vocabCount} từ</span>
            {mastery > 0 && (
              <>
                <Progress
                  value={mastery}
                  size="sm"
                  color={mastery >= 80 ? "success" : mastery >= 40 ? "warning" : "primary"}
                  className="max-w-[80px]"
                  aria-label="progress"
                />
                <span className="text-[10px] font-medium text-default-500">
                  {Math.round(mastery)}%
                </span>
              </>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-default-300 group-hover:text-primary shrink-0" />
      </div>
    </button>
  )
}
