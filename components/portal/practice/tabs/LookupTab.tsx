"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Input,
  Card,
  CardBody,
  Chip,
  Divider,
} from "@heroui/react"
import { Search, Volume2, BookOpen, Award } from "lucide-react"
import { CDrawer } from "@/components/portal/common"
import { recordVocabSeenAction } from "@/actions/practice.actions"
import { useTTS } from "@/hooks/useTTS"
import { WORD_TYPE_COLORS, WORD_TYPE_LABELS, STATUS_LABELS, getDisplayMeaning } from "@/enums/portal/common"
import type { IVocabularyItem, IStudentItemProgress } from "@/interfaces/portal/practice"
import { VocabItem } from "../shared"

interface Props {
  vocabularies: IVocabularyItem[]
  lessonId: string
  itemProgress: Record<string, IStudentItemProgress>
  onProgressUpdate: () => void
}

export default function LookupTab({ vocabularies, lessonId, itemProgress, onProgressUpdate }: Props) {
  const [search, setSearch] = useState("")
  const [selectedVocab, setSelectedVocab] = useState<IVocabularyItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { speak } = useTTS()

  const filteredVocabs = useMemo(() => {
    if (!search.trim()) return vocabularies
    const q = search.toLowerCase()
    return vocabularies.filter(
      (v) =>
        v.word.toLowerCase().includes(q) ||
        (v.pinyin && v.pinyin.toLowerCase().includes(q)) ||
        v.meaning.toLowerCase().includes(q) ||
        (v.meaningVi && v.meaningVi.toLowerCase().includes(q)),
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

  const playAudio = useCallback((word: string, audioUrl: string | null, e?: React.MouseEvent) => {
    e?.stopPropagation()
    speak(word, audioUrl)
  }, [speak])

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
          {filteredVocabs.map((vocab) => (
            <VocabItem
              key={vocab.id}
              vocab={vocab}
              progress={itemProgress[vocab.id]}
              onSelect={handleSelectVocab}
              onPlayAudio={playAudio}
            />
          ))}
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
              <p className="text-4xl sm:text-5xl font-bold mb-3 text-red-600 dark:text-red-400">{selectedVocab.word}</p>
              <p className="text-lg text-primary font-medium">{selectedVocab.pinyin}</p>
              <p className="text-base text-default-600 mt-1">{getDisplayMeaning(selectedVocab)}</p>
              {/* Show English meaning as secondary info when Vietnamese is available */}
              {selectedVocab.meaningVi && (
                <p className="text-xs text-default-400 mt-0.5">EN: {selectedVocab.meaning}</p>
              )}
              <button
                onClick={() => playAudio(selectedVocab.word, selectedVocab.audioUrl)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary hover:bg-primary-200 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">Phát âm</span>
              </button>
            </div>

            <Divider />

            {/* Word type */}
            {selectedVocab.wordType && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">Từ loại:</span>
                <Chip size="sm" variant="flat" color={WORD_TYPE_COLORS[selectedVocab.wordType] ?? "default"}>
                  {WORD_TYPE_LABELS[selectedVocab.wordType] ?? selectedVocab.wordType}
                </Chip>
              </div>
            )}

            {/* Example sentence */}
            {selectedVocab.exampleSentence && (
              <div>
                <p className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Câu ví dụ
                </p>
                <div className="p-3 rounded-lg bg-default-50 dark:bg-default-800/50 space-y-1">
                  <p className="text-base font-medium text-red-600 dark:text-red-400">{selectedVocab.exampleSentence}</p>
                  {selectedVocab.examplePinyin && (
                    <p className="text-sm text-primary">{selectedVocab.examplePinyin}</p>
                  )}
                  {selectedVocab.exampleMeaning && (
                    <p className="text-sm text-default-500">{selectedVocab.exampleMeaning}</p>
                  )}
                </div>
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
