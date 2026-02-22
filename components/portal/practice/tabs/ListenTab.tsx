"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Card, CardBody, Chip, Progress } from "@heroui/react"
import { Volume2, Eye, EyeOff, Lock, ChevronLeft, ChevronRight } from "lucide-react"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
  recordPracticeAttemptAction,
} from "@/actions/practice.actions"
import { useTTS } from "@/hooks/useTTS"
import { getDisplayMeaning } from "@/enums/portal/common"
import type { IVocabularyItem } from "@/interfaces/portal/practice"
import { QuizResultScreen, McqOptions } from "../shared"

const AUTO_NEXT_DELAY = 3000 // ms

interface Props {
  vocabularies: IVocabularyItem[]
  lessonId: string
  onProgressUpdate: () => void
}

interface ListenQuestion {
  vocab: IVocabularyItem
  options: { key: string; label: string }[]
  correctKey: string
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateListenQuestions(vocabs: IVocabularyItem[]): ListenQuestion[] {
  if (vocabs.length < 2) return []

  // Use ALL vocab — TTS will handle pronunciation when no audio URL
  return shuffleArray(vocabs).map((vocab) => {
    const others = vocabs.filter((v) => v.id !== vocab.id)
    const distractors = shuffleArray(others).slice(0, Math.min(3, others.length))

    const allOptions = shuffleArray([
      { key: "correct", label: getDisplayMeaning(vocab) },
      ...distractors.map((d, i) => ({ key: `d${i}`, label: getDisplayMeaning(d) })),
    ])

    return { vocab, options: allOptions, correctKey: "correct" }
  })
}

export default function ListenTab({ vocabularies, lessonId, onProgressUpdate }: Props) {
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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { speak } = useTTS()

  // Generate questions
  useEffect(() => {
    setQuestions(generateListenQuestions(vocabularies))
  }, [vocabularies])

  // Start session
  useEffect(() => {
    let active = true
    startPracticeSessionAction(lessonId, "LISTEN").then((res) => {
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

  const playAudio = useCallback(() => {
    if (!currentQ) return
    // Use TTS hook which handles audioUrl OR TTS fallback
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(true)
    setHasListened(true)
    speak(currentQ.vocab.word, currentQ.vocab.audioUrl)
      .then(() => setIsPlaying(false))
      .catch(() => setIsPlaying(false))
  }, [currentQ, speak])

  // Auto-play on new question
  useEffect(() => {
    if (currentQ?.vocab.audioUrl && !finished) {
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

  const handleNext = useCallback(() => {
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
        finishPracticeSessionAction(sessionId, dur)
      }
      onProgressUpdate()
    }
  }, [currentIdx, totalQ, sessionId, onProgressUpdate, clearAutoNext])

  const handleSelect = useCallback(
    async (key: string) => {
      if (!hasListened || showResult || !currentQ || !sessionId) return
      setSelectedKey(key)
      setShowResult(true)

      const isCorrect = key === currentQ.correctKey
      const correctOption = currentQ.options.find((o) => o.key === currentQ.correctKey)
      const selectedOption = currentQ.options.find((o) => o.key === key)
      const timeSec = Math.round((Date.now() - questionStartRef.current) / 1000)

      setResults((prev) => [...prev, { correct: isCorrect, vocab: currentQ.vocab }])

      await recordPracticeAttemptAction({
        sessionId,
        vocabularyId: currentQ.vocab.id,
        questionType: "LISTEN_MCQ",
        userAnswer: selectedOption?.label || null,
        correctAnswer: correctOption?.label || "",
        isCorrect,
        timeSpentSec: timeSec,
      })

      // Auto-advance after 3s on correct answer
      if (isCorrect) {
        setAutoNextCountdown(3)
        countdownIntervalRef.current = setInterval(() => {
          setAutoNextCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null))
        }, 1000)
        autoNextTimerRef.current = setTimeout(() => {
          handleNext()
        }, AUTO_NEXT_DELAY)
      }
    },
    [hasListened, showResult, currentQ, sessionId, handleNext],
  )

  const handleRestart = useCallback(() => {
    clearAutoNext()
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
    startPracticeSessionAction(lessonId, "LISTEN").then((res) => {
      if (res.success && res.data) setSessionId(res.data.sessionId)
    })
  }, [vocabularies, lessonId, clearAutoNext])

  // Empty state: not enough vocab
  if (totalQ === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="text-default-500">Cần ít nhất 2 từ vựng có audio để tạo bài nghe</p>
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
        titles={{
          excellent: "Nghe giỏi lắm! 🎉",
          good: "Khá tốt! 👍",
          needWork: "Luyện nghe thêm nhé 💪",
        }}
        wrongItemsLabel="Từ cần nghe lại"
        restartColor="primary"
      />
    )
  }

  // Question
  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-default-500">
          Câu <span className="font-medium text-foreground">{currentIdx + 1}</span>/{totalQ}
        </span>
        <Chip size="sm" variant="flat" startContent={<Volume2 className="w-3 h-3" />}>
          Nghe & chọn nghĩa
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
            className="w-20 h-20 mb-4"
            onPress={playAudio}
            aria-label="Phát audio"
          >
            <Volume2 className={`w-8 h-8 ${isPlaying ? "animate-pulse" : ""}`} />
          </Button>
          <p className="text-sm text-default-400 mb-2">
            {hasListened
              ? "Nhấn để phát lại — Chọn nghĩa đúng bên dưới"
              : "Nhấn nút để nghe trước khi chọn đáp án"}
          </p>

          {/* Transcript toggle */}
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="light"
              onPress={() => setShowTranscript((v) => !v)}
              startContent={showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            >
              {showTranscript ? "Ẩn transcript" : "Xem transcript"}
            </Button>
          </div>
          {showTranscript && (
            <div className="mt-2 p-2 rounded bg-default-100">
              <p className="text-2xl font-bold">{currentQ.vocab.word}</p>
              <p className="text-primary text-sm">{currentQ.vocab.pinyin}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Listen-first lock notice */}
      {!hasListened && !showResult && (
        <div className="flex items-center justify-center gap-2 mb-3 text-warning text-sm">
          <Lock className="w-4 h-4" />
          <span>Hãy nghe audio trước khi chọn đáp án</span>
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

      {/* Reveal answer info on result */}
      {showResult && (
        <div className="mb-4">
          {/* Correct/Wrong feedback banner */}
          <div className={`w-full p-3 rounded-lg text-center mb-3 ${
            selectedKey === currentQ.correctKey
              ? "bg-success-50 dark:bg-success-950/20"
              : "bg-danger-50 dark:bg-danger-950/20"
          }`}>
            {selectedKey === currentQ.correctKey ? (
              <div>
                <p className="text-success font-medium">✓ Chính xác!</p>
                {autoNextCountdown !== null && (
                  <p className="text-xs text-success-600/70 mt-1">Tự động chuyển sau {autoNextCountdown}s…</p>
                )}
              </div>
            ) : (
              <p className="text-danger font-medium">✗ Sai rồi</p>
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
      )}

      {/* Next */}
      {showResult && (
        <div className="flex justify-center mb-4">
          <Button color="secondary" onPress={handleNext}>
            {currentIdx < totalQ - 1 ? "Câu tiếp theo" : "Xem kết quả"}
          </Button>
        </div>
      )}

      {/* Prev/Next Navigation */}
      {!showResult && (
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
            Trước
          </Button>
          <span className="text-xs text-default-400">{currentIdx + 1}/{totalQ}</span>
          <Button
            variant="bordered"
            size="sm"
            isDisabled={currentIdx >= totalQ - 1}
            onPress={() => {
              if (currentIdx < totalQ - 1) {
                setCurrentIdx((i) => i + 1)
                setSelectedKey(null)
                setShowResult(false)
                setShowTranscript(false)
                setHasListened(false)
                questionStartRef.current = Date.now()
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
