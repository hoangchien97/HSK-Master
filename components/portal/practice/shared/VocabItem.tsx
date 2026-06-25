"use client"

import { Badge } from "@/components/ui"
import { Volume2 } from "lucide-react"
import { WORD_TYPE_LABELS, STATUS_LABELS, ItemProgressStatus, getDisplayMeaning } from "@/enums/portal/common"
import type { IVocabularyItem, IStudentItemProgress } from "@/interfaces/portal/practice"

interface Props {
  vocab: IVocabularyItem
  progress?: IStudentItemProgress
  onSelect: (vocab: IVocabularyItem) => void
  onPlayAudio: (word: string, e?: React.MouseEvent) => void
}

/** Single vocabulary row used in LookupTab list */
export default function VocabItem({ vocab, progress, onSelect, onPlayAudio }: Props) {
  const status = progress?.status || ItemProgressStatus.NEW
  const wordTypeLabel = vocab.wordType ? (WORD_TYPE_LABELS[vocab.wordType] ?? vocab.wordType) : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(vocab)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(vocab) }}
      className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all group cursor-pointer ${
        status === ItemProgressStatus.MASTERED
          ? "border-green-200 bg-green-50/30 dark:bg-green-950/10 hover:border-green-400"
          : status === ItemProgressStatus.LEARNING
            ? "border-amber-200 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-400"
            : "border-(--color-smoke) hover:border-red-300 hover:bg-red-50/30 dark:hover:bg-red-950/20"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Hanzi */}
        <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 min-w-12 sm:min-w-16 text-center shrink-0">
          {vocab.word}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-(--color-vermillion) font-medium">{vocab.pinyin}</span>
            {status !== ItemProgressStatus.NEW && (
              <Badge
                size="sm"
                variant={STATUS_LABELS[status]?.color ?? "default"}
                className="text-[10px]"
              >
                {STATUS_LABELS[status]?.label}
              </Badge>
            )}
          </div>
          <p className="text-sm text-(--color-ink) truncate">{getDisplayMeaning(vocab)}</p>
        </div>

        {/* Right side: word type + mastery + speaker */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
          {wordTypeLabel && (
            <Badge size="sm" className="text-[10px] hidden sm:inline-flex">
              {wordTypeLabel}
            </Badge>
          )}
          {progress && progress.masteryScore > 0 && (
            <div className="text-xs font-bold text-(--color-vermillion)">{Math.round(progress.masteryScore * 100)}%</div>
          )}
          <button
            onClick={(e) => onPlayAudio(vocab.word, e)}
            className="p-2 rounded-full transition hover:bg-red-100 dark:hover:bg-red-900/30 text-(--color-vermillion) cursor-pointer"
            aria-label="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
