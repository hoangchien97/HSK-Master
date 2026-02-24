"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button, Card, CardBody, Chip, Switch, Progress } from "@heroui/react"
import { RotateCcw, ChevronLeft, ChevronRight, Volume2, BookOpen } from "lucide-react"
import { toast } from "react-toastify"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
  recordFlashcardActionServer,
} from "@/actions/practice.actions"
import { useSpeech } from "@/hooks/useSpeech"
import { WORD_TYPE_COLORS, WORD_TYPE_LABELS, ItemProgressStatus, getDisplayMeaning } from "@/enums/portal/common"
import { PracticeMode } from "@/enums/portal"
import { FlashcardPhase, FlashcardAction } from "@/constants/portal/practice"
import type { IVocabularyItem, IStudentItemProgress } from "@/interfaces/portal/practice"

interface Props {
  vocabularies: IVocabularyItem[]
  lessonId: string
  itemProgress: Record<string, IStudentItemProgress>
  onProgressUpdate: () => void
}

export default function FlashcardTab({ vocabularies, lessonId, itemProgress, onProgressUpdate }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffled, setShuffled] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [knownSet, setKnownSet] = useState<Set<string>>(new Set())
  const [unknownSet, setUnknownSet] = useState<Set<string>>(new Set())
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null)
  const [phase, setPhase] = useState<FlashcardPhase>(FlashcardPhase.MAIN)
  const [reviewItems, setReviewItems] = useState<IVocabularyItem[]>([])
  const [roundComplete, setRoundComplete] = useState(false)
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

  // Start session
  useEffect(() => {
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
  }, [lessonId])

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

      // Visual swipe animation
      setSwipeDir(action === FlashcardAction.EASY ? "right" : "left")

      // Track known/unknown
      if (action === FlashcardAction.EASY) {
        setKnownSet((prev) => new Set(prev).add(currentItem.id))
        setUnknownSet((prev) => {
          const next = new Set(prev)
          next.delete(currentItem.id)
          return next
        })
      } else {
        setUnknownSet((prev) => new Set(prev).add(currentItem.id))
        setKnownSet((prev) => {
          const next = new Set(prev)
          next.delete(currentItem.id)
          return next
        })
      }

      if (sessionId) {
        await recordFlashcardActionServer({
          vocabularyId: currentItem.id,
          lessonId,
          action: action === FlashcardAction.EASY ? FlashcardAction.EASY : FlashcardAction.HARD,
          sessionId,
        })
      }

      onProgressUpdate()

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
    [currentItem, sessionId, lessonId, onProgressUpdate, currentIndex, total],
  )

  const handleRoundComplete = useCallback(() => {
    if (phase === FlashcardPhase.MAIN) {
      // After main round, check for unknown words
      const unknowns = mainItems.filter((v) => unknownSet.has(v.id))
      if (unknowns.length > 0) {
        setReviewItems(unknowns)
        setPhase(FlashcardPhase.REVIEW_UNKNOWN)
        setCurrentIndex(0)
        setIsFlipped(false)
        toast.info(`Ôn lại ${unknowns.length} từ chưa thuộc 📖`)
      } else {
        setRoundComplete(true)
        toast.success(`Hoàn thành! Đã thuộc tất cả ${mainItems.length} từ 🎉`)
      }
    } else {
      // Review round finished
      const stillUnknown = reviewItems.filter((v) => unknownSet.has(v.id))
      if (stillUnknown.length > 0 && stillUnknown.length < reviewItems.length) {
        setReviewItems(stillUnknown)
        setCurrentIndex(0)
        setIsFlipped(false)
        toast.info(`Còn ${stillUnknown.length} từ chưa thuộc, tiếp tục ôn tập!`)
      } else {
        setRoundComplete(true)
        toast.success("Hoàn thành tất cả! 🎉")
      }
    }
  }, [phase, mainItems, reviewItems, unknownSet])

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
    if (shuffled) setShuffled(false)
    setTimeout(() => setShuffled(shuffled), 0)
  }, [shuffled])

  if (total === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="text-default-500">Bài học này chưa có từ vựng</p>
        </CardBody>
      </Card>
    )
  }

  // Completion screen
  if (roundComplete) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardBody className="text-center p-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2">Hoàn thành Flashcard!</h2>
            <p className="text-default-500 mb-1">
              Đã thuộc: <span className="text-success font-bold">{knownSet.size}</span>/{vocabularies.length}
            </p>
            {unknownSet.size > 0 && (
              <p className="text-default-500 mb-4">
                Chưa thuộc: <span className="text-danger font-bold">{unknownSet.size}</span>
              </p>
            )}
            <div className="flex gap-3 justify-center mt-4">
              <Button
                color="primary"
                onPress={handleRestart}
                startContent={<RotateCcw className="w-4 h-4" />}
              >
                Làm lại
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  const progress = currentItem ? itemProgress[currentItem.id] : undefined
  const meaningText = getDisplayMeaning(currentItem)

  return (
    <div className="max-w-lg mx-auto">
      {/* Phase indicator */}
      {phase === FlashcardPhase.REVIEW_UNKNOWN && (
        <div className="mb-3 p-2 rounded-lg bg-warning-50 dark:bg-warning-950/20 text-center">
          <p className="text-sm text-warning-700 dark:text-warning-300 font-medium">
            📖 Ôn lại {reviewItems.length} từ chưa thuộc
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
              <span className="text-xs text-default-400">Trộn</span>
              <Switch
                size="sm"
                isSelected={shuffled}
                onValueChange={(val) => {
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
        color={phase === FlashcardPhase.REVIEW_UNKNOWN ? "warning" : "primary"}
        className="mb-4"
        aria-label="progress"
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
          <Card
            className="col-start-1 row-start-1 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardBody className="flex flex-col items-center justify-center p-6 sm:p-8">
              {/* Chinese character — large, red */}
              <p className="text-5xl sm:text-7xl font-bold text-red-600 dark:text-red-400 text-center leading-tight">
                {currentItem.word}
              </p>

              {/* Word type badge */}
              {currentItem.wordType && (
                <Chip size="sm" variant="flat" color={WORD_TYPE_COLORS[currentItem.wordType] ?? "secondary"} className="mt-3">
                  {WORD_TYPE_LABELS[currentItem.wordType] ?? currentItem.wordType}
                </Chip>
              )}

              {/* Speaker icon */}
              <button
                onClick={(e) => handlePlayAudio(currentItem.word, e)}
                className="mt-3 p-2.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary hover:bg-primary-200 dark:hover:bg-primary-800/40 transition cursor-pointer"
                aria-label="Nghe phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {/* Mastery chip */}
              {progress && (
                <Chip
                  size="sm"
                  variant="dot"
                  color={progress.status === ItemProgressStatus.MASTERED ? "success" : progress.status === ItemProgressStatus.LEARNING ? "warning" : "default"}
                  className="mt-2"
                >
                  {Math.round(progress.masteryScore * 100)}%
                </Chip>
              )}

              <p className="text-sm text-default-400 mt-4">Nhấn để xem nghĩa</p>
            </CardBody>
          </Card>

          {/* ───────── BACK: Pinyin + Meaning + Example ───────── */}
          <Card
            className="col-start-1 row-start-1"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <CardBody className="flex flex-col items-center justify-center p-6 sm:p-8 bg-primary-50 dark:bg-primary-950/20">
              {/* Chinese character (smaller on back) */}
              <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                {currentItem.word}
              </p>

              {/* Pinyin */}
              <p className="text-lg sm:text-xl text-primary font-medium">
                {currentItem.pinyin}
              </p>

              {/* Meaning */}
              <p className="text-base sm:text-lg text-default-700 dark:text-default-300 text-center mt-1">
                {meaningText}
              </p>

              {/* Word type */}
              {currentItem.wordType && (
                <Chip size="sm" variant="flat" color={WORD_TYPE_COLORS[currentItem.wordType] ?? "default"} className="mt-2">
                  {WORD_TYPE_LABELS[currentItem.wordType] ?? currentItem.wordType}
                </Chip>
              )}

              {/* Audio button */}
              <button
                onClick={(e) => handlePlayAudio(currentItem.word, e)}
                className="mt-2 p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary hover:bg-primary-200 transition"
                aria-label="Nghe phát âm"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {/* Example sentence */}
              {currentItem.exampleSentence && (
                <div className="mt-3 p-3 rounded-lg bg-white/60 dark:bg-default-800/50 text-center max-w-xs w-full">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-default-400">Ví dụ</span>
                  </div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {currentItem.exampleSentence}
                  </p>
                  {currentItem.examplePinyin && (
                    <p className="text-xs text-primary mt-0.5">{currentItem.examplePinyin}</p>
                  )}
                  {currentItem.exampleMeaning && (
                    <p className="text-xs text-default-500 mt-0.5">{currentItem.exampleMeaning}</p>
                  )}
                  {/* Speaker for example sentence */}
                  <button
                    onClick={(e) => handlePlayAudio(currentItem.exampleSentence!, e)}
                    className="mt-1.5 p-1.5 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary hover:bg-secondary-200 transition mx-auto block"
                    aria-label="Nghe câu ví dụ"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs text-default-400 mt-3">Nhấn để lật lại</p>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Action buttons: Chưa thuộc / Đã thuộc — always visible */}
      {!swipeDir && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            color="danger"
            variant="flat"
            size="lg"
            className="font-medium"
            onPress={() => handleAction(FlashcardAction.HARD)}
          >
            ✗ Chưa thuộc
          </Button>
          <Button
            color="success"
            variant="flat"
            size="lg"
            className="font-medium"
            onPress={() => handleAction(FlashcardAction.EASY)}
          >
            ✓ Đã thuộc
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentIndex === 0}
          onPress={() => goTo("prev")}
          startContent={<ChevronLeft className="w-4 h-4" />}
        >
          Trước
        </Button>
        <Button
          variant="light"
          size="sm"
          onPress={handleRestart}
          startContent={<RotateCcw className="w-4 h-4" />}
        >
          Bắt đầu lại
        </Button>
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentIndex >= total - 1}
          onPress={() => goTo("next")}
          endContent={<ChevronRight className="w-4 h-4" />}
        >
          Tiếp
        </Button>
      </div>
    </div>
  )
}
