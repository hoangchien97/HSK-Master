"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Card, CardBody, Chip, Progress } from "@heroui/react"
import { Volume2, Eye, EyeOff, Lock, ChevronLeft, ChevronRight } from "lucide-react"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
} from "@/actions/practice.actions"
import { recordSkillAttemptAction } from "@/actions/practice-skill.actions"
import { useSpeech } from "@/hooks/useSpeech"
import { getDisplayMeaning } from "@/enums/portal/common"
import { PracticeMode } from "@/enums/portal"
import { AUTO_NEXT_DELAY_MS, PRACTICE_LABELS } from "@/constants/portal/practice"
import { usePracticeKeyboard } from "@/hooks/usePracticeKeyboard"
import { generateListenQuestions } from "@/utils/practice"
import type { ListenQuestion } from "@/utils/practice"
import type { IVocabularyItem, IQueueVocabItem, ISkillProgressRecord } from "@/interfaces/portal/practice"
import { QuizResultScreen, McqOptions } from "../shared"

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
  /** Whether this mode is fully completed */
  isCompleted?: boolean
  /** Callback to reset session & refetch queue */
  onResetSession?: () => void
}

const L = PRACTICE_LABELS

export default function ListenTab({ vocabularies, lessonId, onProgressUpdate, isCompleted: modeCompleted }: Props) {
  const [questions, setQuestions] = useState<ListenQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<{ correct: boolean; vocab: IVocabularyItem }[]>([])
  const [finished, setFinished] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [hasListened, setHasListened] = useState(false)
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null)
  const startTimeRef = useRef(Date.now())
  const questionStartRef = useRef(Date.now())
  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isAdvancingRef = useRef(false)
  const { speak } = useSpeech()

  // Generate questions
  useEffect(() => {
    setQuestions(generateListenQuestions(vocabularies))
  }, [vocabularies])

  // Start session (skip if mode already completed)
  useEffect(() => {
    if (modeCompleted) return
    let active = true
    startPracticeSessionAction(lessonId, PracticeMode.LISTEN).then((res) => {
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

  const playAudio = useCallback(() => {
    if (!currentQ) return
    // Use Web Speech API for pronunciation
    setIsPlaying(true)
    setHasListened(true)
    speak(currentQ.vocab.word)
      .then(() => setIsPlaying(false))
      .catch(() => setIsPlaying(false))
  }, [currentQ, speak])

  // Auto-play on new question
  useEffect(() => {
    if (currentQ && !finished) {
      const timer = setTimeout(() => playAudio(), 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, finished])

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
      setShowTranscript(false)
      setHasListened(false)
      questionStartRef.current = Date.now()
    } else {
      setFinished(true)
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
      if (!hasListened || showResult || !currentQ) return

      setSelectedKey(key)
      setShowResult(true)

      const isCorrect = key === currentQ.correctKey

      setResults((prev) => [...prev, { correct: isCorrect, vocab: currentQ.vocab }])

      // Record per-mode skill progress (handles legacy sync internally)
      recordSkillAttemptAction({
        lessonId,
        mode: PracticeMode.LISTEN,
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
    [hasListened, showResult, currentQ, handleNext, currentIdx, lessonId, totalQ],
  )

  // State for "retry wrong words only" mode
  const [retryWrongVocabs, setRetryWrongVocabs] = useState<IVocabularyItem[] | null>(null)

  const handleRestart = useCallback(() => {
    clearAutoNext()
    setRetryWrongVocabs(null)
    setQuestions(generateListenQuestions(vocabularies))
    setCurrentIdx(0)
    setSelectedKey(null)
    setShowResult(false)
    setShowTranscript(false)
    setHasListened(false)
    setResults([])
    setFinished(false)
    questionStartRef.current = Date.now()
    startTimeRef.current = Date.now()
    startPracticeSessionAction(lessonId, PracticeMode.LISTEN).then((res) => {
      if (res.success && res.data) setSessionId(res.data.sessionId)
    })
  }, [vocabularies, lessonId, clearAutoNext])

  const handleRetryWrong = useCallback((wrongVocabs: IVocabularyItem[]) => {
    clearAutoNext()
    setRetryWrongVocabs(wrongVocabs)
    setQuestions(generateListenQuestions(wrongVocabs))
    setCurrentIdx(0)
    setSelectedKey(null)
    setShowResult(false)
    setShowTranscript(false)
    setHasListened(false)
    setResults([])
    setFinished(false)
    questionStartRef.current = Date.now()
    startTimeRef.current = Date.now()
    startPracticeSessionAction(lessonId, PracticeMode.LISTEN).then((res) => {
      if (res.success && res.data) setSessionId(res.data.sessionId)
    })
  }, [lessonId, clearAutoNext])

  // Keyboard shortcuts: Space=play audio, 1-4 select answer, Enter next
  usePracticeKeyboard(
    {
      " ": () => playAudio(),
      "1": () => { if (questions[currentIdx]?.options[0] && hasListened && !showResult) handleSelect(questions[currentIdx].options[0].key) },
      "2": () => { if (questions[currentIdx]?.options[1] && hasListened && !showResult) handleSelect(questions[currentIdx].options[1].key) },
      "3": () => { if (questions[currentIdx]?.options[2] && hasListened && !showResult) handleSelect(questions[currentIdx].options[2].key) },
      "4": () => { if (questions[currentIdx]?.options[3] && hasListened && !showResult) handleSelect(questions[currentIdx].options[3].key) },
      "Enter": () => { if (showResult) handleNext() },
    },
    { enabled: !finished && totalQ > 0 },
  )

  // Empty state: not enough vocab
  if (totalQ === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="text-default-500">{L.empty.minVocabListen}</p>
        </CardBody>
      </Card>
    )
  }

  // Finished
  if (finished) {
    const timeSec = Math.round((Date.now() - startTimeRef.current) / 1000)
    return (
      <QuizResultScreen
        results={results}
        totalQuestions={totalQ}
        elapsedSec={timeSec}
        onRestart={handleRestart}
        onRetryWrong={handleRetryWrong}
        mode={PracticeMode.LISTEN}
        wrongItemsLabel="Từ cần nghe lại"
        restartColor="primary"
      />
    )
  }

  // Question
  return (
    <div className="max-w-lg mx-auto">
      {/* Retry wrong words indicator */}
      {retryWrongVocabs && (
        <div className="mb-3 p-2 rounded-lg bg-warning-50 dark:bg-warning-950/20 text-center">
          <p className="text-sm text-warning-700 dark:text-warning-300 font-medium">
            {L.listen.retryTpl(retryWrongVocabs.length)}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-default-500">
          {L.quiz.questionLabel} <span className="font-medium text-foreground">{currentIdx + 1}</span>/{totalQ}
        </span>
        <Chip size="sm" variant="flat" startContent={<Volume2 className="w-3 h-3" />}>
          {L.listen.chipLabel}
        </Chip>
      </div>

      <Progress value={((currentIdx + 1) / totalQ) * 100} size="sm" color="secondary" className="mb-4" aria-label="listen progress" />

      {/* Audio card */}
      <Card className="mb-4">
        <CardBody className="p-6 sm:p-8 text-center">
          <Button
            isIconOnly
            size="lg"
            radius="full"
            color="secondary"
            variant={isPlaying ? "solid" : "bordered"}
            className="w-16 h-16 sm:w-20 sm:h-20 mb-4"
            onPress={playAudio}
            aria-label="Phát audio"
          >
            <Volume2 className={`w-6 h-6 sm:w-8 sm:h-8 ${isPlaying ? "animate-pulse" : ""}`} />
          </Button>
          <p className="text-sm text-default-400 mb-2">
            {hasListened
              ? L.listen.instructionListened
              : L.listen.instructionNotListened}
          </p>

          {/* Transcript toggle */}
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="light"
              onPress={() => setShowTranscript((v) => !v)}
              startContent={showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            >
              {showTranscript ? L.listen.hideTranscript : L.listen.showTranscript}
            </Button>
          </div>
          {showTranscript && (
            <div className="mt-2 p-2 rounded bg-default-100">
              <p className="text-xl sm:text-2xl font-bold">{currentQ.vocab.word}</p>
              <p className="text-primary text-sm">{currentQ.vocab.pinyin}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Listen-first lock notice */}
      {!hasListened && !showResult && (
        <div className="flex items-center justify-center gap-2 mb-3 text-warning text-sm">
          <Lock className="w-4 h-4" />
          <span>{L.listen.lockNotice}</span>
        </div>
      )}

      {/* Options */}
      <div className={`mb-4 ${!hasListened && !showResult ? "opacity-50 pointer-events-none" : ""}`}>
        <McqOptions
          options={currentQ.options}
          correctKey={currentQ.correctKey}
          selectedKey={selectedKey}
          showResult={showResult}
          onSelect={handleSelect}
        />
      </div>

      {/* Bottom section — stable min-h prevents height jump on answer/advance */}
      <div className="min-h-55">
        {showResult ? (
          <>
            {/* Reveal answer info on result */}
            <div className="mb-4">
              {/* Correct/Wrong feedback banner */}
              <div className={`w-full p-3 rounded-lg text-center mb-3 ${
                selectedKey === currentQ.correctKey
                  ? "bg-success-50 dark:bg-success-950/20"
                  : "bg-danger-50 dark:bg-danger-950/20"
              }`}>
                {selectedKey === currentQ.correctKey ? (
                  <div>
                    <p className="text-success font-medium">{L.feedback.correct}</p>
                    {autoNextCountdown !== null && (
                      <p className="text-xs text-success-600/70 mt-1">{L.feedback.autoNextTpl(autoNextCountdown)}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-danger font-medium">{L.feedback.wrong}</p>
                )}
              </div>
              {/* Always show answer details */}
              <div className="p-3 rounded-lg bg-default-100 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{currentQ.vocab.word}</p>
                <p className="text-primary text-sm">
                  {currentQ.vocab.pinyin} — {getDisplayMeaning(currentQ.vocab)}
                </p>
                {currentQ.vocab.meaningVi && currentQ.vocab.meaning !== currentQ.vocab.meaningVi && (
                  <p className="text-xs text-default-400 mt-1">{currentQ.vocab.meaning}</p>
                )}
              </div>
            </div>

            {/* Next */}
            <div className="flex justify-center mb-4">
              <Button color="secondary" onPress={handleNext}>
                {currentIdx < totalQ - 1 ? L.nav.nextQuestion : L.nav.viewResult}
              </Button>
            </div>
          </>
        ) : (
          /* Prev/Next Navigation — forward requires answering */
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
                  setShowTranscript(false)
                  setHasListened(false)
                  questionStartRef.current = Date.now()
                }
              }}
              startContent={<ChevronLeft className="w-4 h-4" />}
            >
              {L.nav.prev}
            </Button>
            <span className="text-xs text-default-400">{currentIdx + 1}/{totalQ}</span>
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
