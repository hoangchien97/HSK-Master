"use client"

import Link from "next/link"
import {
  Users,
  Calendar,
  ClipboardCheck,
  FileText,
  BookOpen,
  Clock,
  TrendingUp,
  ArrowRight,
  School,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Card, CardHeader, CardBody, Chip } from "@heroui/react"
import { PageHeader } from "@/components/portal/common/PageHeader"
import { StatCard } from "@/components/portal/common/StatCard"
import { DataCard } from "@/components/portal/common/DataCard"
import { EmptyState } from "@/components/portal/common/EmptyState"

interface TeacherDashboardProps {
  teacherName?: string
  stats?: {
    totalClasses: number
    totalStudents: number
    upcomingClasses: number
    pendingAssignments: number
    attendanceRate: number
  }
}

export default function TeacherDashboard({ teacherName, stats }: TeacherDashboardProps) {
  // Demo stats - replace with actual data
  const dashboardStats = stats || {
    totalClasses: 4,
    totalStudents: 28,
    upcomingClasses: 3,
    pendingAssignments: 5,
    attendanceRate: 92,
  }

  const todaySchedule = [
    {
      id: 1,
      className: "HSK 1 - Lớp Sáng",
      time: "08:00 - 10:00",
      room: "Phòng A1",
      students: 12,
      status: "upcoming",
    },
    {
      id: 2,
      className: "HSK 2 - Lớp Tối",
      time: "18:30 - 20:30",
      room: "Phòng B2",
      students: 15,
      status: "upcoming",
    },
  ]

  const recentSubmissions = [
    {
      id: 1,
      student: "Nguyễn Văn A",
      assignment: "Bài tập từ vựng HSK 1 - Tuần 3",
      submittedAt: "10 phút trước",
      status: "pending",
    },
    {
      id: 2,
      student: "Trần Thị B",
      assignment: "Bài tập ngữ pháp HSK 2",
      submittedAt: "1 giờ trước",
      status: "pending",
    },
    {
      id: 3,
      student: "Lê Văn C",
      assignment: "Bài kiểm tra giữa kỳ HSK 1",
      submittedAt: "2 giờ trước",
      status: "graded",
    },
  ]

  const classOverview = [
    { name: "HSK 1 - Sáng", students: 12, attendance: 95, progress: 45 },
    { name: "HSK 2 - Tối", students: 15, attendance: 88, progress: 32 },
    { name: "HSK 3 - Chiều", students: 8, attendance: 92, progress: 60 },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Xin chào${teacherName ? `, ${teacherName}` : ""}!`}
        description="Quản lý lớp học và theo dõi tiến độ học viên"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng lớp học"
          value={dashboardStats.totalClasses}
          icon={<School className="w-6 h-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Học viên"
          value={dashboardStats.totalStudents}
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Lớp học hôm nay"
          value={dashboardStats.upcomingClasses}
          icon={<Calendar className="w-6 h-6" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Tỷ lệ điểm danh"
          value={`${dashboardStats.attendanceRate}%`}
          icon={<ClipboardCheck className="w-6 h-6" />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          trend={{ value: 2, label: "so với tuần trước" }}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <DataCard
          title="Lịch dạy hôm nay"
          action={
            <Link href="/portal/teacher/schedule" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              Xem lịch <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          {todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{schedule.className}</h4>
                    <p className="text-sm text-gray-500">{schedule.time} • {schedule.room}</p>
                    <p className="text-xs text-gray-400">{schedule.students} học viên</p>
                  </div>
                  <Link
                    href={`/portal/teacher/classes/${schedule.id}`}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Xem lớp
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              title="Không có lớp học hôm nay"
              description="Bạn không có lịch dạy nào trong ngày hôm nay"
            />
          )}
        </DataCard>

        {/* Recent Submissions */}
        <DataCard
          title="Bài tập mới nộp"
          action={
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
              {dashboardStats.pendingAssignments} chờ chấm
            </span>
          }
        >
          {recentSubmissions.length > 0 ? (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    submission.status === "pending" ? "bg-yellow-100" : "bg-green-100"
                  }`}>
                    {submission.status === "pending" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{submission.student}</p>
                    <p className="text-sm text-gray-500 truncate">{submission.assignment}</p>
                    <p className="text-xs text-gray-400">{submission.submittedAt}</p>
                  </div>
                  {submission.status === "pending" && (
                    <Link
                      href={`/portal/teacher/assignments/${submission.id}`}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Chấm điểm
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title="Chưa có bài nộp mới"
            />
          )}
        </DataCard>
      </div>

      {/* Class Overview */}
      <DataCard
        title="Tổng quan lớp học"
        action={
          <Link href="/portal/teacher/classes" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
            Quản lý lớp <ArrowRight className="w-4 h-4" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Lớp học</th>
                <th className="pb-3 font-medium text-center">Học viên</th>
                <th className="pb-3 font-medium text-center">Điểm danh</th>
                <th className="pb-3 font-medium">Tiến độ</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {classOverview.map((cls, index) => (
                <tr key={index} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <span className="font-medium text-gray-900">{cls.name}</span>
                  </td>
                  <td className="py-3 text-center text-gray-600">{cls.students}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cls.attendance >= 90 ? "bg-green-100 text-green-700" :
                      cls.attendance >= 80 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>
                      {cls.attendance}%
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${cls.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10">{cls.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Link href={`/portal/teacher/classes/${index + 1}`} className="text-red-600 hover:text-red-700">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataCard>
    </div>
  )
}
