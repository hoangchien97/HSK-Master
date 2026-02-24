/**
 * LessonPracticeView — Client-side interactive component
 *
 * Receives SSR-serialized data as props (lesson, progress, siblings).
 * All interactive features (tabs, audio, hanzi-writer) run purely on the client.
 *
 * Heavy tabs are lazy-loaded with `ssr: false` because they use
 * browser-only APIs (Web Speech API, hanzi-writer canvas).
 */

"use client"

import { useState, useCallback, useEffect, useRef, useTransition } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Tabs, Tab, Chip, Button, Skeleton, Spinner } from "@heroui/react"
import { Search, Layers, HelpCircle, Headphones, PenTool } from "lucide-react"
import { refreshLessonProgress } from "@/actions/practice.actions"
import { usePortalUI } from "@/providers/portal-ui-provider"
import { TAB_KEYS, DEFAULT_TAB } from "@/constants/portal/practice"
import type { PracticeTabKey } from "@/constants/portal/practice"
import ProgressCard from "./ProgressCard"
import LookupTab from "./tabs/LookupTab"
import type { IVocabularyItem, IStudentItemProgress } from "@/interfaces/portal/practice"

/* ── Lazy-load heavy tabs with ssr:false ─────────────────────────
 *  These tabs use browser-only APIs:
 *  - FlashcardTab / QuizTab / ListenTab → useSpeech (Web Speech API)
 *  - WriteTab → hanzi-writer (canvas)
 *  Setting ssr:false avoids hydration mismatches and keeps the
 *  server bundle lean (no browser polyfill needed).
 * ─────────────────────────────────────────────────────────────── */

function TabSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="w-full h-48 rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="w-24 h-10 rounded-lg" />
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>
    </div>
  )
}

const FlashcardTab = dynamic(() => import("./tabs/FlashcardTab"), {
  ssr: false,
  loading: () => <TabSkeleton />,
})
const QuizTab = dynamic(() => import("./tabs/QuizTab"), {
  ssr: false,
  loading: () => <TabSkeleton />,
})
const ListenTab = dynamic(() => import("./tabs/ListenTab"), {
  ssr: false,
  loading: () => <TabSkeleton />,
})
const WriteTab = dynamic(() => import("./tabs/WriteTab"), {
  ssr: false,
  loading: () => <TabSkeleton />,
})

interface LessonData {
  id: string
  slug?: string | null
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
  slug?: string | null
  title: string
  order: number
}

const TAB_CONFIG: Record<PracticeTabKey, { label: string; icon: React.ReactNode }> = {
  lookup: { label: "Tra cứu", icon: <Search className="w-4 h-4" /> },
  flashcard: { label: "Flashcard", icon: <Layers className="w-4 h-4" /> },
  quiz: { label: "Quiz", icon: <HelpCircle className="w-4 h-4" /> },
  listen: { label: "Nghe", icon: <Headphones className="w-4 h-4" /> },
  write: { label: "Viết", icon: <PenTool className="w-4 h-4" /> },
}

interface Props {
  /** Slug from URL, used for breadcrumbs & sibling nav comparison */
  lessonSlug: string
  /** Pre-fetched from server (SSR) */
  initialLesson: LessonData
  initialProgress: ProgressData | null
  initialItemProgress: Record<string, IStudentItemProgress>
  initialSiblings: SiblingLesson[]
}

export default function LessonPracticeView({
  lessonSlug,
  initialLesson,
  initialProgress,
  initialItemProgress,
  initialSiblings,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { setDynamicLabel } = usePortalUI()
  const siblingScrollRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  const tabParam = (searchParams.get("tab") || DEFAULT_TAB) as PracticeTabKey
  const activeTab = TAB_KEYS.includes(tabParam) ? tabParam : DEFAULT_TAB

  // State hydrated from SSR props; progress can be refreshed client-side
  const lesson = initialLesson
  const [progress, setProgress] = useState<ProgressData | null>(initialProgress)
  const [itemProgress, setItemProgress] = useState<Record<string, IStudentItemProgress>>(initialItemProgress)
  const siblings = initialSiblings

  // Always use the resolved UUID for all DB operations
  const lessonId = lesson.id

  // Set breadcrumb dynamic label
  useEffect(() => {
    setDynamicLabel(lessonSlug, `${lesson.order}. ${lesson.title}`)
  }, [lessonSlug, lesson.order, lesson.title, setDynamicLabel])

  // Auto-scroll sibling nav to current lesson on mount
  useEffect(() => {
    const container = siblingScrollRef.current
    if (!container) return
    const activeBtn = container.querySelector<HTMLElement>("[data-active-lesson]")
    if (activeBtn) {
      activeBtn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" })
    }
  }, [lessonId])

  const handleRefreshProgress = useCallback(async () => {
    const result = await refreshLessonProgress(lessonId)
    if (result.success && result.data) {
      setProgress(result.data.progress as ProgressData | null)
      setItemProgress((result.data.itemProgress || {}) as Record<string, IStudentItemProgress>)
    }
  }, [lessonId])

  const handleTabChange = useCallback(
    (key: string | number) => {
      startTransition(() => {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.set("tab", String(key))
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
      })
    },
    [searchParams, router, pathname, startTransition],
  )

  const vocabs = lesson.vocabularies
  const totalItems = vocabs.length

  return (
    <div className="space-y-3 sm:space-y-6 pb-20 sm:pb-6">
      {/* Header — compact on mobile */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
          <h1 className="text-base sm:text-xl font-bold leading-tight">
            Buổi {lesson.order}: {lesson.title}
          </h1>
          {lesson.titleChinese && (
            <span className="text-sm sm:text-lg text-default-400">{lesson.titleChinese}</span>
          )}
        </div>
        {lesson.description && (
          <p className="text-xs sm:text-sm text-default-500 mt-0.5 sm:mt-1 line-clamp-2">{lesson.description}</p>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
          <Chip size="sm" variant="flat" color="primary" className="text-[10px] sm:text-xs">{lesson.course.title}</Chip>
          <Chip size="sm" variant="flat" className="text-[10px] sm:text-xs">{totalItems} từ vựng</Chip>
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

      {/* Practice Tabs — icon-only on mobile, icon+label on sm+ */}
      <div>
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={handleTabChange}
          aria-label="Chế độ luyện tập"
          variant="bordered"
          fullWidth
          size="lg"
          classNames={{
            tabList: "gap-0 bg-default-100/50 p-1 rounded-xl",
            tab: "px-2 sm:px-3 py-2 sm:py-2.5 text-sm font-medium min-w-0",
            cursor: "bg-white shadow-sm rounded-lg",
          }}
        >
          {TAB_KEYS.map((key) => (
            <Tab
              key={key}
              title={
                <div className="flex items-center gap-1 sm:gap-1.5 justify-center">
                  {TAB_CONFIG[key].icon}
                  <span className="hidden sm:inline text-xs sm:text-sm">{TAB_CONFIG[key].label}</span>
                </div>
              }
            />
          ))}
        </Tabs>

        {/* Tab content — spinner overlay during transitions */}
        <div className="relative mt-3 sm:mt-4">
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-xl min-h-48">
              <Spinner size="lg" color="primary" label="Đang tải..." />
            </div>
          )}
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
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-background/95 backdrop-blur border-t sm:border-t-0 sm:border border-divider sm:rounded-lg shadow-none p-2 sm:p-3 z-40">
          <p className="text-xs text-default-400 mb-1.5 px-1 hidden sm:block">Các bài học khác</p>
          <div ref={siblingScrollRef} className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-safe">
            {siblings.map((s) => {
              const isCurrent = s.id === lessonId
              return (
                <Button
                  key={s.id}
                  size="sm"
                  variant={isCurrent ? "flat" : "bordered"}
                  color={isCurrent ? "primary" : "default"}
                  className="shrink-0 text-xs min-w-0"
                  {...(isCurrent ? { "data-active-lesson": true } : {})}
                  onPress={() => {
                    if (!isCurrent) {
                      // Always reset to lookup tab when switching lesson
                      router.push(`/portal/student/practice/${s.slug}`)
                    }
                  }}
                >
                  Bài {s.order}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
