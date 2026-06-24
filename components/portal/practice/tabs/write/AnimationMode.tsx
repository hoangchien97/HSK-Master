"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button, Badge } from "@/components/ui"
import { Play, Pause, SkipForward, PenLine, Volume2 } from "lucide-react"
import { useSpeech } from "@/hooks/useSpeech"
import { getDisplayMeaning } from "@/enums/portal/common"
import { HANZI_WRITER } from "@/constants/portal/ui"
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
  const { speak } = useSpeech()

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
          width: HANZI_WRITER.CANVAS_SIZE,
          height: HANZI_WRITER.CANVAS_SIZE,
          padding: HANZI_WRITER.PADDING,
          showOutline: true,
          strokeAnimationSpeed: 0.8,
          delayBetweenStrokes: HANZI_WRITER.STROKE_DELAY_PRACTICE,
          showCharacter: false,
          strokeColor: HANZI_WRITER.STROKE_COLOR,
          outlineColor: HANZI_WRITER.OUTLINE_COLOR,
          highlightColor: HANZI_WRITER.HIGHLIGHT_COLOR,
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
      <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm mb-4">
        <div className="p-4 sm:p-6 text-center">
          <p className="text-sm text-gray-400 mb-1">Xem nét viết</p>
          <p className="text-4xl sm:text-5xl font-bold text-red-600 dark:text-red-400 mb-1">{item.word}</p>
          <p className="text-(--color-vermillion) text-sm mb-1">{item.pinyin}</p>
          <p className="text-(--color-muted) text-sm">{getDisplayMeaning(item)}</p>
          {item.meaningVi && item.meaning !== item.meaningVi && (
            <p className="text-xs text-gray-400">{item.meaning}</p>
          )}
          <button
            onClick={() => speak(item.word)}
            className="mt-2 p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-(--color-vermillion) hover:bg-red-200 transition mx-auto inline-flex"
            aria-label="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas + controls */}
      <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm mb-4">
        <div className="flex flex-col items-center p-4">
          {/* Character selector for multi-char words */}
          {item.word.length > 1 && (
            <div className="flex gap-1 mb-3">
              {item.word.split("").map((char, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCharIdx(idx)}
                  className={`text-lg px-2 py-0.5 rounded-full font-medium border transition-colors cursor-pointer ${
                    charIdx === idx
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-transparent text-(--color-ink) border-(--color-smoke) hover:bg-(--color-paper)"
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          )}

          <div
            ref={containerRef}
            className="border-2 border-dashed border-(--color-smoke) rounded-xl bg-(--color-paper) mx-auto"
            style={{ width: HANZI_WRITER.CANVAS_SIZE, maxWidth: "100%", aspectRatio: "1/1" }}
          />

          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <Button
              size="sm"
              variant="secondary"
              onClick={isAnimating ? handlePauseResume : handleAnimate}
              leftIcon={isAnimating && !isPaused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isAnimating ? (isPaused ? "Tiếp tục" : "Tạm dừng") : "Xem nét viết"}
            </Button>
            {onSwitchToPractice && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onSwitchToPractice}
                leftIcon={<PenLine className="w-3.5 h-3.5" />}
              >
                Luyện viết
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onNext}
              leftIcon={<SkipForward className="w-3.5 h-3.5" />}
            >
              {currentIdx < totalItems - 1 ? "Từ tiếp" : "Xem kết quả"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
