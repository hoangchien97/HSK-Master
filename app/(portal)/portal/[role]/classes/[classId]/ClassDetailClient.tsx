"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Users,
  Calendar,
  BookOpen,
  UserPlus,
  Trash2,
  Mail,
  Phone,
  Search,
  X,
} from "lucide-react"
import { toast } from "react-toastify"
import { Button, Input, Label } from "@/app/components/common"
import { PageHeader } from "@/app/components/portal/common"

interface Student {
  id: string
  fullName: string | null
  email: string
  phoneNumber: string | null
}

interface Enrollment {
  id: string
  studentId: string
  enrolledAt: string
  student: Student
}

interface ClassData {
  id: string
  className: string
  classCode: string
  description: string | null
  level: string | null
  startDate: string
  endDate: string | null
  maxStudents: number
  status: string
  teacher: {
    id: string
    fullName: string | null
    email: string
  }
  enrollments: Enrollment[]
  _count: {
    schedules: number
    assignments: number
  }
}

interface SearchedUser {
  id: string
  email: string
  fullName: string | null
  role: string
  phoneNumber: string | null
}

export default function ClassDetailClient({ classId }: { classId: string }) {
  const router = useRouter()
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [studentEmail, setStudentEmail] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([])
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    fetchClassDetail()
  }, [classId])

  const fetchClassDetail = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/portal/classes/${classId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch class")
      }
      const data = await response.json()
      setClassData(data)
    } catch (error) {
      console.error("Error fetching class:", error)
      toast.error("Không thể tải thông tin lớp học")
      router.push("/portal/teacher/classes")
    } finally {
      setIsLoading(false)
    }
  }

  const searchStudents = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const response = await fetch(
        `/api/portal/users/search?q=${encodeURIComponent(query)}&role=STUDENT`
      )
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error("Error searching students:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleEnrollStudent = async (email: string) => {
    try {
      setEnrolling(true)
      const response = await fetch(`/api/portal/classes/${classId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail: email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to enroll student")
      }

      toast.success("Đã thêm học viên thành công!")
      setShowAddStudent(false)
      setStudentEmail("")
      setSearchResults([])
      fetchClassDetail()
    } catch (error: unknown) {
      console.error("Error enrolling student:", error)
      toast.error(error instanceof Error ? error.message : "Không thể thêm học viên")
    } finally {
      setEnrolling(false)
    }
  }

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${studentName} khỏi lớp học?`)) {
      return
    }

    try {
      const response = await fetch(
        `/api/portal/classes/${classId}/enrollments?studentId=${studentId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove student")
      }

      toast.success("Đã xóa học viên khỏi lớp")
      fetchClassDetail()
    } catch (error: unknown) {
      console.error("Error removing student:", error)
      toast.error(error instanceof Error ? error.message : "Không thể xóa học viên")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy lớp học</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/portal/teacher/classes"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {classData.className}
          </h1>
          <p className="text-gray-600">Mã lớp: {classData.classCode}</p>
        </div>
        <Button
          onClick={() => setShowAddStudent(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm học viên
        </Button>
      </div>

      {/* Class Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Học viên</p>
              <p className="text-2xl font-bold text-gray-900">
                {classData.enrollments.length}/{classData.maxStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Buổi học</p>
              <p className="text-2xl font-bold text-gray-900">
                {classData._count.schedules}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Bài tập</p>
              <p className="text-2xl font-bold text-gray-900">
                {classData._count.assignments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Cấp độ</p>
            <p className="text-xl font-bold text-red-600">
              {classData.level || "Chưa xác định"}
            </p>
          </div>
        </div>
      </div>

      {/* Class Description */}
      {classData.description && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Mô tả lớp học</h3>
          <p className="text-gray-600">{classData.description}</p>
        </div>
      )}

      {/* Student Roster */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Danh sách học viên</h3>
        </div>

        {classData.enrollments.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chưa có học viên nào trong lớp</p>
            <Button
              onClick={() => setShowAddStudent(true)}
              variant="outline"
              className="mt-4"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm học viên đầu tiên
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classData.enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-semibold">
                            {enrollment.student.fullName?.[0]?.toUpperCase() ||
                              enrollment.student.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.student.fullName || "Chưa cập nhật"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {enrollment.student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {enrollment.student.phoneNumber ? (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {enrollment.student.phoneNumber}
                        </div>
                      ) : (
                        <span className="text-gray-400">Chưa cập nhật</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(enrollment.enrolledAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() =>
                          handleRemoveStudent(
                            enrollment.studentId,
                            enrollment.student.fullName || enrollment.student.email
                          )
                        }
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Thêm học viên mới
              </h3>
              <button
                onClick={() => {
                  setShowAddStudent(false)
                  setStudentEmail("")
                  setSearchResults([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="studentEmail">Email hoặc tên học viên</Label>
                <div className="relative">
                  <Input
                    id="studentEmail"
                    type="text"
                    value={studentEmail}
                    onChange={(e) => {
                      setStudentEmail(e.target.value)
                      searchStudents(e.target.value)
                    }}
                    placeholder="Nhập email hoặc tên..."
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleEnrollStudent(user.email)}
                      disabled={enrolling}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <div className="font-medium text-gray-900">
                        {user.fullName || "Chưa cập nhật"}
                      </div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </button>
                  ))}
                </div>
              )}

              {searching && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddStudent(false)
                  setStudentEmail("")
                  setSearchResults([])
                }}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
