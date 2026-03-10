"use client"

import { Card, CardBody, Progress, Tooltip } from "@heroui/react"
import { BookOpen, Award, Clock, Layers, HelpCircle, Headphones, PenTool } from "lucide-react"
import { PracticeMode } from "@/enums/portal/common"
import { PRACTICE_LABELS } from "@/constants/portal/practice"

const L = PRACTICE_LABELS

interface SkillInfo {
  masteryPercent: number
  masteredCount: number
  totalCount: number
}

interface ProgressCardProps {
  totalItems: number
  learnedCount: number
  masteredCount: number
  totalTimeSec: number
  masteryPercent: number
  /** Per-mode skill progress (optional — shown when available) */
  skillProgress?: Partial<Record<string, SkillInfo>>
}

const SKILL_CONFIG: { mode: string; label: string; icon: React.ReactNode; color: string; progressColor: "primary" | "warning" | "secondary" | "success" }[] = [
  { mode: PracticeMode.FLASHCARD, label: L.tabLabels[PracticeMode.FLASHCARD], icon: <Layers className="w-3.5 h-3.5" />, color: "text-primary", progressColor: "primary" },
  { mode: PracticeMode.QUIZ, label: L.tabLabels[PracticeMode.QUIZ], icon: <HelpCircle className="w-3.5 h-3.5" />, color: "text-warning", progressColor: "warning" },
  { mode: PracticeMode.LISTEN, label: L.tabLabels[PracticeMode.LISTEN], icon: <Headphones className="w-3.5 h-3.5" />, color: "text-secondary", progressColor: "secondary" },
  { mode: PracticeMode.WRITE, label: L.tabLabels[PracticeMode.WRITE], icon: <PenTool className="w-3.5 h-3.5" />, color: "text-success", progressColor: "success" },
]

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
  skillProgress,
}: ProgressCardProps) {
  const remaining = totalItems - learnedCount
  const hasSkillData = skillProgress && Object.keys(skillProgress).length > 0

  return (
    <Card className="border border-default-200 dark:border-default-700/50 shadow-sm">
      <CardBody className="p-3 sm:p-4 space-y-3">
        {/* Top row: mastery + stats */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mastery circle */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18" cy="18" r="15"
                fill="none" stroke="currentColor"
                className="text-default-100 dark:text-default-800"
                strokeWidth="2.5"
              />
              <circle
                cx="18" cy="18" r="15"
                fill="none" stroke="currentColor"
                className={masteryPercent >= 80 ? "text-success" : masteryPercent >= 40 ? "text-warning" : "text-primary"}
                strokeWidth="2.5"
                strokeDasharray={`${(masteryPercent / 100) * 94.25}, 94.25`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-sm sm:text-base font-bold ${masteryPercent >= 80 ? "text-success" : masteryPercent >= 40 ? "text-warning" : "text-primary"}`}>
                {Math.round(masteryPercent)}%
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-none">{learnedCount}<span className="text-xs font-normal text-default-400">/{totalItems}</span></p>
              <p className="text-[9px] sm:text-[10px] text-default-400 mt-0.5">{L.progress.learnedLabel}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Award className="w-3.5 h-3.5 text-success" />
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-none">{masteredCount}</p>
              <p className="text-[9px] sm:text-[10px] text-default-400 mt-0.5">{L.progress.masteredLabel}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-warning" />
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-none">{formatTime(totalTimeSec)}</p>
              <p className="text-[9px] sm:text-[10px] text-default-400 mt-0.5">{L.progress.timeLabel}</p>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        {totalItems > 0 && (
          <div className="flex items-center gap-2">
            <Progress
              value={masteryPercent}
              color={masteryPercent >= 80 ? "success" : masteryPercent >= 40 ? "warning" : "primary"}
              size="sm"
              className="flex-1"
              aria-label={L.progress.ariaLabel}
            />
            {remaining > 0 ? (
              <span className="text-[10px] text-default-400 shrink-0 tabular-nums">{L.progress.remainingTpl(remaining)}</span>
            ) : totalItems > 0 ? (
              <span className="text-[10px] text-success-600 font-medium shrink-0">✓ {L.progress.allLearned}</span>
            ) : null}
          </div>
        )}

        {/* Per-mode skill progress */}
        {hasSkillData && (
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-default-100 dark:border-default-800">
            {SKILL_CONFIG.map(({ mode, label, icon, color, progressColor }) => {
              const info = skillProgress?.[mode]
              const pct = info?.masteryPercent ?? 0

              return (
                <Tooltip
                  key={mode}
                  content={`${label}: ${Math.round(pct)}% (${info?.masteredCount ?? 0}/${info?.totalCount ?? totalItems})`}
                  placement="bottom"
                >
                  <div className="flex flex-col items-center gap-1 cursor-default">
                    <span className={color}>{icon}</span>
                    <Progress
                      value={pct}
                      size="sm"
                      color={pct >= 80 ? "success" : progressColor}
                      className="w-full"
                      aria-label={`${label} progress`}
                    />
                    <span className={`text-[9px] font-medium tabular-nums ${pct >= 80 ? "text-success" : pct > 0 ? "text-default-600" : "text-default-300"}`}>
                      {Math.round(pct)}%
                    </span>
                  </div>
                </Tooltip>
              )
            })}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
