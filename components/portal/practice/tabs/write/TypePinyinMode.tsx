"use client"

import { useState, useCallback } from "react"
import { Button, Card, CardBody, Input } from "@heroui/react"
import { CheckCircle, XCircle, Lightbulb, Volume2 } from "lucide-react"
import { useTTS } from "@/hooks/useTTS"
import { getDisplayMeaning } from "@/enums/portal/common"
import type { IVocabularyItem } from "@/interfaces/portal/practice"

interface Props {
  item: IVocabularyItem
  currentIdx: number
  totalItems: number
  onComplete: (isCorrect: boolean, answer: string) => void
  onNext: () => void
}

export default function TypePinyinMode({ item, currentIdx, totalItems, onComplete, onNext }: Props) {
  const [answer, setAnswer] = useState("")
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const { speak } = useTTS()

  // Reset when item changes
  const handleReset = useCallback(() => {
    setAnswer("")
    setChecked(false)
    setIsCorrect(false)
    setShowHint(false)
  }, [])

  // Reset on item change via key prop (parent will remount)
  const handleCheck = useCallback(() => {
    if (!item) return
    const correct = (item.pinyin || "").trim().toLowerCase()
    const userAnswer = answer.trim().toLowerCase()
    const result = userAnswer === correct
    setChecked(true)
    setIsCorrect(result)
    onComplete(result, answer)
  }, [item, answer, onComplete])

  const handleNext = useCallback(() => {
    handleReset()
    onNext()
  }, [handleReset, onNext])

  const useHint = useCallback(() => {
    if (hintsUsed >= 2) return
    setHintsUsed((h) => h + 1)
    setShowHint(true)
  }, [hintsUsed])

  return (
    <>
      {/* Prompt */}
      <Card className="mb-4">
        <CardBody className="p-4 sm:p-6 text-center">
          <p className="text-sm text-default-400 mb-1">Gõ phiên âm Pinyin cho chữ</p>
          <p className="text-4xl sm:text-5xl font-bold text-red-600 dark:text-red-400 mb-1">{item.word}</p>
          <p className="text-default-500 text-sm">{getDisplayMeaning(item)}</p>
          <button
            onClick={() => speak(item.word, item.audioUrl)}
            className="mt-2 p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary hover:bg-primary-200 transition mx-auto inline-flex"
            aria-label="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </CardBody>
      </Card>

      {/* Input + controls */}
      <Card className="mb-4">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end mb-3">
            <Input
              label="Nhập Pinyin"
              placeholder="vd: nǐ hǎo"
              value={answer}
              onValueChange={setAnswer}
              isDisabled={checked}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !checked && answer.trim()) handleCheck()
              }}
              color={checked ? (isCorrect ? "success" : "danger") : "default"}
            />
            {!checked ? (
              <Button
                color="primary"
                onPress={handleCheck}
                isDisabled={!answer.trim()}
              >
                Kiểm tra
              </Button>
            ) : (
              <Button color="primary" onPress={handleNext}>
                {currentIdx < totalItems - 1 ? "Tiếp" : "Kết quả"}
              </Button>
            )}
          </div>

          {/* Hint */}
          {!checked && (
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
          {showHint && !checked && (
            <p className="text-sm text-warning mt-1">
              Bắt đầu bằng: <span className="font-medium">{(item.pinyin || "").charAt(0)}</span>...
            </p>
          )}

          {/* Result feedback */}
          {checked && (
            <div className={`mt-2 p-2 rounded-lg ${isCorrect ? "bg-success-50 dark:bg-success-950/20" : "bg-danger-50 dark:bg-danger-950/20"}`}>
              {isCorrect ? (
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
                    Đáp án đúng: <span className="font-bold text-primary">{item.pinyin}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </>
  )
}
