"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui"
import { Select, type SelectOption } from "@/components/ui"
import {
  FileText,
  Search,
  Paperclip,
  ExternalLink,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { PAGINATION, SUBMISSION_STATUS } from "@/constants/portal"
import { CTable, type CTableColumn } from "@/components/portal/common"
import { fetchAssignments } from "@/actions/assignment.actions"
import { useDebouncedValue, useSyncSearchToUrl } from "@/hooks/useTableParams"

dayjs.locale("vi")

/* ──────────────────────── types ──────────────────────── */

interface ClassInfo {
  id: string
  className: string
  classCode: string
}

interface StudentSubmission {
  id: string
  student: { id: string; name: string }
  status: string
  score?: number | null
}

interface AssignmentData {
  id: string
  slug?: string | null
  title: string
  description?: string | null
  dueDate?: Date | null
  maxScore: number
  attachments?: string[]
  tags?: string[]
  externalLink?: string | null
  status: string
  publishedAt?: Date | null
  class: ClassInfo
  submissions: StudentSubmission[]
  createdAt: Date
}

/* ──────────────────── config ──────────────────────────── */

/** v2 submission statuses + backward compat */
const SUBMISSION_STATUS_CONFIG: Record<string, { label: string; color: "primary" | "success" | "warning" | "danger" | "default"; icon?: React.ReactNode }> = {
  [SUBMISSION_STATUS.NOT_SUBMITTED]: { label: "Chưa nộp", color: "warning", icon: <AlertCircle className="w-3 h-3" /> },
  [SUBMISSION_STATUS.SUBMITTED]: { label: "Đã nộp", color: "primary", icon: <Clock className="w-3 h-3" /> },
  [SUBMISSION_STATUS.REVIEWED]: { label: "Đã xem xét", color: "default", icon: <Eye className="w-3 h-3" /> },
  [SUBMISSION_STATUS.COMPLETED]: { label: "Hoàn thành", color: "success", icon: <CheckCircle className="w-3 h-3" /> },
  [SUBMISSION_STATUS.REVISION_REQUIRED]: { label: "Cần sửa lại", color: "danger", icon: <AlertCircle className="w-3 h-3" /> },
  [SUBMISSION_STATUS.OVERDUE]: { label: "Quá hạn", color: "danger" },
}

const STATUS_OPTIONS = [
  { key: "ALL", label: "Tất cả" },
  { key: SUBMISSION_STATUS.NOT_SUBMITTED, label: "Chưa nộp" },
  { key: SUBMISSION_STATUS.SUBMITTED, label: "Đã nộp" },
  { key: SUBMISSION_STATUS.COMPLETED, label: "Hoàn thành" },
  { key: SUBMISSION_STATUS.REVISION_REQUIRED, label: "Cần sửa lại" },
]

/* ──────────────────── component ──────────────────────── */

export default function StudentAssignmentsView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  /* ─── URL params ─── */
  const urlSearch = searchParams.get("search") || ""
  const urlClassFilter = searchParams.get("classId") || "ALL"
  const urlStatusFilter = searchParams.get("status") || "ALL"
  const urlPage = Number(searchParams.get("page") || PAGINATION.INITIAL_PAGE)
  const urlPageSize = Number(searchParams.get("pageSize") || PAGINATION.DEFAULT_PAGE_SIZE)

  /* ─── Local state ─── */
  const [search, setSearch] = useState(urlSearch)
  const debouncedSearch = useDebouncedValue(search, 350)
  const [items, setItems] = useState<AssignmentData[]>([])
  const [total, setTotal] = useState(0)
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /* ─── URL updater ─── */
  const updateUrl = useCallback(
    (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      let shouldResetPage = false

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "ALL") {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
        if (key !== "page") shouldResetPage = true
      }

      if (shouldResetPage && !("page" in updates)) {
        newParams.delete("page")
      }

      const qs = newParams.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false })
    },
    [searchParams, router, pathname],
  )

  /* ─── Load data via server action (role-aware) ─── */
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchAssignments({
        search: debouncedSearch || undefined,
        classId: urlClassFilter !== "ALL" ? urlClassFilter : undefined,
        status: urlStatusFilter !== "ALL" ? urlStatusFilter : undefined,
        page: urlPage,
        pageSize: urlPageSize,
      })
      if (result.success && result.data) {
        setItems(result.data.items as AssignmentData[])
        setTotal(result.data.total)
        setClasses(result.data.classes as ClassInfo[])
      } else {
        toast.error(result.error || "Không thể tải danh sách bài tập")
      }
    } catch (error) {
      console.error('Error loading assignments:', error)
      toast.error("Không thể tải danh sách bài tập")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, urlClassFilter, urlStatusFilter, urlPage, urlPageSize])

  useEffect(() => {
    loadData()
  }, [loadData])

  useSyncSearchToUrl(debouncedSearch, updateUrl)

  /* ─── Submission status helper ─── */
  const getSubmissionStatus = useCallback((row: AssignmentData) => {
    const sub = row.submissions?.[0]
    if (!sub) return SUBMISSION_STATUS.NOT_SUBMITTED
    return sub.status
  }, [])

  /* ─── Columns (v2: cleaner layout, status with icons) ─── */
  const columns: CTableColumn<AssignmentData & Record<string, unknown>>[] = useMemo(() => [
    {
      key: "stt",
      label: "STT",
      align: "center" as const,
      headerClassName: "w-[50px]",
      render: (_v, _row, index) => (
        <span className="text-sm text-(--color-muted)">{(urlPage - 1) * urlPageSize + index + 1}</span>
      ),
    },
    {
      key: "title",
      label: "Bài tập",
      render: (_v, row) => (
        <div className="max-w-xs">
          <Link
            href={`/portal/student/assignments/${row.slug || row.id}`}
            className="font-medium text-foreground hover:text-(--color-vermillion) transition"
          >
            {row.title}
          </Link>
          {row.tags && row.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {row.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} size="sm" className="text-[11px]">
                  #{tag}
                </Badge>
              ))}
              {row.tags.length > 2 && (
                <Badge size="sm" className="text-[11px]">
                  +{row.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "class",
      label: "Lớp",
      headerClassName: "w-[120px]",
      render: (_v, row) => <span className="text-sm">{row.class.className}</span>,
    },
    {
      key: "dueDate",
      label: "Hạn nộp",
      headerClassName: "w-[140px]",
      render: (_v, row) => {
        if (!row.dueDate) return <span className="text-gray-400 text-sm">—</span>
        const isOverdue = new Date(row.dueDate) < new Date()
        const subStatus = getSubmissionStatus(row)
        const showWarning = isOverdue && subStatus === SUBMISSION_STATUS.NOT_SUBMITTED
        return (
          <span className={`text-sm ${showWarning ? "text-red-600 font-medium" : ""}`}>
            {dayjs(row.dueDate).format("DD/MM/YYYY HH:mm")}
            {showWarning && (
              <span className="block text-[11px] text-red-600">Quá hạn</span>
            )}
          </span>
        )
      },
    },
    {
      key: "attachments",
      label: "Đính kèm",
      align: "center" as const,
      headerClassName: "w-[90px]",
      render: (_v, row) => {
        const count = row.attachments?.length || 0
        const hasLink = !!row.externalLink
        if (!count && !hasLink) return <span className="text-gray-400">—</span>
        return (
          <span className="flex items-center justify-center gap-1 text-sm text-(--color-muted)">
            {count > 0 && <><Paperclip className="w-3.5 h-3.5" />{count}</>}
            {hasLink && <ExternalLink className="w-3.5 h-3.5 text-(--color-vermillion)" />}
          </span>
        )
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      headerClassName: "w-[110px]",
      render: (_v, row) => {
        const subStatus = getSubmissionStatus(row)
        const config = SUBMISSION_STATUS_CONFIG[subStatus]
        const sub = row.submissions?.[0]

        return (
          <div className="flex flex-col gap-1">
            <Badge size="sm" variant={config?.color ?? "default"} className="min-w-24 text-center">
              {config?.label ?? subStatus}
            </Badge>
            {subStatus === SUBMISSION_STATUS.COMPLETED && sub?.score != null && (
              <span className="text-xs text-green-600 font-medium">
                {sub.score}/{row.maxScore}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      headerClassName: "w-[60px]",
      render: (_v, row) => (
        <Link
          href={`/portal/student/assignments/${row.slug || row.id}`}
          title="Chi tiết"
          className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors inline-flex items-center"
        >
          <Eye className="w-4 h-4" />
        </Link>
      ),
    },
  ], [urlPage, urlPageSize, getSubmissionStatus])

  /* ─── Select options ─── */
  const classOptions: SelectOption[] = useMemo(() => [
    { value: "ALL", label: "Tất cả lớp" },
    ...classes.map((c) => ({ value: c.id, label: c.className })),
  ], [classes])

  const statusOptions: SelectOption[] = STATUS_OPTIONS.map((opt) => ({ value: opt.key, label: opt.label }))

  /* ─── Toolbar ─── */
  const toolbarContent = useMemo(() => (
    <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm bài tập..."
            className="h-9 w-full pl-9 pr-8 rounded-md border border-(--color-smoke) bg-white text-sm text-(--color-ink) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-vermillion)"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-ink)">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Select
            value={urlClassFilter}
            onChange={(v) => updateUrl({ classId: v || "ALL" })}
            options={classOptions}
            placeholder="Tất cả lớp"
            className="w-full sm:w-40"
          />
          <Select
            value={urlStatusFilter}
            onChange={(v) => updateUrl({ status: v || "ALL" })}
            options={statusOptions}
            placeholder="Trạng thái"
            className="w-full sm:w-44"
          />
        </div>
      </div>
    </div>
  ), [search, urlClassFilter, urlStatusFilter, classOptions, updateUrl])

  return (
    <CTable<AssignmentData & Record<string, unknown>>
      columns={columns}
      data={items as (AssignmentData & Record<string, unknown>)[]}
      rowKey="id"
      page={urlPage}
      pageSize={urlPageSize}
      total={total}
      isLoading={isLoading}
      onPageChange={(p) => updateUrl({ page: String(p) })}
      onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
      ariaLabel="Danh sách bài tập"
      emptyContent={{
        icon: <FileText className="w-12 h-12" />,
        title: "Chưa có bài tập nào",
        description: "Bài tập sẽ hiển thị khi giáo viên công bố",
      }}
      toolbar={toolbarContent}
    />
  )
}
