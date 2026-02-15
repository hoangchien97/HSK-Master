"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Card, CardBody, Chip, Progress } from "@heroui/react"
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

interface QuizQuestion {
  vocab: IVocabularyItem
  type: "MCQ_MEANING" | "MCQ_HANZI" | "MCQ_PINYIN"
  prompt: string
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

function generateQuestions(vocabs: IVocabularyItem[]): QuizQuestion[] {
  if (vocabs.length === 0) return []

  const questions: QuizQuestion[] = []
  const types: QuizQuestion["type"][] = ["MCQ_MEANING", "MCQ_HANZI", "MCQ_PINYIN"]

  const shuffledVocabs = shuffleArray(vocabs)

  for (const vocab of shuffledVocabs) {
    const type = types[Math.floor(Math.random() * types.length)]
    const others = vocabs.filter((v) => v.id !== vocab.id)
    const distractorCount = Math.min(3, others.length)
    const distractors = shuffleArray(others).slice(0, distractorCount)

    let prompt: string
    let correctLabel: string
    let distractorLabels: string[]

    switch (type) {
      case "MCQ_MEANING":
        prompt = vocab.word
        correctLabel = vocab.meaning
        distractorLabels = distractors.map((d) => d.meaning)
        break
      case "MCQ_HANZI":
        prompt = vocab.meaning
        correctLabel = vocab.word
        distractorLabels = distractors.map((d) => d.word)
        break
      case "MCQ_PINYIN":
        prompt = vocab.word
        correctLabel = vocab.pinyin || ""
        distractorLabels = distractors.map((d) => d.pinyin || "")
        break
    }

    const allOptions = shuffleArray([
      { key: "correct", label: correctLabel },
      ...distractorLabels.map((label, i) => ({ key: `d${i}`, label })),
    ])

    questions.push({
      vocab,
      type,
      prompt,
      options: allOptions,
      correctKey: "correct",
    })
  }

  return questions
}

const TYPE_LABELS: Record<string, string> = {
  MCQ_MEANING: "Chọn nghĩa đúng",
  MCQ_HANZI: "Chọn Hán tự đúng",
  MCQ_PINYIN: "Chọn Pinyin đúng",
}

export default function QuizTab({ vocabularies, lessonId, onProgressUpdate }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [results, setResults] = useState<{ correct: boolean; vocab: IVocabularyItem }[]>([])
  const [finished, setFinished] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startTimeRef = useRef(Date.now())
  const questionStartRef = useRef(Date.now())

  // Generate questions
  useEffect(() => {
    setQuestions(generateQuestions(vocabularies))
  }, [vocabularies])

  // Start session
  useEffect(() => {
    let active = true
    startPracticeSessionAction(lessonId, "QUIZ").then((res) => {
      if (active && res.success && res.data) {
        setSessionId(res.data.sessionId)
        startTimeRef.current = Date.now()
      }
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

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

      // Record attempt
      await recordPracticeAttemptAction({
        sessionId,
        vocabularyId: currentQ.vocab.id,
        questionType: currentQ.type,
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
      questionStartRef.current = Date.now()
    } else {
      // Finish
      setFinished(true)
      if (sessionId) {
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
        finishPracticeSessionAction(sessionId, dur)
      }
      onProgressUpdate()
    }
  }, [currentIdx, totalQ, sessionId, onProgressUpdate])

  const handleRestart = useCallback(() => {
    setQuestions(generateQuestions(vocabularies))
    setCurrentIdx(0)
    setSelectedKey(null)
    setShowResult(false)
    setResults([])
    setFinished(false)
    questionStartRef.current = Date.now()
    startTimeRef.current = Date.now()
    startPracticeSessionAction(lessonId, "QUIZ").then((res) => {
      if (res.success && res.data) setSessionId(res.data.sessionId)
    })
  }, [vocabularies, lessonId])

  if (totalQ === 0) {
    return (
      <Card><CardBody className="py-12 text-center"><p className="text-default-500">Bài học cần ít nhất 2 từ vựng để tạo Quiz</p></CardBody></Card>
    )
  }

  // Results screen
  if (finished) {
    const timeSec = Math.round((Date.now() - startTimeRef.current) / 1000)
    return (
      <QuizResultScreen
        results={results}
        totalQuestions={totalQ}
        elapsedSec={timeSec}
        onRestart={handleRestart}
      />
    )
  }

  // Quiz question
  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-default-500">
          Câu <span className="font-medium text-foreground">{currentIdx + 1}</span>/{totalQ}
        </span>
        <Chip size="sm" variant="flat">{TYPE_LABELS[currentQ.type]}</Chip>
      </div>

      <Progress value={((currentIdx + 1) / totalQ) * 100} size="sm" color="primary" className="mb-4" aria-label="quiz progress" />

      {/* Question card */}
      <Card className="mb-4">
        <CardBody className="p-6 sm:p-8 text-center">
          <p className={`font-bold ${currentQ.type === "MCQ_HANZI" ? "text-xl sm:text-2xl" : "text-3xl sm:text-5xl"}`}>
            {currentQ.prompt}
          </p>
          {currentQ.type === "MCQ_HANZI" && (
            <p className="text-sm text-default-400 mt-1">Chọn Hán tự tương ứng</p>
          )}
          {currentQ.type === "MCQ_MEANING" && (
            <p className="text-sm text-default-400 mt-1">Chọn nghĩa tiếng Việt</p>
          )}
          {currentQ.type === "MCQ_PINYIN" && (
            <p className="text-sm text-default-400 mt-1">Chọn phiên âm đúng</p>
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
          largeFont={currentQ.type === "MCQ_HANZI"}
        />
      </div>

      {/* Next button */}
      {showResult && (
        <div className="flex justify-center">
          <Button color="primary" onPress={handleNext}>
            {currentIdx < totalQ - 1 ? "Câu tiếp theo" : "Xem kết quả"}
          </Button>
        </div>
      )}
    </div>
  )
}
