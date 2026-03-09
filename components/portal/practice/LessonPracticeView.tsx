/**
 * LessonPracticeView — Client-side interactive component
 *
 * Receives SSR-serialized data as props (lesson, progress, siblings).
 * All interactive features (tabs, audio, hanzi-writer) run purely on the client.
 *
 * Heavy tabs are lazy-loaded with `ssr: false` because they use
 * browser-only APIs (Web Speech API, hanzi-writer canvas).
 *
 * Per-mode skill progress: When a tab is selected, the component fetches
 * a per-mode queue (with interleaving from previous lesson) and skill
 * progress data. Resume pointer is computed server-side.
 */

"use client"

import { useState, useCallback, useEffect, useRef, useTransition } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Tabs, Tab, Chip, Button, Skeleton } from "@heroui/react"
import { Search, Layers, HelpCircle, Headphones, PenTool, RotateCcw, CheckCircle2 } from "lucide-react"
import { toast } from "react-toastify"
import { CSpinner } from "@/components/portal/common"
import { refreshLessonProgress } from "@/actions/practice.actions"
import {
  fetchPracticeQueue,
  resetPracticeSessionAction,
  refreshSkillProgress,
  refreshAllModeSkillProgress,
} from "@/actions/practice-skill.actions"
import { usePortalUI } from "@/providers/portal-ui-provider"
import { TAB_KEYS, DEFAULT_TAB } from "@/constants/portal/practice"
import type { PracticeTabKey } from "@/constants/portal/practice"
import { PracticeMode } from "@/enums/portal/common"
import ProgressCard from "./ProgressCard"
import LookupTab from "./tabs/LookupTab"
import type { IVocabularyItem, IStudentItemProgress, IQueueVocabItem, ISkillProgressRecord } from "@/interfaces/portal/practice"

/* ── Lazy-load heavy tabs with ssr:false ─────────────────────────
 *  These tabs use browser-only APIs:
 *  - FlashcardTab / QuizTab / ListenTab → useSpeech (Web Speech API)
 *  - WriteTab → hanzi-writer (canvas)
 *  Setting ssr:false avoids hydration mismatches and keeps the
 *  server bundle lean (no browser polyfill needed).
 * ─────────────────────────────────────────────────────────────── */



function TabSkeleton() {
  return (
    <div className="space-y-3 p-4 flex flex-col items-center justify-center min-h-[50vh]">
      <Skeleton className="w-full max-w-lg h-48 rounded-xl" />
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
  [PracticeMode.LOOKUP]: { label: "Tra cứu", icon: <Search className="w-4 h-4" /> },
  [PracticeMode.FLASHCARD]: { label: "Flashcard", icon: <Layers className="w-4 h-4" /> },
  [PracticeMode.QUIZ]: { label: "Quiz", icon: <HelpCircle className="w-4 h-4" /> },
  [PracticeMode.LISTEN]: { label: "Nghe", icon: <Headphones className="w-4 h-4" /> },
  [PracticeMode.WRITE]: { label: "Viết", icon: <PenTool className="w-4 h-4" /> },
}

interface Props {
  /** Level slug from URL, e.g. 'hsk1' */
  levelSlug: string
  /** Slug from URL, used for breadcrumbs & sibling nav comparison */
  lessonSlug: string
  /** Pre-fetched from server (SSR) */
  initialLesson: LessonData
  initialProgress: ProgressData | null
  initialItemProgress: Record<string, IStudentItemProgress>
  initialSiblings: SiblingLesson[]
  /** Per-mode skill progress summary (SSR) */
  initialSkillProgress?: Partial<Record<string, { masteryPercent: number; masteredCount: number; totalCount: number }>>
}

export default function LessonPracticeView({
  levelSlug,
  lessonSlug,
  initialLesson,
  initialProgress,
  initialItemProgress,
  initialSiblings,
  initialSkillProgress,
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
  const [skillProgressSummary, setSkillProgressSummary] = useState(initialSkillProgress ?? {})
  const siblings = initialSiblings

  // Per-mode queue state
  const [modeQueue, setModeQueue] = useState<IQueueVocabItem[]>([])
  const [modePointer, setModePointer] = useState(0)
  const [modeCompleted, setModeCompleted] = useState(false)
  const [modeSkillMap, setModeSkillMap] = useState<Record<string, ISkillProgressRecord>>({})
  const [modeLoading, setModeLoading] = useState(false)
  const lastFetchedMode = useRef<string | null>(null)

  // Always use the resolved UUID for all DB operations
  const lessonId = lesson.id

  // Set breadcrumb label for the lesson slug segment only
  // (level label is handled statically in breadcrumb routeMeta)
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
    // NOTE: Do NOT invalidate lastFetchedMode here.
    // Queue cache is only invalidated on explicit reset (handleResetSession).
    // This prevents redundant re-fetches when switching tabs after progress update.

    // Fire all refreshes in parallel for performance
    const promises: Promise<unknown>[] = [
      refreshLessonProgress(lessonId),
      refreshAllModeSkillProgress(lessonId),
    ]
    // Also refresh per-item skill map for the active mode tab
    if (activeTab !== PracticeMode.LOOKUP) {
      promises.push(refreshSkillProgress(lessonId, activeTab))
    }

    const [legacyResult, allModeResult, skillResult] = await Promise.all(promises) as [
      Awaited<ReturnType<typeof refreshLessonProgress>>,
      Awaited<ReturnType<typeof refreshAllModeSkillProgress>>,
      Awaited<ReturnType<typeof refreshSkillProgress>> | undefined,
    ]

    // Update legacy progress (for the overall mastery circle)
    if (legacyResult.success && legacyResult.data) {
      setProgress(legacyResult.data.progress as ProgressData | null)
      setItemProgress((legacyResult.data.itemProgress || {}) as Record<string, IStudentItemProgress>)
    }

    // Update ALL mode skill progress at once (for ProgressCard badges)
    if (allModeResult.success && allModeResult.data) {
      setSkillProgressSummary(allModeResult.data as Partial<Record<string, { masteryPercent: number; masteredCount: number; totalCount: number }>>)
    }

    // Update per-item skill map for the current tab
    if (skillResult?.success && skillResult.data) {
      if (skillResult.data.skillProgress) {
        setModeSkillMap(skillResult.data.skillProgress as Record<string, ISkillProgressRecord>)
      }
    }
  }, [lessonId, activeTab])

  // Fetch per-mode queue when active tab changes to a practice mode
  const fetchModeQueue = useCallback(async (mode: string) => {
    if (mode === PracticeMode.LOOKUP) return
    if (lastFetchedMode.current === mode) return
    setModeLoading(true)
    try {
      const result = await fetchPracticeQueue(lessonSlug, mode)
      if (result.success && result.data) {
        setModeQueue(result.data.queue as IQueueVocabItem[])
        setModePointer(result.data.pointer)
        setModeCompleted(result.data.isCompleted)
        setModeSkillMap(result.data.skillProgressMap as Record<string, ISkillProgressRecord>)
        lastFetchedMode.current = mode
      }
    } catch (e) {
      console.error("Error fetching mode queue:", e)
    } finally {
      setModeLoading(false)
    }
  }, [lessonSlug])

  // Fetch queue when active tab changes
  useEffect(() => {
    if (activeTab !== PracticeMode.LOOKUP) {
      fetchModeQueue(activeTab)
    }
  }, [activeTab, fetchModeQueue])

  // Handle reset session pointer (ôn lại từ đầu)
  const handleResetSession = useCallback(async () => {
    if (activeTab === PracticeMode.LOOKUP) return
    await resetPracticeSessionAction(lessonId, activeTab)
    lastFetchedMode.current = null // force refetch
    await fetchModeQueue(activeTab)
    toast.success("Đã reset, bắt đầu ôn lại từ đầu!")
  }, [lessonId, activeTab, fetchModeQueue])

  // Get queue vocabularies for the current mode (for tabs that use queue)
  const vocabs = lesson.vocabularies
  const totalItems = vocabs.length

  const modeVocabularies: IVocabularyItem[] = modeQueue.length > 0
    ? modeQueue.map(q => ({
        id: q.id,
        lessonId: q.lessonId,
        word: q.word,
        pinyin: q.pinyin,
        meaning: q.meaning,
        meaningVi: q.meaningVi,
        wordType: q.wordType,
        exampleSentence: q.exampleSentence,
        examplePinyin: q.examplePinyin,
        exampleMeaning: q.exampleMeaning,
      }))
    : vocabs

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

  // Practice base path (includes level)
  const practiceBasePath = `/portal/student/practice/${levelSlug}`

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header — compact on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 pt-2 sm:pt-0">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-bold truncate">
            Buổi {lesson.order}: {lesson.title}
          </h1>
          {lesson.titleChinese && (
            <span className="text-sm sm:text-base text-default-400 shrink-0">{lesson.titleChinese}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 sm:ml-auto shrink-0">
          <Chip size="sm" variant="flat" color="primary" className="text-[10px] sm:text-xs">{lesson.course.title}</Chip>
          <Chip size="sm" variant="flat" className="text-[10px] sm:text-xs">{totalItems} từ vựng</Chip>
        </div>
      </div>

      {/* Progress Card — compact inline */}
      <div>
        <ProgressCard
          totalItems={totalItems}
          learnedCount={progress?.learnedCount ?? 0}
          masteredCount={progress?.masteredCount ?? 0}
          totalTimeSec={progress?.totalTimeSec ?? 0}
          masteryPercent={progress?.masteryPercent ?? 0}
          skillProgress={skillProgressSummary}
        />
      </div>

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

        {/* Tab content — fills remaining height, scrolls internally on desktop */}
        <div className="relative mt-3">
          {(isPending || modeLoading) && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-xl">
              <CSpinner message="Đang tải..." color="primary" />
            </div>
          )}

          {/* Completed overlay for practice modes */}
          {activeTab !== PracticeMode.LOOKUP && modeCompleted && !modeLoading && modeQueue.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-800/30 text-center">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2" />
              <h3 className="text-lg font-bold text-success-700 dark:text-success-300">
                Bạn đã hoàn thành bài này! 🎉
              </h3>
              <p className="text-sm text-default-500 mt-1 mb-3">
                Tất cả từ vựng đã đạt mức thành thạo cho chế độ {TAB_CONFIG[activeTab]?.label}
              </p>
              <Button
                color="primary"
                variant="flat"
                onPress={handleResetSession}
                startContent={<RotateCcw className="w-4 h-4" />}
              >
                Ôn lại từ đầu
              </Button>
            </div>
          )}

          {activeTab === PracticeMode.LOOKUP && (
            <LookupTab
              vocabularies={vocabs}
              lessonId={lessonId}
              itemProgress={itemProgress}
              onProgressUpdate={handleRefreshProgress}
            />
          )}
          {activeTab === PracticeMode.FLASHCARD && (
            <FlashcardTab
              vocabularies={modeVocabularies}
              lessonId={lessonId}
              itemProgress={itemProgress}
              onProgressUpdate={handleRefreshProgress}
              queue={modeQueue}
              skillProgressMap={modeSkillMap}
              initialPointer={modePointer}
              isCompleted={modeCompleted}
              onResetSession={handleResetSession}
            />
          )}
          {activeTab === PracticeMode.QUIZ && (
            <QuizTab
              vocabularies={modeVocabularies}
              lessonId={lessonId}
              onProgressUpdate={handleRefreshProgress}
              queue={modeQueue}
              skillProgressMap={modeSkillMap}
              initialPointer={modePointer}
              isCompleted={modeCompleted}
              onResetSession={handleResetSession}
            />
          )}
          {activeTab === PracticeMode.LISTEN && (
            <ListenTab
              vocabularies={modeVocabularies}
              lessonId={lessonId}
              onProgressUpdate={handleRefreshProgress}
              queue={modeQueue}
              skillProgressMap={modeSkillMap}
              initialPointer={modePointer}
              isCompleted={modeCompleted}
              onResetSession={handleResetSession}
            />
          )}
          {activeTab === PracticeMode.WRITE && (
            <WriteTab
              vocabularies={modeVocabularies}
              lessonId={lessonId}
              onProgressUpdate={handleRefreshProgress}
              queue={modeQueue}
              skillProgressMap={modeSkillMap}
              initialPointer={modePointer}
              isCompleted={modeCompleted}
              onResetSession={handleResetSession}
            />
          )}
        </div>
      </div>

      {/* Sibling lessons nav — fixed footer */}
      {siblings.length > 1 && (
        <div className="border-t border-divider pt-3 mt-4">
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
                      router.push(`${practiceBasePath}/${s.slug}`)
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
