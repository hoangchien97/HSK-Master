"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button, Badge, Switch, Progress } from "@/components/ui"
import { RotateCcw, ChevronLeft, ChevronRight, Volume2, BookOpen } from "lucide-react"
import { toast } from "react-toastify"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
} from "@/actions/practice.actions"
import { recordFlashcardSkillAction } from "@/actions/practice-skill.actions"
import { useSpeech } from "@/hooks/useSpeech"
import { WORD_TYPE_COLORS, WORD_TYPE_LABELS, ItemProgressStatus, getDisplayMeaning } from "@/enums/portal/common"
import { PracticeMode } from "@/enums/portal"
import { FlashcardPhase, FlashcardAction, PRACTICE_LABELS } from "@/constants/portal/practice"
import { usePracticeKeyboard, KeyHint } from "@/hooks/usePracticeKeyboard"
import type { IVocabularyItem, IStudentItemProgress, IQueueVocabItem, ISkillProgressRecord } from "@/interfaces/portal/practice"

const L = PRACTICE_LABELS

interface Props {
  vocabularies: IVocabularyItem[]
  lessonId: string
  itemProgress: Record<string, IStudentItemProgress>
  onProgressUpdate: () => void
  /** Per-mode queue (with interleaved prev-lesson vocab) */
  queue?: IQueueVocabItem[]
  /** Per-mode skill progress map keyed by vocabularyId */
  skillProgressMap?: Record<string, ISkillProgressRecord>
  /** Resume pointer from server */
  initialPointer?: number
  /** Whether all vocab are MASTERED for this mode */
  isCompleted?: boolean
  /** Reset session handler */
  onResetSession?: () => void
}

export default function FlashcardTab({
  vocabularies, lessonId, itemProgress, onProgressUpdate,
  queue: modeQueue, skillProgressMap, initialPointer, isCompleted: modeCompleted, onResetSession,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialPointer ?? 0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Init known/unknown from server skill data (P1-07 state sync)
  const [knownSet, setKnownSet] = useState<Set<string>>(() => {
    if (!skillProgressMap) return new Set()
    return new Set(
      Object.entries(skillProgressMap)
        .filter(([, v]) => v.status === "MASTERED")
        .map(([id]) => id),
    )
  })
  const [unknownSet, setUnknownSet] = useState<Set<string>>(() => {
    if (!skillProgressMap) return new Set()
    return new Set(
      Object.entries(skillProgressMap)
        .filter(([, v]) => v.status === "LEARNING")
        .map(([id]) => id),
    )
  })

  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null)
  const [phase, setPhase] = useState<FlashcardPhase>(FlashcardPhase.MAIN)
  const [reviewItems, setReviewItems] = useState<IVocabularyItem[]>([])
  const [roundComplete, setRoundComplete] = useState(modeCompleted ?? false)
  const startTimeRef = useRef(Date.now())
  const { speak } = useSpeech()

  // Shuffle items for main phase
  const mainItems = useMemo(() => {
    if (!shuffled) return vocabularies
    return [...vocabularies].sort(() => Math.random() - 0.5)
  }, [vocabularies, shuffled])

  // Current items based on phase
  const items = phase === FlashcardPhase.REVIEW_UNKNOWN ? reviewItems : mainItems
  const currentItem = items[currentIndex]
  const total = items.length

  // Start session (skip if mode already completed)
  useEffect(() => {
    if (modeCompleted) return
    let active = true
    startPracticeSessionAction(lessonId, PracticeMode.FLASHCARD).then((res) => {
      if (active && res.success && res.data) {
        setSessionId(res.data.sessionId)
        startTimeRef.current = Date.now()
      }
    })
    return () => {
      active = false
    }
  }, [lessonId, modeCompleted])

  // Cleanup: finish session on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
        finishPracticeSessionAction(sessionId, dur)
      }
    }
  }, [sessionId])

  const handlePlayAudio = useCallback(
    (text: string, e?: React.MouseEvent) => {
      e?.stopPropagation()
      speak(text)
    },
    [speak],
  )

  const handleAction = useCallback(
    async (action: FlashcardAction) => {
      if (!currentItem) return

      // Visual swipe animation - AGAIN and HARD swipe left, GOOD and EASY swipe right
      setSwipeDir(action === FlashcardAction.AGAIN || action === FlashcardAction.HARD ? "left" : "right")

      // Track known/unknown
      if (action === FlashcardAction.AGAIN || action === FlashcardAction.HARD) {
        setUnknownSet((prev) => new Set(prev).add(currentItem.id))
        setKnownSet((prev) => {
          const next = new Set(prev)
          next.delete(currentItem.id)
          return next
        })
      } else {
        // GOOD or EASY → mark as known
        setKnownSet((prev) => new Set(prev).add(currentItem.id))
        setUnknownSet((prev) => {
          const next = new Set(prev)
          next.delete(currentItem.id)
          return next
        })
      }

      if (sessionId) {
        // Record per-mode skill progress (handles legacy sync internally)
        recordFlashcardSkillAction({
          lessonId,
          vocabularyId: currentItem.id,
          action,
          currentIndex,
          queueLength: total,
          sessionId,
        })
      }

      // NOTE: onProgressUpdate is called once at round completion, not per card.

      // Auto-advance after animation
      setTimeout(() => {
        setSwipeDir(null)
        setIsFlipped(false)
        if (currentIndex < total - 1) {
          setCurrentIndex((i) => i + 1)
        } else {
          handleRoundComplete()
        }
      }, 300)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentItem, sessionId, lessonId, currentIndex, total],
  )

  const handleRoundComplete = useCallback(() => {
    // Refresh progress once per round (not per card)
    onProgressUpdate()

    if (phase === FlashcardPhase.MAIN) {
      // After main round, check for unknown words
      const unknowns = mainItems.filter((v) => unknownSet.has(v.id))
      if (unknowns.length > 0) {
        setReviewItems(unknowns)
        setPhase(FlashcardPhase.REVIEW_UNKNOWN)
        setCurrentIndex(0)
        setIsFlipped(false)
        toast.info(L.flashcard.toastReviewTpl(unknowns.length))
      } else {
        setRoundComplete(true)
        toast.success(L.flashcard.toastCompleteTpl(mainItems.length))
      }
    } else {
      // Review round finished
      const stillUnknown = reviewItems.filter((v) => unknownSet.has(v.id))
      if (stillUnknown.length > 0 && stillUnknown.length < reviewItems.length) {
        setReviewItems(stillUnknown)
        setCurrentIndex(0)
        setIsFlipped(false)
        toast.info(L.flashcard.toastStillUnknownTpl(stillUnknown.length))
      } else {
        setRoundComplete(true)
        toast.success(L.flashcard.toastCompleteAll)
      }
    }
  }, [phase, mainItems, reviewItems, unknownSet, onProgressUpdate])

  const goTo = useCallback(
    (dir: "prev" | "next") => {
      setIsFlipped(false)
      setSwipeDir(null)
      if (dir === "prev" && currentIndex > 0) setCurrentIndex((i) => i - 1)
      if (dir === "next" && currentIndex < total - 1) setCurrentIndex((i) => i + 1)
    },
    [currentIndex, total],
  )

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setSwipeDir(null)
    setKnownSet(new Set())
    setUnknownSet(new Set())
    setPhase(FlashcardPhase.MAIN)
    setReviewItems([])
    setRoundComplete(false)
    // Reset server session pointer so queue re-fetches from start
    onResetSession?.()
    if (shuffled) setShuffled(false)
    setTimeout(() => setShuffled(shuffled), 0)
  }, [shuffled, onResetSession])

  // Keyboard shortcuts: Space=flip, Arrow keys=difficulty (SM-2: 1=Again, 2=Hard, 3=Good, 4=Easy)
  // MUST be called before any early return to satisfy React hooks rules
  usePracticeKeyboard(
    {
      " ": () => setIsFlipped((f) => !f),
      "1": () => handleAction(FlashcardAction.AGAIN),
      "2": () => handleAction(FlashcardAction.HARD),
      "3": () => handleAction(FlashcardAction.GOOD),
      "4": () => handleAction(FlashcardAction.EASY),
      "ArrowLeft": () => handleAction(FlashcardAction.AGAIN),
      "ArrowDown": () => handleAction(FlashcardAction.HARD),
      "ArrowUp": () => handleAction(FlashcardAction.GOOD),
      "ArrowRight": () => handleAction(FlashcardAction.EASY),
    },
    { enabled: !roundComplete && !swipeDir && !!currentItem },
  )

  if (total === 0) {
    return (
      <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
        <div className="py-12 text-center">
          <p className="text-(--color-muted)">{L.empty.noVocab}</p>
        </div>
      </div>
    )
  }

  // Completion screen
  if (roundComplete) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
          <div className="text-center p-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2">{L.flashcard.completionTitle}</h2>
            <p className="text-(--color-muted) mb-1">
              {L.flashcard.knownLabel} <span className="text-green-600 font-bold">{knownSet.size}</span>/{vocabularies.length}
            </p>
            {unknownSet.size > 0 && (
              <p className="text-(--color-muted) mb-4">
                {L.flashcard.unknownLabel} <span className="text-red-600 font-bold">{unknownSet.size}</span>
              </p>
            )}
            <div className="flex gap-3 justify-center mt-4">
              <Button
                variant="primary"
                onClick={handleRestart}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                {L.nav.restart}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress = currentItem ? itemProgress[currentItem.id] : undefined
  const skillProg = currentItem && skillProgressMap ? skillProgressMap[currentItem.id] : undefined
  const meaningText = getDisplayMeaning(currentItem)
  const isFromPrev = modeQueue?.find(q => q.id === currentItem?.id)?.isFromPrevLesson ?? false

  return (
    <div className="max-w-lg mx-auto">
      {/* Phase indicator */}
      {phase === FlashcardPhase.REVIEW_UNKNOWN && (
        <div className="mb-3 p-2 rounded-lg bg-warning-50 dark:bg-warning-950/20 text-center">
          <p className="text-sm text-warning-700 dark:text-warning-300 font-medium">
            {L.flashcard.phaseTpl(reviewItems.length)}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-default-500">
            <span className="font-medium text-foreground">{currentIndex + 1}</span>/{total}
          </span>
          <span className="text-success text-xs">✓ {knownSet.size}</span>
          <span className="text-danger text-xs">✗ {unknownSet.size}</span>
        </div>
        <div className="flex items-center gap-3">
          {phase === FlashcardPhase.MAIN && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{L.nav.shuffle}</span>
              <Switch
                checked={shuffled}
                onChange={(val) => {
                  setShuffled(val)
                  setCurrentIndex(0)
                  setIsFlipped(false)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <Progress
        value={((currentIndex + 1) / total) * 100}
        size="sm"
        variant={phase === FlashcardPhase.REVIEW_UNKNOWN ? "warning" : "default"}
        className="mb-4"
      />

      {/* Flashcard — Click to flip */}
      <div
        className="relative perspective-1000 cursor-pointer mb-4"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full transition-all duration-500 preserve-3d grid ${isFlipped ? "rotate-y-180" : ""} ${
            swipeDir === "right" ? "translate-x-[120%] opacity-0" : swipeDir === "left" ? "-translate-x-[120%] opacity-0" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* ───────── FRONT: Chinese character + word type + speaker ───────── */}
          <div
            className="col-start-1 row-start-1 rounded-xl border border-(--color-smoke) bg-white shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex flex-col items-center justify-center p-6 sm:p-8">
              {/* Chinese character — large, red */}
              <p className="text-5xl sm:text-7xl font-bold text-red-600 dark:text-red-400 text-center leading-tight">
                {currentItem.word}
              </p>

              {/* Word type badge */}
              {currentItem.wordType && (
                <Badge size="sm" className="mt-3">
                  {WORD_TYPE_LABELS[currentItem.wordType] ?? currentItem.wordType}
                </Badge>
              )}

              {/* Speaker icon */}
              <button
                onClick={(e) => handlePlayAudio(currentItem.word, e)}
                className="mt-3 p-2.5 rounded-full bg-red-100 dark:bg-red-900/30 text-(--color-vermillion) hover:bg-red-200 dark:hover:bg-red-800/40 transition cursor-pointer"
                aria-label="Nghe phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {/* Mastery badge — prefer skill progress over legacy */}
              {(skillProg || progress) && (
                <Badge
                  size="sm"
                  variant={
                    (skillProg?.status ?? progress?.status) === ItemProgressStatus.MASTERED ? "success"
                    : (skillProg?.status ?? progress?.status) === ItemProgressStatus.LEARNING ? "warning"
                    : "default"
                  }
                  className="mt-2"
                >
                  {Math.round((skillProg?.masteryScore ?? progress?.masteryScore ?? 0) * 100)}%
                </Badge>
              )}

              {/* Interleaved vocab indicator */}
              {isFromPrev && (
                <Badge size="sm" className="mt-1.5">
                  {L.flashcard.reviewPrevLesson}
                </Badge>
              )}

              <p className="text-sm text-gray-400 mt-4">{L.flashcard.flipHint}</p>
            </div>
          </div>

          {/* ───────── BACK: Pinyin + Meaning + Example ───────── */}
          <div
            className="col-start-1 row-start-1 rounded-xl border border-(--color-smoke) bg-red-50 dark:bg-red-950/20 shadow-sm"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="flex flex-col items-center justify-center p-6 sm:p-8">
              {/* Chinese character (smaller on back) */}
              <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                {currentItem.word}
              </p>

              {/* Pinyin */}
              <p className="text-lg sm:text-xl text-(--color-vermillion) font-medium">
                {currentItem.pinyin}
              </p>

              {/* Meaning */}
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 text-center mt-1">
                {meaningText}
              </p>

              {/* Word type */}
              {currentItem.wordType && (
                <Badge size="sm" className="mt-2">
                  {WORD_TYPE_LABELS[currentItem.wordType] ?? currentItem.wordType}
                </Badge>
              )}

              {/* Audio button */}
              <button
                onClick={(e) => handlePlayAudio(currentItem.word, e)}
                className="mt-2 p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-(--color-vermillion) hover:bg-red-200 transition"
                aria-label="Nghe phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {/* Example sentence */}
              {currentItem.exampleSentence && (
                <div className="mt-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/50 text-center max-w-xs w-full">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-(--color-vermillion)" />
                    <span className="text-xs text-gray-400">{L.flashcard.exampleLabel}</span>
                  </div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {currentItem.exampleSentence}
                  </p>
                  {currentItem.examplePinyin && (
                    <p className="text-xs text-(--color-vermillion) mt-0.5">{currentItem.examplePinyin}</p>
                  )}
                  {currentItem.exampleMeaning && (
                    <p className="text-xs text-(--color-muted) mt-0.5">{currentItem.exampleMeaning}</p>
                  )}
                  {/* Speaker for example sentence */}
                  <button
                    onClick={(e) => handlePlayAudio(currentItem.exampleSentence!, e)}
                    className="mt-1.5 p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-200 transition mx-auto block"
                    aria-label="Nghe câu ví dụ"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3">{L.flashcard.flipBackHint}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons + Navigation — stable min-h prevents collapse during swipe animation */}
      <div className="min-h-30">
        {/* Action buttons: Quên / Khó / Tạm ổn / Dễ — hidden during swipe animation */}
        {!swipeDir && (
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            <Button
              variant="secondary"
              size="lg"
              className="font-medium text-xs sm:text-sm"
              onClick={() => handleAction(FlashcardAction.AGAIN)}
            >
              {L.flashcard.againBtn}<KeyHint>(1)</KeyHint>
            </Button>
            <Button
              variant="danger"
              size="lg"
              className="font-medium text-xs sm:text-sm"
              onClick={() => handleAction(FlashcardAction.HARD)}
            >
              {L.flashcard.hardBtn}<KeyHint>(2)</KeyHint>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="font-medium text-xs sm:text-sm"
              onClick={() => handleAction(FlashcardAction.GOOD)}
            >
              {L.flashcard.goodBtn}<KeyHint>(3)</KeyHint>
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="font-medium text-xs sm:text-sm"
              onClick={() => handleAction(FlashcardAction.EASY)}
            >
              {L.flashcard.easyBtn}<KeyHint>(4)</KeyHint>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            isDisabled={currentIndex === 0}
            onClick={() => goTo("prev")}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            {L.nav.prev}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {L.nav.startOver}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={currentIndex >= total - 1}
            onClick={() => goTo("next")}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {L.nav.next}
          </Button>
        </div>
      </div>
    </div>
  )
}
