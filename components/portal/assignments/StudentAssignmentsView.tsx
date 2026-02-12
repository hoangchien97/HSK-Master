"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
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
  Divider,
  useDisclosure,
} from "@heroui/react"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  ExternalLink,
  Download,
  Paperclip,
} from "lucide-react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import { isPast, differenceInDays } from "date-fns"
import "dayjs/locale/vi"
import { CTable, type CTableColumn, FileUploadZone } from "@/components/portal/common"
import { submitAssignmentAction } from "@/actions/submission.actions"

dayjs.locale("vi")

/* ──────────────────────── types ──────────────────────── */

interface AssignmentData {
  id: string
  title: string
  description?: string | null
  type: string
  dueDate: Date | null
  maxScore?: number | null
  attachments?: string[]
  class: { className: string; classCode: string }
  submitted: boolean
  submission?: {
    id: string
    score?: number | null
    feedback?: string | null
    submittedAt: Date
    content?: string | null
    attachments?: string[]
  } | null
}

interface StudentAssignmentsViewProps {
  assignments: AssignmentData[]
  studentId: string
}

/* ──────────────────── helpers ──────────────────────────── */

function getFileName(url: string) {
  try {
    const decoded = decodeURIComponent(url)
    const parts = decoded.split("/")
    const raw = parts[parts.length - 1]
    return raw.replace(/^\d+_/, "")
  } catch {
    return url
  }
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
  const [submissionAttachments, setSubmissionAttachments] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  const now = useMemo(() => new Date(), [])

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
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredAssignments.slice(start, start + rowsPerPage)
  }, [filteredAssignments, page])

  /* types set */
  const types = useMemo(() => [...new Set(assignments.map((a) => a.type))], [assignments])

  /* status badge */
  const getStatusChip = useCallback((a: AssignmentData) => {
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
  }, [now])

  const openSubmitModal = useCallback((assignment: AssignmentData) => {
    setSelectedAssignment(assignment)
    if (assignment.submitted && assignment.submission) {
      setSubmissionContent(assignment.submission.content || "")
      setSubmissionAttachments(assignment.submission.attachments || [])
    } else {
      setSubmissionContent("")
      setSubmissionAttachments([])
    }
    submitModal.onOpen()
  }, [submitModal])

  /* columns for CTable */
  const columns: CTableColumn<AssignmentData & Record<string, unknown>>[] = useMemo(() => [
    {
      key: "title",
      label: "Bài tập",
      render: (_v, row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          {row.description && (
            <p className="text-xs text-default-400 line-clamp-1 mt-0.5">{row.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Chip size="sm" variant="flat">{row.type}</Chip>
            {(row.attachments?.length ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-default-400">
                <Paperclip className="w-3 h-3" />{row.attachments!.length} file
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "class",
      label: "Lớp",
      render: (_v, row) => (
        <span className="text-sm text-primary">{row.class.className}</span>
      ),
    },
    {
      key: "dueDate",
      label: "Hạn nộp",
      render: (_v, row) =>
        row.dueDate ? (
          <span className="text-sm">{dayjs(row.dueDate).format("DD/MM/YYYY HH:mm")}</span>
        ) : (
          <span className="text-default-400">—</span>
        ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_v, row) => getStatusChip(row),
    },
    {
      key: "actions",
      label: "Thao tác",
      align: "end" as const,
      render: (_v, row) => (
        <div className="flex justify-end gap-2">
          {!row.submitted && row.dueDate && !isPast(new Date(row.dueDate)) && (
            <Button
              size="sm"
              color="primary"
              startContent={<Upload className="w-3.5 h-3.5" />}
              onPress={() => openSubmitModal(row)}
            >
              Nộp bài
            </Button>
          )}
          {row.submitted && (
            <Button
              size="sm"
              variant="bordered"
              startContent={<ExternalLink className="w-3.5 h-3.5" />}
              onPress={() => openSubmitModal(row)}
            >
              Xem bài
            </Button>
          )}
        </div>
      ),
    },
  ], [getStatusChip, openSubmitModal])

  /* submit handler — using server action */
  const handleSubmit = async () => {
    if (!selectedAssignment) return
    if (!submissionContent.trim() && submissionAttachments.length === 0) {
      toast.warning("Vui lòng nhập nội dung hoặc đính kèm file")
      return
    }

    setLoading(true)
    try {
      const result = await submitAssignmentAction({
        assignmentId: selectedAssignment.id,
        content: submissionContent || undefined,
        attachments: submissionAttachments,
      })

      if (!result.success) throw new Error(result.error)

      toast.success("Nộp bài thành công!")
      submitModal.onClose()
      setSubmissionContent("")
      setSubmissionAttachments([])
      setSelectedAssignment(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
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
      <CTable<AssignmentData & Record<string, unknown>>
        columns={columns}
        data={paginatedItems as (AssignmentData & Record<string, unknown>)[]}
        rowKey="id"
        page={page}
        pageSize={rowsPerPage}
        total={filteredAssignments.length}
        onPageChange={setPage}
        ariaLabel="Danh sách bài tập"
        emptyContent={{
          icon: <FileText className="w-12 h-12" />,
          title: "Không có bài tập nào",
        }}
      />

      {/* Submit / View Modal */}
      <Modal
        isOpen={submitModal.isOpen}
        onClose={() => {
          submitModal.onClose()
          setSelectedAssignment(null)
          setSubmissionContent("")
          setSubmissionAttachments([])
        }}
        size="3xl"
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
                {/* Assignment description */}
                {selectedAssignment.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Mô tả bài tập</p>
                    <div className="p-3 bg-default-100 rounded-lg text-sm">
                      {selectedAssignment.description}
                    </div>
                  </div>
                )}

                {/* Teacher attachments (download) */}
                {(selectedAssignment.attachments?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Paperclip className="w-4 h-4" />
                      Tài liệu đính kèm ({selectedAssignment.attachments!.length})
                    </p>
                    <div className="space-y-2">
                      {selectedAssignment.attachments!.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg bg-default-50 hover:bg-default-100 transition-colors group"
                        >
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="flex-1 text-sm truncate">{getFileName(url)}</span>
                          <Download className="w-4 h-4 text-default-400 group-hover:text-primary shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <Divider />

                {/* Student content */}
                <Textarea
                  label={selectedAssignment.submitted ? "Bài làm của bạn" : "Nội dung bài làm"}
                  value={submissionContent}
                  onValueChange={setSubmissionContent}
                  minRows={5}
                  isDisabled={selectedAssignment.submitted}
                  placeholder="Nhập bài làm của bạn..."
                />

                {/* Student file upload / view */}
                <div>
                  <p className="text-sm font-medium mb-2">
                    {selectedAssignment.submitted ? "File đã nộp" : "Đính kèm file bài làm"}
                  </p>
                  <FileUploadZone
                    value={submissionAttachments}
                    onChange={setSubmissionAttachments}
                    folder="submissions"
                    maxFiles={5}
                    disabled={selectedAssignment.submitted}
                  />
                </div>

                {/* Grading result */}
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
                    setSubmissionAttachments([])
                  }}
                >
                  {selectedAssignment.submitted ? "Đóng" : "Hủy"}
                </Button>
                {!selectedAssignment.submitted && (
                  <Button
                    color="primary"
                    isLoading={loading}
                    isDisabled={!submissionContent.trim() && submissionAttachments.length === 0}
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
