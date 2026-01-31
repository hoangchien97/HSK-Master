"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Bookmark,
  Volume2,
  Search,
  Trash2,
  ArrowLeft,
  RotateCcw,
  ArrowRight,
} from "lucide-react"
import {
  PageHeader,
  Card,
  EmptyState,
} from "@/app/components/portal/shared"
import { cn } from "@/lib/utils"

interface Vocabulary {
  id: string
  hanzi: string
  pinyin: string | null
  meaning: string
  hskLevel?: {
    level: number
    name: string
  } | null
}

interface VocabularyProgress {
  id: string
  vocabulary: Vocabulary
  mastered: boolean
  reviewCount: number
  lastReviewedAt?: Date | null
}

interface BookmarksClientProps {
  bookmarks: VocabularyProgress[]
  studentId: string
}

export default function BookmarksClient({
  bookmarks,
}: BookmarksClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<number | "all">("all")
  const [mode, setMode] = useState<"browse" | "flashcard">("browse")

  // Flashcard state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const levels = useMemo(() => {
    const uniqueLevels = new Set(
      bookmarks.map((b) => b.vocabulary.hskLevel?.level).filter(Boolean)
    )
    return Array.from(uniqueLevels).sort((a, b) => (a || 0) - (b || 0))
  }, [bookmarks])

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesSearch =
        b.vocabulary.hanzi.includes(searchTerm) ||
        (b.vocabulary.pinyin?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        b.vocabulary.meaning.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLevel =
        levelFilter === "all" || b.vocabulary.hskLevel?.level === levelFilter

      return matchesSearch && matchesLevel
    })
  }, [bookmarks, searchTerm, levelFilter])

  const playPronunciation = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "zh-CN"
      speechSynthesis.speak(utterance)
    }
  }

  const handleRemoveBookmark = async (progressId: string) => {
    try {
      await fetch(`/api/portal/vocabulary-progress/${progressId}`, {
        method: "DELETE",
      })
      router.refresh()
    } catch (error) {
      console.error("Error removing bookmark:", error)
    }
  }

  // Flashcard mode
  if (mode === "flashcard" && filteredBookmarks.length > 0) {
    const currentVocab = filteredBookmarks[currentIndex]?.vocabulary

    return (
      <div>
        <PageHeader
          title="Ôn tập Flashcard"
          subtitle={`${currentIndex + 1} / ${filteredBookmarks.length}`}
          actions={
            <button
              onClick={() => setMode("browse")}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          }
        />

        <div className="max-w-xl mx-auto">
          <Card
            className="min-h-[300px] flex flex-col items-center justify-center cursor-pointer relative"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                playPronunciation(currentVocab.hanzi)
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Volume2 className="w-5 h-5 text-gray-400" />
            </button>

            <span className="text-6xl font-bold text-gray-900 mb-4">
              {currentVocab.hanzi}
            </span>

            {showAnswer ? (
              <div className="text-center">
                <p className="text-xl text-red-600 mb-2">{currentVocab.pinyin}</p>
                <p className="text-lg text-gray-600">{currentVocab.meaning}</p>
                {currentVocab.hskLevel && (
                  <span className="inline-block mt-3 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                    HSK {currentVocab.hskLevel.level}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Nhấp để xem đáp án</p>
            )}
          </Card>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => {
                setCurrentIndex((i) => (i > 0 ? i - 1 : filteredBookmarks.length - 1))
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
                setCurrentIndex((i) => (i < filteredBookmarks.length - 1 ? i + 1 : 0))
                setShowAnswer(false)
              }}
              className="p-3 hover:bg-gray-100 rounded-xl transition"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-6 flex-wrap">
            {filteredBookmarks.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition",
                  idx === currentIndex ? "bg-red-600" : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Browse mode
  return (
    <div>
      <PageHeader
        title="Từ vựng đã lưu"
        subtitle={`${bookmarks.length} từ đã bookmark`}
        actions={
          filteredBookmarks.length > 0 && (
            <button
              onClick={() => {
                setCurrentIndex(0)
                setShowAnswer(false)
                setMode("flashcard")
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Ôn tập Flashcard
            </button>
          )
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm từ vựng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={levelFilter}
              onChange={(e) =>
                setLevelFilter(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Tất cả cấp độ</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  HSK {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Bookmarked Vocabulary List */}
      {filteredBookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={bookmarks.length === 0 ? "Chưa có từ vựng đã lưu" : "Không tìm thấy từ vựng"}
          description={
            bookmarks.length === 0
              ? "Đánh dấu từ vựng khi học để ôn tập sau"
              : "Thử tìm kiếm với từ khóa khác"
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} hover className="group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {bookmark.vocabulary.hanzi}
                    </span>
                    <button
                      onClick={() => playPronunciation(bookmark.vocabulary.hanzi)}
                      className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-red-600 text-sm mb-1">{bookmark.vocabulary.pinyin}</p>
                  <p className="text-gray-600">{bookmark.vocabulary.meaning}</p>
                </div>

                <div className="flex flex-col gap-1">
                  {bookmark.vocabulary.hskLevel && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                      HSK {bookmark.vocabulary.hskLevel.level}
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    title="Xóa bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                Đã ôn: {bookmark.reviewCount} lần
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
