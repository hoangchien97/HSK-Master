"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui"
import { Button } from "@/components/ui"
import { Avatar } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Input } from "@/components/ui"
import { Select, type SelectOption } from "@/components/ui"
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
import { ROLE_ROUTES } from "@/lib/utils/auth"

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

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "default" | "warning" | "danger" }> = {
  PUBLISHED: { label: "Đã công bố", variant: "success" },
  DRAFT: { label: "Nháp", variant: "default" },
  CLOSED: { label: "Đã đóng", variant: "warning" },
  ARCHIVED: { label: "Lưu trữ", variant: "warning" },
}

/** v2 submission statuses + backward compat with v1 */
const SUBMISSION_STATUS_CONFIG: Record<string, { label: string; variant: "primary" | "success" | "warning" | "danger" | "default" }> = {
  NOT_SUBMITTED: { label: "Chưa nộp", variant: "warning" },
  SUBMITTED: { label: "Đã nộp", variant: "primary" },
  REVIEWED: { label: "Đã xem xét", variant: "default" },
  COMPLETED: { label: "Hoàn thành", variant: "success" },
  REVISION_REQUIRED: { label: "Cần sửa lại", variant: "danger" },
  OVERDUE: { label: "Quá hạn", variant: "danger" },
  // Backward compat v1
  RESUBMITTED: { label: "Đã nộp lại", variant: "primary" },
  GRADED: { label: "Đã chấm", variant: "success" },
  RETURNED: { label: "Trả lại", variant: "danger" },
}

/* ──────────────────── component ──────────────────────── */

export default function AssignmentDetailView({
  assignment,
  currentUserId,
  userRole,
}: AssignmentDetailViewProps) {
  const isTeacher = userRole === ROLE_ROUTES.TEACHER
  const isStudent = userRole === ROLE_ROUTES.STUDENT

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
        <Link href={backUrl} className="mt-1 p-1.5 rounded-md hover:bg-(--color-smoke) text-(--color-ink) transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge
              size="sm"
              variant={STATUS_CONFIG[assignment.status]?.variant ?? "default"}
            >
              {STATUS_CONFIG[assignment.status]?.label ?? assignment.status}
            </Badge>
            {isOverdue && !mySubmission && isStudent && (
              <Badge size="sm" variant="danger">
                <AlertCircle className="w-3 h-3 mr-1" />Quá hạn
              </Badge>
            )}
            {isClosed && (
              <Badge size="sm" variant="warning">
                <Lock className="w-3 h-3 mr-1" />Đã khóa nộp bài
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-(--color-muted) flex-wrap">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {assignment.class.className}
            </span>
            {dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
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
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              {assignment.tags.map((tag) => (
                <Badge key={tag} size="sm" variant="primary">
                  #{tag}
                </Badge>
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
        <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm flex flex-row items-center gap-3">
          <Avatar
            src={assignment.teacher.image || undefined}
            name={assignment.teacher.name?.charAt(0)}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium">Giáo viên: {assignment.teacher.name}</p>
            <p className="text-xs text-gray-400">{assignment.teacher.email}</p>
          </div>
        </div>
      )}

      {/* ═══════ v2 Statistics Summary (teachers) ═══════ */}
      {isTeacher && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatBox
            icon={<Users className="w-5 h-5 text-(--color-vermillion)" />}
            bg="bg-red-100"
            value={totalEnrolled}
            label="Học viên"
          />
          <StatBox
            icon={<Upload className="w-5 h-5 text-amber-600" />}
            bg="bg-amber-100"
            value={`${totalSubmitted}/${totalEnrolled}`}
            label="Đã nộp"
          />
          <StatBox
            icon={<Clock className="w-5 h-5 text-gray-500" />}
            bg="bg-gray-100"
            value={pendingReview}
            label="Chờ chấm"
            highlight={pendingReview > 0}
          />
          <StatBox
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            bg="bg-green-100"
            value={totalCompleted}
            label="Hoàn thành"
          />
          <StatBox
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            bg="bg-red-100"
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
    <div className={`rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm flex flex-row items-center gap-3 py-3 px-4 ${highlight ? "ring-2 ring-amber-400" : ""}`}>
      <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-(--color-muted)">{label}</p>
      </div>
    </div>
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
      variant="secondary"
      size="sm"
      isLoading={loading}
      onClick={handleClose}
      leftIcon={!loading ? <Lock className="w-4 h-4" /> : undefined}
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

  const tabs = [
    { key: "overview", title: "Tổng quan", icon: <FileText className="w-4 h-4" /> },
    { key: "submissions", title: `Bài nộp (${assignment.submissions.length})`, icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: "comments", title: "Bình luận", icon: <MessageSquare className="w-4 h-4" /> },
  ]

  return (
    <div>
      <div className="flex gap-1 border-b border-(--color-smoke) mb-4">
        {tabs.map(tab => (
          <button key={tab.key} type="button" onClick={() => setSelectedTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${selectedTab === tab.key ? "border-(--color-vermillion) text-(--color-vermillion)" : "border-transparent text-(--color-muted) hover:text-(--color-ink)"}`}>
            {tab.icon}
            {tab.title}
          </button>
        ))}
      </div>
      {selectedTab === "overview" && (
        <div className="space-y-4 mt-4">
          <AssignmentContentCard assignment={assignment} />
        </div>
      )}
      {selectedTab === "submissions" && (
        <div className="mt-4">
          <TeacherSubmissionsSection assignment={assignment} isOverdue={isOverdue} />
        </div>
      )}
      {selectedTab === "comments" && (
        <div className="mt-4">
          <CommentsPlaceholder />
        </div>
      )}
    </div>
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

  const tabs = [
    { key: "overview", title: "Tổng quan", icon: <FileText className="w-4 h-4" /> },
    { key: "comments", title: "Bình luận", icon: <MessageSquare className="w-4 h-4" /> },
  ]

  return (
    <div>
      <div className="flex gap-1 border-b border-(--color-smoke) mb-4">
        {tabs.map(tab => (
          <button key={tab.key} type="button" onClick={() => setSelectedTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${selectedTab === tab.key ? "border-(--color-vermillion) text-(--color-vermillion)" : "border-transparent text-(--color-muted) hover:text-(--color-ink)"}`}>
            {tab.icon}
            {tab.title}
          </button>
        ))}
      </div>
      {selectedTab === "overview" && (
        <div className="space-y-4 mt-4">
          <AssignmentContentCard assignment={assignment} />
          <StudentSubmissionSection
            assignment={assignment}
            submission={submission}
            isOverdue={isOverdue}
            isClosed={isClosed}
          />
        </div>
      )}
      {selectedTab === "comments" && (
        <div className="mt-4">
          <CommentsPlaceholder />
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   Assignment Content Card (shared)
   ════════════════════════════════════════════════════ */

function AssignmentContentCard({ assignment }: { assignment: AssignmentData }) {
  return (
    <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
      <div className="mb-3 font-semibold">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-(--color-vermillion)" />
          Nội dung bài tập
        </h2>
      </div>
      <hr className="border-t border-(--color-smoke)" />
      <div className="gap-4 mt-4">
        {assignment.description ? (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {assignment.description}
          </div>
        ) : (
          <p className="text-gray-400 italic">Không có mô tả</p>
        )}

        {/* External link */}
        {assignment.externalLink && (
          <a
            href={assignment.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-(--color-vermillion) hover:underline mt-4"
          >
            <ExternalLink className="w-4 h-4" />
            {assignment.externalLink}
          </a>
        )}

        {assignment.attachments.length > 0 && (
          <>
            <hr className="border-t border-(--color-smoke) my-4" />
            <FilePreviewList
              urls={assignment.attachments}
              title="Tài liệu đính kèm"
              showPreview
            />
          </>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   Comments Placeholder (v2 — to be implemented)
   ════════════════════════════════════════════════════ */

function CommentsPlaceholder() {
  return (
    <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm py-12 text-center">
      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p className="text-(--color-muted) font-medium">Hệ thống bình luận</p>
      <p className="text-sm text-gray-400 mt-1">
        Tính năng bình luận & @mention sẽ được cập nhật trong phiên bản tiếp theo.
      </p>
    </div>
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
    <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-(--color-vermillion)" />
          {submission ? "Bài nộp của bạn" : "Nộp bài tập"}
        </h2>
        {submission && (
          <Badge
            size="sm"
            variant={SUBMISSION_STATUS_CONFIG[submission.status]?.variant ?? "default"}
          >
            {SUBMISSION_STATUS_CONFIG[submission.status]?.label ?? submission.status}
          </Badge>
        )}
      </div>
      <hr className="border-t border-(--color-smoke)" />
      <div className="gap-4 mt-4 flex flex-col">
        {/* COMPLETED result */}
        {isCompleted && submission && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Hoàn thành
              </span>
              {submission.score != null && (
                <span className="text-2xl font-bold text-green-700">
                  {submission.score}/{assignment.maxScore}
                </span>
              )}
            </div>
            {submission.feedback && (
              <div className="mt-2 p-3 bg-white/50 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Nhận xét:
                </p>
                <p className="text-sm text-green-700">{submission.feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* REVIEWED — reviewed but not finalized */}
        {isReviewed && submission && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-row items-center gap-3">
            <Eye className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Giáo viên đã xem xét bài nộp, đang chờ kết quả cuối cùng
              </p>
            </div>
          </div>
        )}

        {/* REVISION_REQUIRED — teacher returned for revision */}
        {isRevisionRequired && submission && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">Giáo viên yêu cầu sửa lại bài nộp</span>
            </div>
            {submission.feedback && (
              <div className="mt-1 p-3 bg-white/50 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Nhận xét:
                </p>
                <p className="text-sm text-red-700">{submission.feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* Waiting for review (SUBMITTED) */}
        {submission && submission.status === SUBMISSION_STATUS.SUBMITTED && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex flex-row items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Đang chờ giáo viên chấm bài
              </p>
              <p className="text-xs text-blue-600">
                Đã nộp lúc: {dayjs(submission.submittedAt).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <Textarea
          label="Nội dung bài làm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!canSubmit}
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
              variant={isResubmit ? "secondary" : "primary"}
              size="sm"
              isLoading={loading}
              isDisabled={!content.trim() && attachments.length === 0}
              onClick={handleSubmit}
              leftIcon={!loading ? (isResubmit ? <RotateCcw className="w-4 h-4" /> : <Upload className="w-4 h-4" />) : undefined}
            >
              {isResubmit ? "Nộp lại bài" : "Nộp bài"}
            </Button>
          </div>
        )}

        {/* Closed notice */}
        {isClosed && !submission && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-row items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              Bài tập đã đóng. Không thể nộp bài.
            </p>
          </div>
        )}

        {/* Overdue notice */}
        {!submission && isOverdue && !isClosed && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex flex-row items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">
              Bài tập đã quá hạn nộp. Vui lòng liên hệ giáo viên nếu cần gia hạn.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   Teacher Submissions Section (v2)
   Filterable tabs + grading actions
   ════════════════════════════════════════════════════ */

const SUBMISSION_FILTER_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "Tất cả" },
  { value: SUBMISSION_STATUS.NOT_SUBMITTED, label: "Chưa nộp" },
  { value: SUBMISSION_STATUS.SUBMITTED, label: "Đã nộp (chờ chấm)" },
  { value: SUBMISSION_STATUS.COMPLETED, label: "Hoàn thành" },
  { value: SUBMISSION_STATUS.REVISION_REQUIRED, label: "Cần sửa lại" },
  { value: SUBMISSION_STATUS.OVERDUE, label: "Quá hạn" },
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
          value={filter}
          onChange={(v) => setFilter(v)}
          options={SUBMISSION_FILTER_OPTIONS}
          label="Lọc bài nộp"
          className="w-56"
        />
        <Badge size="sm" variant="default">
          {filter === "NOT_SUBMITTED" || filter === "OVERDUE"
            ? `${notSubmitted.length} kết quả`
            : `${filteredSubmissions.length} bài nộp`}
        </Badge>
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
        <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
          <div className="mb-3 font-semibold">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Chưa nộp ({notSubmitted.length})
            </h3>
          </div>
          <hr className="border-t border-(--color-smoke)" />
          <div className="mt-4">
            <div className="space-y-2">
              {notSubmitted.map((e) => (
                <div key={e.studentId} className="flex items-center gap-3 p-3 rounded-lg bg-(--color-paper)">
                  <Avatar
                    src={e.student.image || undefined}
                    name={e.student.name?.charAt(0)}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium">{e.student.name}</p>
                    <p className="text-xs text-gray-400">{e.student.username || e.student.email}</p>
                  </div>
                  <Badge size="sm" variant={isOverdue ? "danger" : "warning"} className="ml-auto">
                    {isOverdue ? "Quá hạn" : "Chưa nộp"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty states */}
      {filteredSubmissions.length === 0 && !showNotSubmitted && (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-2" />
          <p>Không có bài nộp nào phù hợp bộ lọc</p>
        </div>
      )}
      {filteredSubmissions.length === 0 && filter === "ALL" && notSubmitted.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
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
  const [gradeOpen, setGradeOpen] = useState(false)
  const [score, setScore] = useState(String(submission.score ?? ""))
  const [feedback, setFeedback] = useState(submission.feedback || "")
  const [loading, setLoading] = useState(false)
  const isCompleted = submission.status === SUBMISSION_STATUS.COMPLETED || submission.status === SUBMISSION_STATUS.GRADED
  const isRevisionRequired = submission.status === SUBMISSION_STATUS.REVISION_REQUIRED || submission.status === SUBMISSION_STATUS.RETURNED
  const isPending = submission.status === SUBMISSION_STATUS.SUBMITTED || submission.status === SUBMISSION_STATUS.RESUBMITTED

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
        setGradeOpen(false)
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
        setGradeOpen(false)
        onGraded()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm gap-3 flex flex-col">
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
            <p className="text-xs text-gray-400">
              Nộp lúc: {dayjs(submission.submittedAt).format("DD/MM/YYYY HH:mm")}
              {" · "}
              {dayjs(submission.submittedAt).fromNow()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            size="sm"
            variant={SUBMISSION_STATUS_CONFIG[submission.status]?.variant ?? "default"}
          >
            {SUBMISSION_STATUS_CONFIG[submission.status]?.label ?? submission.status}
          </Badge>
          {isCompleted && submission.score != null && (
            <Badge size="sm" variant="success">
              {submission.score}/{maxScore}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {submission.content && (
        <div className="p-3 bg-(--color-paper) rounded-lg text-sm whitespace-pre-wrap">
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
        <div className={`p-3 rounded-lg border ${isCompleted ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <p className={`text-xs font-medium mb-1 ${isCompleted ? "text-green-700" : "text-red-700"}`}>
            Nhận xét:
          </p>
          <p className={`text-sm ${isCompleted ? "text-green-700" : "text-red-700"}`}>
            {submission.feedback}
          </p>
        </div>
      )}

      {/* Grade / Return buttons */}
      {!gradeOpen ? (
        <div className="flex justify-end gap-2">
          {isPending && (
            <>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={() => setGradeOpen(true)}
              >
                Yêu cầu sửa lại
              </Button>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                onClick={() => setGradeOpen(true)}
              >
                Chấm điểm
              </Button>
            </>
          )}
          {isCompleted && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Star className="w-4 h-4" />}
              onClick={() => setGradeOpen(true)}
            >
              Chấm lại
            </Button>
          )}
          {isRevisionRequired && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Clock className="w-4 h-4" />}
              isDisabled
            >
              Đang chờ nộp lại
            </Button>
          )}
        </div>
      ) : (
        <>
          <hr className="border-t border-(--color-smoke)" />
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800">Chấm điểm / Yêu cầu sửa lại</p>
            <Input
              type="number"
              label={`Điểm (0 - ${maxScore})`}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min={0}
              max={maxScore}
            />
            <Textarea
              label="Nhận xét"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Nhận xét bài làm của học viên..."
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setGradeOpen(false)}>
                Hủy
              </Button>
              <Button
                size="sm"
                variant="secondary"
                isLoading={loading}
                onClick={() => handleGrade("REVISION_REQUIRED")}
                leftIcon={!loading ? <RotateCcw className="w-4 h-4" /> : undefined}
              >
                Yêu cầu sửa lại
              </Button>
              <Button
                size="sm"
                variant="primary"
                isLoading={loading}
                onClick={() => handleGrade("COMPLETED")}
                leftIcon={!loading ? <CheckCircle className="w-4 h-4" /> : undefined}
              >
                Hoàn thành
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
