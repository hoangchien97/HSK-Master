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
import { TAB_KEYS, DEFAULT_TAB, PRACTICE_LABELS } from "@/constants/portal/practice"
import type { PracticeTabKey } from "@/constants/portal/practice"
import { PracticeMode } from "@/enums/portal/common"
import ProgressCard from "./ProgressCard"
import LookupTab from "./tabs/LookupTab"
import { TabErrorBoundary } from "./shared"
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

const L = PRACTICE_LABELS

const TAB_CONFIG: Record<PracticeTabKey, { label: string; icon: React.ReactNode }> = {
  [PracticeMode.LOOKUP]: { label: L.tabLabels[PracticeMode.LOOKUP], icon: <Search className="w-4 h-4" /> },
  [PracticeMode.FLASHCARD]: { label: L.tabLabels[PracticeMode.FLASHCARD], icon: <Layers className="w-4 h-4" /> },
  [PracticeMode.QUIZ]: { label: L.tabLabels[PracticeMode.QUIZ], icon: <HelpCircle className="w-4 h-4" /> },
  [PracticeMode.LISTEN]: { label: L.tabLabels[PracticeMode.LISTEN], icon: <Headphones className="w-4 h-4" /> },
  [PracticeMode.WRITE]: { label: L.tabLabels[PracticeMode.WRITE], icon: <PenTool className="w-4 h-4" /> },
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
  const [, startTransition] = useTransition()

  const tabParam = (searchParams.get("tab") || DEFAULT_TAB) as PracticeTabKey
  const activeTab = TAB_KEYS.includes(tabParam) ? tabParam : DEFAULT_TAB

  // State hydrated from SSR props; progress can be refreshed client-side
  const lesson = initialLesson
  const [progress, setProgress] = useState<ProgressData | null>(initialProgress)
  const [itemProgress, setItemProgress] = useState<Record<string, IStudentItemProgress>>(initialItemProgress)
  const [skillProgressSummary, setSkillProgressSummary] = useState(initialSkillProgress ?? {})
  const siblings = initialSiblings

  // ─── Per-mode queue cache (persists across tab switches) ───
  interface ModeCache {
    queue: IQueueVocabItem[]
    pointer: number
    isCompleted: boolean
    skillMap: Record<string, ISkillProgressRecord>
  }
  const modeCacheRef = useRef<Map<string, ModeCache>>(new Map())
  const [visitedTabs, setVisitedTabs] = useState<Set<PracticeTabKey>>(new Set([activeTab]))
  const [modeLoading, setModeLoading] = useState(false)
  const fetchingModeRef = useRef<Set<string>>(new Set())

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
    // Fire all refreshes in parallel for performance
    const promises: Promise<unknown>[] = [
      refreshLessonProgress(lessonId),
      refreshAllModeSkillProgress(lessonId),
    ]
    if (activeTab !== PracticeMode.LOOKUP) {
      promises.push(refreshSkillProgress(lessonId, activeTab))
    }

    const [legacyResult, allModeResult, skillResult] = await Promise.all(promises) as [
      Awaited<ReturnType<typeof refreshLessonProgress>>,
      Awaited<ReturnType<typeof refreshAllModeSkillProgress>>,
      Awaited<ReturnType<typeof refreshSkillProgress>> | undefined,
    ]

    if (legacyResult.success && legacyResult.data) {
      setProgress(legacyResult.data.progress as ProgressData | null)
      setItemProgress((legacyResult.data.itemProgress || {}) as Record<string, IStudentItemProgress>)
    }

    if (allModeResult.success && allModeResult.data) {
      setSkillProgressSummary(allModeResult.data as Partial<Record<string, { masteryPercent: number; masteredCount: number; totalCount: number }>>)
    }

    // Update the cached skill map for current mode
    if (skillResult?.success && skillResult.data?.skillProgress) {
      const cached = modeCacheRef.current.get(activeTab)
      if (cached) {
        cached.skillMap = skillResult.data.skillProgress as Record<string, ISkillProgressRecord>
      }
    }
  }, [lessonId, activeTab])

  // Fetch per-mode queue (with dedup + caching)
  const fetchModeQueue = useCallback(async (mode: string, force = false) => {
    if (mode === PracticeMode.LOOKUP) return
    if (!force && modeCacheRef.current.has(mode)) return
    if (fetchingModeRef.current.has(mode)) return
    fetchingModeRef.current.add(mode)
    setModeLoading(true)
    try {
      const result = await fetchPracticeQueue(lessonSlug, mode)
      if (result.success && result.data) {
        modeCacheRef.current.set(mode, {
          queue: result.data.queue as IQueueVocabItem[],
          pointer: result.data.pointer,
          isCompleted: result.data.isCompleted,
          skillMap: result.data.skillProgressMap as Record<string, ISkillProgressRecord>,
        })
      }
    } catch (e) {
      console.error("Error fetching mode queue:", e)
    } finally {
      fetchingModeRef.current.delete(mode)
      setModeLoading(false)
    }
  }, [lessonSlug])

  // Fetch queue when active tab changes; mark tab as visited
  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) return prev
      return new Set(prev).add(activeTab)
    })
    if (activeTab !== PracticeMode.LOOKUP) {
      fetchModeQueue(activeTab)
    }
  }, [activeTab, fetchModeQueue])

  // Handle reset session pointer
  const handleResetSession = useCallback(async () => {
    if (activeTab === PracticeMode.LOOKUP) return
    await resetPracticeSessionAction(lessonId, activeTab)
    modeCacheRef.current.delete(activeTab)
    await fetchModeQueue(activeTab, true)
    toast.success(L.completion.resetToast)
  }, [lessonId, activeTab, fetchModeQueue])

  // ─── Derive per-mode data from cache ───
  const vocabs = lesson.vocabularies
  const totalItems = vocabs.length

  /** Read cached queue data for any practice mode */
  const getModeData = (mode: PracticeTabKey) => {
    const cache = modeCacheRef.current.get(mode)
    const queue = cache?.queue ?? []
    const vocabularies: IVocabularyItem[] = queue.length > 0
      ? queue.map(q => ({
          id: q.id, lessonId: q.lessonId, word: q.word, pinyin: q.pinyin,
          meaning: q.meaning, meaningVi: q.meaningVi, wordType: q.wordType,
          exampleSentence: q.exampleSentence, examplePinyin: q.examplePinyin,
          exampleMeaning: q.exampleMeaning,
        }))
      : vocabs
    return {
      vocabularies, queue,
      pointer: cache?.pointer ?? 0,
      isCompleted: cache?.isCompleted ?? false,
      skillMap: cache?.skillMap ?? ({} as Record<string, ISkillProgressRecord>),
    }
  }

  // Active mode's snapshot — used by completed overlay
  const activeData = getModeData(activeTab)

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
    <div className="space-y-4">
      {/* Header — lesson info + meta chips */}
      <div className="flex flex-col gap-1 pt-1">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <h1 className="text-base sm:text-lg font-bold leading-snug">
            <span className="text-default-400 font-normal">{L.lessonView.lessonPrefix} {lesson.order}:</span>{" "}
            {lesson.title}
          </h1>
          <div className="flex items-center gap-1.5 shrink-0">
            <Chip size="sm" variant="flat" color="primary" className="text-[10px] sm:text-xs">{lesson.course.title}</Chip>
            <Chip size="sm" variant="flat" className="text-[10px] sm:text-xs">{totalItems} {L.lessonView.wordCountSuffix}</Chip>
          </div>
        </div>
        {lesson.titleChinese && (
          <p className="text-sm text-default-400">{lesson.titleChinese}</p>
        )}
      </div>

      {/* Progress Card */}
      <ProgressCard
        totalItems={totalItems}
        learnedCount={progress?.learnedCount ?? 0}
        masteredCount={progress?.masteredCount ?? 0}
        totalTimeSec={progress?.totalTimeSec ?? 0}
        masteryPercent={progress?.masteryPercent ?? 0}
        skillProgress={skillProgressSummary}
      />

      {/* Practice Tabs */}
      <div>
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={handleTabChange}
          aria-label={L.lessonView.tabsAriaLabel}
          variant="bordered"
          fullWidth
          size="lg"
          classNames={{
            tabList: "gap-0 bg-default-100/60 dark:bg-default-800/40 p-1 rounded-xl border border-default-200 dark:border-default-700/50",
            tab: "px-2 sm:px-3 py-2 sm:py-2.5 text-sm font-medium min-w-0 data-[hover=true]:opacity-80",
            cursor: "bg-white dark:bg-default-900 shadow-sm rounded-lg",
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

        {/* Tab content */}
        <div className="relative mt-3 min-h-120">
          {modeLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-xl">
              <CSpinner message={L.lessonView.loadingMessage} color="primary" />
            </div>
          )}

          {/* Completed overlay for practice modes */}
          {activeTab !== PracticeMode.LOOKUP && activeData.isCompleted && !modeLoading && activeData.queue.length > 0 && (
            <div className="mb-4 p-5 rounded-xl bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-800/30 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-lg font-bold text-success-700 dark:text-success-300">
                {L.completion.heading}
              </h3>
              <p className="text-sm text-default-500 mt-1 mb-4 max-w-sm mx-auto">
                {L.completion.descriptionTpl(TAB_CONFIG[activeTab]?.label)}
              </p>
              <Button
                color="primary"
                variant="flat"
                onPress={handleResetSession}
                startContent={<RotateCcw className="w-4 h-4" />}
              >
                {L.completion.resetBtn}
              </Button>
            </div>
          )}

          {/* ── Keep-mounted tabs: once visited, stay mounted (display:none when inactive) ── */}

          {/* LookupTab — no queue needed */}
          <div style={{ display: activeTab === PracticeMode.LOOKUP ? undefined : 'none' }}>
            <TabErrorBoundary tabName="Tra cứu">
              <LookupTab
                vocabularies={vocabs}
                lessonId={lessonId}
                itemProgress={itemProgress}
                onProgressUpdate={handleRefreshProgress}
              />
            </TabErrorBoundary>
          </div>

          {/* Practice tabs — render only after cache is loaded; keep mounted thereafter */}
          {visitedTabs.has(PracticeMode.FLASHCARD) && modeCacheRef.current.has(PracticeMode.FLASHCARD) && (() => {
            const d = getModeData(PracticeMode.FLASHCARD)
            return (
              <div style={{ display: activeTab === PracticeMode.FLASHCARD ? undefined : 'none' }}>
                <TabErrorBoundary tabName="Flashcard">
                  <FlashcardTab
                    vocabularies={d.vocabularies}
                    lessonId={lessonId}
                    itemProgress={itemProgress}
                    onProgressUpdate={handleRefreshProgress}
                    queue={d.queue}
                    skillProgressMap={d.skillMap}
                    initialPointer={d.pointer}
                    isCompleted={d.isCompleted}
                    onResetSession={handleResetSession}
                  />
                </TabErrorBoundary>
              </div>
            )
          })()}

          {visitedTabs.has(PracticeMode.QUIZ) && modeCacheRef.current.has(PracticeMode.QUIZ) && (() => {
            const d = getModeData(PracticeMode.QUIZ)
            return (
              <div style={{ display: activeTab === PracticeMode.QUIZ ? undefined : 'none' }}>
                <TabErrorBoundary tabName="Quiz">
                  <QuizTab
                    vocabularies={d.vocabularies}
                    lessonId={lessonId}
                    onProgressUpdate={handleRefreshProgress}
                    queue={d.queue}
                    skillProgressMap={d.skillMap}
                    initialPointer={d.pointer}
                    isCompleted={d.isCompleted}
                    onResetSession={handleResetSession}
                  />
                </TabErrorBoundary>
              </div>
            )
          })()}

          {visitedTabs.has(PracticeMode.LISTEN) && modeCacheRef.current.has(PracticeMode.LISTEN) && (() => {
            const d = getModeData(PracticeMode.LISTEN)
            return (
              <div style={{ display: activeTab === PracticeMode.LISTEN ? undefined : 'none' }}>
                <TabErrorBoundary tabName="Nghe">
                  <ListenTab
                    vocabularies={d.vocabularies}
                    lessonId={lessonId}
                    onProgressUpdate={handleRefreshProgress}
                    queue={d.queue}
                    skillProgressMap={d.skillMap}
                    initialPointer={d.pointer}
                    isCompleted={d.isCompleted}
                    onResetSession={handleResetSession}
                  />
                </TabErrorBoundary>
              </div>
            )
          })()}

          {visitedTabs.has(PracticeMode.WRITE) && modeCacheRef.current.has(PracticeMode.WRITE) && (() => {
            const d = getModeData(PracticeMode.WRITE)
            return (
              <div style={{ display: activeTab === PracticeMode.WRITE ? undefined : 'none' }}>
                <TabErrorBoundary tabName="Viết">
                  <WriteTab
                    vocabularies={d.vocabularies}
                    lessonId={lessonId}
                    onProgressUpdate={handleRefreshProgress}
                    queue={d.queue}
                    skillProgressMap={d.skillMap}
                    initialPointer={d.pointer}
                    isCompleted={d.isCompleted}
                    onResetSession={handleResetSession}
                  />
                </TabErrorBoundary>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Sibling lessons nav */}
      {siblings.length > 1 && (
        <div className="border-t border-divider pt-3">
          <p className="text-[10px] text-default-400 mb-2 uppercase tracking-wide font-medium">{L.lessonView.siblingHeading}</p>
          <div ref={siblingScrollRef} className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-safe">
            {siblings.map((s) => {
              const isCurrent = s.id === lessonId
              return (
                <Button
                  key={s.id}
                  size="sm"
                  variant={isCurrent ? "flat" : "bordered"}
                  color={isCurrent ? "primary" : "default"}
                  className={`shrink-0 text-xs min-w-0 ${isCurrent ? "font-semibold" : ""}`}
                  {...(isCurrent ? { "data-active-lesson": true } : {})}
                  onPress={() => {
                    if (!isCurrent) {
                      router.push(`${practiceBasePath}/${s.slug}`)
                    }
                  }}
                >
                  {L.lessonView.lessonPrefix} {s.order}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
