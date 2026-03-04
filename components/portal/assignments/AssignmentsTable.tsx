"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Progress,
} from "@heroui/react"
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  Users,
  CheckCircle,
  Lock,
  Eye,
} from "lucide-react"
import { toast } from "react-toastify"
import { PAGINATION, ASSIGNMENT_STATUS } from "@/constants/portal"
import { CTable, type CTableColumn } from "@/components/portal/common"
import AssignmentFormModal from "./AssignmentFormModal"
import { fetchAssignments, deleteAssignmentAction, closeAssignmentAction } from "@/actions/assignment.actions"
import { useDebouncedValue, useSyncSearchToUrl } from "@/hooks/useTableParams"
import { usePortalUI } from "@/providers/portal-ui-provider"
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
    (s) => s.status === "COMPLETED" || s.status === "GRADED",
  ).length
  const pendingReview = row.submissions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "RESUBMITTED",
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
  const { startLoading, stopLoading } = usePortalUI()
  const createModal = useDisclosure()
  const editModal = useDisclosure()

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
  const [isTableLoading, setIsTableLoading] = useState(true)

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
    setIsTableLoading(true)
    startLoading()
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
      setIsTableLoading(false)
      stopLoading()
    }
  }, [debouncedSearch, urlClassFilter, urlStatusFilter, urlPage, urlPageSize, startLoading, stopLoading])

  useEffect(() => {
    loadData()
  }, [loadData])

  useSyncSearchToUrl(debouncedSearch, updateUrl)

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
            href={`/portal/${role}/assignments/${row.slug || row.id}`}
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
        const isOverdue = new Date(row.dueDate) < new Date() && row.status === ASSIGNMENT_STATUS.PUBLISHED
        return (
          <span className={`text-sm ${isOverdue ? "text-danger font-medium" : ""}`}>
            {dayjs(row.dueDate).format("DD/MM/YYYY HH:mm")}
            {isOverdue && (
              <span className="block text-[11px] text-danger">Quá hạn</span>
            )}
          </span>
        )
      },
    },
    {
      key: "progress",
      label: "Tiến độ nộp bài",
      render: (_v, row) => {
        const meta = computeMeta(row as AssignmentData)
        if (meta.totalStudents === 0) {
          return <span className="text-default-300 text-sm">—</span>
        }
        const pct = Math.round((meta.submittedCount / meta.totalStudents) * 100)
        return (
          <div className="min-w-28">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-default-600">
                <Users className="w-3 h-3" />
                {meta.submittedCount} / {meta.totalStudents}
              </span>
              <span className="text-default-400">{pct}%</span>
            </div>
            <Progress
              size="sm"
              value={pct}
              color={pct === 100 ? "success" : pct >= 50 ? "primary" : "warning"}
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
      render: (_v, row) => {
        const meta = computeMeta(row as AssignmentData)
        if (meta.pendingReview === 0) {
          return <span className="text-default-300 text-sm">0</span>
        }
        return (
          <Chip size="sm" color="warning" variant="flat" className="font-medium">
            {meta.pendingReview}
          </Chip>
        )
      },
    },
    {
      key: "completed",
      label: "Hoàn thành",
      align: "center" as const,
      render: (_v, row) => {
        const meta = computeMeta(row as AssignmentData)
        if (meta.completedCount === 0) {
          return <span className="text-default-300 text-sm">0</span>
        }
        return (
          <span className="flex items-center justify-center gap-1 text-sm text-success font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            {meta.completedCount}
          </span>
        )
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_v, row) => (
        <Chip
          size="sm"
          color={STATUS_CONFIG[row.status]?.color ?? "default"}
          variant="flat"
          className="min-w-20 text-center"
        >
          {STATUS_CONFIG[row.status]?.label ?? row.status}
        </Chip>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "center" as const,
      render: (_v, row) => (
        <div className="flex justify-end">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Thao tác">
              <DropdownItem
                key="view"
                startContent={<Eye className="w-4 h-4" />}
                href={`/portal/${role}/assignments/${row.slug || row.id}`}
              >
                Xem chi tiết
              </DropdownItem>
              <DropdownItem
                key="edit"
                startContent={<Edit2 className="w-4 h-4" />}
                isDisabled={row.status === ASSIGNMENT_STATUS.CLOSED}
                onPress={() => {
                  setEditData(row as AssignmentData)
                  editModal.onOpen()
                }}
              >
                Chỉnh sửa
              </DropdownItem>
              <DropdownItem
                key="close"
                startContent={<Lock className="w-4 h-4" />}
                className="text-warning"
                color="warning"
                isDisabled={row.status !== ASSIGNMENT_STATUS.PUBLISHED}
                onPress={() => handleClose(row.id)}
              >
                Đóng bài tập
              </DropdownItem>
              <DropdownItem
                key="delete"
                color="danger"
                className="text-danger"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={() => handleDelete(row.id)}
              >
                Xóa
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ], [urlPage, urlPageSize, role, handleDelete, handleClose, editModal])

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
          aria-label="Lọc theo lớp học"
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
          aria-label="Lọc theo trạng thái"
          selectedKeys={[urlStatusFilter]}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string
            updateUrl({ status: val || "ALL" })
          }}
          className="w-full sm:w-48"
        >
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.key}>{opt.label}</SelectItem>
          ))}
        </Select>
      </div>
    </div>
  ), [search, urlClassFilter, urlStatusFilter, classes, updateUrl])

  return (
    <>
      <CTable<AssignmentData & Record<string, unknown>>
        columns={columns}
        data={items as (AssignmentData & Record<string, unknown>)[]}
        rowKey="id"
        page={urlPage}
        pageSize={urlPageSize}
        total={total}
        onPageChange={(p) => updateUrl({ page: String(p) })}
        onPageSizeChange={(s) => updateUrl({ pageSize: String(s) })}
        ariaLabel="Bảng bài tập"
        emptyContent={{
          icon: <FileText className="w-12 h-12" />,
          title: "Chưa có bài tập nào",
          description: "Tạo bài tập mới để bắt đầu",
        }}
        actions={
          <Button color="primary" size="sm" startContent={<Plus className="w-4 h-4" />} onPress={createModal.onOpen}>
            Tạo bài tập
          </Button>
        }
        toolbar={toolbarContent}
      />

      {createModal.isOpen && (
        <AssignmentFormModal
          classes={classes}
          isOpen={createModal.isOpen}
          onClose={createModal.onClose}
          onSuccess={(assignment: unknown) => handleCreateSuccess(assignment as AssignmentData)}
        />
      )}

      {editModal.isOpen && editData && (
        <AssignmentFormModal
          classes={classes}
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.onClose()
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
