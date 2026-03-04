"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
} from "@heroui/react"
import {
  FileText,
  Search,
  Paperclip,
  ExternalLink,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { PAGINATION, SUBMISSION_STATUS } from "@/constants/portal"
import { CTable, type CTableColumn } from "@/components/portal/common"
import { fetchAssignments } from "@/actions/assignment.actions"
import { useDebouncedValue } from "@/hooks/useTableParams"
import { usePortalUI } from "@/providers/portal-ui-provider"

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
const SUBMISSION_STATUS_CONFIG: Record<string, { label: string; color: "primary" | "success" | "warning" | "danger" | "secondary" | "default"; icon?: React.ReactNode }> = {
  [SUBMISSION_STATUS.NOT_SUBMITTED]: { label: "Chưa nộp", color: "warning", icon: <AlertCircle className="w-3 h-3" /> },
  [SUBMISSION_STATUS.SUBMITTED]: { label: "Đã nộp", color: "primary", icon: <Clock className="w-3 h-3" /> },
  [SUBMISSION_STATUS.REVIEWED]: { label: "Đã xem xét", color: "secondary", icon: <Eye className="w-3 h-3" /> },
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
  const { startLoading, stopLoading } = usePortalUI()

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
    startLoading()
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
    stopLoading()
  }, [debouncedSearch, urlClassFilter, urlStatusFilter, urlPage, urlPageSize, startLoading, stopLoading])

  useEffect(() => {
    loadData()
  }, [loadData])

  /* ─── Sync search → URL ─── */
  useEffect(() => {
    updateUrl({ search: debouncedSearch })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

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
      headerClassName: "w-12",
      render: (_v, _row, index) => (
        <span className="text-sm text-default-500">{(urlPage - 1) * urlPageSize + index + 1}</span>
      ),
    },
    {
      key: "title",
      label: "Bài tập",
      render: (_v, row) => (
        <div className="max-w-xs">
          <Link
            href={`/portal/student/assignments/${row.slug || row.id}`}
            className="font-medium text-foreground hover:text-primary transition"
          >
            {row.title}
          </Link>
          {row.tags && row.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {row.tags.slice(0, 2).map((tag) => (
                <Chip key={tag} size="sm" variant="flat" color="secondary" className="text-[11px]">
                  #{tag}
                </Chip>
              ))}
              {row.tags.length > 2 && (
                <Chip size="sm" variant="flat" className="text-[11px]">
                  +{row.tags.length - 2}
                </Chip>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "class",
      label: "Lớp",
      render: (_v, row) => <span className="text-sm">{row.class.className}</span>,
    },
    {
      key: "dueDate",
      label: "Hạn nộp",
      render: (_v, row) => {
        if (!row.dueDate) return <span className="text-default-400 text-sm">—</span>
        const isOverdue = new Date(row.dueDate) < new Date()
        const subStatus = getSubmissionStatus(row)
        const showWarning = isOverdue && subStatus === SUBMISSION_STATUS.NOT_SUBMITTED
        return (
          <span className={`text-sm ${showWarning ? "text-danger font-medium" : ""}`}>
            {dayjs(row.dueDate).format("DD/MM/YYYY HH:mm")}
            {showWarning && (
              <span className="block text-[11px] text-danger">Quá hạn</span>
            )}
          </span>
        )
      },
    },
    {
      key: "attachments",
      label: "Đính kèm",
      align: "center" as const,
      render: (_v, row) => {
        const count = row.attachments?.length || 0
        const hasLink = !!row.externalLink
        if (!count && !hasLink) return <span className="text-default-300">—</span>
        return (
          <span className="flex items-center justify-center gap-1 text-sm text-default-500">
            {count > 0 && <><Paperclip className="w-3.5 h-3.5" />{count}</>}
            {hasLink && <ExternalLink className="w-3.5 h-3.5 text-primary" />}
          </span>
        )
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_v, row) => {
        const subStatus = getSubmissionStatus(row)
        const config = SUBMISSION_STATUS_CONFIG[subStatus]
        const sub = row.submissions?.[0]

        return (
          <div className="flex flex-col gap-1">
            <Chip size="sm" color={config?.color ?? "default"} variant="flat" className="min-w-24 text-center">
              {config?.label ?? subStatus}
            </Chip>
            {subStatus === SUBMISSION_STATUS.COMPLETED && sub?.score != null && (
              <span className="text-xs text-success-600 font-medium">
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
      render: (_v, row) => (
        <Button
          as={Link}
          href={`/portal/student/assignments/${row.slug || row.id}`}
          isIconOnly
          size="sm"
          variant="flat"
          color="primary"
          title="Chi tiết"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ], [urlPage, urlPageSize, getSubmissionStatus])

  /* ─── Toolbar ─── */
  const toolbarContent = useMemo(() => (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        isClearable
        placeholder="Tìm kiếm bài tập..."
        startContent={<Search className="w-4 h-4 text-default-400" />}
        value={search}
        onValueChange={setSearch}
        onClear={() => setSearch("")}
        className="w-full sm:max-w-xs"
        size="sm"
      />
      <div className="flex gap-2">
        <Select
          placeholder="Tất cả lớp"
          size="sm"
          selectedKeys={[urlClassFilter]}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string
            updateUrl({ classId: val || "ALL" })
          }}
          className="w-full sm:w-40"
        >
          {[
            <SelectItem key="ALL">Tất cả lớp</SelectItem>,
            ...classes.map((c) => (
              <SelectItem key={c.id}>{c.className}</SelectItem>
            )),
          ]}
        </Select>
        <Select
          placeholder="Trạng thái"
          size="sm"
          selectedKeys={[urlStatusFilter]}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string
            updateUrl({ status: val || "ALL" })
          }}
          className="w-full sm:w-44"
        >
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.key}>{opt.label}</SelectItem>
          ))}
        </Select>
      </div>
    </div>
  ), [search, urlClassFilter, urlStatusFilter, classes, updateUrl])

  return (
    <CTable<AssignmentData & Record<string, unknown>>
      columns={columns}
      data={items as (AssignmentData & Record<string, unknown>)[]}
      rowKey="id"
      page={urlPage}
      pageSize={urlPageSize}
      total={total}
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
