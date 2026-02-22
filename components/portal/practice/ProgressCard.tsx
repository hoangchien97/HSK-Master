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
      <CardBody className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Mastery circle */}
          <div className="flex items-center gap-3 sm:min-w-50">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
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
                <span className="text-sm sm:text-base font-bold text-primary">{Math.round(masteryPercent)}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Độ thành thạo</p>
              {remaining > 0 ? (
                <p className="text-xs text-default-500">Còn {remaining} từ chưa học</p>
              ) : totalItems > 0 ? (
                <p className="text-xs text-success-600">Đã học hết!</p>
              ) : (
                <p className="text-xs text-default-400">Chưa có từ vựng</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-foreground">{learnedCount}</p>
                <p className="text-[10px] sm:text-xs text-default-500">Đã học</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-foreground">{masteredCount}</p>
                <p className="text-[10px] sm:text-xs text-default-500">Thành thạo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-warning-100 dark:bg-warning-900/30">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-foreground">{formatTime(totalTimeSec)}</p>
                <p className="text-[10px] sm:text-xs text-default-500">Thời gian</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {totalItems > 0 && (
          <Progress
            value={masteryPercent}
            color="primary"
            size="sm"
            className="mt-3"
            aria-label="Tiến độ học tập"
          />
        )}
      </CardBody>
    </Card>
  )
}
