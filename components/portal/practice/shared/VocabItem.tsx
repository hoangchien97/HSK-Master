"use client"

import { Chip } from "@heroui/react"
import { Volume2 } from "lucide-react"
import { WORD_TYPE_COLORS, WORD_TYPE_LABELS, STATUS_LABELS, getDisplayMeaning } from "@/enums/portal/common"
import type { IVocabularyItem, IStudentItemProgress } from "@/interfaces/portal/practice"

interface Props {
  vocab: IVocabularyItem
  progress?: IStudentItemProgress
  onSelect: (vocab: IVocabularyItem) => void
  onPlayAudio: (word: string, audioUrl: string | null, e?: React.MouseEvent) => void
}

/** Single vocabulary row used in LookupTab list */
export default function VocabItem({ vocab, progress, onSelect, onPlayAudio }: Props) {
  const status = progress?.status || "NEW"
  const wordTypeLabel = vocab.wordType ? (WORD_TYPE_LABELS[vocab.wordType] ?? vocab.wordType) : null
  const wordTypeColor = vocab.wordType ? (WORD_TYPE_COLORS[vocab.wordType] ?? "default") : "default"

  return (
    <button
      onClick={() => onSelect(vocab)}
      className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all group ${
        status === "MASTERED"
          ? "border-success-200 bg-success-50/30 dark:bg-success-950/10 hover:border-success-400"
          : status === "LEARNING"
            ? "border-warning-200 bg-warning-50/20 dark:bg-warning-950/10 hover:border-warning-400"
            : "border-default-200 hover:border-primary-300 hover:bg-primary-50/30 dark:hover:bg-primary-950/20"
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
            <span className="text-sm text-primary font-medium">{vocab.pinyin}</span>
            {/* Word type badge */}
            {wordTypeLabel && (
              <Chip size="sm" variant="flat" color={wordTypeColor} className="text-[10px] h-5">
                {wordTypeLabel}
              </Chip>
            )}
            {status !== "NEW" && (
              <Chip
                size="sm"
                variant="dot"
                color={STATUS_LABELS[status]?.color ?? "default"}
                className="text-[10px] h-5"
              >
                {STATUS_LABELS[status]?.label}
              </Chip>
            )}
          </div>
          <p className="text-sm text-default-600 truncate">{getDisplayMeaning(vocab)}</p>
        </div>

        {/* Right side: speaker + mastery */}
        <div className="shrink-0 flex items-center gap-2">
          {progress && progress.masteryScore > 0 && (
            <div className="text-xs font-bold text-primary">{Math.round(progress.masteryScore * 100)}%</div>
          )}
          <button
            onClick={(e) => onPlayAudio(vocab.word, vocab.audioUrl, e)}
            className="p-1.5 rounded-full transition hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary cursor-pointer"
            aria-label="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </button>
  )
}
