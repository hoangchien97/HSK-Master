"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Card, CardBody, Chip, Progress } from "@heroui/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
  recordPracticeAttemptAction,
} from "@/actions/practice.actions"
import { PracticeMode, QuestionType } from "@/enums/portal"
import { WriteMode } from "@/constants/portal/practice"
import { shuffleArray } from "@/utils/practice"
import type { IVocabularyItem } from "@/interfaces/portal/practice"
import { QuizResultScreen } from "../shared"
import { AnimationMode, PracticeStrokeMode, TypePinyinMode } from "./write"

interface Props {
  vocabularies: IVocabularyItem[]
  lessonId: string
  onProgressUpdate: () => void
}

export default function WriteTab({ vocabularies, lessonId, onProgressUpdate }: Props) {
  const [items, setItems] = useState<IVocabularyItem[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [mode, setMode] = useState<WriteMode>(WriteMode.ANIMATION)
  const [finished, setFinished] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [results, setResults] = useState<{ correct: boolean; vocab: IVocabularyItem }[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startTimeRef = useRef(0)
  const questionStartRef = useRef(0)

  const currentItem = items[currentIdx]
  const totalItems = items.length

  // Generate items
  useEffect(() => {
    setItems(shuffleArray(vocabularies))
  }, [vocabularies])

  // Start session
  useEffect(() => {
    let active = true
    startTimeRef.current = Date.now()
    questionStartRef.current = Date.now()
    startPracticeSessionAction(lessonId, PracticeMode.WRITE).then((res) => {
      if (active && res.success && res.data) {
        setSessionId(res.data.sessionId)
        startTimeRef.current = Date.now()
      }
    })
    return () => { active = false }
  }, [lessonId])

  // Finish on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
        finishPracticeSessionAction(sessionId, dur)
      }
    }
  }, [sessionId])

  const recordAttempt = useCallback(
    async (isCorrect: boolean, userAnswer: string, questionType: string) => {
      if (!sessionId || !currentItem) return
      const timeSec = Math.round((Date.now() - questionStartRef.current) / 1000)
      await recordPracticeAttemptAction({
        sessionId,
        vocabularyId: currentItem.id,
        questionType,
        userAnswer,
        correctAnswer: questionType === QuestionType.TYPE_PINYIN ? (currentItem.pinyin || "") : currentItem.word.charAt(0),
        isCorrect,
        timeSpentSec: timeSec,
      })
    },
    [sessionId, currentItem],
  )

  const goNext = useCallback(async () => {
    if (currentIdx < totalItems - 1) {
      setCurrentIdx((i) => i + 1)
      questionStartRef.current = Date.now()
    } else {
      const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
      setElapsedSec(dur)
      setFinished(true)
      if (sessionId) {
        await finishPracticeSessionAction(sessionId, dur)
      }
      onProgressUpdate()
    }
  }, [currentIdx, totalItems, sessionId, onProgressUpdate])

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1)
      questionStartRef.current = Date.now()
    }
  }, [currentIdx])

  const handleStrokeComplete = useCallback(
    (isCorrect: boolean, mistakes: number) => {
      if (!currentItem) return
      setResults((prev) => [...prev, { correct: isCorrect, vocab: currentItem }])
      recordAttempt(isCorrect, `stroke_mistakes:${mistakes}`, QuestionType.TYPE_HANZI)
      goNext()
    },
    [currentItem, recordAttempt, goNext],
  )

  const handleStrokeSkip = useCallback(() => {
    if (!currentItem) return
    setResults((prev) => [...prev, { correct: false, vocab: currentItem }])
    recordAttempt(false, "skipped", QuestionType.TYPE_HANZI)
    goNext()
  }, [currentItem, recordAttempt, goNext])

  const handlePinyinComplete = useCallback(
    (isCorrect: boolean, answer: string) => {
      if (!currentItem) return
      setResults((prev) => [...prev, { correct: isCorrect, vocab: currentItem }])
      recordAttempt(isCorrect, answer, QuestionType.TYPE_PINYIN)
    },
    [currentItem, recordAttempt],
  )

  const handleRestart = useCallback(() => {
    setItems(shuffleArray(vocabularies))
    setCurrentIdx(0)
    setFinished(false)
    setResults([])
    questionStartRef.current = Date.now()
    startTimeRef.current = Date.now()
    startPracticeSessionAction(lessonId, PracticeMode.WRITE).then((res) => {
      if (res.success && res.data) setSessionId(res.data.sessionId)
    })
  }, [vocabularies, lessonId])

  if (totalItems === 0) {
    return (
      <Card><CardBody className="py-12 text-center"><p className="text-default-500">Chưa có từ vựng cho bài học này</p></CardBody></Card>
    )
  }

  // Results screen
  if (finished) {
    return (
      <QuizResultScreen
        results={results}
        totalQuestions={totalItems}
        elapsedSec={elapsedSec}
        onRestart={handleRestart}
        mode={PracticeMode.WRITE}
        wrongItemsLabel="Từ cần luyện"
      />
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-default-500">
          Từ <span className="font-medium text-foreground">{currentIdx + 1}</span>/{totalItems}
        </span>
        {mode === WriteMode.TYPE_PINYIN && (
          <Chip size="sm" variant="flat" color="primary">Gõ Pinyin</Chip>
        )}
        {mode === WriteMode.PRACTICE && (
          <Chip size="sm" variant="flat" color="primary">Luyện viết</Chip>
        )}
      </div>

      <Progress value={((currentIdx + 1) / totalItems) * 100} size="sm" color="primary" className="mb-4" aria-label="write progress" />

      {/* Mode content */}
      {mode === WriteMode.ANIMATION && (
        <AnimationMode
          item={currentItem}
          currentIdx={currentIdx}
          totalItems={totalItems}
          onNext={goNext}
          onSwitchToPractice={() => setMode(WriteMode.PRACTICE)}
        />
      )}

      {mode === WriteMode.PRACTICE && (
        <PracticeStrokeMode
          key={`stroke-${currentItem.id}`}
          item={currentItem}
          currentIdx={currentIdx}
          totalItems={totalItems}
          onComplete={handleStrokeComplete}
          onSkip={handleStrokeSkip}
        />
      )}

      {mode === WriteMode.TYPE_PINYIN && (
        <TypePinyinMode
          key={`pinyin-${currentItem.id}`}
          item={currentItem}
          currentIdx={currentIdx}
          totalItems={totalItems}
          onComplete={handlePinyinComplete}
          onNext={goNext}
        />
      )}

      {/* Prev/Next Navigation */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentIdx === 0}
          onPress={goPrev}
          startContent={<ChevronLeft className="w-4 h-4" />}
        >
          Trước
        </Button>
        <span className="text-xs text-default-400">
          {currentIdx + 1}/{totalItems}
        </span>
        <Button
          variant="bordered"
          size="sm"
          isDisabled={currentIdx >= totalItems - 1}
          onPress={goNext}
          endContent={<ChevronRight className="w-4 h-4" />}
        >
          Tiếp
        </Button>
      </div>
    </div>
  )
}
