"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Users
} from "lucide-react"
import { PageHeader, Card, EmptyState } from "@/app/components/portal/shared"
import { cn } from "@/lib/utils"

interface ClassInfo {
  id: string
  className: string
  classCode: string
}

interface StudentData {
  id: string
  name: string
  fullName?: string | null
  email: string
  phoneNumber?: string | null
  image?: string | null
  level?: string | null
  status: string
  classes: ClassInfo[]
}

interface StudentsClientProps {
  students: StudentData[]
}

export default function StudentsClient({ students }: StudentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("ALL")
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.fullName || student.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLevel = levelFilter === "ALL" || student.level === levelFilter

    return matchesSearch && matchesLevel
  })

  const statusConfig = {
    ACTIVE: { text: "Đang học", bg: "bg-green-100 text-green-700" },
    INACTIVE: { text: "Tạm nghỉ", bg: "bg-yellow-100 text-yellow-700" },
    GRADUATED: { text: "Tốt nghiệp", bg: "bg-blue-100 text-blue-700" },
  }

  return (
    <div>
      <PageHeader
        title="Quản lý học viên"
        subtitle={`Tổng cộng ${students.length} học viên`}
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm học viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          >
            <option value="ALL">Tất cả trình độ</option>
            <option value="HSK1">HSK 1</option>
            <option value="HSK2">HSK 2</option>
            <option value="HSK3">HSK 3</option>
            <option value="HSK4">HSK 4</option>
            <option value="HSK5">HSK 5</option>
            <option value="HSK6">HSK 6</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có học viên nào"
          description="Học viên sẽ xuất hiện khi họ đăng ký vào lớp của bạn"
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Học viên</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Trình độ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Lớp học</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Trạng thái</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {student.image ? (
                            <img
                              src={student.image}
                              alt={student.name || ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {(student.fullName || student.name).charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.fullName || student.name}
                          </p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {student.level ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {student.level}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {student.classes.slice(0, 2).map((classItem) => (
                          <span
                            key={classItem.id}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {classItem.classCode}
                          </span>
                        ))}
                        {student.classes.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{student.classes.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-block px-2.5 py-1 text-xs font-medium rounded-full",
                          statusConfig[student.status as keyof typeof statusConfig]?.bg ||
                            "bg-gray-100 text-gray-700"
                        )}
                      >
                        {statusConfig[student.status as keyof typeof statusConfig]?.text ||
                          student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`mailto:${student.email}`}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Gửi email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        {student.phoneNumber && (
                          <a
                            href={`tel:${student.phoneNumber}`}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Gọi điện"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenu(activeMenu === student.id ? null : student.id)
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeMenu === student.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                              <Link
                                href={`/portal/teacher/students/${student.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </Link>
                              <Link
                                href={`/portal/teacher/students/${student.id}/progress`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <GraduationCap className="w-4 h-4" />
                                Xem tiến độ
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
