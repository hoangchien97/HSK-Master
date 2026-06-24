"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Dropdown } from "@/components/ui"
import { Select, type SelectOption } from "@/components/ui"
import { Tooltip } from "@/components/ui"
import { Progress } from "@/components/ui"
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Hash,
  Users,
  CheckCircle,
  Lock,
  Eye,
  X,
} from "lucide-react"
import { toast } from "react-toastify"
import {
  PAGINATION,
  ASSIGNMENT_STATUS,
  SUBMISSION_STATUS,
  DEADLINE_STATUS_LABEL,
  DEADLINE_STATUS_COLOR,
  getDeadlineStatus,
} from "@/constants/portal"
import { CTable, type CTableColumn } from "@/components/portal/common"
import AssignmentFormModal from "./AssignmentFormModal"
import { fetchAssignments, deleteAssignmentAction, closeAssignmentAction } from "@/actions/assignment.actions"
import { useDebouncedValue, useSyncSearchToUrl, useTableSort } from "@/hooks/useTableParams"
import dayjs from "dayjs"
import "dayjs/locale/vi"

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
  title: string
  slug?: string | null
  description?: string | null
  dueDate?: Date | null
  maxScore: number
  attachments?: string[]
  tags?: string[]
  externalLink?: string | null
  status: string
  publishedAt?: Date | null
  class: ClassInfo & { enrollments?: { studentId: string }[] }
  submissions: StudentSubmission[]
  createdAt: Date
  _meta?: {
    totalStudents: number
    submittedCount: number
    completedCount: number
    pendingReview: number
  }
}

interface AssignmentsTableProps {
  role?: string
}

/* ──────────────────── config ──────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "default" | "warning" | "danger" }> = {
  [ASSIGNMENT_STATUS.PUBLISHED]: { label: "Đã công bố", color: "success" },
  [ASSIGNMENT_STATUS.DRAFT]: { label: "Nháp", color: "default" },
  [ASSIGNMENT_STATUS.CLOSED]: { label: "Đã đóng", color: "warning" },
}

const STATUS_OPTIONS = [
  { key: "ALL", label: "Tất cả trạng thái" },
  { key: ASSIGNMENT_STATUS.PUBLISHED, label: "Đã công bố" },
  { key: ASSIGNMENT_STATUS.DRAFT, label: "Nháp" },
  { key: ASSIGNMENT_STATUS.CLOSED, label: "Đã đóng" },
  { key: "NEEDS_GRADING", label: "Cần chấm bài" },
  { key: "OVERDUE", label: "Quá hạn" },
]

/* ──────────────── helpers ──────────────────────────── */

/** Compute progress meta from submissions (backward-compat with v1 statuses) */
function computeMeta(row: AssignmentData) {
  if (row._meta) return row._meta
  const totalStudents = row.class.enrollments?.length ?? 0
  const submittedCount = row.submissions.length
  const completedCount = row.submissions.filter(
    (s) => s.status === SUBMISSION_STATUS.COMPLETED || s.status === SUBMISSION_STATUS.GRADED,
  ).length
  const pendingReview = row.submissions.filter(
    (s) => s.status === SUBMISSION_STATUS.SUBMITTED || s.status === SUBMISSION_STATUS.RESUBMITTED,
  ).length
  return { totalStudents, submittedCount, completedCount, pendingReview }
}

/* ──────────────────── component ──────────────────────── */

export default function AssignmentsTable({
  role = "teacher",
}: AssignmentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

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
  const [editData, setEditData] = useState<AssignmentData | null>(null)
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

  /* ─── Load data via server action ─── */
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

  const { sortDescriptor, onSortChange } = useTableSort(updateUrl, searchParams)

  /* ─── Optimistic create ─── */
  const handleCreateSuccess = useCallback((newAssignment: AssignmentData) => {
    setItems((prev) => [newAssignment, ...prev])
    setTotal((prev) => prev + 1)
  }, [])

  /* ─── Optimistic update ─── */
  const handleUpdateSuccess = useCallback((updated: AssignmentData) => {
    setItems((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }, [])

  /* ─── Delete handler ─── */
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bạn có chắc muốn xóa bài tập này?")) return
      const prevItems = items
      const prevTotal = total
      setItems((prev) => prev.filter((a) => a.id !== id))
      setTotal((prev) => prev - 1)

      const result = await deleteAssignmentAction(id)
      if (!result.success) {
        setItems(prevItems)
        setTotal(prevTotal)
        toast.error(result.error || "Có lỗi xảy ra")
      } else {
        toast.success("Đã xóa bài tập")
      }
    },
    [items, total],
  )

  /* ─── Close handler (v2: PUBLISHED → CLOSED) ─── */
  const handleClose = useCallback(
    async (id: string) => {
      if (!confirm("Đóng bài tập? Học viên sẽ không thể nộp bài thêm.")) return

      const result = await closeAssignmentAction(id)
      if (!result.success) {
        toast.error(result.error || "Có lỗi xảy ra")
      } else {
        toast.success("Đã đóng bài tập")
        setItems((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: ASSIGNMENT_STATUS.CLOSED } : a)),
        )
      }
    },
    [],
  )

  /* ─── Columns (v2: progress + pending review + completed) ─── */
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
      sortable: true,
      render: (_v, row) => (
        <Link
          href={`/portal/${role}/assignments/${row.slug || row.id}`}
          className="font-medium text-foreground hover:text-(--color-vermillion) transition truncate block max-w-50"
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: "tags",
      label: "Hashtag",
      headerClassName: "w-[140px]",
      render: (_v, row) => {
        if (!row.tags || row.tags.length === 0) return <span className="text-gray-400">—</span>
        return (
          <div className="flex flex-wrap gap-1 max-w-40">
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
        )
      },
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
      sortable: true,
      headerClassName: "w-[120px]",
      render: (_v, row) => {
        if (!row.dueDate) return <span className="text-gray-400 text-sm">—</span>
        const deadlineStatus = getDeadlineStatus(row.dueDate, row.status)
        const formattedDate = dayjs(row.dueDate).format("DD/MM/YYYY HH:mm")
        return (
          <Tooltip content={formattedDate} placement="top" delayMs={300}>
            <span className="cursor-default inline-block min-w-20 text-center">
              <Badge
                variant={DEADLINE_STATUS_COLOR[deadlineStatus] as "success" | "warning" | "danger" | "default" | "primary" | "info" | undefined}
                size="sm"
                className="min-w-20 text-center"
              >
                {DEADLINE_STATUS_LABEL[deadlineStatus]}
              </Badge>
            </span>
          </Tooltip>
        )
      },
    },
    {
      key: "progress",
      label: "Tiến độ nộp bài",
      headerClassName: "w-[160px]",
      render: (_v, row) => {
        const meta = computeMeta(row as AssignmentData)
        if (meta.totalStudents === 0) {
          return <span className="text-gray-400 text-sm">—</span>
        }
        const pct = Math.round((meta.submittedCount / meta.totalStudents) * 100)
        return (
          <div className="min-w-28">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-(--color-muted)">
                <Users className="w-3 h-3" />
                {meta.submittedCount} / {meta.totalStudents}
              </span>
              <span className="text-gray-400">{pct}%</span>
            </div>
            <Progress
              size="sm"
              value={pct}
              variant={pct === 100 ? "success" : pct >= 50 ? "default" : "warning"}
              className="max-w-full"
            />
          </div>
        )
      },
    },
    {
      key: "pendingReview",
      label: "Chờ chấm",
      align: "center" as const,
      headerClassName: "w-[90px]",
      render: (_v, row) => {
        const meta = computeMeta(row as AssignmentData)
        if (meta.pendingReview === 0) {
          return <span className="text-gray-400 text-sm">0</span>
        }
        return (
          <Badge size="sm" variant="warning" className="font-medium">
            {meta.pendingReview}
          </Badge>
        )
      },
    },
    {
      key: "completed",
      label: "Hoàn thành",
      align: "center" as const,
      headerClassName: "w-[90px]",
      render: (_v, row) => {
        const meta = computeMeta(row as AssignmentData)
        if (meta.completedCount === 0) {
          return <span className="text-gray-400 text-sm">0</span>
        }
        return (
          <span className="flex items-center justify-center gap-1 text-sm text-green-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            {meta.completedCount}
          </span>
        )
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      headerClassName: "w-[110px]",
      render: (_v, row) => (
        <Badge
          size="sm"
          variant={STATUS_CONFIG[row.status]?.color ?? "default"}
          className="min-w-20 text-center"
        >
          {STATUS_CONFIG[row.status]?.label ?? row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      headerClassName: "w-[60px]",
      render: (_v, row) => (
        <div className="flex justify-end">
          <Dropdown
            trigger={
              <button type="button" className="p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            }
            items={[
              {
                label: "Xem chi tiết",
                icon: <Eye className="w-4 h-4" />,
                onClick: () => { window.location.href = `/portal/${role}/assignments/${row.slug || row.id}` },
              },
              {
                label: "Chỉnh sửa",
                icon: <Edit2 className="w-4 h-4" />,
                disabled: row.status === ASSIGNMENT_STATUS.CLOSED,
                onClick: () => {
                  setEditData(row as AssignmentData)
                  setIsEditOpen(true)
                },
              },
              {
                label: "Đóng bài tập",
                icon: <Lock className="w-4 h-4" />,
                disabled: row.status !== ASSIGNMENT_STATUS.PUBLISHED,
                onClick: () => handleClose(row.id),
              },
              {
                label: "Xóa",
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => handleDelete(row.id),
              },
            ]}
          />
        </div>
      ),
    },
  ], [urlPage, urlPageSize, role, handleDelete, handleClose])

  /* ─── Class options ─── */
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
            className="w-full sm:w-48"
          />
        </div>
      </div>
    </div>
  ), [search, urlClassFilter, urlStatusFilter, classOptions, updateUrl])

  return (
    <>
      <CTable<AssignmentData & Record<string, unknown>>
        columns={columns}
        data={items as (AssignmentData & Record<string, unknown>)[]}
        rowKey="id"
        page={urlPage}
        pageSize={urlPageSize}
        total={total}
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        isLoading={isLoading}
        onPageChange={(p) => updateUrl({ page: String(p) })}
        onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Bảng bài tập"
        emptyContent={{
          icon: <Hash className="w-12 h-12" />,
          title: "Chưa có bài tập nào",
          description: "Tạo bài tập mới để bắt đầu",
        }}
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>
            Tạo bài tập
          </Button>
        }
        toolbar={toolbarContent}
      />

      {isCreateOpen && (
        <AssignmentFormModal
          classes={classes}
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(assignment: unknown) => handleCreateSuccess(assignment as AssignmentData)}
        />
      )}

      {isEditOpen && editData && (
        <AssignmentFormModal
          classes={classes}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setEditData(null)
          }}
          onSuccess={(assignment: unknown) => handleUpdateSuccess(assignment as AssignmentData)}
          editData={{
            id: editData.id,
            title: editData.title,
            description: editData.description,
            dueDate: editData.dueDate,
            maxScore: editData.maxScore,
            classId: editData.class.id,
            status: editData.status,
            attachments: editData.attachments || [],
            tags: editData.tags || [],
            externalLink: editData.externalLink || "",
          }}
        />
      )}
    </>
  )
}
