"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  ExternalLink,
} from "lucide-react"
import {
  PageHeader,
  Card,
  EmptyState,
  StatCard,
} from "@/app/components/portal/shared"
import { format, isPast, differenceInDays } from "date-fns"
import { vi } from "date-fns/locale"

interface AssignmentData {
  id: string
  title: string
  description?: string | null
  type: string
  dueDate: Date | null
  maxScore?: number | null
  class: {
    className: string
    classCode: string
  }
  submitted: boolean
  submission?: {
    id: string
    score?: number | null
    feedback?: string | null
    submittedAt: Date
    content?: string | null
  } | null
}

interface StudentAssignmentsClientProps {
  assignments: AssignmentData[]
  studentId: string
}

export default function StudentAssignmentsClient({
  assignments,
}: StudentAssignmentsClientProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentData | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submissionContent, setSubmissionContent] = useState("")
  const [loading, setLoading] = useState(false)

  const now = new Date()

  const filteredAssignments = assignments.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false

    if (filter === "pending") {
      return !a.submitted && a.dueDate && !isPast(new Date(a.dueDate))
    }
    if (filter === "submitted") {
      return a.submitted && !a.submission?.score
    }
    if (filter === "graded") {
      return a.submitted && a.submission?.score !== null && a.submission?.score !== undefined
    }
    return true
  })

  // Stats
  const pendingCount = assignments.filter(
    (a) => !a.submitted && a.dueDate && !isPast(new Date(a.dueDate))
  ).length
  const submittedCount = assignments.filter((a) => a.submitted).length
  const gradedCount = assignments.filter(
    (a) => a.submission?.score !== null && a.submission?.score !== undefined
  ).length
  const overdueCount = assignments.filter(
    (a) => !a.submitted && a.dueDate && isPast(new Date(a.dueDate))
  ).length

  const getStatusBadge = (assignment: AssignmentData) => {
    if (!assignment.dueDate) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          Không hạn
        </span>
      )
    }

    const dueDate = new Date(assignment.dueDate)

    if (assignment.submission?.score !== null && assignment.submission?.score !== undefined) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Đã chấm: {assignment.submission.score}/{assignment.maxScore}
        </span>
      )
    }

    if (assignment.submitted) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          Đã nộp
        </span>
      )
    }

    if (isPast(dueDate)) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          Quá hạn
        </span>
      )
    }

    const daysLeft = differenceInDays(dueDate, now)
    if (daysLeft <= 2) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          Còn {daysLeft + 1} ngày
        </span>
      )
    }

    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
        Chưa nộp
      </span>
    )
  }

  const handleSubmit = async () => {
    if (!selectedAssignment || !submissionContent.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/portal/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          content: submissionContent,
        }),
      })

      if (response.ok) {
        setShowSubmitModal(false)
        setSubmissionContent("")
        setSelectedAssignment(null)
        router.refresh()
      }
    } catch (error) {
      console.error("Submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  const types = [...new Set(assignments.map((a) => a.type))]

  return (
    <div>
      <PageHeader title="Bài tập" subtitle="Quản lý và nộp bài tập các lớp học" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Cần làm"
          value={pendingCount}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Đã nộp"
          value={submittedCount}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Đã chấm"
          value={gradedCount}
          icon={<FileText className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Quá hạn"
          value={overdueCount}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Cần làm</option>
              <option value="submitted">Đã nộp</option>
              <option value="graded">Đã chấm</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại bài tập
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Không có bài tập"
          description="Không có bài tập nào phù hợp với bộ lọc"
        />
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} hover>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                    {getStatusBadge(assignment)}
                  </div>

                  <p className="text-sm text-red-600 mb-1">{assignment.class.className}</p>

                  {assignment.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {assignment.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Hạn: {format(new Date(assignment.dueDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </span>
                      </div>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {assignment.type}
                    </span>
                    {assignment.maxScore && (
                      <span className="text-xs">Điểm tối đa: {assignment.maxScore}</span>
                    )}
                  </div>

                  {/* Show feedback if graded */}
                  {assignment.submission?.feedback && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-1">Nhận xét:</p>
                      <p className="text-sm text-green-700">{assignment.submission.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {!assignment.submitted && assignment.dueDate && !isPast(new Date(assignment.dueDate)) && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment)
                        setShowSubmitModal(true)
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      Nộp bài
                    </button>
                  )}

                  {assignment.submitted && assignment.submission?.content && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment)
                        setShowSubmitModal(true)
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Xem bài
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold">
                {selectedAssignment.submitted ? "Bài nộp" : "Nộp bài tập"}
              </h2>
              <p className="text-gray-500">{selectedAssignment.title}</p>
            </div>

            <div className="p-6 space-y-4">
              {selectedAssignment.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả bài tập
                  </label>
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                    {selectedAssignment.description}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedAssignment.submitted ? "Bài làm của bạn" : "Nội dung bài làm"}
                </label>
                <textarea
                  value={
                    selectedAssignment.submitted
                      ? selectedAssignment.submission?.content || ""
                      : submissionContent
                  }
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={8}
                  disabled={selectedAssignment.submitted}
                  placeholder="Nhập bài làm của bạn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              {selectedAssignment.submission?.score !== null &&
                selectedAssignment.submission?.score !== undefined && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-800">Điểm số:</span>
                      <span className="text-xl font-bold text-green-700">
                        {selectedAssignment.submission.score}/{selectedAssignment.maxScore}
                      </span>
                    </div>
                    {selectedAssignment.submission.feedback && (
                      <p className="mt-2 text-sm text-green-700">
                        {selectedAssignment.submission.feedback}
                      </p>
                    )}
                  </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSubmitModal(false)
                  setSelectedAssignment(null)
                  setSubmissionContent("")
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                {selectedAssignment.submitted ? "Đóng" : "Hủy"}
              </button>

              {!selectedAssignment.submitted && (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !submissionContent.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50"
                >
                  {loading ? "Đang nộp..." : "Nộp bài"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
