"use client"

import { Card, CardBody, Progress } from "@heroui/react"
import { BookOpen, Award, Clock } from "lucide-react"

interface ProgressCardProps {
  totalItems: number
  learnedCount: number
  masteredCount: number
  totalTimeSec: number
  masteryPercent: number
}

function formatTime(sec: number): string {
  if (sec < 60) return `${sec}s`
  if (sec < 3600) return `${Math.floor(sec / 60)}m`
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function ProgressCard({
  totalItems,
  learnedCount,
  masteredCount,
  totalTimeSec,
  masteryPercent,
}: ProgressCardProps) {
  const remaining = totalItems - learnedCount

  return (
    <Card className="bg-linear-to-r from-primary-50 to-secondary-50 dark:from-primary-950/30 dark:to-secondary-950/30 border border-primary-100 dark:border-primary-900/30">
      <CardBody className="p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mastery circle — compact */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18" cy="18" r="15.9155"
                fill="none"
                stroke="currentColor"
                className="text-default-200 dark:text-default-700"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.9155"
                fill="none"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="3"
                strokeDasharray={`${masteryPercent}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-primary">{Math.round(masteryPercent)}%</span>
            </div>
          </div>

          {/* Stats — single row */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-bold text-foreground leading-none">{learnedCount}</p>
                <p className="text-[9px] sm:text-[10px] text-default-500">Đã học</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-success shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-bold text-foreground leading-none">{masteredCount}</p>
                <p className="text-[9px] sm:text-[10px] text-default-500">Thành thạo</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-warning shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-bold text-foreground leading-none">{formatTime(totalTimeSec)}</p>
                <p className="text-[9px] sm:text-[10px] text-default-500">Thời gian</p>
              </div>
            </div>
          </div>

          {/* Remaining indicator */}
          <div className="text-right shrink-0 hidden sm:block">
            {remaining > 0 ? (
              <p className="text-[10px] text-default-500">Còn {remaining} từ</p>
            ) : totalItems > 0 ? (
              <p className="text-[10px] text-success-600 font-medium">✓ Đã học hết!</p>
            ) : null}
          </div>
        </div>

        {/* Progress bar */}
        {totalItems > 0 && (
          <Progress
            value={masteryPercent}
            color="primary"
            size="sm"
            className="mt-2"
            aria-label="Tiến độ học tập"
          />
        )}
      </CardBody>
    </Card>
  )
}
