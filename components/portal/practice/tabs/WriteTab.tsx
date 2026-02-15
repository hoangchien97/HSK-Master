"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Card, CardBody, Chip, Progress, Input } from "@heroui/react"
import { CheckCircle, XCircle, PenLine, Lightbulb, SkipForward } from "lucide-react"
import {
  startPracticeSessionAction,
  finishPracticeSessionAction,
  recordPracticeAttemptAction,
} from "@/actions/practice.actions"
import type { IVocabularyItem } from "@/interfaces/portal/practice"
import { QuizResultScreen } from "../shared"

interface Props {
  vocabularies: IVocabularyItem[]
  lessonId: string
  onProgressUpdate: () => void
}

type WriteMode = "STROKE" | "TYPE_PINYIN"

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function WriteTab({ vocabularies, lessonId, onProgressUpdate }: Props) {
  const [items, setItems] = useState<IVocabularyItem[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [mode, setMode] = useState<WriteMode>("STROKE")
  const [finished, setFinished] = useState(false)
  const [results, setResults] = useState<{ correct: boolean; vocab: IVocabularyItem }[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startTimeRef = useRef(Date.now())
  const questionStartRef = useRef(Date.now())

  // Stroke mode state
  const writerContainerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<any>(null)
  const [strokeComplete, setStrokeComplete] = useState(false)
  const [strokeMistakes, setStrokeMistakes] = useState(0)

  // Type pinyin mode state
  const [pinyinAnswer, setPinyinAnswer] = useState("")
  const [pinyinChecked, setPinyinChecked] = useState(false)
  const [pinyinCorrect, setPinyinCorrect] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)

  const currentItem = items[currentIdx]
  const totalItems = items.length

  // Generate items
  useEffect(() => {
    setItems(shuffleArray(vocabularies))
  }, [vocabularies])

  // Start session
  useEffect(() => {
    let active = true
    startPracticeSessionAction(lessonId, "WRITE").then((res) => {
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

  // Initialize HanziWriter for stroke mode
  useEffect(() => {
    if (mode !== "STROKE" || !currentItem || finished) return
    if (!writerContainerRef.current) return

    // Clear previous
    writerContainerRef.current.innerHTML = ""
    writerRef.current = null
    setStrokeComplete(false)
    setStrokeMistakes(0)

    // Single character: use first char of the word
    const char = currentItem.word.charAt(0)

    // Dynamically import hanzi-writer (client-side only)
    import("hanzi-writer").then((HanziWriterModule) => {
      const HanziWriter = HanziWriterModule.default || HanziWriterModule
      if (!writerContainerRef.current) return

      try {
        const writer = HanziWriter.create(writerContainerRef.current, char, {
          width: 250,
          height: 250,
          padding: 10,
          showOutline: true,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 100,
          showCharacter: false,
          showHintAfterMisses: 3,
          highlightOnComplete: true,
          drawingWidth: 20,
          strokeColor: "#333",
          outlineColor: "#ddd",
          highlightColor: "#3b82f6",
        })

        let mistakes = 0
        writer.quiz({
          onMistake: (strokeData: any) => {
            mistakes++
            setStrokeMistakes(mistakes)
          },
          onCorrectStroke: () => {},
          onComplete: (summaryData: any) => {
            setStrokeComplete(true)
            setStrokeMistakes(summaryData?.totalMistakes || mistakes)
          },
        })

        writerRef.current = writer
      } catch {
        // Character not found in HanziWriter — fallback
        if (writerContainerRef.current) {
          writerContainerRef.current.innerHTML =
            `<div style="display:flex;align-items:center;justify-content:center;height:250px;color:#999;font-size:14px;">Không hỗ trợ ký tự này</div>`
        }
      }
    })

    return () => {
      writerRef.current = null
    }
  }, [mode, currentItem, currentIdx, finished])

  const recordAttempt = useCallback(
    async (isCorrect: boolean, userAnswer: string) => {
      if (!sessionId || !currentItem) return
      const timeSec = Math.round((Date.now() - questionStartRef.current) / 1000)
      await recordPracticeAttemptAction({
        sessionId,
        vocabularyId: currentItem.id,
        questionType: mode === "STROKE" ? "TYPE_HANZI" : "TYPE_PINYIN",
        userAnswer,
        correctAnswer: mode === "STROKE" ? currentItem.word.charAt(0) : (currentItem.pinyin || ""),
        isCorrect,
        timeSpentSec: timeSec,
      })
    },
    [sessionId, currentItem, mode],
  )

  const handleStrokeNext = useCallback(async () => {
    const isCorrect = strokeMistakes <= 2
    setResults((prev) => [...prev, { correct: isCorrect, vocab: currentItem }])
    await recordAttempt(isCorrect, `stroke_mistakes:${strokeMistakes}`)
    goNext()
  }, [strokeMistakes, currentItem, recordAttempt])

  const handlePinyinCheck = useCallback(() => {
    if (!currentItem) return
    const correct = (currentItem.pinyin || "").trim().toLowerCase()
    const answer = pinyinAnswer.trim().toLowerCase()
    const isCorrect = answer === correct
    setPinyinChecked(true)
    setPinyinCorrect(isCorrect)
    setResults((prev) => [...prev, { correct: isCorrect, vocab: currentItem }])
    recordAttempt(isCorrect, pinyinAnswer)
  }, [currentItem, pinyinAnswer, recordAttempt])

  const goNext = useCallback(() => {
    if (currentIdx < totalItems - 1) {
      setCurrentIdx((i) => i + 1)
      setPinyinAnswer("")
      setPinyinChecked(false)
      setPinyinCorrect(false)
      setShowHint(false)
      questionStartRef.current = Date.now()
    } else {
      setFinished(true)
      if (sessionId) {
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000)
        finishPracticeSessionAction(sessionId, dur)
      }
      onProgressUpdate()
    }
  }, [currentIdx, totalItems, sessionId, onProgressUpdate])

  const handleRestart = useCallback(() => {
    setItems(shuffleArray(vocabularies))
    setCurrentIdx(0)
    setFinished(false)
    setResults([])
    setPinyinAnswer("")
    setPinyinChecked(false)
    setPinyinCorrect(false)
    setShowHint(false)
    setHintsUsed(0)
    questionStartRef.current = Date.now()
    startTimeRef.current = Date.now()
    startPracticeSessionAction(lessonId, "WRITE").then((res) => {
      if (res.success && res.data) setSessionId(res.data.sessionId)
    })
  }, [vocabularies, lessonId])

  const useHint = useCallback(() => {
    if (hintsUsed >= 2) return
    setHintsUsed((h) => h + 1)
    setShowHint(true)
  }, [hintsUsed])

  if (totalItems === 0) {
    return (
      <Card><CardBody className="py-12 text-center"><p className="text-default-500">Chưa có từ vựng cho bài học này</p></CardBody></Card>
    )
  }

  // Results screen
  if (finished) {
    const timeSec = Math.round((Date.now() - startTimeRef.current) / 1000)
    return (
      <QuizResultScreen
        results={results}
        totalQuestions={totalItems}
        elapsedSec={timeSec}
        onRestart={handleRestart}
        titles={{
          excellent: "Viết đẹp lắm! 🎉",
          good: "Khá tốt! 👍",
          needWork: "Luyện viết thêm nhé 💪",
        }}
        wrongItemsLabel="Từ cần luyện"
      />
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <span className="text-sm text-default-500">
          Từ <span className="font-medium text-foreground">{currentIdx + 1}</span>/{totalItems}
        </span>
        <div className="flex gap-1">
          <Chip
            size="sm"
            variant={mode === "STROKE" ? "solid" : "bordered"}
            color={mode === "STROKE" ? "primary" : "default"}
            className="cursor-pointer"
            onClick={() => setMode("STROKE")}
          >
            Viết nét
          </Chip>
          <Chip
            size="sm"
            variant={mode === "TYPE_PINYIN" ? "solid" : "bordered"}
            color={mode === "TYPE_PINYIN" ? "primary" : "default"}
            className="cursor-pointer"
            onClick={() => setMode("TYPE_PINYIN")}
          >
            Gõ Pinyin
          </Chip>
        </div>
      </div>

      <Progress value={((currentIdx + 1) / totalItems) * 100} size="sm" color="primary" className="mb-4" aria-label="write progress" />

      {/* Prompt */}
      <Card className="mb-4">
        <CardBody className="p-4 sm:p-6 text-center">
          {mode === "STROKE" ? (
            <>
              <p className="text-sm text-default-400 mb-1">Viết theo nét chữ</p>
              <p className="text-primary text-sm mb-1">{currentItem.pinyin}</p>
              <p className="text-default-500 text-sm">{currentItem.meaning}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-default-400 mb-1">Gõ phiên âm Pinyin cho chữ</p>
              <p className="text-4xl sm:text-5xl font-bold mb-1">{currentItem.word}</p>
              <p className="text-default-500 text-sm">{currentItem.meaning}</p>
            </>
          )}
        </CardBody>
      </Card>

      {/* Stroke mode: HanziWriter canvas */}
      {mode === "STROKE" && (
        <Card className="mb-4">
          <CardBody className="flex flex-col items-center p-4">
            <div
              ref={writerContainerRef}
              className="border-2 border-dashed border-default-200 rounded-xl bg-default-50 mx-auto"
              style={{ width: 250, maxWidth: "100%", height: 250, touchAction: "none" }}
            />
            {strokeComplete && (
              <div className="mt-3 text-center">
                {strokeMistakes <= 2 ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {strokeMistakes === 0 ? "Hoàn hảo!" : `Tốt! (${strokeMistakes} lỗi)`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-warning">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">{strokeMistakes} lỗi — Luyện thêm nhé</span>
                  </div>
                )}
                <Button size="sm" color="primary" className="mt-2" onPress={handleStrokeNext}>
                  {currentIdx < totalItems - 1 ? "Từ tiếp theo" : "Xem kết quả"}
                </Button>
              </div>
            )}
            {!strokeComplete && (
              <Button
                size="sm"
                variant="light"
                className="mt-2"
                onPress={() => {
                  setResults((prev) => [...prev, { correct: false, vocab: currentItem }])
                  recordAttempt(false, "skipped")
                  goNext()
                }}
                startContent={<SkipForward className="w-3.5 h-3.5" />}
              >
                Bỏ qua
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Type pinyin mode */}
      {mode === "TYPE_PINYIN" && (
        <Card className="mb-4">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end mb-3">
              <Input
                label="Nhập Pinyin"
                placeholder="vd: nǐ hǎo"
                value={pinyinAnswer}
                onValueChange={setPinyinAnswer}
                isDisabled={pinyinChecked}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !pinyinChecked && pinyinAnswer.trim()) handlePinyinCheck()
                }}
                color={pinyinChecked ? (pinyinCorrect ? "success" : "danger") : "default"}
              />
              {!pinyinChecked ? (
                <Button
                  color="primary"
                  onPress={handlePinyinCheck}
                  isDisabled={!pinyinAnswer.trim()}
                >
                  Kiểm tra
                </Button>
              ) : (
                <Button color="primary" onPress={goNext}>
                  {currentIdx < totalItems - 1 ? "Tiếp" : "Kết quả"}
                </Button>
              )}
            </div>

            {/* Hint */}
            {!pinyinChecked && (
              <Button
                size="sm"
                variant="light"
                onPress={useHint}
                isDisabled={hintsUsed >= 2}
                startContent={<Lightbulb className="w-3.5 h-3.5" />}
              >
                Gợi ý ({2 - hintsUsed} lượt)
              </Button>
            )}
            {showHint && !pinyinChecked && (
              <p className="text-sm text-warning mt-1">
                Bắt đầu bằng: <span className="font-medium">{(currentItem.pinyin || "").charAt(0)}</span>...
              </p>
            )}

            {/* Result feedback */}
            {pinyinChecked && (
              <div className={`mt-2 p-2 rounded-lg ${pinyinCorrect ? "bg-success-50 dark:bg-success-950/20" : "bg-danger-50 dark:bg-danger-950/20"}`}>
                {pinyinCorrect ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Chính xác!</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-danger mb-1">
                      <XCircle className="w-4 h-4" />
                      <span className="font-medium">Sai rồi</span>
                    </div>
                    <p className="text-sm">
                      Đáp án đúng: <span className="font-bold text-primary">{currentItem.pinyin}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
