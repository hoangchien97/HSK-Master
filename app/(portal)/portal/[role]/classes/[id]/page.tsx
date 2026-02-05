"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Calendar, MapPin, Edit, Trash2, UserPlus, Search, X } from "lucide-react"
import { toast } from "react-toastify"
import { PageHeader } from "@/app/components/portal/common"
import Link from "next/link"
import Image from "next/image"

interface Student {
  id: string
  fullName: string
  name: string
  email: string
  image?: string
  phoneNumber?: string
}

interface Enrollment {
  id: string
  status: string
  enrolledAt: string
  student: Student
}

interface ClassDetail {
  id: string
  className: string
  classCode: string
  description?: string
  level?: string
  maxStudents: number
  startDate: string
  endDate?: string
  status: string
  enrollments: Enrollment[]
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [classData, setClassData] = useState<ClassDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [studentEmail, setStudentEmail] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (classId) {
      fetchClassDetail()
    }
  }, [classId])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (studentEmail.length >= 3) {
        searchStudents()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [studentEmail])

  const fetchClassDetail = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/portal/classes')
      if (response.ok) {
        const classes = await response.json()
        const foundClass = classes.find((c: ClassDetail) => c.id === classId)
        if (foundClass) {
          setClassData(foundClass)
        } else {
          toast.error('Không tìm thấy lớp học')
          router.push('/portal/teacher/classes')
        }
      }
    } catch (error) {
      console.error('Error fetching class:', error)
      toast.error('Không thể tải thông tin lớp')
    } finally {
      setIsLoading(false)
    }
  }

  const searchStudents = async () => {
    try {
      setIsSearching(true)
      const response = await fetch(`/api/portal/enrollments?email=${encodeURIComponent(studentEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.students || [])
      }
    } catch (error) {
      console.error('Error searching students:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddStudent = async (email: string) => {
    try {
      setIsAdding(true)
      const response = await fetch('/api/portal/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, studentEmail: email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add student')
      }

      toast.success('Đã thêm học viên vào lớp!')
      setShowAddStudent(false)
      setStudentEmail('')
      setSearchResults([])
      fetchClassDetail()
    } catch (error: any) {
      console.error('Error adding student:', error)
      toast.error(error.message || 'Không thể thêm học viên')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveStudent = async (enrollmentId: string, studentName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa ${studentName} khỏi lớp?`)) {
      return
    }

    try {
      const response = await fetch(`/api/portal/enrollments?enrollmentId=${enrollmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove student')
      }

      toast.success('Đã xóa học viên khỏi lớp')
      fetchClassDetail()
    } catch (error) {
      console.error('Error removing student:', error)
      toast.error('Không thể xóa học viên')
    }
  }

  if (isLoading || !classData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const activeEnrollments = classData.enrollments.filter(e => e.status === 'ENROLLED')

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/portal/teacher/classes"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại danh sách lớp
      </Link>

      <PageHeader
        title={classData.className}
        description={classData.classCode}
      >
        <button
          onClick={() => setShowAddStudent(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Thêm học viên
        </button>
      </PageHeader>

      {/* Class Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Trình độ</h3>
            <p className="text-lg font-semibold text-gray-900">{classData.level || 'Chưa xác định'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Sĩ số</h3>
            <p className="text-lg font-semibold text-gray-900">
              {activeEnrollments.length}/{classData.maxStudents} học viên
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Thời gian</h3>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(classData.startDate).toLocaleDateString('vi-VN')}
              {classData.endDate && ` - ${new Date(classData.endDate).toLocaleDateString('vi-VN')}`}
            </p>
          </div>
        </div>

        {classData.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Mô tả</h3>
            <p className="text-gray-700">{classData.description}</p>
          </div>
        )}
      </div>

      {/* Roster */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Danh sách học viên ({activeEnrollments.length})</h2>
        </div>

        {activeEnrollments.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có học viên</h3>
            <p className="text-gray-500 mb-4">Thêm học viên đầu tiên vào lớp</p>
            <button
              onClick={() => setShowAddStudent(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Thêm học viên
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activeEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {enrollment.student.image ? (
                      <Image
                        src={enrollment.student.image}
                        alt={enrollment.student.fullName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-600">
                        {enrollment.student.fullName?.charAt(0) || enrollment.student.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {enrollment.student.fullName || enrollment.student.name}
                    </h4>
                    <p className="text-sm text-gray-500">{enrollment.student.email}</p>
                    {enrollment.student.phoneNumber && (
                      <p className="text-sm text-gray-500">{enrollment.student.phoneNumber}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Tham gia: {new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')}
                  </span>
                  <button
                    onClick={() => handleRemoveStudent(enrollment.id, enrollment.student.fullName || enrollment.student.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddStudent(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Thêm học viên</h3>
              <button
                onClick={() => setShowAddStudent(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Nhập email học viên..."
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {isSearching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleAddStudent(student.email)}
                      disabled={isAdding}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {student.image ? (
                          <Image src={student.image} alt={student.fullName} width={40} height={40} />
                        ) : (
                          <span className="text-sm font-semibold text-gray-600">
                            {student.fullName?.charAt(0) || student.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{student.fullName || student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {studentEmail.length >= 3 && !isSearching && searchResults.length === 0 && (
                <p className="text-center text-gray-500 py-4">Không tìm thấy học viên</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
