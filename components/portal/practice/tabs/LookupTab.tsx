"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Input,
  Card,
  CardBody,
  Chip,
  Divider,
} from "@heroui/react"
import { Search, Volume2, BookOpen, Award, Eye } from "lucide-react"
import { CDrawer } from "@/components/portal/common"
import { recordVocabSeenAction } from "@/actions/practice.actions"
import type { IVocabularyItem, IStudentItemProgress } from "@/interfaces/portal/practice"

interface Props {
  vocabularies: IVocabularyItem[]
  lessonId: string
  itemProgress: Record<string, IStudentItemProgress>
  onProgressUpdate: () => void
}

const WORD_TYPE_COLORS: Record<string, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
  "đại từ": "primary",
  "danh từ": "secondary",
  "động từ": "success",
  "tính từ": "warning",
  "phó từ": "danger",
  "số từ": "default",
  "trợ từ": "default",
  "thành ngữ": "primary",
  "giới từ": "secondary",
  "liên từ": "warning",
  "lượng từ": "danger",
}

const STATUS_LABELS: Record<string, { label: string; color: "default" | "warning" | "success" }> = {
  NEW: { label: "Mới", color: "default" },
  LEARNING: { label: "Đang học", color: "warning" },
  MASTERED: { label: "Thành thạo", color: "success" },
}

export default function LookupTab({ vocabularies, lessonId, itemProgress, onProgressUpdate }: Props) {
  const [search, setSearch] = useState("")
  const [selectedVocab, setSelectedVocab] = useState<IVocabularyItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filteredVocabs = useMemo(() => {
    if (!search.trim()) return vocabularies
    const q = search.toLowerCase()
    return vocabularies.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        (v.pinyin && v.pinyin.toLowerCase().includes(q)) ||
        v.meaning.toLowerCase().includes(q),
    )
  }, [vocabularies, search])

  const handleSelectVocab = useCallback(
    async (vocab: IVocabularyItem) => {
      setSelectedVocab(vocab)
      setIsDrawerOpen(true)

      // Record seen
      await recordVocabSeenAction(vocab.id, lessonId)
      onProgressUpdate()
    },
    [lessonId, onProgressUpdate],
  )

  const playAudio = useCallback((audioUrl: string | null, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!audioUrl) return
    const audio = new Audio(audioUrl)
    audio.play().catch(() => {})
  }, [])

  const selectedProgress = selectedVocab ? itemProgress[selectedVocab.id] : undefined

  return (
    <div>
      {/* Search */}
      <Input
        isClearable
        placeholder="Tìm kiếm từ vựng..."
        startContent={<Search className="w-4 h-4 text-default-400" />}
        value={search}
        onValueChange={setSearch}
        onClear={() => setSearch("")}
        className="mb-4"
        size="sm"
      />

      {/* Count */}
      <div className="flex items-center gap-2 mb-3">
        <Chip size="sm" variant="flat" color="primary">{filteredVocabs.length} từ vựng</Chip>
      </div>

      {/* Vocabulary list */}
      {filteredVocabs.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <BookOpen className="w-10 h-10 mx-auto text-default-300 mb-2" />
            <p className="text-default-500 text-sm">
              {vocabularies.length === 0 ? "Bài học này chưa có từ vựng" : "Không tìm thấy từ vựng"}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-2">
          {filteredVocabs.map((vocab) => {
            const progress = itemProgress[vocab.id]
            const status = progress?.status || "NEW"

            return (
              <button
                key={vocab.id}
                onClick={() => handleSelectVocab(vocab)}
                className="w-full text-left p-3 sm:p-4 rounded-lg border border-default-200 hover:border-primary-300 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  {/* Hanzi */}
                  <div className="text-xl sm:text-2xl font-bold text-foreground min-w-[48px] sm:min-w-[64px] text-center">
                    {vocab.word}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-primary font-medium">{vocab.pinyin}</span>
                      {vocab.audioUrl && (
                        <button
                          onClick={(e) => playAudio(vocab.audioUrl, e)}
                          className="p-0.5 rounded hover:bg-primary-100 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-primary" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-default-600 truncate">{vocab.meaning}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {vocab.wordType && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color={WORD_TYPE_COLORS[vocab.wordType] ?? "default"}
                          className="text-[10px] h-5"
                        >
                          {vocab.wordType}
                        </Chip>
                      )}
                      {status !== "NEW" && (
                        <Chip
                          size="sm"
                          variant="dot"
                          color={STATUS_LABELS[status]?.color ?? "default"}
                          className="text-[10px] h-5"
                        >
                          {STATUS_LABELS[status]?.label}
                        </Chip>
                      )}
                    </div>
                  </div>

                  {/* Mastery indicator */}
                  {progress && progress.masteryScore > 0 && (
                    <div className="shrink-0 text-center">
                      <div className="text-xs font-bold text-primary">{Math.round(progress.masteryScore * 100)}%</div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Detail drawer */}
      <CDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedVocab(null)
        }}
        title="Chi tiết từ vựng"
        size="sm"
      >
        {selectedVocab && (
          <div className="space-y-5">
            {/* Main display */}
            <div className="text-center py-4">
              <p className="text-4xl sm:text-5xl font-bold mb-3">{selectedVocab.word}</p>
              <p className="text-lg text-primary font-medium">{selectedVocab.pinyin}</p>
              <p className="text-base text-default-600 mt-1">{selectedVocab.meaning}</p>
              {selectedVocab.audioUrl && (
                <button
                  onClick={() => playAudio(selectedVocab.audioUrl)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary hover:bg-primary-200 transition"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm">Phát âm</span>
                </button>
              )}
            </div>

            <Divider />

            {/* Word type */}
            {selectedVocab.wordType && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">Từ loại:</span>
                <Chip size="sm" variant="flat" color={WORD_TYPE_COLORS[selectedVocab.wordType] ?? "default"}>
                  {selectedVocab.wordType}
                </Chip>
              </div>
            )}

            {/* Progress info */}
            {selectedProgress && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  Tiến độ học tập
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-default-100 dark:bg-default-800">
                    <p className="text-lg font-bold">{selectedProgress.seenCount}</p>
                    <p className="text-[10px] text-default-500">Lần xem</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-success-50 dark:bg-success-900/20">
                    <p className="text-lg font-bold text-success">{selectedProgress.correctCount}</p>
                    <p className="text-[10px] text-default-500">Đúng</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-danger-50 dark:bg-danger-900/20">
                    <p className="text-lg font-bold text-danger">{selectedProgress.wrongCount}</p>
                    <p className="text-[10px] text-default-500">Sai</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-default-500">Trạng thái:</span>
                  <Chip size="sm" variant="flat" color={STATUS_LABELS[selectedProgress.status]?.color ?? "default"}>
                    {STATUS_LABELS[selectedProgress.status]?.label ?? selectedProgress.status}
                  </Chip>
                  <span className="text-sm font-medium text-primary ml-auto">
                    {Math.round(selectedProgress.masteryScore * 100)}% thành thạo
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CDrawer>
    </div>
  )
}
