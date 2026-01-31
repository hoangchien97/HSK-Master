"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Download,
  Save,
} from "lucide-react"
import {
  PageHeader,
  Card,
  CardHeader,
  AttendanceTable,
  AttendanceSummary,
  EmptyState,
} from "@/app/components/portal/shared"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface StudentUser {
  id: string
  name?: string | null
  email: string
  image?: string | null
}

interface StudentData {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  user: StudentUser
}

interface ClassEnrollment {
  id: string
  student: StudentData
}

interface ClassData {
  id: string
  className: string
  classCode: string
  enrollments: ClassEnrollment[]
}

interface AttendanceStudentData {
  id: string
  studentCode: string
  firstName: string
  lastName: string
}

interface AttendanceRecord {
  id: string
  date: Date
  status: string
  student: AttendanceStudentData
  class: { className: string }
}

interface AttendanceClientProps {
  classes: ClassData[]
  recentAttendances: AttendanceRecord[]
}

export default function AttendanceClient({
  classes,
  recentAttendances,
}: AttendanceClientProps) {
  const router = useRouter()
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [attendance, setAttendance] = useState<
    Record<string, "present" | "absent" | "late" | "excused">
  >({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const selectedClass = classes.find((c) => c.id === selectedClassId)
  const students = selectedClass?.enrollments.map((e) => ({
    id: e.student.id,
    name: `${e.student.lastName} ${e.student.firstName}`,
    studentCode: e.student.studentCode,
    image: e.student.user.image,
  })) || []

  const handleAttendanceChange = (
    studentId: string,
    status: "present" | "absent" | "late" | "excused"
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleSubmit = async () => {
    if (!selectedClassId || !selectedDate) return

    setLoading(true)
    setMessage(null)

    try {
      const attendanceData = students.map((student) => ({
        studentId: student.id,
        status: attendance[student.id] || "present",
      }))

      const response = await fetch("/api/portal/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          date: selectedDate,
          attendance: attendanceData,
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Điểm danh thành công!" })
        router.refresh()
      } else {
        const data = await response.json()
        setMessage({ type: "error", text: data.error || "Điểm danh thất bại" })
      }
    } catch {
      setMessage({ type: "error", text: "Có lỗi xảy ra" })
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary
  const presentCount = Object.values(attendance).filter((s) => s === "present").length
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length
  const lateCount = Object.values(attendance).filter((s) => s === "late").length
  const excusedCount = Object.values(attendance).filter((s) => s === "excused").length

  // Initialize attendance with present for all students
  if (students.length > 0 && Object.keys(attendance).length === 0) {
    const initial: Record<string, "present"> = {}
    students.forEach((s) => {
      initial[s.id] = "present"
    })
    setAttendance(initial)
  }

  return (
    <div>
      <PageHeader
        title="Điểm danh"
        subtitle="Điểm danh học viên theo buổi học"
        actions={
          <button
            onClick={() => {/* Export logic */}}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        }
      />

      {/* Message */}
      {message && (
        <div
          className={cn(
            "mb-6 px-4 py-3 rounded-xl flex items-center gap-2",
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          )}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {classes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Chưa có lớp học nào"
          description="Tạo lớp học để bắt đầu điểm danh"
        />
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp học
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value)
                    setAttendance({})
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.className} ({classItem.classCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày điểm danh
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          {/* Summary */}
          {students.length > 0 && (
            <AttendanceSummary
              present={presentCount || students.length}
              absent={absentCount}
              late={lateCount}
              excused={excusedCount}
            />
          )}

          {/* Attendance Table */}
          <Card padding="none">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Danh sách học viên</h3>
                <p className="text-sm text-gray-500">
                  {selectedClass?.className} - {format(new Date(selectedDate), "EEEE, dd/MM/yyyy", { locale: vi })}
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || students.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu điểm danh</span>
                  </>
                )}
              </button>
            </div>

            {students.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Lớp học chưa có học viên</p>
              </div>
            ) : (
              <AttendanceTable
                students={students}
                attendance={Object.entries(attendance).map(([studentId, status]) => ({
                  studentId,
                  status,
                }))}
                onAttendanceChange={handleAttendanceChange}
              />
            )}
          </Card>

          {/* Recent Attendance History */}
          <Card>
            <CardHeader title="Lịch sử điểm danh gần đây" />
            {recentAttendances.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Chưa có lịch sử điểm danh"
                description="Điểm danh sẽ xuất hiện ở đây"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-500">Ngày</th>
                      <th className="text-left py-2 font-medium text-gray-500">Lớp</th>
                      <th className="text-left py-2 font-medium text-gray-500">Học viên</th>
                      <th className="text-left py-2 font-medium text-gray-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentAttendances.slice(0, 10).map((record) => (
                      <tr key={record.id}>
                        <td className="py-2">
                          {format(new Date(record.date), "dd/MM/yyyy", { locale: vi })}
                        </td>
                        <td className="py-2">{record.class.className}</td>
                        <td className="py-2">
                          {record.student.lastName} {record.student.firstName}
                        </td>
                        <td className="py-2">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              record.status === "PRESENT" && "bg-green-100 text-green-700",
                              record.status === "ABSENT" && "bg-red-100 text-red-700",
                              record.status === "LATE" && "bg-yellow-100 text-yellow-700",
                              record.status === "EXCUSED" && "bg-blue-100 text-blue-700"
                            )}
                          >
                            {record.status === "PRESENT" && "Có mặt"}
                            {record.status === "ABSENT" && "Vắng"}
                            {record.status === "LATE" && "Muộn"}
                            {record.status === "EXCUSED" && "Có phép"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
