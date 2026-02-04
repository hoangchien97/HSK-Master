"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Users,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Eye
} from "lucide-react"
import { PageHeader, Card, EmptyState } from "@/app/components/portal/shared"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface ClassEnrollment {
  id: string
  student: {
    id: string
    fullName: string | null
    name: string
  }
}

interface ClassData {
  id: string
  className: string
  classCode: string
  description?: string | null
  level?: string | null
  startDate: Date
  endDate?: Date | null
  maxStudents: number
  status: string
  enrollments: ClassEnrollment[]
}

interface ClassesClientProps {
  classes: ClassData[]
}

export default function ClassesClient({ classes }: ClassesClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const filteredClasses = classes.filter(
    (c) =>
      c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.classCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusConfig = {
    ACTIVE: { text: "Đang hoạt động", bg: "bg-green-100 text-green-700" },
    COMPLETED: { text: "Hoàn thành", bg: "bg-gray-100 text-gray-700" },
    CANCELLED: { text: "Đã hủy", bg: "bg-red-100 text-red-700" },
  }

  return (
    <div>
      <PageHeader
        title="Quản lý lớp học"
        subtitle="Tạo và quản lý các lớp học của bạn"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Tạo lớp mới
          </button>
        }
      />

      {/* Search & Filter */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm lớp học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có lớp học nào"
          description="Tạo lớp học đầu tiên để bắt đầu quản lý học viên"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Tạo lớp mới
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <Card key={classItem.id} hover className="relative">
              {/* Menu Button */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setActiveMenu(activeMenu === classItem.id ? null : classItem.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {activeMenu === classItem.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                    <Link
                      href={`/portal/teacher/classes/${classItem.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      Chi tiết
                    </Link>
                    <Link
                      href={`/portal/teacher/classes/${classItem.id}/edit`}
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

              <Link href={`/portal/teacher/classes/${classItem.id}`}>
                {/* Level Badge */}
                {classItem.level && (
                  <span className="inline-block px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full mb-3">
                    {classItem.level}
                  </span>
                )}

                {/* Class Name */}
                <h3 className="text-lg font-semibold text-gray-900 pr-8">
                  {classItem.className}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Mã: {classItem.classCode}</p>

                {/* Status */}
                <div className="mt-3">
                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                      statusConfig[classItem.status as keyof typeof statusConfig]?.bg ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusConfig[classItem.status as keyof typeof statusConfig]?.text ||
                      classItem.status}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {classItem.enrollments.length}/{classItem.maxStudents} học viên
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(classItem.startDate), "dd/MM/yyyy", { locale: vi })}</span>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <CreateClassModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}

function CreateClassModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    className: "",
    classCode: "",
    description: "",
    level: "HSK1",
    maxStudents: 20,
    startDate: "",
    endDate: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/portal/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.refresh()
        onClose()
      }
    } catch (error) {
      console.error("Error creating class:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Tạo lớp học mới</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên lớp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="HSK 1 - Sáng thứ 2, 4, 6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã lớp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.classCode}
              onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="HSK1-MWF-AM-2025"
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
              placeholder="Mô tả về lớp học..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trình độ
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="HSK1">HSK 1</option>
                <option value="HSK2">HSK 2</option>
                <option value="HSK3">HSK 3</option>
                <option value="HSK4">HSK 4</option>
                <option value="HSK5">HSK 5</option>
                <option value="HSK6">HSK 6</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số học viên tối đa
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
              {loading ? "Đang tạo..." : "Tạo lớp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
