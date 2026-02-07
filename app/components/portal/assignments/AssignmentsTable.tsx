"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  useDisclosure,
} from "@heroui/react"
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Users,
  CheckCircle,
} from "lucide-react"
import { toast } from "react-toastify"
import { PAGINATION } from "@/app/constants/portal"
import AssignmentFormModal from "./AssignmentFormModal"
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
  status: string
  class: ClassInfo
  submissions: StudentSubmission[]
  createdAt: Date
}

interface AssignmentsTableProps {
  assignments: AssignmentData[]
  classes: ClassInfo[]
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

const COLUMNS = [
  { key: "title", label: "Bài tập" },
  { key: "class", label: "Lớp" },
  { key: "type", label: "Loại" },
  { key: "dueDate", label: "Hạn nộp" },
  { key: "submissions", label: "Nộp bài" },
  { key: "status", label: "Trạng thái" },
  { key: "actions", label: "" },
]

/* ──────────────────── component ──────────────────────── */

export default function AssignmentsTable({
  assignments,
  classes,
  role = "teacher",
}: AssignmentsTableProps) {
  const router = useRouter()
  const createModal = useDisclosure()

  const [searchQuery, setSearchQuery] = useState("")
  const [classFilter, setClassFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [page, setPage] = useState(PAGINATION.INITIAL_PAGE)
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION.DEFAULT_PAGE_SIZE)

  /* filtering */
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchClass = classFilter === "ALL" || a.class.id === classFilter
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter
      return matchSearch && matchClass && matchStatus
    })
  }, [assignments, searchQuery, classFilter, statusFilter])

  /* pagination */
  const pages = Math.ceil(filteredAssignments.length / rowsPerPage)
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredAssignments.slice(start, start + rowsPerPage)
  }, [filteredAssignments, page])

  /* delete */
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Bạn có chắc muốn xóa bài tập này?")) return
      try {
        const res = await fetch(`/api/portal/assignments/${id}`, { method: "DELETE" })
        if (res.ok) {
          toast.success("Đã xóa bài tập")
          router.refresh()
        } else {
          toast.error("Xóa thất bại")
        }
      } catch {
        toast.error("Có lỗi xảy ra")
      }
    },
    [router],
  )

  /* render cell */
  const renderCell = useCallback(
    (assignment: AssignmentData, columnKey: string) => {
      switch (columnKey) {
        case "title":
          return (
            <div className="max-w-xs">
              <Link
                href={`/portal/${role}/assignments/${assignment.id}`}
                className="font-medium text-foreground hover:text-primary transition"
              >
                {assignment.title}
              </Link>
              {assignment.description && (
                <p className="text-xs text-default-400 line-clamp-1 mt-0.5">
                  {assignment.description}
                </p>
              )}
            </div>
          )

        case "class":
          return (
            <span className="text-sm">
              {assignment.class.className}
            </span>
          )

        case "type":
          return (
            <Chip
              size="sm"
              color={TYPE_CONFIG[assignment.assignmentType]?.color ?? "default"}
              variant="flat"
            >
              {TYPE_CONFIG[assignment.assignmentType]?.label ?? assignment.assignmentType}
            </Chip>
          )

        case "dueDate":
          return assignment.dueDate ? (
            <span className="text-sm">
              {dayjs(assignment.dueDate).format("DD/MM/YYYY HH:mm")}
            </span>
          ) : (
            <span className="text-default-400 text-sm">—</span>
          )

        case "submissions": {
          const submitted = assignment.submissions.length
          const graded = assignment.submissions.filter((s) => s.status === "GRADED").length
          return (
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-default-400" />
                {submitted} nộp
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-success" />
                {graded} chấm
              </span>
            </div>
          )
        }

        case "status":
          return (
            <Chip
              size="sm"
              color={STATUS_CONFIG[assignment.status]?.color ?? "default"}
              variant="flat"
            >
              {STATUS_CONFIG[assignment.status]?.label ?? assignment.status}
            </Chip>
          )

        case "actions":
          return (
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
                    href={`/portal/${role}/assignments/${assignment.id}`}
                  >
                    Chi tiết
                  </DropdownItem>
                  <DropdownItem
                    key="submissions"
                    startContent={<FileText className="w-4 h-4" />}
                    href={`/portal/${role}/assignments/${assignment.id}/submissions`}
                  >
                    Xem bài nộp
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    startContent={<Edit2 className="w-4 h-4" />}
                    href={`/portal/${role}/assignments/${assignment.id}/edit`}
                  >
                    Chỉnh sửa
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    color="danger"
                    className="text-danger"
                    startContent={<Trash2 className="w-4 h-4" />}
                    onPress={() => handleDelete(assignment.id)}
                  >
                    Xóa
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )

        default:
          return null
      }
    },
    [role, handleDelete],
  )

  /* top content */
  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Quản lý bài tập</h1>
            <p className="text-default-500 text-sm mt-1">
              Tổng cộng {assignments.length} bài tập
            </p>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={createModal.onOpen}
          >
            Tạo bài tập
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <Input
            isClearable
            placeholder="Tìm kiếm bài tập..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={searchQuery}
            onValueChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            className="w-full lg:max-w-sm"
          />
          <div className="flex gap-3">
            <Select
              placeholder="Tất cả lớp"
              selectedKeys={[classFilter]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string
                setClassFilter(val || "ALL")
                setPage(PAGINATION.INITIAL_PAGE)
              }}
              className="w-48"
              size="md"
            >
              {[
                <SelectItem key="ALL">Tất cả lớp</SelectItem>,
                ...classes.map((c) => (
                  <SelectItem key={c.id}>{c.className}</SelectItem>
                )),
              ]}
            </Select>
            <Select
              placeholder="Tất cả trạng thái"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string
                setStatusFilter(val || "ALL")
                setPage(PAGINATION.INITIAL_PAGE)
              }}
              className="w-48"
              size="md"
            >
              <SelectItem key="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem key="ACTIVE">Đang mở</SelectItem>
              <SelectItem key="DRAFT">Nháp</SelectItem>
              <SelectItem key="ARCHIVED">Đã đóng</SelectItem>
            </Select>
            <Select
              label="Hiển thị"
              selectedKeys={[String(rowsPerPage)]}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(PAGINATION.INITIAL_PAGE);
              }}
              className="w-32"
              size="md"
            >
              {PAGINATION.PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>
    ),
    [assignments.length, searchQuery, classFilter, statusFilter, classes, createModal],
  )

  /* bottom content */
  const bottomContent = useMemo(
    () =>
      pages > 1 ? (
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-sm text-default-400">
            {filteredAssignments.length} bài tập
          </span>
          <Pagination
            total={pages}
            page={page}
            onChange={setPage}
            showControls
            color="primary"
          />
        </div>
      ) : null,
    [pages, page, filteredAssignments.length],
  )

  return (
    <div className="space-y-4">
      <Table
        aria-label="Bảng bài tập"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        isStriped
      >
        <TableHeader columns={COLUMNS}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "end" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={paginatedItems}
          emptyContent={
            <div className="flex flex-col items-center py-10 gap-3">
              <FileText className="w-12 h-12 text-default-300" />
              <p className="text-default-500">Chưa có bài tập nào</p>
              <Button
                color="primary"
                size="sm"
                startContent={<Plus className="w-4 h-4" />}
                onPress={createModal.onOpen}
              >
                Tạo bài tập
              </Button>
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey as string)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Assignment Form Modal */}
      {createModal.isOpen && (
        <AssignmentFormModal
          classes={classes}
          isOpen={createModal.isOpen}
          onClose={createModal.onClose}
        />
      )}
    </div>
  )
}
