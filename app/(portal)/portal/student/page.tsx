import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PrismaClient } from "@prisma/client"
import {
  Book,
  Calendar,
  FileText,
  Bookmark,
  Trophy,
  ChevronRight,
  GraduationCap,
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const prisma = new PrismaClient()

async function getStudentDashboardData(email: string) {
  const user = await prisma.portalUser.findUnique({
    where: { email },
    include: {
      student: {
        include: {
          enrollments: {
            include: {
              class: {
                include: {
                  assignments: {
                    include: { submissions: true },
                  },
                  schedules: {
                    where: { startTime: { gte: new Date() } },
                    orderBy: { startTime: "asc" },
                    take: 3,
                  },
                },
              },
            },
          },
          submissions: true,
          vocabularies: true,
          attendances: {
            where: { status: "PRESENT" },
          },
        },
      },
    },
  })

  const student = user?.student
  if (!student) return null

  // Calculate stats
  const totalAssignments = student.enrollments.flatMap((e: { class: { assignments: { id: string; title: string; dueDate: Date | null }[] } }) => e.class.assignments)
  const submittedAssignments = new Set(student.submissions.map((s: { assignmentId: string }) => s.assignmentId))
  const pendingAssignments = totalAssignments.filter(
    (a: { id: string; title: string; dueDate: Date | null }) => !submittedAssignments.has(a.id) && a.dueDate && new Date(a.dueDate) >= new Date()
  )
  const gradedSubmissions = student.submissions.filter(
    (s: { score: number | null }) => s.score !== null && s.score !== undefined
  )
  const avgScore =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce((sum: number, s: { score: number | null }) => sum + (s.score || 0), 0) /
            gradedSubmissions.length
        )
      : null

  const upcomingSchedules = student.enrollments.flatMap((e: { class: { className: string; schedules: { id: string; title: string; startTime: Date }[] } }) =>
    e.class.schedules.map((s: { id: string; title: string; startTime: Date }) => ({
      ...s,
      className: e.class.className,
    }))
  ).sort((a: { startTime: Date }, b: { startTime: Date }) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 5)

  const recentAssignments = totalAssignments
    .sort((a: { dueDate: Date | null }, b: { dueDate: Date | null }) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    .slice(0, 5)
    .map((a: { id: string; title: string; dueDate: Date | null }) => ({
      ...a,
      submitted: submittedAssignments.has(a.id),
      className: student.enrollments.find((e: { class: { assignments: { id: string }[] } }) =>
        e.class.assignments.some((ca: { id: string }) => ca.id === a.id)
      )?.class.className || "",
    }))

  return {
    stats: {
      completedLessons: student.attendances.length,
      vocabularyLearned: student.vocabularies.filter((p: { mastery: string }) => p.mastery === "MASTERED").length,
      pendingAssignments: pendingAssignments.length,
      avgScore,
    },
    upcomingSchedules,
    recentAssignments,
    enrolledClasses: student.enrollments.length,
  }
}

export default async function StudentDashboard() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/portal/login")
  }

  const data = await getStudentDashboardData(session.user.email)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Xin chào, {session.user.name || "Học sinh"}!</h1>
        <p className="mt-2 text-gray-600">Tiếp tục hành trình học tiếng Trung của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.stats.completedLessons || 0}</div>
          <div className="text-sm text-gray-500">Buổi học tham gia</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <Book className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.stats.vocabularyLearned || 0}</div>
          <div className="text-sm text-gray-500">Từ vựng thành thạo</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.stats.pendingAssignments || 0}</div>
          <div className="text-sm text-gray-500">Bài tập chờ nộp</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {data?.stats.avgScore !== null && data?.stats.avgScore !== undefined ? data.stats.avgScore : "-"}
          </div>
          <div className="text-sm text-gray-500">Điểm trung bình</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/portal/student/vocabulary"
          className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-5 hover:from-red-600 hover:to-red-700 transition group"
        >
          <Book className="w-8 h-8 mb-3 opacity-80" />
          <div className="font-semibold">Từ vựng HSK</div>
          <div className="text-sm opacity-80">Học và ôn tập</div>
        </Link>

        <Link
          href="/portal/student/schedule"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 hover:from-blue-600 hover:to-blue-700 transition group"
        >
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <div className="font-semibold">Lịch học</div>
          <div className="text-sm opacity-80">Xem lịch của bạn</div>
        </Link>

        <Link
          href="/portal/student/assignments"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-5 hover:from-green-600 hover:to-green-700 transition group"
        >
          <FileText className="w-8 h-8 mb-3 opacity-80" />
          <div className="font-semibold">Bài tập</div>
          <div className="text-sm opacity-80">Nộp bài và xem điểm</div>
        </Link>

        <Link
          href="/portal/student/bookmarks"
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl p-5 hover:from-yellow-600 hover:to-yellow-700 transition group"
        >
          <Bookmark className="w-8 h-8 mb-3 opacity-80" />
          <div className="font-semibold">Đã lưu</div>
          <div className="text-sm opacity-80">Từ vựng bookmark</div>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lịch học sắp tới</h2>
            <Link
              href="/portal/student/schedule"
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {(!data?.upcomingSchedules || data.upcomingSchedules.length === 0) ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có lịch học</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingSchedules.map((schedule: { id: string; title: string; startTime: Date; className: string }) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xs text-red-600 font-medium">
                      {format(new Date(schedule.startTime), "MMM", { locale: vi })}
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {format(new Date(schedule.startTime), "dd")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {schedule.title}
                    </div>
                    <div className="text-sm text-gray-500">{schedule.className}</div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {format(new Date(schedule.startTime), "HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Bài tập gần đây</h2>
            <Link
              href="/portal/student/assignments"
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {(!data?.recentAssignments || data.recentAssignments.length === 0) ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có bài tập</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentAssignments.map((assignment: { id: string; title: string; dueDate: Date | null; submitted: boolean; className: string }) => (
                <div
                  key={assignment.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      assignment.submitted
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {assignment.title}
                    </div>
                    <div className="text-sm text-gray-500">{assignment.className}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {assignment.dueDate ? format(new Date(assignment.dueDate), "dd/MM") : "-"}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        assignment.submitted ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      {assignment.submitted ? "Đã nộp" : "Chờ nộp"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
