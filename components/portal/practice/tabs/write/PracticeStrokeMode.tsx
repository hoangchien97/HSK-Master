"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Card, CardBody } from "@heroui/react"
import { CheckCircle, XCircle, SkipForward, RotateCcw, Volume2 } from "lucide-react"
import { useTTS } from "@/hooks/useTTS"
import { getDisplayMeaning } from "@/enums/portal/common"
import type { IVocabularyItem } from "@/interfaces/portal/practice"

interface Props {
  item: IVocabularyItem
  currentIdx: number
  totalItems: number
  onComplete: (isCorrect: boolean, mistakes: number) => void
  onSkip: () => void
}

export default function PracticeStrokeMode({ item, currentIdx, totalItems, onComplete, onSkip }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writerRef = useRef<any>(null)
  const [strokeComplete, setStrokeComplete] = useState(false)
  const [strokeMistakes, setStrokeMistakes] = useState(0)
  const [retryKey, setRetryKey] = useState(0)
  const { speak } = useTTS()

  // Setup HanziWriter in quiz mode
  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ""
    writerRef.current = null
    setStrokeComplete(false)
    setStrokeMistakes(0)

    const char = item.word.charAt(0)

    import("hanzi-writer").then((HanziWriterModule) => {
      const HanziWriter = HanziWriterModule.default || HanziWriterModule
      if (!containerRef.current) return

      try {
        const writer = HanziWriter.create(containerRef.current, char, {
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
          onMistake: () => {
            mistakes++
            setStrokeMistakes(mistakes)
          },
          onCorrectStroke: () => {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onComplete: (summaryData: any) => {
            setStrokeComplete(true)
            setStrokeMistakes(summaryData?.totalMistakes || mistakes)
          },
        })

        writerRef.current = writer
      } catch {
        if (containerRef.current) {
          containerRef.current.innerHTML =
            `<div style="display:flex;align-items:center;justify-content:center;height:250px;color:#999;font-size:14px;">Không hỗ trợ ký tự này</div>`
        }
      }
    })

    return () => { writerRef.current = null }
  }, [item, retryKey])

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1)
  }, [])

  const handleNext = useCallback(() => {
    const isCorrect = strokeMistakes <= 2
    onComplete(isCorrect, strokeMistakes)
  }, [strokeMistakes, onComplete])

  return (
    <>
      {/* Prompt */}
      <Card className="mb-4">
        <CardBody className="p-4 sm:p-6 text-center">
          <p className="text-sm text-default-400 mb-1">Luyện viết theo nét</p>
          <p className="text-primary text-sm mb-1">{item.pinyin}</p>
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

      {/* Stroke canvas */}
      <Card className="mb-4">
        <CardBody className="flex flex-col items-center p-4">
          <div
            ref={containerRef}
            className="border-2 border-dashed border-default-200 rounded-xl bg-default-50 mx-auto"
            style={{ width: 250, maxWidth: "100%", height: 250, touchAction: "none" }}
          />

          {strokeComplete && (
            <div className="mt-3 text-center">
              {strokeMistakes <= 2 ? (
                <div className="flex items-center gap-2 text-success justify-center">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {strokeMistakes === 0 ? "Hoàn hảo!" : `Tốt! (${strokeMistakes} lỗi)`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-warning justify-center">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">{strokeMistakes} lỗi — Luyện thêm nhé</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 justify-center">
                <Button
                  size="sm"
                  color="secondary"
                  variant="bordered"
                  onPress={handleRetry}
                  startContent={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Thử lại
                </Button>
                <Button size="sm" color="primary" onPress={handleNext}>
                  {currentIdx < totalItems - 1 ? "Từ tiếp theo" : "Xem kết quả"}
                </Button>
              </div>
            </div>
          )}

          {!strokeComplete && (
            <Button
              size="sm"
              variant="light"
              className="mt-2"
              onPress={onSkip}
              startContent={<SkipForward className="w-3.5 h-3.5" />}
            >
              Bỏ qua
            </Button>
          )}
        </CardBody>
      </Card>
    </>
  )
}
