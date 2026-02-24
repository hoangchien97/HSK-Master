"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Card, CardBody, Chip, Progress } from "@heroui/react"
import { Volume2, ChevronLeft, ChevronRight } from "lucide-react"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
  recordPracticeAttemptAction,
} from "@/actions/practice.actions"
import { useSpeech } from "@/hooks/useSpeech"
import { getDisplayMeaning, QuestionType } from "@/enums/portal/common"
import { PracticeMode } from "@/enums/portal"
import { AUTO_NEXT_DELAY_MS, QUESTION_TYPE_LABELS } from "@/constants/portal/practice"
import { generateQuizQuestions } from "@/utils/practice"
import type { QuizQuestion } from "@/utils/practice"
import type { IVocabularyItem } from "@/interfaces/portal/practice"
import { QuizResultScreen, McqOptions } from "../shared"

interface Props {
  vocabularies: IVocabularyItem[]
  lessonId: string
  onProgressUpdate: () => void
}

export default function QuizTab({ vocabularies, lessonId, onProgressUpdate }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<{ correct: boolean; vocab: IVocabularyItem }[]>([])
  const [finished, setFinished] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null)
  const startTimeRef = useRef(0)
  const questionStartRef = useRef(0)
  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { speak } = useSpeech()

  // Initialize time refs
  useEffect(() => {
    startTimeRef.current = Date.now()
    questionStartRef.current = Date.now()
  }, [])

  // Generate questions — also reset index so currentQ never goes out of bounds
  useEffect(() => {
    setQuestions(generateQuizQuestions(vocabularies))
    setCurrentIdx(0)
    setSelectedKey(null)
    setShowResult(false)
  }, [vocabularies])

  // Start session
  useEffect(() => {
    let active = true
    startPracticeSessionAction(lessonId, PracticeMode.QUIZ).then((res) => {
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

  const currentQ = questions[currentIdx]
  const totalQ = questions.length

  const handlePlayPromptAudio = useCallback(() => {
    if (!currentQ) return
    // For Chinese character prompts, speak the character
    if (currentQ.type === QuestionType.MCQ_MEANING || currentQ.type === QuestionType.MCQ_PINYIN) {
      speak(currentQ.vocab.word)
    } else if (currentQ.type === QuestionType.MCQ_EXAMPLE && currentQ.vocab.exampleSentence) {
      speak(currentQ.vocab.exampleSentence)
    }
  }, [currentQ, speak])

  // Clear auto-next timers helper
  const clearAutoNext = useCallback(() => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current)
      autoNextTimerRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setAutoNextCountdown(null)
  }, [])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [])

  const handleNext = useCallback(async () => {
    clearAutoNext()
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((i) => i + 1)
      setSelectedKey(null)
      setShowResult(false)
      questionStartRef.current = Date.now()
    } else {
      // Finish
      setFinished(true)
      setElapsedSec(startTimeRef.current > 0 ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0)
      if (sessionId) {
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
        await finishPracticeSessionAction(sessionId, dur)
      }
      onProgressUpdate()
    }
  }, [currentIdx, totalQ, sessionId, onProgressUpdate, clearAutoNext])

  const handleSelect = useCallback(
    async (key: string) => {
      if (showResult || !currentQ) return

      setSelectedKey(key)
      setShowResult(true)

      const isCorrect = key === currentQ.correctKey
      const correctOption = currentQ.options.find((o) => o.key === currentQ.correctKey)
      const selectedOption = currentQ.options.find((o) => o.key === key)
      const timeSec = Math.round((Date.now() - questionStartRef.current) / 1000)

      setResults((prev) => [...prev, { correct: isCorrect, vocab: currentQ.vocab }])

      // Record attempt
      if (sessionId) {
        await recordPracticeAttemptAction({
          sessionId,
          vocabularyId: currentQ.vocab.id,
          questionType: currentQ.type,
          userAnswer: selectedOption?.label || null,
          correctAnswer: correctOption?.label || "",
          isCorrect,
          timeSpentSec: timeSec,
        })
      }

      // Auto-advance after 3s on correct answer
      if (isCorrect) {
        setAutoNextCountdown(3)
        countdownIntervalRef.current = setInterval(() => {
          setAutoNextCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null))
        }, 1000)
        autoNextTimerRef.current = setTimeout(() => {
          handleNext()
        }, AUTO_NEXT_DELAY_MS)
      }
    },
    [showResult, currentQ, sessionId, handleNext],
  )

  const handleRestart = useCallback(() => {
    clearAutoNext()
    setQuestions(generateQuizQuestions(vocabularies))
    setCurrentIdx(0)
    setSelectedKey(null)
    setShowResult(false)
    setResults([])
    setFinished(false)
    questionStartRef.current = Date.now()
    startTimeRef.current = Date.now()
    startPracticeSessionAction(lessonId, PracticeMode.QUIZ).then((res) => {
      if (res.success && res.data) setSessionId(res.data.sessionId)
    })
  }, [vocabularies, lessonId, clearAutoNext])

  if (totalQ === 0) {
    return (
      <Card><CardBody className="py-12 text-center"><p className="text-default-500">Bài học cần ít nhất 2 từ vựng để tạo Quiz</p></CardBody></Card>
    )
  }

  // Results screen
  if (finished) {
    return (
      <QuizResultScreen
        results={results}
        totalQuestions={totalQ}
        elapsedSec={elapsedSec}
        onRestart={handleRestart}
        mode={PracticeMode.QUIZ}
      />
    )
  }

  // Guard: questions may be regenerating (e.g. after onProgressUpdate triggers vocabularies re-fetch)
  if (!currentQ) return null

  const isCorrectAnswer = showResult ? selectedKey === currentQ.correctKey : null
  // Determine if prompt is Chinese text (for font size + TTS)
  const isChinPrompt = currentQ.type === QuestionType.MCQ_MEANING || currentQ.type === QuestionType.MCQ_PINYIN

  // Quiz question
  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-default-500">
          Câu <span className="font-medium text-foreground">{currentIdx + 1}</span>/{totalQ}
        </span>
        <Chip size="sm" variant="flat">{QUESTION_TYPE_LABELS[currentQ.type]}</Chip>
      </div>

      <Progress value={((currentIdx + 1) / totalQ) * 100} size="sm" color="primary" className="mb-4" aria-label="quiz progress" />

      {/* Question card */}
      <Card className="mb-4">
        <CardBody className="p-6 sm:p-8 text-center">
          <p className={`font-bold ${isChinPrompt ? "text-3xl sm:text-5xl text-red-600 dark:text-red-400" : currentQ.type === QuestionType.MCQ_EXAMPLE ? "text-lg sm:text-xl text-red-600 dark:text-red-400" : "text-xl sm:text-2xl"}`}>
            {currentQ.prompt}
          </p>
          {currentQ.promptSub && (
            <p className="text-sm text-default-400 mt-2">{currentQ.promptSub}</p>
          )}
          {/* Speaker button for Chinese prompts */}
          {(isChinPrompt || currentQ.type === QuestionType.MCQ_EXAMPLE) && (
            <button
              onClick={handlePlayPromptAudio}
              className="mt-3 p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary hover:bg-primary-200 transition mx-auto inline-flex"
              aria-label="Nghe phát âm"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
        </CardBody>
      </Card>

      {/* Options */}
      <div className="mb-4">
        <McqOptions
          options={currentQ.options}
          correctKey={currentQ.correctKey}
          selectedKey={selectedKey}
          showResult={showResult}
          onSelect={handleSelect}
          largeFont={currentQ.type === QuestionType.MCQ_HANZI}
        />
      </div>

      {/* Result info + Next button */}
      {showResult && (
        <div className="flex flex-col items-center gap-3">
          {/* Correct/Wrong feedback */}
          <div className={`w-full p-3 rounded-lg text-center ${isCorrectAnswer ? "bg-success-50 dark:bg-success-950/20" : "bg-danger-50 dark:bg-danger-950/20"}`}>
            {isCorrectAnswer ? (
              <div>
                <p className="text-success font-medium">✓ Chính xác!</p>
                {autoNextCountdown !== null && (
                  <p className="text-xs text-success-600/70 mt-1">Tự động chuyển sau {autoNextCountdown}s…</p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-danger font-medium mb-1">✗ Sai rồi</p>
                <p className="text-sm text-default-600">
                  Đáp án: <span className="font-bold text-red-600 dark:text-red-400">{currentQ.vocab.word}</span>
                  {" — "}
                  <span className="text-primary">{currentQ.vocab.pinyin}</span>
                  {" — "}
                  <span>{getDisplayMeaning(currentQ.vocab)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Next button — always visible, clicking cancels auto-next timer */}
          <Button color="primary" onPress={handleNext} size="lg" className="font-medium">
            {currentIdx < totalQ - 1 ? "Câu tiếp theo →" : "Xem kết quả"}
          </Button>
        </div>
      )}

      {/* Prev/Next navigation (for reviewing previous questions) */}
      {!showResult && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="bordered"
            size="sm"
            isDisabled={currentIdx === 0}
            onPress={() => {
              if (currentIdx > 0) {
                setCurrentIdx((i) => i - 1)
                setSelectedKey(null)
                setShowResult(false)
              }
            }}
            startContent={<ChevronLeft className="w-4 h-4" />}
          >
            Trước
          </Button>
          <span className="text-xs text-default-400">
            {currentIdx + 1}/{totalQ}
          </span>
          <Button
            variant="bordered"
            size="sm"
            isDisabled={currentIdx >= totalQ - 1}
            onPress={() => {
              if (currentIdx < totalQ - 1) {
                setCurrentIdx((i) => i + 1)
                setSelectedKey(null)
                setShowResult(false)
              }
            }}
            endContent={<ChevronRight className="w-4 h-4" />}
          >
            Tiếp
          </Button>
        </div>
      )}
    </div>
  )
}
