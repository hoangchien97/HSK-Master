"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button, Card, CardBody, Chip, Switch, Progress } from "@heroui/react"
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle, Eye } from "lucide-react"
import { toast } from "react-toastify"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
  recordFlashcardActionServer,
} from "@/actions/practice.actions"
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
  const [showMeaning, setShowMeaning] = useState(false) // front = hanzi (default)
  const [shuffled, setShuffled] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startTimeRef = useRef(Date.now())

  // Shuffle items
  const items = useMemo(() => {
    if (!shuffled) return vocabularies
    return [...vocabularies].sort(() => Math.random() - 0.5)
  }, [vocabularies, shuffled])

  const currentItem = items[currentIndex]
  const total = items.length

  // Start session
  useEffect(() => {
    let active = true
    startPracticeSessionAction(lessonId, "FLASHCARD").then((res) => {
      if (active && res.success && res.data) {
        setSessionId(res.data.sessionId)
        startTimeRef.current = Date.now()
      }
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  // Cleanup: finish session on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
        finishPracticeSessionAction(sessionId, dur)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const handleAction = useCallback(
    async (action: "HARD" | "GOOD" | "EASY") => {
      if (!currentItem || !sessionId) return

      await recordFlashcardActionServer({
        vocabularyId: currentItem.id,
        lessonId,
        action,
        sessionId,
      })

      onProgressUpdate()
      setIsFlipped(false)

      // Auto-advance
      if (currentIndex < total - 1) {
        setTimeout(() => setCurrentIndex((i) => i + 1), 200)
      } else {
        toast.success("Hoàn thành! 🎉")
      }
    },
    [currentItem, sessionId, lessonId, onProgressUpdate, currentIndex, total],
  )

  const goTo = useCallback(
    (dir: "prev" | "next") => {
      setIsFlipped(false)
      if (dir === "prev" && currentIndex > 0) setCurrentIndex((i) => i - 1)
      if (dir === "next" && currentIndex < total - 1) setCurrentIndex((i) => i + 1)
    },
    [currentIndex, total],
  )

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    if (shuffled) setShuffled(false)
    setTimeout(() => setShuffled(shuffled), 0) // re-shuffle
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

  const progress = currentItem ? itemProgress[currentItem.id] : undefined
  const frontContent = showMeaning ? currentItem.meaning : currentItem.word
  const backPrimary = showMeaning ? currentItem.word : currentItem.pinyin
  const backSecondary = showMeaning ? currentItem.pinyin : currentItem.meaning

  return (
    <div className="max-w-lg mx-auto">
      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-default-500">
          <span className="font-medium text-foreground">{currentIndex + 1}</span>
          <span>/</span>
          <span>{total}</span>
        </div>
        <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-default-400">Front = Nghĩa</span>
            <Switch
              size="sm"
              isSelected={showMeaning}
              onValueChange={(val) => {
                setShowMeaning(val)
                setIsFlipped(false)
              }}
            />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress
        value={((currentIndex + 1) / total) * 100}
        size="sm"
        color="primary"
        className="mb-4"
        aria-label="progress"
      />

      {/* Flashcard */}
      <div
        className="relative perspective-1000 cursor-pointer mb-4"
        style={{ minHeight: 280 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full transition-transform duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
          style={{ minHeight: 280, transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <Card
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardBody className="flex flex-col items-center justify-center p-6 sm:p-8 min-h-[280px]">
              <p className={`font-bold text-center ${showMeaning ? "text-xl sm:text-2xl" : "text-4xl sm:text-6xl"}`}>
                {frontContent}
              </p>
              <p className="text-sm text-default-400 mt-4">Nhấn để lật</p>
              {progress && (
                <Chip size="sm" variant="dot" color={progress.status === "MASTERED" ? "success" : progress.status === "LEARNING" ? "warning" : "default"} className="mt-2">
                  {Math.round(progress.masteryScore * 100)}%
                </Chip>
              )}
            </CardBody>
          </Card>

          {/* Back */}
          <Card
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <CardBody className="flex flex-col items-center justify-center p-6 sm:p-8 min-h-[280px] bg-primary-50 dark:bg-primary-950/20">
              <p className={`font-bold text-center mb-2 ${showMeaning ? "text-4xl sm:text-6xl" : "text-xl sm:text-2xl text-primary"}`}>
                {backPrimary}
              </p>
              <p className="text-base sm:text-lg text-default-600 text-center">{backSecondary}</p>
              {currentItem.wordType && (
                <Chip size="sm" variant="flat" className="mt-3">{currentItem.wordType}</Chip>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Action buttons (visible only when flipped) */}
      {isFlipped && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button
            color="danger"
            variant="flat"
            className="font-medium"
            onPress={() => handleAction("HARD")}
          >
            Chưa biết
          </Button>
          <Button
            color="warning"
            variant="flat"
            className="font-medium"
            onPress={() => handleAction("GOOD")}
          >
            Tạm ổn
          </Button>
          <Button
            color="success"
            variant="flat"
            className="font-medium"
            onPress={() => handleAction("EASY")}
          >
            Đã biết
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
