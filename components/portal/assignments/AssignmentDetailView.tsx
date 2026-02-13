"use client"

import { useState, useCallback } from "react"
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
  Loader2,
} from "lucide-react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import relativeTime from "dayjs/plugin/relativeTime"

import FilePreviewList from "@/components/portal/common/FilePreviewList"
import { FileUploadZone } from "@/components/portal/common"
import { submitAssignmentAction, gradeSubmissionAction } from "@/actions/submission.actions"

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
  assignmentType: string
  dueDate: string | null
  maxScore: number
  attachments: string[]
  status: string
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

const SUBMISSION_STATUS: Record<string, { label: string; color: "primary" | "success" | "warning" | "danger" }> = {
  SUBMITTED: { label: "Đã nộp", color: "primary" },
  GRADED: { label: "Đã chấm", color: "success" },
  LATE: { label: "Nộp muộn", color: "warning" },
}

/* ──────────────────── component ──────────────────────── */

export default function AssignmentDetailView({
  assignment,
  currentUserId,
  userRole,
}: AssignmentDetailViewProps) {
  const router = useRouter()
  const isTeacher = userRole === "teacher"
  const isStudent = userRole === "student"

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
  const isOverdue = dueDate ? dueDate < new Date() : false
  const mySubmission = isStudent
    ? assignment.submissions.find((s) => s.studentId === currentUserId)
    : null

  const totalEnrolled = assignment.class.enrollments.length
  const totalSubmitted = assignment.submissions.length
  const totalGraded = assignment.submissions.filter((s) => s.status === "GRADED").length

  const backUrl = `/portal/${userRole}/assignments`

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
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
              color={TYPE_CONFIG[assignment.assignmentType]?.color ?? "default"}
              variant="flat"
            >
              {TYPE_CONFIG[assignment.assignmentType]?.label ?? assignment.assignmentType}
            </Chip>
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
          </div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-default-500 flex-wrap">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {assignment.class.className}
            </span>
            {dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Hạn nộp: {dayjs(dueDate).format("DD/MM/YYYY HH:mm")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              Điểm tối đa: {assignment.maxScore}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Tạo: {dayjs(assignment.createdAt).format("DD/MM/YYYY")}
            </span>
          </div>
        </div>
      </div>

      {/* Teacher info (for students) */}
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

      {/* Stats (for teachers) */}
      {isTeacher && (
        <div className="grid grid-cols-3 gap-4">
          <Card shadow="sm">
            <CardBody className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-100">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEnrolled}</p>
                <p className="text-xs text-default-500">Học viên</p>
              </div>
            </CardBody>
          </Card>
          <Card shadow="sm">
            <CardBody className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-warning-100">
                <Upload className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSubmitted}/{totalEnrolled}</p>
                <p className="text-xs text-default-500">Đã nộp</p>
              </div>
            </CardBody>
          </Card>
          <Card shadow="sm">
            <CardBody className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-success-100">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGraded}/{totalSubmitted}</p>
                <p className="text-xs text-default-500">Đã chấm</p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Assignment content */}
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

      {/* Student: Submit / View submission */}
      {isStudent && (
        <StudentSubmissionSection
          assignment={assignment}
          submission={mySubmission || null}
          isOverdue={isOverdue}
        />
      )}

      {/* Teacher: View submissions */}
      {isTeacher && (
        <TeacherSubmissionsSection
          assignment={assignment}
        />
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   Student Submission Section
   ════════════════════════════════════════════════════ */

function StudentSubmissionSection({
  assignment,
  submission,
  isOverdue,
}: {
  assignment: AssignmentData
  submission: SubmissionData | null
  isOverdue: boolean
}) {
  const router = useRouter()
  const [content, setContent] = useState(submission?.content || "")
  const [attachments, setAttachments] = useState<string[]>(submission?.attachments || [])
  const [loading, setLoading] = useState(false)

  const canSubmit = !submission && !isOverdue && assignment.status === "ACTIVE"
  const isGraded = submission?.status === "GRADED"

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
      toast.success("Nộp bài thành công!")
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
            color={SUBMISSION_STATUS[submission.status]?.color ?? "default"}
            variant="flat"
          >
            {SUBMISSION_STATUS[submission.status]?.label ?? submission.status}
          </Chip>
        )}
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        {/* Grading result */}
        {isGraded && submission && (
          <Card shadow="none" className="bg-success-50 border border-success-200">
            <CardBody>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-success-800 flex items-center gap-2">
                  <Star className="w-5 h-5" /> Kết quả chấm bài
                </span>
                <span className="text-2xl font-bold text-success-700">
                  {submission.score}/{assignment.maxScore}
                </span>
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

        {/* Waiting for grade */}
        {submission && !isGraded && (
          <Card shadow="none" className="bg-primary-50 border border-primary-200">
            <CardBody className="flex flex-row items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary-800">Đang chờ giáo viên chấm bài</p>
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

        {/* Submit button */}
        {canSubmit && (
          <div className="flex justify-end">
            <Button
              color="primary"
              size="lg"
              isLoading={loading}
              isDisabled={!content.trim() && attachments.length === 0}
              onPress={handleSubmit}
              startContent={!loading && <Upload className="w-4 h-4" />}
            >
              Nộp bài
            </Button>
          </div>
        )}

        {/* Overdue notice */}
        {!submission && isOverdue && (
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
   Teacher Submissions Section
   ════════════════════════════════════════════════════ */

function TeacherSubmissionsSection({
  assignment,
}: {
  assignment: AssignmentData
}) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("submissions")

  // Students who haven't submitted
  const submittedIds = new Set(assignment.submissions.map((s) => s.studentId))
  const notSubmitted = assignment.class.enrollments.filter(
    (e) => !submittedIds.has(e.studentId)
  )

  return (
    <Card shadow="sm">
      <CardHeader>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Quản lý bài nộp
        </h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          variant="underlined"
          classNames={{ tabList: "gap-6" }}
        >
          <Tab
            key="submissions"
            title={
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Đã nộp ({assignment.submissions.length})
              </span>
            }
          >
            <div className="space-y-3 mt-4">
              {assignment.submissions.length === 0 ? (
                <div className="text-center py-8 text-default-400">
                  <Upload className="w-12 h-12 mx-auto mb-2" />
                  <p>Chưa có học viên nào nộp bài</p>
                </div>
              ) : (
                assignment.submissions.map((sub) => (
                  <SubmissionCard
                    key={sub.id}
                    submission={sub}
                    maxScore={assignment.maxScore}
                    onGraded={() => router.refresh()}
                  />
                ))
              )}
            </div>
          </Tab>
          <Tab
            key="not-submitted"
            title={
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Chưa nộp ({notSubmitted.length})
              </span>
            }
          >
            <div className="space-y-2 mt-4">
              {notSubmitted.length === 0 ? (
                <div className="text-center py-8 text-default-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success" />
                  <p>Tất cả học viên đã nộp bài</p>
                </div>
              ) : (
                notSubmitted.map((e) => (
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
                    <Chip size="sm" color="warning" variant="flat" className="ml-auto">
                      Chưa nộp
                    </Chip>
                  </div>
                ))
              )}
            </div>
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  )
}

/* ════════════════════════════════════════════════════
   Single Submission Card (Teacher grading)
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
  const isGraded = submission.status === "GRADED"

  const handleGrade = async () => {
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
      })
      if (!result.success) throw new Error(result.error)
      toast.success("Chấm bài thành công!")
      gradeModal.onClose()
      onGraded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
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
              color={SUBMISSION_STATUS[submission.status]?.color ?? "default"}
              variant="flat"
            >
              {SUBMISSION_STATUS[submission.status]?.label ?? submission.status}
            </Chip>
            {isGraded && (
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

        {/* Feedback display */}
        {isGraded && submission.feedback && (
          <div className="p-3 bg-success-50 rounded-lg border border-success-200">
            <p className="text-xs font-medium text-success-700 mb-1">Nhận xét:</p>
            <p className="text-sm text-success-700">{submission.feedback}</p>
          </div>
        )}

        {/* Grade button / form */}
        {!gradeModal.isOpen ? (
          <div className="flex justify-end">
            <Button
              size="sm"
              color={isGraded ? "default" : "primary"}
              variant={isGraded ? "flat" : "solid"}
              startContent={<Star className="w-4 h-4" />}
              onPress={gradeModal.onOpen}
            >
              {isGraded ? "Chấm lại" : "Chấm điểm"}
            </Button>
          </div>
        ) : (
          <>
            <Divider />
            <div className="space-y-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm font-medium text-primary-800">Chấm điểm</p>
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
                  color="primary"
                  isLoading={loading}
                  onPress={handleGrade}
                  startContent={!loading && <CheckCircle className="w-4 h-4" />}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  )
}
