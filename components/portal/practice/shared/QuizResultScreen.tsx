"use client"

import { Button } from "@/components/ui"
import { RotateCcw, Trophy } from "lucide-react"
import { PracticeMode } from "@/enums/portal"
import type { IVocabularyItem } from "@/interfaces/portal/practice"
import { PRACTICE_LABELS } from "@/constants/portal/practice"

const L = PRACTICE_LABELS

interface ResultItem {
  correct: boolean
  vocab: IVocabularyItem
}

/** Result title map — keyed by score tier + practice mode */
const RESULT_TITLES: Record<PracticeMode, { excellent: string; good: string; needWork: string }> = {
  [PracticeMode.QUIZ]: {
    excellent: "Xuất sắc! 🎉",
    good: "Khá tốt! 👍",
    needWork: "Cần cố gắng thêm 💪",
  },
  [PracticeMode.LISTEN]: {
    excellent: "Nghe giỏi lắm! 🎉",
    good: "Khá tốt! 👍",
    needWork: "Luyện nghe thêm nhé 💪",
  },
  [PracticeMode.WRITE]: {
    excellent: "Viết đẹp lắm! 🎉",
    good: "Khá tốt! 👍",
    needWork: "Luyện viết thêm nhé 💪",
  },
  [PracticeMode.FLASHCARD]: {
    excellent: "Hoàn thành Flashcard! 🎉",
    good: "Khá tốt! 👍",
    needWork: "Cần ôn thêm 💪",
  },
  [PracticeMode.LOOKUP]: {
    excellent: "Xuất sắc! 🎉",
    good: "Khá tốt! 👍",
    needWork: "Cần cố gắng thêm 💪",
  },
}

interface Props {
  results: ResultItem[]
  totalQuestions: number
  elapsedSec: number
  onRestart: () => void
  /** Retry only the wrong items */
  onRetryWrong?: (wrongVocabs: IVocabularyItem[]) => void
  /** Practice tab mode — determines result titles */
  mode: PracticeMode
  /** Label for the wrong items section */
  wrongItemsLabel?: string
  /** Accent color for the restart button */
  restartColor?: "primary" | "secondary"
}

export default function QuizResultScreen({
  results,
  totalQuestions,
  elapsedSec,
  onRestart,
  onRetryWrong,
  mode,
  wrongItemsLabel = "Từ cần ôn lại",
  restartColor = "primary",
}: Props) {
  const correctCount = results.filter((r) => r.correct).length
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const wrongItems = results.filter((r) => !r.correct)

  const titles = RESULT_TITLES[mode]

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm overflow-visible">
        <div className="text-center p-6 sm:p-8">
          <div className="relative -mt-12 mb-4">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
                score >= 80 ? "bg-green-100" : score >= 50 ? "bg-amber-100" : "bg-red-100"
              }`}
            >
              <Trophy
                className={`w-10 h-10 ${
                  score >= 80 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600"
                }`}
              />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            {score >= 80 ? titles.excellent : score >= 50 ? titles.good : titles.needWork}
          </h2>
          <p className="text-(--color-muted) mb-4">
            {L.result.scoreTpl(correctCount, totalQuestions)}
          </p>

          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-(--color-vermillion)">{score}%</p>
              <p className="text-xs text-gray-400">{L.result.scoreLabel}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-600">{elapsedSec}s</p>
              <p className="text-xs text-gray-400">{L.result.timeLabel}</p>
            </div>
          </div>

          {wrongItems.length > 0 && (
            <div className="text-left mt-4">
              <p className="text-sm font-medium mb-2 text-red-600">
                {wrongItemsLabel} ({wrongItems.length})
              </p>
              <div className="grid gap-2">
                {wrongItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20"
                  >
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{item.vocab.word}</span>
                    <span className="text-sm text-(--color-vermillion)">{item.vocab.pinyin}</span>
                    <span className="text-sm text-(--color-muted)">— {item.vocab.meaningVi || item.vocab.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center mt-6 flex-wrap">
            {wrongItems.length > 0 && onRetryWrong && (
              <Button
                variant="secondary"
                onClick={() => onRetryWrong(wrongItems.map((r) => r.vocab))}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                {L.result.retryWrongTpl(wrongItems.length)}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={onRestart}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              {L.result.retryAllBtn}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
