"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Tabs, Tab, Chip, Button } from "@heroui/react"
import { Search, Layers, HelpCircle, Headphones, PenTool, ArrowLeft } from "lucide-react"
import { toast } from "react-toastify"
import { fetchLessonPracticeData, refreshLessonProgress } from "@/actions/practice.actions"
import { usePortalUI } from "@/providers/portal-ui-provider"
import ProgressCard from "./ProgressCard"
import LookupTab from "./tabs/LookupTab"
import FlashcardTab from "./tabs/FlashcardTab"
import QuizTab from "./tabs/QuizTab"
import ListenTab from "./tabs/ListenTab"
import WriteTab from "./tabs/WriteTab"
import type { IVocabularyItem, IStudentItemProgress } from "@/interfaces/portal/practice"

interface LessonData {
  id: string
  title: string
  titleChinese: string | null
  description: string | null
  order: number
  courseId: string
  course: { id: string; title: string; slug: string; level: string | null }
  vocabularies: IVocabularyItem[]
}

interface ProgressData {
  learnedCount: number
  masteredCount: number
  totalTimeSec: number
  masteryPercent: number
}

interface SiblingLesson {
  id: string
  title: string
  order: number
}

const TAB_KEYS = ["lookup", "flashcard", "quiz", "listen", "write"] as const
type TabKey = (typeof TAB_KEYS)[number]

const TAB_CONFIG: Record<TabKey, { label: string; icon: React.ReactNode }> = {
  lookup: { label: "Tra cứu", icon: <Search className="w-4 h-4" /> },
  flashcard: { label: "Flashcard", icon: <Layers className="w-4 h-4" /> },
  quiz: { label: "Quiz", icon: <HelpCircle className="w-4 h-4" /> },
  listen: { label: "Nghe", icon: <Headphones className="w-4 h-4" /> },
  write: { label: "Viết", icon: <PenTool className="w-4 h-4" /> },
}

interface Props {
  lessonId: string
}

export default function LessonPracticeView({ lessonId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { startLoading, stopLoading } = usePortalUI()

  const tabParam = (searchParams.get("tab") || "lookup") as TabKey
  const activeTab = TAB_KEYS.includes(tabParam) ? tabParam : "lookup"

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [itemProgress, setItemProgress] = useState<Record<string, IStudentItemProgress>>({})
  const [siblings, setSiblings] = useState<SiblingLesson[]>([])

  const loadData = useCallback(async () => {
    startLoading()
    const result = await fetchLessonPracticeData(lessonId)
    if (result.success && result.data) {
      setLesson(result.data.lesson as unknown as LessonData)
      setProgress(result.data.progress as ProgressData | null)
      setItemProgress((result.data.itemProgress || {}) as Record<string, IStudentItemProgress>)
      setSiblings(result.data.siblings)
    } else {
      toast.error(result.error || "Không thể tải bài học")
      router.push("/portal/student/practice")
    }
    stopLoading()
  }, [lessonId, startLoading, stopLoading, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefreshProgress = useCallback(async () => {
    const result = await refreshLessonProgress(lessonId)
    if (result.success && result.data) {
      setProgress(result.data.progress as ProgressData | null)
      setItemProgress((result.data.itemProgress || {}) as Record<string, IStudentItemProgress>)
    }
  }, [lessonId])

  const handleTabChange = useCallback(
    (key: string | number) => {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set("tab", String(key))
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  if (!lesson) return null

  const vocabs = lesson.vocabularies
  const totalItems = vocabs.length

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-24 sm:pb-6">
      {/* Back + header */}
      <div>
        <Button
          as={Link}
          href="/portal/student/practice"
          variant="light"
          size="sm"
          startContent={<ArrowLeft className="w-4 h-4" />}
          className="mb-2 -ml-2 text-default-500"
        >
          Quay lại
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <h1 className="text-lg sm:text-xl font-bold">
            Buổi {lesson.order}: {lesson.title}
          </h1>
          {lesson.titleChinese && (
            <span className="text-base sm:text-lg text-default-400">{lesson.titleChinese}</span>
          )}
        </div>
        {lesson.description && (
          <p className="text-sm text-default-500 mt-1">{lesson.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Chip size="sm" variant="flat" color="primary">{lesson.course.title}</Chip>
          <Chip size="sm" variant="flat">{totalItems} từ vựng</Chip>
        </div>
      </div>

      {/* Progress Card */}
      <ProgressCard
        totalItems={totalItems}
        learnedCount={progress?.learnedCount ?? 0}
        masteredCount={progress?.masteredCount ?? 0}
        totalTimeSec={progress?.totalTimeSec ?? 0}
        masteryPercent={progress?.masteryPercent ?? 0}
      />

      {/* Practice Tabs */}
      <div>
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={handleTabChange}
          aria-label="Chế độ luyện tập"
          variant="underlined"
          classNames={{
            tabList: "gap-0 sm:gap-2 w-full overflow-x-auto scrollbar-hide border-b border-divider",
            tab: "px-2 sm:px-4 py-2 text-xs sm:text-sm",
            cursor: "bg-primary",
          }}
        >
          {TAB_KEYS.map((key) => (
            <Tab
              key={key}
              title={
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {TAB_CONFIG[key].icon}
                  <span className="hidden sm:inline">{TAB_CONFIG[key].label}</span>
                  <span className="sm:hidden text-[11px]">{TAB_CONFIG[key].label}</span>
                </div>
              }
            />
          ))}
        </Tabs>

        {/* Tab content */}
        <div className="mt-4">
          {activeTab === "lookup" && (
            <LookupTab
              vocabularies={vocabs}
              lessonId={lessonId}
              itemProgress={itemProgress}
              onProgressUpdate={handleRefreshProgress}
            />
          )}
          {activeTab === "flashcard" && (
            <FlashcardTab
              vocabularies={vocabs}
              lessonId={lessonId}
              itemProgress={itemProgress}
              onProgressUpdate={handleRefreshProgress}
            />
          )}
          {activeTab === "quiz" && (
            <QuizTab
              vocabularies={vocabs}
              lessonId={lessonId}
              onProgressUpdate={handleRefreshProgress}
            />
          )}
          {activeTab === "listen" && (
            <ListenTab
              vocabularies={vocabs}
              lessonId={lessonId}
              onProgressUpdate={handleRefreshProgress}
            />
          )}
          {activeTab === "write" && (
            <WriteTab
              vocabularies={vocabs}
              lessonId={lessonId}
              onProgressUpdate={handleRefreshProgress}
            />
          )}
        </div>
      </div>

      {/* Sibling lessons nav — sticky bottom on mobile */}
      {siblings.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-background/95 backdrop-blur border-t sm:border-t-0 sm:border border-divider sm:rounded-lg p-2 sm:p-3 z-40">
          <p className="text-xs text-default-400 mb-1.5 px-1 hidden sm:block">Các bài học khác</p>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-safe">
            {siblings.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={s.id === lessonId ? "flat" : "bordered"}
                color={s.id === lessonId ? "primary" : "default"}
                className="shrink-0 text-xs min-w-0"
                onPress={() => {
                  if (s.id !== lessonId) {
                    router.push(`/portal/student/practice/${s.id}?tab=${activeTab}`)
                  }
                }}
              >
                {s.order}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
