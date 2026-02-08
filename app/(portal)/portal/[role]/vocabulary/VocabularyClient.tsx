"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  Book,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Volume2,
  Eye,
  Trophy,
  Brain,
  Plus,
} from "lucide-react"
import { Card, CardBody, Button, Chip, Progress } from "@heroui/react"
import { PageHeader } from "@/app/components/portal/common/PageHeader"
import { StatCard } from "@/app/components/portal/common/StatCard"
import { EmptyState } from "@/app/components/portal/common/EmptyState"
import { cn } from "@/app/lib/utils"

interface HSKLevel {
  id: string
  level: number
  name: string
  description?: string | null
  vocabularyCount: string
}

interface VocabularyProgress {
  id: string
  word: string
  pinyin?: string | null
  meaning: string
  level?: string | null
  mastery: string
  reviewCount: number
}

interface VocabularyClientProps {
  hskLevels: HSKLevel[]
  progress: VocabularyProgress[]
  studentId: string
}

type Mode = "levels" | "mywords" | "flashcard"

function ProgressCircle({ percentage, size = 56 }: { percentage: number; size?: number }) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
        {percentage}%
      </span>
    </div>
  )
}

export default function VocabularyClient({
  hskLevels,
  progress,
}: VocabularyClientProps) {
  const [mode, setMode] = useState<Mode>("levels")
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")

  // Flashcard state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  // Filter vocabularies
  const filteredVocabs = useMemo(() => {
    return progress.filter((v) => {
      const matchesSearch =
        v.word.includes(searchTerm) ||
        (v.pinyin?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        v.meaning.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLevel = levelFilter === "all" || v.level === levelFilter

      return matchesSearch && matchesLevel
    })
  }, [progress, searchTerm, levelFilter])

  // Shuffle vocabularies
  const shuffleVocabs = useCallback((vocabs: VocabularyProgress[]) => {
    const shuffled = [...vocabs]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [])

  // Stats
  const stats = useMemo(() => {
    return {
      total: progress.length,
      mastered: progress.filter((v) => v.mastery === "MASTERED").length,
      learning: progress.filter((v) => v.mastery === "LEARNING").length,
      new: progress.filter((v) => v.mastery === "NEW").length,
    }
  }, [progress])

  // Play pronunciation (using browser speech synthesis)
  const playPronunciation = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "zh-CN"
      speechSynthesis.speak(utterance)
    }
  }

  // Get unique levels from progress
  const levels = useMemo(() => {
    return [...new Set(progress.map((v) => v.level).filter(Boolean))]
  }, [progress])

  // Flashcard mode
  if (mode === "flashcard" && filteredVocabs.length > 0) {
    const shuffledVocabs = shuffleVocabs(filteredVocabs)
    const currentVocab = shuffledVocabs[currentIndex] || shuffledVocabs[0]

    return (
      <div>
        <PageHeader title="Flashcard" description={`${currentIndex + 1} / ${shuffledVocabs.length}`}>
          <button
            onClick={() => setMode("mywords")}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </PageHeader>

        <div className="max-w-xl mx-auto">
          <Card
            isPressable
            onPress={() => setShowAnswer(!showAnswer)}
            className="min-h-[300px] flex flex-col items-center justify-center relative"
          >
            <CardBody className="flex flex-col items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  playPronunciation(currentVocab.word)
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Volume2 className="w-5 h-5 text-gray-400" />
              </button>

              <span className="text-6xl font-bold text-gray-900 mb-4">
                {currentVocab.word}
              </span>

              {showAnswer ? (
                <div className="text-center">
                  <p className="text-xl text-red-600 mb-2">{currentVocab.pinyin}</p>
                  <p className="text-lg text-gray-600">{currentVocab.meaning}</p>
                  {currentVocab.level && (
                    <span className="inline-block mt-3 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {currentVocab.level}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Nhấp để xem đáp án
                </p>
              )}
            </CardBody>
          </Card>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => {
                setCurrentIndex((i) => (i > 0 ? i - 1 : shuffledVocabs.length - 1))
                setShowAnswer(false)
              }}
              className="p-3 hover:bg-gray-100 rounded-xl transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => {
                setCurrentIndex(0)
                setShowAnswer(false)
              }}
              className="p-3 hover:bg-gray-100 rounded-xl transition"
              title="Bắt đầu lại"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setCurrentIndex((i) => (i < shuffledVocabs.length - 1 ? i + 1 : 0))
                setShowAnswer(false)
              }}
              className="p-3 hover:bg-gray-100 rounded-xl transition"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-6 flex-wrap">
            {shuffledVocabs.slice(0, 20).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition",
                  idx === currentIndex ? "bg-red-600" : "bg-gray-200"
                )}
              />
            ))}
            {shuffledVocabs.length > 20 && (
              <span className="text-xs text-gray-400 ml-2">+{shuffledVocabs.length - 20}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // My Words mode
  if (mode === "mywords") {
    return (
      <div>
        <PageHeader title="Từ vựng của tôi" description={`${progress.length} từ đã lưu`}>
          <div className="flex gap-2">
            {filteredVocabs.length > 0 && (
              <button
                onClick={() => {
                  setCurrentIndex(0)
                  setShowAnswer(false)
                  setMode("flashcard")
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Flashcard
              </button>
            )}
            <button
              onClick={() => setMode("levels")}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Tổng từ vựng"
            value={stats.total}
            icon={<Book className="w-5 h-5" />}
          />
          <StatCard
            title="Đang học"
            value={stats.learning}
            icon={<Brain className="w-5 h-5" />}
          />
          <StatCard
            title="Thành thạo"
            value={stats.mastered}
            icon={<Trophy className="w-5 h-5" />}
          />
          <StatCard
            title="Mới"
            value={stats.new}
            icon={<Plus className="w-5 h-5" />}
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm từ vựng..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              {levels.length > 0 && (
                <div className="w-full md:w-48">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả cấp độ</option>
                    {levels.map((level) => (
                      <option key={level} value={level!}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Vocabulary Grid */}
        {filteredVocabs.length === 0 ? (
          <EmptyState
            icon={<Book className="w-8 h-8" />}
            title={progress.length === 0 ? "Chưa có từ vựng" : "Không tìm thấy"}
            description={
              progress.length === 0
                ? "Từ vựng bạn học sẽ xuất hiện ở đây"
                : "Thử tìm kiếm với từ khóa khác"
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocabs.map((vocab) => (
              <Card key={vocab.id} className="group hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {vocab.word}
                        </span>
                        <button
                          onClick={() => playPronunciation(vocab.word)}
                          className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition"
                        >
                          <Volume2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <p className="text-red-600 text-sm mb-1">{vocab.pinyin}</p>
                      <p className="text-gray-600">{vocab.meaning}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {vocab.level && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                          {vocab.level}
                        </span>
                      )}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          vocab.mastery === "MASTERED" && "bg-green-100 text-green-700",
                          vocab.mastery === "LEARNING" && "bg-yellow-100 text-yellow-700",
                          vocab.mastery === "NEW" && "bg-gray-100 text-gray-700"
                        )}
                      >
                        {vocab.mastery === "MASTERED" && "Thành thạo"}
                        {vocab.mastery === "LEARNING" && "Đang học"}
                        {vocab.mastery === "NEW" && "Mới"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    Đã ôn: {vocab.reviewCount} lần
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // HSK Levels mode (default)
  return (
    <div>
      <PageHeader title="Từ vựng HSK" description="Học từ vựng theo cấp độ HSK">
        {progress.length > 0 && (
          <button
            onClick={() => setMode("mywords")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
          >
            <Book className="w-4 h-4" />
            Từ vựng của tôi ({progress.length})
          </button>
        )}
      </PageHeader>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hskLevels.map((level) => {
          const levelVocabs = progress.filter((v) => v.level === `HSK${level.level}`)
          const masteredCount = levelVocabs.filter((v) => v.mastery === "MASTERED").length
          const percentage =
            levelVocabs.length > 0
              ? Math.round((masteredCount / levelVocabs.length) * 100)
              : 0

          return (
            <Link
              key={level.id}
              href={`/vocabulary?level=${level.level}`}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{level.level}</span>
                    </div>
                    {levelVocabs.length > 0 && (
                      <ProgressCircle percentage={percentage} size={56} />
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900">{level.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{level.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Từ vựng:</span>{" "}
                      <span className="font-medium">{level.vocabularyCount}</span>
                    </div>
                    {levelVocabs.length > 0 && (
                      <div>
                        <span className="text-gray-400">Đã học:</span>{" "}
                        <span className="font-medium text-green-600">{masteredCount}</span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Link>
          )
        })}
      </div>

      {hskLevels.length === 0 && (
        <EmptyState
          icon={<Book className="w-8 h-8" />}
          title="Chưa có dữ liệu từ vựng"
          description="Dữ liệu từ vựng HSK sẽ được cập nhật sớm"
        />
      )}
    </div>
  )
}
