"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Button,
  Chip,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Pagination,
  useDisclosure,
} from "@heroui/react"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  ExternalLink,
} from "lucide-react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import { isPast, differenceInDays } from "date-fns"
import "dayjs/locale/vi"

dayjs.locale("vi")

/* ──────────────────────── types ──────────────────────── */

interface AssignmentData {
  id: string
  title: string
  description?: string | null
  type: string
  dueDate: Date | null
  maxScore?: number | null
  class: { className: string; classCode: string }
  submitted: boolean
  submission?: {
    id: string
    score?: number | null
    feedback?: string | null
    submittedAt: Date
    content?: string | null
  } | null
}

interface StudentAssignmentsViewProps {
  assignments: AssignmentData[]
  studentId: string
}

/* ──────────────────── component ──────────────────────── */

export default function StudentAssignmentsView({
  assignments,
}: StudentAssignmentsViewProps) {
  const router = useRouter()
  const submitModal = useDisclosure()

  const [filter, setFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentData | null>(null)
  const [submissionContent, setSubmissionContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  const now = new Date()

  /* filtering */
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false
      if (filter === "pending") return !a.submitted && a.dueDate && !isPast(new Date(a.dueDate))
      if (filter === "submitted") return a.submitted && !a.submission?.score
      if (filter === "graded") return a.submitted && a.submission?.score != null
      return true
    })
  }, [assignments, filter, typeFilter])

  /* stats */
  const stats = useMemo(() => ({
    pending: assignments.filter((a) => !a.submitted && a.dueDate && !isPast(new Date(a.dueDate))).length,
    submitted: assignments.filter((a) => a.submitted).length,
    graded: assignments.filter((a) => a.submission?.score != null).length,
    overdue: assignments.filter((a) => !a.submitted && a.dueDate && isPast(new Date(a.dueDate))).length,
  }), [assignments])

  /* pagination */
  const pages = Math.ceil(filteredAssignments.length / rowsPerPage)
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredAssignments.slice(start, start + rowsPerPage)
  }, [filteredAssignments, page])

  /* types set */
  const types = useMemo(() => [...new Set(assignments.map((a) => a.type))], [assignments])

  /* status badge */
  const getStatusChip = (a: AssignmentData) => {
    if (a.submission?.score != null) {
      return (
        <Chip size="sm" color="success" variant="flat">
          Đã chấm: {a.submission.score}/{a.maxScore}
        </Chip>
      )
    }
    if (a.submitted) return <Chip size="sm" color="primary" variant="flat">Đã nộp</Chip>
    if (!a.dueDate) return <Chip size="sm" variant="flat">Không hạn</Chip>

    const dueDate = new Date(a.dueDate)
    if (isPast(dueDate)) return <Chip size="sm" color="danger" variant="flat">Quá hạn</Chip>

    const daysLeft = differenceInDays(dueDate, now)
    if (daysLeft <= 2) {
      return <Chip size="sm" color="warning" variant="flat">Còn {daysLeft + 1} ngày</Chip>
    }
    return <Chip size="sm" variant="flat">Chưa nộp</Chip>
  }

  /* submit handler */
  const handleSubmit = async () => {
    if (!selectedAssignment || !submissionContent.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/portal/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          content: submissionContent,
        }),
      })
      if (res.ok) {
        toast.success("Nộp bài thành công!")
        submitModal.onClose()
        setSubmissionContent("")
        setSelectedAssignment(null)
        router.refresh()
      } else {
        toast.error("Nộp bài thất bại")
      }
    } catch {
      toast.error("Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const openSubmitModal = (assignment: AssignmentData) => {
    setSelectedAssignment(assignment)
    if (assignment.submitted && assignment.submission?.content) {
      setSubmissionContent(assignment.submission.content)
    } else {
      setSubmissionContent("")
    }
    submitModal.onOpen()
  }

  /* ──────────────────── render ──────────────────────── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bài tập</h1>
        <p className="text-default-500 text-sm mt-1">
          Quản lý và nộp bài tập các lớp học
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Cần làm", value: stats.pending, icon: Clock, color: "primary" as const },
          { label: "Đã nộp", value: stats.submitted, icon: CheckCircle, color: "success" as const },
          { label: "Đã chấm", value: stats.graded, icon: FileText, color: "secondary" as const },
          { label: "Quá hạn", value: stats.overdue, icon: AlertCircle, color: "danger" as const },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} shadow="sm">
            <CardBody className="flex flex-row items-center gap-3">
              <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-default-500">{label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card shadow="sm">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              label="Trạng thái"
              selectedKeys={[filter]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string
                setFilter(val || "all")
                setPage(1)
              }}
              className="flex-1"
            >
              <SelectItem key="all">Tất cả</SelectItem>
              <SelectItem key="pending">Cần làm</SelectItem>
              <SelectItem key="submitted">Đã nộp</SelectItem>
              <SelectItem key="graded">Đã chấm</SelectItem>
            </Select>

            <Select
              label="Loại bài tập"
              selectedKeys={[typeFilter]}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string
                setTypeFilter(val || "all")
                setPage(1)
              }}
              className="flex-1"
            >
              {[
                <SelectItem key="all">Tất cả</SelectItem>,
                ...types.map((t) => <SelectItem key={t}>{t}</SelectItem>),
              ]}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Assignments Table */}
      <Table
        aria-label="Danh sách bài tập"
        isStriped
        bottomContent={
          pages > 1 ? (
            <div className="flex justify-center py-2">
              <Pagination
                total={pages}
                page={page}
                onChange={setPage}
                showControls
                color="primary"
              />
            </div>
          ) : null
        }
        bottomContentPlacement="outside"
      >
        <TableHeader>
          <TableColumn>Bài tập</TableColumn>
          <TableColumn>Lớp</TableColumn>
          <TableColumn>Hạn nộp</TableColumn>
          <TableColumn>Trạng thái</TableColumn>
          <TableColumn align="end">Thao tác</TableColumn>
        </TableHeader>
        <TableBody
          items={paginatedItems}
          emptyContent={
            <div className="flex flex-col items-center py-10 gap-2">
              <FileText className="w-12 h-12 text-default-300" />
              <p className="text-default-500">Không có bài tập nào</p>
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-default-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <Chip size="sm" variant="flat" className="mt-1">
                    {item.type}
                  </Chip>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-primary">
                  {item.class.className}
                </span>
              </TableCell>
              <TableCell>
                {item.dueDate ? (
                  <span className="text-sm">
                    {dayjs(item.dueDate).format("DD/MM/YYYY HH:mm")}
                  </span>
                ) : (
                  <span className="text-default-400">—</span>
                )}
              </TableCell>
              <TableCell>{getStatusChip(item)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {!item.submitted && item.dueDate && !isPast(new Date(item.dueDate)) && (
                    <Button
                      size="sm"
                      color="primary"
                      startContent={<Upload className="w-3.5 h-3.5" />}
                      onPress={() => openSubmitModal(item)}
                    >
                      Nộp bài
                    </Button>
                  )}
                  {item.submitted && (
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<ExternalLink className="w-3.5 h-3.5" />}
                      onPress={() => openSubmitModal(item)}
                    >
                      Xem bài
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Submit / View Modal */}
      <Modal
        isOpen={submitModal.isOpen}
        onClose={() => {
          submitModal.onClose()
          setSelectedAssignment(null)
          setSubmissionContent("")
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {selectedAssignment && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span>
                  {selectedAssignment.submitted ? "Bài nộp" : "Nộp bài tập"}
                </span>
                <span className="text-sm font-normal text-default-500">
                  {selectedAssignment.title}
                </span>
              </ModalHeader>

              <ModalBody className="gap-4">
                {selectedAssignment.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Mô tả bài tập</p>
                    <div className="p-3 bg-default-100 rounded-lg text-sm">
                      {selectedAssignment.description}
                    </div>
                  </div>
                )}

                <Textarea
                  label={selectedAssignment.submitted ? "Bài làm của bạn" : "Nội dung bài làm"}
                  value={submissionContent}
                  onValueChange={setSubmissionContent}
                  minRows={6}
                  isDisabled={selectedAssignment.submitted}
                  placeholder="Nhập bài làm của bạn..."
                />

                {selectedAssignment.submission?.score != null && (
                  <Card shadow="sm" className="bg-success-50 border border-success-200">
                    <CardBody>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-success-800">Điểm số:</span>
                        <span className="text-xl font-bold text-success-700">
                          {selectedAssignment.submission.score}/{selectedAssignment.maxScore}
                        </span>
                      </div>
                      {selectedAssignment.submission.feedback && (
                        <p className="text-sm text-success-700">
                          {selectedAssignment.submission.feedback}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                )}
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="flat"
                  onPress={() => {
                    submitModal.onClose()
                    setSelectedAssignment(null)
                    setSubmissionContent("")
                  }}
                >
                  {selectedAssignment.submitted ? "Đóng" : "Hủy"}
                </Button>
                {!selectedAssignment.submitted && (
                  <Button
                    color="primary"
                    isLoading={loading}
                    isDisabled={!submissionContent.trim()}
                    onPress={handleSubmit}
                  >
                    Nộp bài
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
