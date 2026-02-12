"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Users, Calendar, Edit, Trash2, Search } from "lucide-react"
import { toast } from "react-toastify"
// PageHeader removed - using inline heading
import { PageHeader } from "@/components/portal/common/PageHeader"
import CreateClassModal from "./CreateClassModal"
import api from "@/lib/http/client"

interface Class {
  id: string
  className: string
  classCode: string
  description?: string
  level?: string
  startDate: string
  endDate?: string
  status: string
  enrollments: Array<{
    id: string
    student: {
      id: string
      name: string
      email: string
    }
  }>
}

export default function TeacherClassManagement() {
  const [classes, setClasses] = useState<Class[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/portal/classes')
      setClasses(data as any[])
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Không thể tải danh sách lớp')
    }
  }

  const handleCreateClass = async (classData: any) => {
    try {
      await api.post('/portal/classes', classData, { meta: { loading: false } })

      toast.success('Đã tạo lớp học thành công!')
      fetchClasses()
      setShowCreateModal(false)
    } catch (error: any) {
      console.error('Error creating class:', error)
      toast.error(error?.normalized?.message || 'Không thể tạo lớp học')
    }
  }

  const filteredClasses = classes.filter(cls =>
    cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.classCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý lớp học"
        description="Danh sách lớp học bạn đang giảng dạy"
      >
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo lớp mới
          </button>
      </PageHeader>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchTerm ? 'Không tìm thấy lớp học' : 'Chưa có lớp học'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Tạo lớp học đầu tiên của bạn'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo lớp mới
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <Link
              key={cls.id}
              href={`/portal/teacher/classes/${cls.id}`}
              className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-red-300 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                    {cls.className}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{cls.classCode}</p>
                </div>
                {cls.level && (
                  <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                    {cls.level}
                  </span>
                )}
              </div>

              {/* Description */}
              {cls.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {cls.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {cls.enrollments.length} học viên
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(cls.startDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                  cls.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : cls.status === 'COMPLETED'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {cls.status === 'ACTIVE' ? 'Đang hoạt động' : cls.status === 'COMPLETED' ? 'Đã kết thúc' : 'Sắp diễn ra'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateClass}
      />
    </div>
  )
}
