"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Card, CardBody, Chip } from "@heroui/react"
import { Play, Pause, SkipForward, PenLine, Volume2 } from "lucide-react"
import { useTTS } from "@/hooks/useTTS"
import { getDisplayMeaning } from "@/enums/portal/common"
import type { IVocabularyItem } from "@/interfaces/portal/practice"

interface Props {
  item: IVocabularyItem
  currentIdx: number
  totalItems: number
  onNext: () => void
  onSwitchToPractice?: () => void
}

export default function AnimationMode({ item, currentIdx, totalItems, onNext, onSwitchToPractice }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writerRef = useRef<any>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [charIdx, setCharIdx] = useState(0)
  const { speak } = useTTS()

  // Reset charIdx when item changes
  useEffect(() => {
    setCharIdx(0)
    setIsPaused(false)
  }, [item.id])

  // Setup HanziWriter for the selected character
  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ""
    writerRef.current = null
    setIsAnimating(false)

    const chars = item.word.split("")
    const char = chars[charIdx] || chars[0]

    import("hanzi-writer").then((HanziWriterModule) => {
      const HanziWriter = HanziWriterModule.default || HanziWriterModule
      if (!containerRef.current) return

      try {
        const writer = HanziWriter.create(containerRef.current, char, {
          width: 250,
          height: 250,
          padding: 10,
          showOutline: true,
          strokeAnimationSpeed: 0.8,
          delayBetweenStrokes: 300,
          showCharacter: false,
          strokeColor: "#333",
          outlineColor: "#ddd",
          highlightColor: "#3b82f6",
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
  }, [item, charIdx])

  const handleAnimate = useCallback(() => {
    if (!writerRef.current) return
    setIsAnimating(true)
    setIsPaused(false)
    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsAnimating(false)
        setIsPaused(false)
      },
    })
  }, [])

  const handlePauseResume = useCallback(() => {
    if (!writerRef.current || !isAnimating) return
    if (isPaused) {
      writerRef.current.resumeAnimation()
      setIsPaused(false)
    } else {
      writerRef.current.pauseAnimation()
      setIsPaused(true)
    }
  }, [isAnimating, isPaused])

  return (
    <>
      {/* Prompt */}
      <Card className="mb-4">
        <CardBody className="p-4 sm:p-6 text-center">
          <p className="text-sm text-default-400 mb-1">Xem nét viết</p>
          <p className="text-4xl sm:text-5xl font-bold text-red-600 dark:text-red-400 mb-1">{item.word}</p>
          <p className="text-primary text-sm mb-1">{item.pinyin}</p>
          <p className="text-default-500 text-sm">{getDisplayMeaning(item)}</p>
          {item.meaningVi && item.meaning !== item.meaningVi && (
            <p className="text-xs text-default-400">{item.meaning}</p>
          )}
          <button
            onClick={() => speak(item.word, item.audioUrl)}
            className="mt-2 p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary hover:bg-primary-200 transition mx-auto inline-flex"
            aria-label="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </CardBody>
      </Card>

      {/* Canvas + controls */}
      <Card className="mb-4">
        <CardBody className="flex flex-col items-center p-4">
          {/* Character selector for multi-char words */}
          {item.word.length > 1 && (
            <div className="flex gap-1 mb-3">
              {item.word.split("").map((char, idx) => (
                <Chip
                  key={idx}
                  size="sm"
                  variant={charIdx === idx ? "solid" : "bordered"}
                  color={charIdx === idx ? "secondary" : "default"}
                  className="cursor-pointer text-lg"
                  onClick={() => setCharIdx(idx)}
                >
                  {char}
                </Chip>
              ))}
            </div>
          )}

          <div
            ref={containerRef}
            className="border-2 border-dashed border-default-200 rounded-xl bg-default-50 mx-auto"
            style={{ width: 250, maxWidth: "100%", height: 250 }}
          />

          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <Button
              size="sm"
              color="secondary"
              variant="bordered"
              isDisabled={isAnimating && !isPaused}
              onPress={handleAnimate}
              startContent={<Play className="w-3.5 h-3.5" />}
            >
              Xem nét viết
            </Button>
            {isAnimating && (
              <Button
                size="sm"
                color="warning"
                variant="bordered"
                onPress={handlePauseResume}
                startContent={isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              >
                {isPaused ? "Tiếp tục" : "Tạm dừng"}
              </Button>
            )}
            {onSwitchToPractice && (
              <Button
                size="sm"
                color="primary"
                variant="bordered"
                onPress={onSwitchToPractice}
                startContent={<PenLine className="w-3.5 h-3.5" />}
              >
                Luyện viết
              </Button>
            )}
            <Button
              size="sm"
              variant="light"
              onPress={onNext}
              startContent={<SkipForward className="w-3.5 h-3.5" />}
            >
              {currentIdx < totalItems - 1 ? "Từ tiếp" : "Xem kết quả"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  )
}
