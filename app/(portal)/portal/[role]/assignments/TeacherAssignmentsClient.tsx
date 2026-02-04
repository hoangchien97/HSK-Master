"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  Users,
  CheckCircle
} from "lucide-react"
import { PageHeader, Card, EmptyState } from "@/app/components/portal/shared"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ClassInfo {
  id: string
  className: string
  classCode: string
}

interface StudentSubmission {
  id: string
  student: {
    id: string
    fullName: string | null
    name: string
  }
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

interface AssignmentsClientProps {
  assignments: AssignmentData[]
  classes: ClassInfo[]
}

export default function AssignmentsClient({ assignments, classes }: AssignmentsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [classFilter, setClassFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = classFilter === "ALL" || assignment.class.id === classFilter
    const matchesStatus = statusFilter === "ALL" || assignment.status === statusFilter

    return matchesSearch && matchesClass && matchesStatus
  })

  const typeConfig: Record<string, { text: string; bg: string }> = {
    HOMEWORK: { text: "Bài tập về nhà", bg: "bg-blue-100 text-blue-700" },
    QUIZ: { text: "Kiểm tra", bg: "bg-purple-100 text-purple-700" },
    PROJECT: { text: "Dự án", bg: "bg-green-100 text-green-700" },
    READING: { text: "Đọc hiểu", bg: "bg-yellow-100 text-yellow-700" },
    WRITING: { text: "Viết", bg: "bg-orange-100 text-orange-700" },
    SPEAKING: { text: "Nói", bg: "bg-pink-100 text-pink-700" },
    LISTENING: { text: "Nghe", bg: "bg-cyan-100 text-cyan-700" },
  }

  const statusConfig: Record<string, { text: string; bg: string }> = {
    ACTIVE: { text: "Đang mở", bg: "bg-green-100 text-green-700" },
    DRAFT: { text: "Nháp", bg: "bg-gray-100 text-gray-700" },
    ARCHIVED: { text: "Đã đóng", bg: "bg-red-100 text-red-700" },
  }

  return (
    <div>
      <PageHeader
        title="Quản lý bài tập"
        subtitle={`Tổng cộng ${assignments.length} bài tập`}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Tạo bài tập
          </button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          >
            <option value="ALL">Tất cả lớp</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.className}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang mở</option>
            <option value="DRAFT">Nháp</option>
            <option value="ARCHIVED">Đã đóng</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có bài tập nào"
          description="Tạo bài tập để giao cho học viên"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Tạo bài tập
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const gradedCount = assignment.submissions.filter(
              (s) => s.status === "GRADED"
            ).length
            const submittedCount = assignment.submissions.length

            return (
              <Card key={assignment.id} padding="none" className="relative overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full",
                            typeConfig[assignment.assignmentType]?.bg || "bg-gray-100 text-gray-700"
                          )}
                        >
                          {typeConfig[assignment.assignmentType]?.text || assignment.assignmentType}
                        </span>
                        <span
                          className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full",
                            statusConfig[assignment.status]?.bg || "bg-gray-100 text-gray-700"
                          )}
                        >
                          {statusConfig[assignment.status]?.text || assignment.status}
                        </span>
                      </div>

                      <Link href={`/portal/teacher/assignments/${assignment.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-red-600 transition">
                          {assignment.title}
                        </h3>
                      </Link>

                      {assignment.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                          {assignment.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          {assignment.class.className}
                        </span>
                        {assignment.dueDate && (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Hạn: {format(new Date(assignment.dueDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {submittedCount} đã nộp
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          {gradedCount} đã chấm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/portal/teacher/assignments/${assignment.id}/submissions`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      >
                        Xem bài nộp
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(activeMenu === assignment.id ? null : assignment.id)
                          }
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {activeMenu === assignment.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                            <Link
                              href={`/portal/teacher/assignments/${assignment.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              Chi tiết
                            </Link>
                            <Link
                              href={`/portal/teacher/assignments/${assignment.id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit2 className="w-4 h-4" />
                              Chỉnh sửa
                            </Link>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal classes={classes} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

function CreateAssignmentModal({
  classes,
  onClose,
}: {
  classes: ClassInfo[]
  onClose: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: classes[0]?.id || "",
    assignmentType: "HOMEWORK",
    dueDate: "",
    maxScore: 100,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/portal/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error("Error creating assignment:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Tạo bài tập mới</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Bài tập tuần 1 - Từ vựng"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Mô tả yêu cầu bài tập..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lớp học <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.className}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại bài tập
              </label>
              <select
                value={formData.assignmentType}
                onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="HOMEWORK">Bài tập về nhà</option>
                <option value="QUIZ">Kiểm tra</option>
                <option value="PROJECT">Dự án</option>
                <option value="READING">Đọc hiểu</option>
                <option value="WRITING">Viết</option>
                <option value="SPEAKING">Nói</option>
                <option value="LISTENING">Nghe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hạn nộp
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm tối đa
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo bài tập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
