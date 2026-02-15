"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Button, Card, CardBody, Chip, Progress } from "@heroui/react"
import { Volume2, VolumeX, Eye, EyeOff } from "lucide-react"
import { toast } from "react-toastify"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
  recordPracticeAttemptAction,
} from "@/actions/practice.actions"
import type { IVocabularyItem } from "@/interfaces/portal/practice"
import { QuizResultScreen, McqOptions } from "../shared"

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
  const withAudio = vocabs.filter((v) => v.audioUrl)
  if (withAudio.length === 0) return []

  return shuffleArray(withAudio).map((vocab) => {
    const others = vocabs.filter((v) => v.id !== vocab.id)
    const distractors = shuffleArray(others).slice(0, Math.min(3, others.length))

    const allOptions = shuffleArray([
      { key: "correct", label: vocab.meaning },
      ...distractors.map((d, i) => ({ key: `d${i}`, label: d.meaning })),
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
  const startTimeRef = useRef(Date.now())
  const questionStartRef = useRef(Date.now())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const withAudioCount = useMemo(() => vocabularies.filter((v) => v.audioUrl).length, [vocabularies])

  // Generate questions
  useEffect(() => {
    setQuestions(generateListenQuestions(vocabularies))
  }, [vocabularies])

  // Start session
  useEffect(() => {
    if (withAudioCount === 0) return
    let active = true
    startPracticeSessionAction(lessonId, "LISTEN").then((res) => {
      if (active && res.success && res.data) {
        setSessionId(res.data.sessionId)
        startTimeRef.current = Date.now()
      }
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, withAudioCount])

  // Finish on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
        finishPracticeSessionAction(sessionId, dur)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const currentQ = questions[currentIdx]
  const totalQ = questions.length

  const playAudio = useCallback(() => {
    if (!currentQ?.vocab.audioUrl) return
    if (audioRef.current) {
      audioRef.current.pause()
    }
    const audio = new Audio(currentQ.vocab.audioUrl)
    audioRef.current = audio
    setIsPlaying(true)
    audio.play().catch(() => {
      toast.error("Không thể phát audio")
      setIsPlaying(false)
    })
    audio.onended = () => setIsPlaying(false)
  }, [currentQ])

  // Auto-play on new question
  useEffect(() => {
    if (currentQ?.vocab.audioUrl && !finished) {
      const timer = setTimeout(() => playAudio(), 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, finished])

  const handleSelect = useCallback(
    async (key: string) => {
      if (showResult || !currentQ || !sessionId) return
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
    },
    [showResult, currentQ, sessionId],
  )

  const handleNext = useCallback(() => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((i) => i + 1)
      setSelectedKey(null)
      setShowResult(false)
      setShowTranscript(false)
      questionStartRef.current = Date.now()
    } else {
      setFinished(true)
      if (sessionId) {
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
        finishPracticeSessionAction(sessionId, dur)
      }
      onProgressUpdate()
    }
  }, [currentIdx, totalQ, sessionId, onProgressUpdate])

  const handleRestart = useCallback(() => {
    setQuestions(generateListenQuestions(vocabularies))
    setCurrentIdx(0)
    setSelectedKey(null)
    setShowResult(false)
    setShowTranscript(false)
    setResults([])
    setFinished(false)
    questionStartRef.current = Date.now()
    startTimeRef.current = Date.now()
    startPracticeSessionAction(lessonId, "LISTEN").then((res) => {
      if (res.success && res.data) setSessionId(res.data.sessionId)
    })
  }, [vocabularies, lessonId])

  // Empty state: no audio
  if (withAudioCount === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <VolumeX className="w-12 h-12 text-default-300 mx-auto mb-3" />
          <p className="text-default-500 font-medium">Chưa có audio cho bài học này</p>
          <p className="text-sm text-default-400 mt-1">
            Dữ liệu audio sẽ được cập nhật sau. Hãy thử các chế độ luyện tập khác!
          </p>
        </CardBody>
      </Card>
    )
  }

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
            Nhấn để phát lại — Nghe và chọn nghĩa đúng
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

      {/* Options */}
      <div className="mb-4">
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
        <div className="mb-4 p-3 rounded-lg bg-default-100 text-center">
          <p className="text-2xl font-bold">{currentQ.vocab.word}</p>
          <p className="text-primary text-sm">{currentQ.vocab.pinyin} — {currentQ.vocab.meaning}</p>
        </div>
      )}

      {/* Next */}
      {showResult && (
        <div className="flex justify-center">
          <Button color="secondary" onPress={handleNext}>
            {currentIdx < totalQ - 1 ? "Câu tiếp theo" : "Xem kết quả"}
          </Button>
        </div>
      )}
    </div>
  )
}
