"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button, Card, CardBody, Chip, Progress } from "@heroui/react"
import { Volume2, ChevronLeft, ChevronRight } from "lucide-react"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
} from "@/actions/practice.actions"
import { recordSkillAttemptAction } from "@/actions/practice-skill.actions"
import { useSpeech } from "@/hooks/useSpeech"
import { getDisplayMeaning, QuestionType } from "@/enums/portal/common"
import { PracticeMode } from "@/enums/portal"
import { AUTO_NEXT_DELAY_MS, QUESTION_TYPE_LABELS, PRACTICE_LABELS } from "@/constants/portal/practice"
import { usePracticeKeyboard } from "@/hooks/usePracticeKeyboard"
import { generateQuizQuestions } from "@/utils/practice"
import type { IVocabularyItem, IQueueVocabItem, ISkillProgressRecord } from "@/interfaces/portal/practice"
import { QuizResultScreen, McqOptions } from "../shared"

const L = PRACTICE_LABELS

interface Props {
  vocabularies: IVocabularyItem[]
  lessonId: string
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

export default function QuizTab({
  vocabularies, lessonId, onProgressUpdate,
  isCompleted: modeCompleted,
}: Props) {
  const [generationKey, setGenerationKey] = useState(0)
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
  const isAdvancingRef = useRef(false)
  const { speak } = useSpeech()

  // State for "retry wrong words only" mode (must be before useMemo that depends on it)
  const [retryWrongVocabs, setRetryWrongVocabs] = useState<IVocabularyItem[] | null>(null)

  // Derive questions from vocabularies + generationKey (avoids setState-in-effect)
  // When retryWrongVocabs is set, generate questions from only the wrong words
  const activeVocabs = retryWrongVocabs ?? vocabularies
  const questions = useMemo(
    () => generateQuizQuestions(activeVocabs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeVocabs, generationKey]
  )

  // Reset quiz state when vocabularies change (React 19 "adjust state during render" pattern)
  const [prevVocabularies, setPrevVocabularies] = useState(vocabularies)
  if (vocabularies !== prevVocabularies) {
    setPrevVocabularies(vocabularies)
    setCurrentIdx(0)
    setSelectedKey(null)
    setShowResult(false)
  }

  // Initialize time refs
  useEffect(() => {
    startTimeRef.current = Date.now()
    questionStartRef.current = Date.now()
  }, [])

  // Start session (skip if mode already completed)
  useEffect(() => {
    if (modeCompleted) return
    let active = true
    startPracticeSessionAction(lessonId, PracticeMode.QUIZ).then((res) => {
      if (active && res.success && res.data) {
        setSessionId(res.data.sessionId)
        startTimeRef.current = Date.now()
      }
    })
    return () => { active = false }
  }, [lessonId, modeCompleted])

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
    // Guard against double-advance (auto-timer + manual click race)
    if (isAdvancingRef.current) return
    isAdvancingRef.current = true
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
    // Reset guard after React has flushed the state update
    requestAnimationFrame(() => { isAdvancingRef.current = false })
  }, [currentIdx, totalQ, sessionId, onProgressUpdate, clearAutoNext])

  const handleSelect = useCallback(
    async (key: string) => {
      if (showResult || !currentQ) return

      setSelectedKey(key)
      setShowResult(true)

      const isCorrect = key === currentQ.correctKey

      setResults((prev) => [...prev, { correct: isCorrect, vocab: currentQ.vocab }])

      // Record per-mode skill progress (handles legacy sync internally)
      recordSkillAttemptAction({
        lessonId,
        mode: PracticeMode.QUIZ,
        vocabularyId: currentQ.vocab.id,
        isCorrect,
        currentIndex: currentIdx,
        queueLength: totalQ,
      })

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
    [showResult, currentQ, handleNext, currentIdx, lessonId, totalQ],
  )

  const handleRestart = useCallback(() => {
    clearAutoNext()
    setRetryWrongVocabs(null)
    setGenerationKey(k => k + 1) // triggers useMemo recalculation
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
  }, [lessonId, clearAutoNext])

  const handleRetryWrong = useCallback((wrongVocabs: IVocabularyItem[]) => {
    clearAutoNext()
    setRetryWrongVocabs(wrongVocabs)
    setGenerationKey(k => k + 1)
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
  }, [lessonId, clearAutoNext])

  // Keyboard shortcuts: 1-4 select answer, Enter next
  usePracticeKeyboard(
    {
      "1": () => { if (questions[currentIdx]?.options[0] && !showResult) handleSelect(questions[currentIdx].options[0].key) },
      "2": () => { if (questions[currentIdx]?.options[1] && !showResult) handleSelect(questions[currentIdx].options[1].key) },
      "3": () => { if (questions[currentIdx]?.options[2] && !showResult) handleSelect(questions[currentIdx].options[2].key) },
      "4": () => { if (questions[currentIdx]?.options[3] && !showResult) handleSelect(questions[currentIdx].options[3].key) },
      "Enter": () => { if (showResult) handleNext() },
    },
    { enabled: !finished && totalQ > 0 },
  )

  if (totalQ === 0) {
    return (
      <Card><CardBody className="py-12 text-center"><p className="text-default-500">{L.empty.minVocabQuiz}</p></CardBody></Card>
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
        onRetryWrong={handleRetryWrong}
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
      {/* Retry wrong words indicator */}
      {retryWrongVocabs && (
        <div className="mb-3 p-2 rounded-lg bg-warning-50 dark:bg-warning-950/20 text-center">
          <p className="text-sm text-warning-700 dark:text-warning-300 font-medium">
            {L.quiz.retryTpl(retryWrongVocabs.length)}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-default-500">
          {L.quiz.questionLabel} <span className="font-medium text-foreground">{currentIdx + 1}</span>/{totalQ}
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

      {/* Bottom section — stable min-h prevents height jump on answer/advance */}
      <div className="min-h-35 mt-4">
        {showResult ? (
          <div className="flex flex-col items-center gap-3">
            {/* Correct/Wrong feedback */}
            <div className={`w-full p-3 rounded-lg text-center ${isCorrectAnswer ? "bg-success-50 dark:bg-success-950/20" : "bg-danger-50 dark:bg-danger-950/20"}`}>
              {isCorrectAnswer ? (
                <div>
                  <p className="text-success font-medium">{L.feedback.correct}</p>
                  {autoNextCountdown !== null && (
                    <p className="text-xs text-success-600/70 mt-1">{L.feedback.autoNextTpl(autoNextCountdown)}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-danger font-medium mb-1">{L.feedback.wrong}</p>
                  <p className="text-sm text-default-600">
                    {L.feedback.answerIs} <span className="font-bold text-red-600 dark:text-red-400">{currentQ.vocab.word}</span>
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
              {currentIdx < totalQ - 1 ? `${L.nav.nextQuestion} →` : L.nav.viewResult}
            </Button>
          </div>
        ) : (
          /* Prev/Next navigation — only go back to review, forward requires answering */
          <div className="flex items-center justify-between">
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
              {L.nav.prev}
            </Button>
            <span className="text-xs text-default-400">
              {currentIdx + 1}/{totalQ}
            </span>
            {/* Forward button disabled — must answer the question to proceed */}
            <Button
              variant="bordered"
              size="sm"
              isDisabled
              endContent={<ChevronRight className="w-4 h-4" />}
            >
              {L.nav.next}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
