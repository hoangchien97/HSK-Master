"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Divider,
  Textarea,
  Input,
  Tabs,
  Tab,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Upload,
  Star,
  MessageSquare,
  BookOpen,
  RotateCcw,
  ExternalLink,
  Hash,
  Lock,
  AlertTriangle,
  ClipboardCheck,
  Eye,
} from "lucide-react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import relativeTime from "dayjs/plugin/relativeTime"

import FilePreviewList from "@/components/portal/common/FilePreviewList"
import { FileUploadZone } from "@/components/portal/common"
import {
  submitAssignmentAction,
  gradeSubmissionAction,
} from "@/actions/submission.actions"
import { closeAssignmentAction } from "@/actions/assignment.actions"
import { ASSIGNMENT_STATUS, SUBMISSION_STATUS } from "@/constants/portal"

dayjs.locale("vi")
dayjs.extend(relativeTime)

/* ──────────────────── types ──────────────────────── */

interface SubmissionData {
  id: string
  assignmentId: string
  studentId: string
  content?: string | null
  attachments: string[]
  submittedAt: string
  score?: number | null
  feedback?: string | null
  status: string
  student: {
    id: string
    name: string
    email: string
    image?: string | null
    username?: string | null
  }
}

interface AssignmentData {
  id: string
  classId: string
  teacherId: string
  title: string
  description?: string | null
  dueDate: string | null
  maxScore: number
  attachments: string[]
  tags?: string[]
  externalLink?: string | null
  status: string
  publishedAt?: string | null
  createdAt: string
  class: {
    id: string
    className: string
    classCode: string
    enrollments: {
      studentId: string
      student: { id: string; name: string; email: string; image?: string | null; username?: string | null }
    }[]
  }
  teacher: { id: string; name: string; email: string; image?: string | null }
  submissions: SubmissionData[]
}

interface AssignmentDetailViewProps {
  assignment: AssignmentData
  currentUserId: string
  userRole: string
}

/* ──────────────────── config ──────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "default" | "warning" | "danger" }> = {
  PUBLISHED: { label: "Đã công bố", color: "success" },
  DRAFT: { label: "Nháp", color: "default" },
  CLOSED: { label: "Đã đóng", color: "warning" },
  ARCHIVED: { label: "Lưu trữ", color: "warning" },
}

/** v2 submission statuses + backward compat with v1 */
const SUBMISSION_STATUS_CONFIG: Record<string, { label: string; color: "primary" | "success" | "warning" | "danger" | "secondary" | "default" }> = {
  NOT_SUBMITTED: { label: "Chưa nộp", color: "warning" },
  SUBMITTED: { label: "Đã nộp", color: "primary" },
  REVIEWED: { label: "Đã xem xét", color: "secondary" },
  COMPLETED: { label: "Hoàn thành", color: "success" },
  REVISION_REQUIRED: { label: "Cần sửa lại", color: "danger" },
  OVERDUE: { label: "Quá hạn", color: "danger" },
  // Backward compat v1
  RESUBMITTED: { label: "Đã nộp lại", color: "primary" },
  GRADED: { label: "Đã chấm", color: "success" },
  RETURNED: { label: "Trả lại", color: "danger" },
}

/* ──────────────────── component ──────────────────────── */

export default function AssignmentDetailView({
  assignment,
  currentUserId,
  userRole,
}: AssignmentDetailViewProps) {
  const isTeacher = userRole === "teacher"
  const isStudent = userRole === "student"

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
  const isOverdue = dueDate ? dueDate < new Date() : false
  const isClosed = assignment.status === ASSIGNMENT_STATUS.CLOSED
  const mySubmission = isStudent
    ? assignment.submissions.find((s) => s.studentId === currentUserId)
    : null

  /* ─── v2 Statistics Summary ─── */
  const totalEnrolled = assignment.class.enrollments.length
  const totalSubmitted = assignment.submissions.length
  const pendingReview = assignment.submissions.filter(
    (s) => s.status === SUBMISSION_STATUS.SUBMITTED,
  ).length
  const totalCompleted = assignment.submissions.filter(
    (s) => s.status === SUBMISSION_STATUS.COMPLETED,
  ).length
  const submittedStudentIds = new Set(assignment.submissions.map((s) => s.studentId))
  const overdueCount = isOverdue
    ? assignment.class.enrollments.filter((e) => !submittedStudentIds.has(e.studentId)).length
    : 0

  const backUrl = `/portal/${userRole}/assignments`

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ═══════ Header ═══════ */}
      <div className="flex items-start gap-4">
        <Button
          as={Link}
          href={backUrl}
          isIconOnly
          variant="flat"
          size="sm"
          className="mt-1"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Chip
              size="sm"
              color={STATUS_CONFIG[assignment.status]?.color ?? "default"}
              variant="flat"
            >
              {STATUS_CONFIG[assignment.status]?.label ?? assignment.status}
            </Chip>
            {isOverdue && !mySubmission && isStudent && (
              <Chip size="sm" color="danger" variant="flat">
                <AlertCircle className="w-3 h-3 mr-1" />Quá hạn
              </Chip>
            )}
            {isClosed && (
              <Chip size="sm" color="warning" variant="flat">
                <Lock className="w-3 h-3 mr-1" />Đã khóa nộp bài
              </Chip>
            )}
          </div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-default-500 flex-wrap">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {assignment.class.className}
            </span>
            {dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? "text-danger font-medium" : ""}`}>
                <Calendar className="w-4 h-4" />
                Hạn nộp: {dayjs(dueDate).format("DD/MM/YYYY HH:mm")}
                {isOverdue && " (Quá hạn)"}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              Điểm tối đa: {assignment.maxScore}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {assignment.publishedAt
                ? `Công bố: ${dayjs(assignment.publishedAt).format("DD/MM/YYYY")}`
                : `Tạo: ${dayjs(assignment.createdAt).format("DD/MM/YYYY")}`}
            </span>
          </div>

          {/* Tags — full width 100% per spec */}
          {assignment.tags && assignment.tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap w-full">
              <Hash className="w-3.5 h-3.5 text-default-400" />
              {assignment.tags.map((tag) => (
                <Chip key={tag} size="sm" variant="flat" color="primary">
                  #{tag}
                </Chip>
              ))}
            </div>
          )}
        </div>

        {/* Close assignment button (teacher only) */}
        {isTeacher && assignment.status === ASSIGNMENT_STATUS.PUBLISHED && (
          <CloseAssignmentButton assignmentId={assignment.id} />
        )}
      </div>

      {/* ═══════ Teacher info (for students) ═══════ */}
      {isStudent && (
        <Card shadow="sm">
          <CardBody className="flex flex-row items-center gap-3">
            <Avatar
              src={assignment.teacher.image || undefined}
              name={assignment.teacher.name?.charAt(0)}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium">Giáo viên: {assignment.teacher.name}</p>
              <p className="text-xs text-default-400">{assignment.teacher.email}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ═══════ v2 Statistics Summary (teachers) ═══════ */}
      {isTeacher && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatBox
            icon={<Users className="w-5 h-5 text-primary" />}
            bg="bg-primary-100"
            value={totalEnrolled}
            label="Học viên"
          />
          <StatBox
            icon={<Upload className="w-5 h-5 text-warning" />}
            bg="bg-warning-100"
            value={`${totalSubmitted}/${totalEnrolled}`}
            label="Đã nộp"
          />
          <StatBox
            icon={<Clock className="w-5 h-5 text-secondary" />}
            bg="bg-secondary-100"
            value={pendingReview}
            label="Chờ chấm"
            highlight={pendingReview > 0}
          />
          <StatBox
            icon={<CheckCircle className="w-5 h-5 text-success" />}
            bg="bg-success-100"
            value={totalCompleted}
            label="Hoàn thành"
          />
          <StatBox
            icon={<AlertTriangle className="w-5 h-5 text-danger" />}
            bg="bg-danger-100"
            value={overdueCount}
            label="Quá hạn"
            highlight={overdueCount > 0}
          />
        </div>
      )}

      {/* ═══════ Tabs: Overview / Submissions / Comments ═══════ */}
      {isTeacher ? (
        <TeacherTabs assignment={assignment} isOverdue={isOverdue} />
      ) : (
        <StudentTabs
          assignment={assignment}
          submission={mySubmission || null}
          isOverdue={isOverdue}
          isClosed={isClosed}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   StatBox — compact stat card for the summary row
   ════════════════════════════════════════════════════ */

function StatBox({
  icon,
  bg,
  value,
  label,
  highlight,
}: {
  icon: React.ReactNode
  bg: string
  value: string | number
  label: string
  highlight?: boolean
}) {
  return (
    <Card shadow="sm" className={highlight ? "ring-2 ring-warning" : ""}>
      <CardBody className="flex flex-row items-center gap-3 py-3 px-4">
        <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-default-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  )
}

/* ════════════════════════════════════════════════════
   Close Assignment Button (teacher)
   ════════════════════════════════════════════════════ */

function CloseAssignmentButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClose = async () => {
    if (!confirm("Đóng bài tập? Học viên sẽ không thể nộp bài thêm.")) return
    setLoading(true)
    try {
      const result = await closeAssignmentAction(assignmentId)
      if (!result.success) throw new Error(result.error)
      toast.success("Đã đóng bài tập")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      color="warning"
      variant="flat"
      size="sm"
      isLoading={loading}
      onPress={handleClose}
      startContent={!loading && <Lock className="w-4 h-4" />}
    >
      Đóng bài tập
    </Button>
  )
}

/* ════════════════════════════════════════════════════
   Teacher Tabs: Overview + Submissions + Comments
   ════════════════════════════════════════════════════ */

function TeacherTabs({
  assignment,
  isOverdue,
}: {
  assignment: AssignmentData
  isOverdue: boolean
}) {
  const [selectedTab, setSelectedTab] = useState("overview")

  return (
    <Tabs
      selectedKey={selectedTab}
      onSelectionChange={(key) => setSelectedTab(key as string)}
      variant="underlined"
      classNames={{ tabList: "gap-6" }}
    >
      <Tab
        key="overview"
        title={
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Tổng quan
          </span>
        }
      >
        <div className="space-y-4 mt-4">
          <AssignmentContentCard assignment={assignment} />
        </div>
      </Tab>
      <Tab
        key="submissions"
        title={
          <span className="flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4" />
            Bài nộp ({assignment.submissions.length})
          </span>
        }
      >
        <div className="mt-4">
          <TeacherSubmissionsSection assignment={assignment} isOverdue={isOverdue} />
        </div>
      </Tab>
      <Tab
        key="comments"
        title={
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Bình luận
          </span>
        }
      >
        <div className="mt-4">
          <CommentsPlaceholder />
        </div>
      </Tab>
    </Tabs>
  )
}

/* ════════════════════════════════════════════════════
   Student Tabs: Overview + Comments
   ════════════════════════════════════════════════════ */

function StudentTabs({
  assignment,
  submission,
  isOverdue,
  isClosed,
}: {
  assignment: AssignmentData
  submission: SubmissionData | null
  isOverdue: boolean
  isClosed: boolean
}) {
  const [selectedTab, setSelectedTab] = useState("overview")

  return (
    <Tabs
      selectedKey={selectedTab}
      onSelectionChange={(key) => setSelectedTab(key as string)}
      variant="underlined"
      classNames={{ tabList: "gap-6" }}
    >
      <Tab
        key="overview"
        title={
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Tổng quan
          </span>
        }
      >
        <div className="space-y-4 mt-4">
          <AssignmentContentCard assignment={assignment} />
          <StudentSubmissionSection
            assignment={assignment}
            submission={submission}
            isOverdue={isOverdue}
            isClosed={isClosed}
          />
        </div>
      </Tab>
      <Tab
        key="comments"
        title={
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Bình luận
          </span>
        }
      >
        <div className="mt-4">
          <CommentsPlaceholder />
        </div>
      </Tab>
    </Tabs>
  )
}

/* ════════════════════════════════════════════════════
   Assignment Content Card (shared)
   ════════════════════════════════════════════════════ */

function AssignmentContentCard({ assignment }: { assignment: AssignmentData }) {
  return (
    <Card shadow="sm">
      <CardHeader>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Nội dung bài tập
        </h2>
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        {assignment.description ? (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {assignment.description}
          </div>
        ) : (
          <p className="text-default-400 italic">Không có mô tả</p>
        )}

        {/* External link */}
        {assignment.externalLink && (
          <a
            href={assignment.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            {assignment.externalLink}
          </a>
        )}

        {assignment.attachments.length > 0 && (
          <>
            <Divider />
            <FilePreviewList
              urls={assignment.attachments}
              title="Tài liệu đính kèm"
              showPreview
            />
          </>
        )}
      </CardBody>
    </Card>
  )
}

/* ════════════════════════════════════════════════════
   Comments Placeholder (v2 — to be implemented)
   ════════════════════════════════════════════════════ */

function CommentsPlaceholder() {
  return (
    <Card shadow="sm">
      <CardBody className="py-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-default-300" />
        <p className="text-default-500 font-medium">Hệ thống bình luận</p>
        <p className="text-sm text-default-400 mt-1">
          Tính năng bình luận & @mention sẽ được cập nhật trong phiên bản tiếp theo.
        </p>
      </CardBody>
    </Card>
  )
}

/* ════════════════════════════════════════════════════
   Student Submission Section (v2)
   Supports: NOT_SUBMITTED → SUBMITTED → COMPLETED / REVISION_REQUIRED → re-SUBMITTED
   ════════════════════════════════════════════════════ */

function StudentSubmissionSection({
  assignment,
  submission,
  isOverdue,
  isClosed,
}: {
  assignment: AssignmentData
  submission: SubmissionData | null
  isOverdue: boolean
  isClosed: boolean
}) {
  const router = useRouter()
  const [content, setContent] = useState(submission?.content || "")
  const [attachments, setAttachments] = useState<string[]>(submission?.attachments || [])
  const [loading, setLoading] = useState(false)

  const isCompleted = submission?.status === SUBMISSION_STATUS.COMPLETED
  const isRevisionRequired = submission?.status === SUBMISSION_STATUS.REVISION_REQUIRED
  const isReviewed = submission?.status === SUBMISSION_STATUS.REVIEWED

  // Can submit if: no submission yet, or revision required, and not closed
  const canSubmit =
    assignment.status === ASSIGNMENT_STATUS.PUBLISHED &&
    !isClosed &&
    (!submission || isRevisionRequired) &&
    !isOverdue
  const isResubmit = !!submission && isRevisionRequired

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) {
      toast.warning("Vui lòng nhập nội dung hoặc đính kèm file")
      return
    }

    setLoading(true)
    try {
      const result = await submitAssignmentAction({
        assignmentId: assignment.id,
        content: content || undefined,
        attachments,
      })
      if (!result.success) throw new Error(result.error)
      toast.success(isResubmit ? "Nộp lại bài thành công!" : "Nộp bài thành công!")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card shadow="sm">
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          {submission ? "Bài nộp của bạn" : "Nộp bài tập"}
        </h2>
        {submission && (
          <Chip
            size="sm"
            color={SUBMISSION_STATUS_CONFIG[submission.status]?.color ?? "default"}
            variant="flat"
          >
            {SUBMISSION_STATUS_CONFIG[submission.status]?.label ?? submission.status}
          </Chip>
        )}
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        {/* COMPLETED result */}
        {isCompleted && submission && (
          <Card shadow="none" className="bg-success-50 border border-success-200">
            <CardBody>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-success-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Hoàn thành
                </span>
                {submission.score != null && (
                  <span className="text-2xl font-bold text-success-700">
                    {submission.score}/{assignment.maxScore}
                  </span>
                )}
              </div>
              {submission.feedback && (
                <div className="mt-2 p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-success-800 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> Nhận xét:
                  </p>
                  <p className="text-sm text-success-700">{submission.feedback}</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* REVIEWED — reviewed but not finalized */}
        {isReviewed && submission && (
          <Card shadow="none" className="bg-secondary-50 border border-secondary-200">
            <CardBody className="flex flex-row items-center gap-3">
              <Eye className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm font-medium text-secondary-800">
                  Giáo viên đã xem xét bài nộp, đang chờ kết quả cuối cùng
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* REVISION_REQUIRED — teacher returned for revision */}
        {isRevisionRequired && submission && (
          <Card shadow="none" className="bg-danger-50 border border-danger-200">
            <CardBody>
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="w-5 h-5 text-danger" />
                <span className="font-medium text-danger-800">Giáo viên yêu cầu sửa lại bài nộp</span>
              </div>
              {submission.feedback && (
                <div className="mt-1 p-3 bg-white/50 rounded-lg">
                  <p className="text-sm font-medium text-danger-800 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> Nhận xét:
                  </p>
                  <p className="text-sm text-danger-700">{submission.feedback}</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Waiting for review (SUBMITTED) */}
        {submission && submission.status === SUBMISSION_STATUS.SUBMITTED && (
          <Card shadow="none" className="bg-primary-50 border border-primary-200">
            <CardBody className="flex flex-row items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary-800">
                  Đang chờ giáo viên chấm bài
                </p>
                <p className="text-xs text-primary-600">
                  Đã nộp lúc: {dayjs(submission.submittedAt).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Content */}
        <Textarea
          label="Nội dung bài làm"
          value={content}
          onValueChange={setContent}
          minRows={4}
          isDisabled={!canSubmit}
          placeholder={canSubmit ? "Nhập bài làm của bạn..." : ""}
        />

        {/* Attachments */}
        <div>
          <p className="text-sm font-medium mb-2">
            {canSubmit ? "Đính kèm file bài làm" : "File đã nộp"}
          </p>
          {canSubmit ? (
            <FileUploadZone
              value={attachments}
              onChange={setAttachments}
              folder="submissions"
              maxFiles={5}
            />
          ) : (
            <FilePreviewList urls={attachments} showPreview />
          )}
        </div>

        {/* Submit / Resubmit button */}
        {canSubmit && (
          <div className="flex justify-end">
            <Button
              color={isResubmit ? "warning" : "primary"}
              size="lg"
              isLoading={loading}
              isDisabled={!content.trim() && attachments.length === 0}
              onPress={handleSubmit}
              startContent={!loading && (isResubmit ? <RotateCcw className="w-4 h-4" /> : <Upload className="w-4 h-4" />)}
            >
              {isResubmit ? "Nộp lại bài" : "Nộp bài"}
            </Button>
          </div>
        )}

        {/* Closed notice */}
        {isClosed && !submission && (
          <Card shadow="none" className="bg-warning-50 border border-warning-200">
            <CardBody className="flex flex-row items-center gap-3">
              <Lock className="w-5 h-5 text-warning" />
              <p className="text-sm text-warning-700">
                Bài tập đã đóng. Không thể nộp bài.
              </p>
            </CardBody>
          </Card>
        )}

        {/* Overdue notice */}
        {!submission && isOverdue && !isClosed && (
          <Card shadow="none" className="bg-danger-50 border border-danger-200">
            <CardBody className="flex flex-row items-center gap-3">
              <AlertCircle className="w-5 h-5 text-danger" />
              <p className="text-sm text-danger-700">
                Bài tập đã quá hạn nộp. Vui lòng liên hệ giáo viên nếu cần gia hạn.
              </p>
            </CardBody>
          </Card>
        )}
      </CardBody>
    </Card>
  )
}

/* ════════════════════════════════════════════════════
   Teacher Submissions Section (v2)
   Filterable tabs + grading actions
   ════════════════════════════════════════════════════ */

const SUBMISSION_FILTER_OPTIONS = [
  { key: "ALL", label: "Tất cả" },
  { key: SUBMISSION_STATUS.NOT_SUBMITTED, label: "Chưa nộp" },
  { key: SUBMISSION_STATUS.SUBMITTED, label: "Đã nộp (chờ chấm)" },
  { key: SUBMISSION_STATUS.COMPLETED, label: "Hoàn thành" },
  { key: SUBMISSION_STATUS.REVISION_REQUIRED, label: "Cần sửa lại" },
  { key: SUBMISSION_STATUS.OVERDUE, label: "Quá hạn" },
]

function TeacherSubmissionsSection({
  assignment,
  isOverdue,
}: {
  assignment: AssignmentData
  isOverdue: boolean
}) {
  const router = useRouter()
  const [filter, setFilter] = useState("ALL")

  const submittedIds = new Set(assignment.submissions.map((s) => s.studentId))
  const notSubmitted = assignment.class.enrollments.filter(
    (e) => !submittedIds.has(e.studentId),
  )

  // Apply filter
  const filteredSubmissions = useMemo(() => {
    if (filter === "ALL") return assignment.submissions
    if (filter === SUBMISSION_STATUS.NOT_SUBMITTED) return [] // handled separately
    if (filter === SUBMISSION_STATUS.SUBMITTED) {
      return assignment.submissions.filter(
        (s) => s.status === SUBMISSION_STATUS.SUBMITTED,
      )
    }
    if (filter === SUBMISSION_STATUS.COMPLETED) {
      return assignment.submissions.filter(
        (s) => s.status === SUBMISSION_STATUS.COMPLETED,
      )
    }
    if (filter === SUBMISSION_STATUS.REVISION_REQUIRED) {
      return assignment.submissions.filter(
        (s) => s.status === SUBMISSION_STATUS.REVISION_REQUIRED,
      )
    }
    if (filter === SUBMISSION_STATUS.OVERDUE) return []
    return assignment.submissions
  }, [filter, assignment.submissions])

  const showNotSubmitted = filter === "ALL" || filter === SUBMISSION_STATUS.NOT_SUBMITTED || filter === SUBMISSION_STATUS.OVERDUE

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Select
          size="sm"
          selectedKeys={[filter]}
          onSelectionChange={(keys) => setFilter(Array.from(keys)[0] as string)}
          className="w-56"
          label="Lọc bài nộp"
        >
          {SUBMISSION_FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.key}>{opt.label}</SelectItem>
          ))}
        </Select>
        <Chip size="sm" variant="flat" color="default">
          {filter === "NOT_SUBMITTED" || filter === "OVERDUE"
            ? `${notSubmitted.length} kết quả`
            : `${filteredSubmissions.length} bài nộp`}
        </Chip>
      </div>

      {/* Submissions list */}
      {filteredSubmissions.length > 0 && filter !== "NOT_SUBMITTED" && filter !== "OVERDUE" && (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              maxScore={assignment.maxScore}
              onGraded={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {/* Not submitted list */}
      {showNotSubmitted && notSubmitted.length > 0 && (
        <Card shadow="sm">
          <CardHeader>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              Chưa nộp ({notSubmitted.length})
            </h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-2">
              {notSubmitted.map((e) => (
                <div key={e.studentId} className="flex items-center gap-3 p-3 rounded-lg bg-default-50">
                  <Avatar
                    src={e.student.image || undefined}
                    name={e.student.name?.charAt(0)}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium">{e.student.name}</p>
                    <p className="text-xs text-default-400">{e.student.username || e.student.email}</p>
                  </div>
                  <Chip size="sm" color={isOverdue ? "danger" : "warning"} variant="flat" className="ml-auto">
                    {isOverdue ? "Quá hạn" : "Chưa nộp"}
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty states */}
      {filteredSubmissions.length === 0 && !showNotSubmitted && (
        <div className="text-center py-12 text-default-400">
          <FileText className="w-12 h-12 mx-auto mb-2" />
          <p>Không có bài nộp nào phù hợp bộ lọc</p>
        </div>
      )}
      {filteredSubmissions.length === 0 && filter === "ALL" && notSubmitted.length === 0 && (
        <div className="text-center py-12 text-default-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success" />
          <p>Tất cả học viên đã nộp bài</p>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   v2 Submission Card (Teacher grading)
   Actions: Mark Completed + Request Revision + Add Feedback
   ════════════════════════════════════════════════════ */

function SubmissionCard({
  submission,
  maxScore,
  onGraded,
}: {
  submission: SubmissionData
  maxScore: number
  onGraded: () => void
}) {
  const gradeModal = useDisclosure()
  const [score, setScore] = useState(String(submission.score ?? ""))
  const [feedback, setFeedback] = useState(submission.feedback || "")
  const [loading, setLoading] = useState(false)
  const isCompleted = submission.status === "COMPLETED" || submission.status === "GRADED"
  const isRevisionRequired = submission.status === "REVISION_REQUIRED" || submission.status === "RETURNED"
  const isPending = submission.status === "SUBMITTED" || submission.status === "RESUBMITTED"

  /** v2: Mark Completed (was GRADED) or Request Revision (was RETURNED) */
  const handleGrade = async (action: "COMPLETED" | "REVISION_REQUIRED") => {
    if (action === "COMPLETED") {
      const scoreNum = parseFloat(score)
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore) {
        toast.warning(`Điểm phải từ 0 đến ${maxScore}`)
        return
      }

      setLoading(true)
      try {
        const result = await gradeSubmissionAction(submission.id, {
          score: scoreNum,
          feedback: feedback || undefined,
          action: "GRADED",
        })
        if (!result.success) throw new Error(result.error)
        toast.success("Đã hoàn thành chấm bài!")
        gradeModal.onClose()
        onGraded()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra")
      } finally {
        setLoading(false)
      }
    } else {
      // REVISION_REQUIRED
      setLoading(true)
      try {
        const result = await gradeSubmissionAction(submission.id, {
          feedback: feedback || undefined,
          action: "RETURNED",
        })
        if (!result.success) throw new Error(result.error)
        toast.success("Đã yêu cầu học viên sửa lại!")
        gradeModal.onClose()
        onGraded()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Card shadow="sm" className="border border-default-200">
      <CardBody className="gap-3">
        {/* Student info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={submission.student.image || undefined}
              name={submission.student.name?.charAt(0)}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium">{submission.student.name}</p>
              <p className="text-xs text-default-400">
                Nộp lúc: {dayjs(submission.submittedAt).format("DD/MM/YYYY HH:mm")}
                {" · "}
                {dayjs(submission.submittedAt).fromNow()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              size="sm"
              color={SUBMISSION_STATUS_CONFIG[submission.status]?.color ?? "default"}
              variant="flat"
            >
              {SUBMISSION_STATUS_CONFIG[submission.status]?.label ?? submission.status}
            </Chip>
            {isCompleted && submission.score != null && (
              <Chip size="sm" color="success" variant="solid">
                {submission.score}/{maxScore}
              </Chip>
            )}
          </div>
        </div>

        {/* Content */}
        {submission.content && (
          <div className="p-3 bg-default-50 rounded-lg text-sm whitespace-pre-wrap">
            {submission.content}
          </div>
        )}

        {/* Attachments */}
        {submission.attachments.length > 0 && (
          <FilePreviewList
            urls={submission.attachments}
            title="File đính kèm"
            showPreview
          />
        )}

        {/* Feedback display (when completed or revision required) */}
        {(isCompleted || isRevisionRequired) && submission.feedback && (
          <div className={`p-3 rounded-lg border ${isCompleted ? "bg-success-50 border-success-200" : "bg-danger-50 border-danger-200"}`}>
            <p className={`text-xs font-medium mb-1 ${isCompleted ? "text-success-700" : "text-danger-700"}`}>
              Nhận xét:
            </p>
            <p className={`text-sm ${isCompleted ? "text-success-700" : "text-danger-700"}`}>
              {submission.feedback}
            </p>
          </div>
        )}

        {/* Grade / Return buttons */}
        {!gradeModal.isOpen ? (
          <div className="flex justify-end gap-2">
            {isPending && (
              <>
                <Button
                  size="sm"
                  color="warning"
                  variant="flat"
                  startContent={<RotateCcw className="w-4 h-4" />}
                  onPress={gradeModal.onOpen}
                >
                  Yêu cầu sửa lại
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  startContent={<CheckCircle className="w-4 h-4" />}
                  onPress={gradeModal.onOpen}
                >
                  Chấm điểm
                </Button>
              </>
            )}
            {isCompleted && (
              <Button
                size="sm"
                color="default"
                variant="flat"
                startContent={<Star className="w-4 h-4" />}
                onPress={gradeModal.onOpen}
              >
                Chấm lại
              </Button>
            )}
            {isRevisionRequired && (
              <Button
                size="sm"
                color="default"
                variant="flat"
                startContent={<Clock className="w-4 h-4" />}
                isDisabled
              >
                Đang chờ nộp lại
              </Button>
            )}
          </div>
        ) : (
          <>
            <Divider />
            <div className="space-y-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm font-medium text-primary-800">Chấm điểm / Yêu cầu sửa lại</p>
              <Input
                type="number"
                label={`Điểm (0 - ${maxScore})`}
                value={score}
                onValueChange={setScore}
                min={0}
                max={maxScore}
                size="sm"
              />
              <Textarea
                label="Nhận xét"
                value={feedback}
                onValueChange={setFeedback}
                minRows={2}
                size="sm"
                placeholder="Nhận xét bài làm của học viên..."
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="flat" onPress={gradeModal.onClose}>
                  Hủy
                </Button>
                <Button
                  size="sm"
                  color="warning"
                  variant="flat"
                  isLoading={loading}
                  onPress={() => handleGrade("REVISION_REQUIRED")}
                  startContent={!loading && <RotateCcw className="w-4 h-4" />}
                >
                  Yêu cầu sửa lại
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  isLoading={loading}
                  onPress={() => handleGrade("COMPLETED")}
                  startContent={!loading && <CheckCircle className="w-4 h-4" />}
                >
                  Hoàn thành
                </Button>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  )
}

