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
  Paperclip,
} from "lucide-react"
import { toast } from "react-toastify"
import { PAGINATION } from "@/constants/portal"
import { CTable, type CTableColumn } from "@/components/portal/common"
import AssignmentFormModal from "./AssignmentFormModal"
import { fetchAssignments, deleteAssignmentAction } from "@/actions/assignment.actions"
import { useDebouncedValue } from "@/hooks/useTableParams"
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
  student: { id: string; fullName: string | null; name: string }
  status: string
  score?: number | null
}

interface AssignmentData {
  id: string
  title: string
  description?: string | null
  assignmentType: string
  dueDate?: Date | null
  maxScore: number
  attachments?: string[]
  status: string
  class: ClassInfo
  submissions: StudentSubmission[]
  createdAt: Date
}

interface AssignmentsTableProps {
  role?: string
}

/* ──────────────────── config ──────────────────────────── */

const TYPE_CONFIG: Record<string, { label: string; color: "primary" | "secondary" | "success" | "warning" | "danger" | "default" }> = {
  HOMEWORK: { label: "Bài tập về nhà", color: "primary" },
  QUIZ: { label: "Kiểm tra", color: "secondary" },
  PROJECT: { label: "Dự án", color: "success" },
  READING: { label: "Đọc hiểu", color: "warning" },
  WRITING: { label: "Viết", color: "warning" },
  SPEAKING: { label: "Nói", color: "danger" },
  LISTENING: { label: "Nghe", color: "default" },
}

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "default" | "danger" }> = {
  ACTIVE: { label: "Đang mở", color: "success" },
  DRAFT: { label: "Nháp", color: "default" },
  ARCHIVED: { label: "Đã đóng", color: "danger" },
}

const STATUS_OPTIONS = [
  { key: "ALL", label: "Tất cả trạng thái" },
  { key: "ACTIVE", label: "Đang mở" },
  { key: "DRAFT", label: "Nháp" },
  { key: "ARCHIVED", label: "Đã đóng" },
]

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
      // Optimistic remove
      const prevItems = items
      const prevTotal = total
      setItems((prev) => prev.filter((a) => a.id !== id))
      setTotal((prev) => prev - 1)

      const result = await deleteAssignmentAction(id)
      if (!result.success) {
        // Rollback
        setItems(prevItems)
        setTotal(prevTotal)
        toast.error(result.error || "Có lỗi xảy ra")
      } else {
        toast.success("Đã xóa bài tập")
      }
    },
    [items, total],
  )

  /* ─── Columns ─── */
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
            href={`/portal/${role}/assignments/${row.id}`}
            className="font-medium text-foreground hover:text-primary transition"
          >
            {row.title}
          </Link>
          {row.description && (
            <p className="text-xs text-default-400 line-clamp-1 mt-0.5">{row.description}</p>
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
      key: "type",
      label: "Loại",
      render: (_v, row) => (
        <Chip size="sm" color={TYPE_CONFIG[row.assignmentType]?.color ?? "default"} variant="flat">
          {TYPE_CONFIG[row.assignmentType]?.label ?? row.assignmentType}
        </Chip>
      ),
    },
    {
      key: "dueDate",
      label: "Hạn nộp",
      render: (_v, row) => row.dueDate
        ? <span className="text-sm">{dayjs(row.dueDate).format("DD/MM/YYYY HH:mm")}</span>
        : <span className="text-default-400 text-sm">—</span>,
    },
    {
      key: "attachments",
      label: "Đính kèm",
      align: "center" as const,
      render: (_v, row) => {
        const count = row.attachments?.length || 0
        if (!count) return <span className="text-default-300">—</span>
        return (
          <span className="flex items-center justify-center gap-1 text-sm text-default-500">
            <Paperclip className="w-3.5 h-3.5" />{count}
          </span>
        )
      },
    },
    {
      key: "submissions",
      label: "Nộp bài",
      render: (_v, row) => {
        const submitted = row.submissions.length
        const graded = row.submissions.filter((s) => s.status === "GRADED").length
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-default-400" />{submitted}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-success" />{graded}
            </span>
          </div>
        )
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_v, row) => (
        <Chip size="sm" color={STATUS_CONFIG[row.status]?.color ?? "default"} variant="flat">
          {STATUS_CONFIG[row.status]?.label ?? row.status}
        </Chip>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "end" as const,
      render: (_v, row) => (
        <div className="flex justify-end">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Thao tác">
              <DropdownItem
                key="edit"
                startContent={<Edit2 className="w-4 h-4" />}
                onPress={() => {
                  setEditData(row as AssignmentData)
                  editModal.onOpen()
                }}
              >
                Chỉnh sửa
              </DropdownItem>
              <DropdownItem key="delete" color="danger" className="text-danger" startContent={<Trash2 className="w-4 h-4" />} onPress={() => handleDelete(row.id)}>
                Xóa
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ], [urlPage, urlPageSize, role, handleDelete, editModal])

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
          className="w-full sm:w-40"
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
            assignmentType: editData.assignmentType,
            dueDate: editData.dueDate,
            maxScore: editData.maxScore,
            classId: editData.class.id,
            status: editData.status,
            attachments: editData.attachments || [],
          }}
        />
      )}
    </>
  )
}
