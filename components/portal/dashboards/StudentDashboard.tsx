"use client"

import Link from "next/link"
import {
  Calendar,
  FileText,
  Languages,
  Trophy,
  ArrowRight,
  Flame,
  Target,
  CheckCircle,
  Play,
  BookOpen,
} from "lucide-react"
import { PageHeader } from "@/components/portal/common/PageHeader"
import { StatCard } from "@/components/portal/common/StatCard"
import { DataCard } from "@/components/portal/common/DataCard"
import { EmptyState } from "@/components/portal/common/EmptyState"

/* ─────────── Types from dashboard service ─────────── */

interface DashboardStats {
  wordsLearned: number
  streakDays: number
  completedLessons: number
  pendingAssignments: number
  overallProgress: number
}

interface ContinueLearning {
  lessonId: string
  lessonSlug: string | null
  lessonTitle: string
  lessonOrder: number
  courseSlug: string | null
  courseLevel: string | null
  mode: string
  masteredCount: number
  totalCount: number
}

interface UpcomingClass {
  id: string
  className: string
  teacher: string
  startTime: string
  endTime: string
  room: string | null
}

interface PendingAssignment {
  id: string
  title: string
  className: string
  dueDate: string | null
  type: string
}

interface RecentVocab {
  word: string
  pinyin: string | null
  meaning: string
  status: string
  masteryScore: number
}

interface LearningProgressItem {
  skill: string
  progress: number
  color: string
}

interface StudentDashboardProps {
  studentName?: string
  stats: DashboardStats
  continueLearning: ContinueLearning | null
  upcomingClasses: UpcomingClass[]
  pendingAssignments: PendingAssignment[]
  recentVocabulary: RecentVocab[]
  learningProgress: LearningProgressItem[]
}

/* ─────────── Helpers ─────────── */

const MODE_LABELS: Record<string, string> = {
  FLASHCARD: "Flashcard",
  QUIZ: "Quiz",
  LISTEN: "Nghe",
  WRITE: "Viết",
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "Không có hạn"
  const due = new Date(dateStr)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return "Đã quá hạn"
  if (diffDays === 0) return "Hôm nay"
  if (diffDays === 1) return "Ngày mai"
  return `Còn ${diffDays} ngày`
}

function formatScheduleDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  if (isToday) return "Hôm nay"
  if (isTomorrow) return "Ngày mai"
  return date.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

function getStatusLabel(status: string): { label: string; className: string } {
  switch (status) {
    case "MASTERED": return { label: "Đã thuộc", className: "bg-green-100 text-green-700" }
    case "LEARNING": return { label: "Đang học", className: "bg-yellow-100 text-yellow-700" }
    default: return { label: "Mới", className: "bg-blue-100 text-blue-700" }
  }
}

function getDuePriority(dateStr: string | null): string {
  if (!dateStr) return "low"
  const diffMs = new Date(dateStr).getTime() - Date.now()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return "high"
  if (diffDays <= 3) return "medium"
  return "low"
}

/* ─────────── Component ─────────── */

export default function StudentDashboard({
  studentName,
  stats,
  continueLearning,
  upcomingClasses,
  pendingAssignments,
  recentVocabulary,
  learningProgress,
}: StudentDashboardProps) {
  const levelSlug = continueLearning?.courseLevel
    ? `hsk${continueLearning.courseLevel}`
    : null
  const continueUrl = continueLearning && levelSlug
    ? `/portal/student/practice/${levelSlug}/${continueLearning.lessonSlug}?tab=${continueLearning.mode}`
    : "/portal/student/practice"

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chào ${studentName || "bạn"}! 👋`}
        description="Tiếp tục hành trình học tiếng Trung của bạn"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Từ vựng đã học"
          value={stats.wordsLearned}
          icon={<Languages className="w-6 h-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Streak"
          value={`${stats.streakDays} ngày`}
          icon={<Flame className="w-6 h-6" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Bài học hoàn thành"
          value={stats.completedLessons}
          icon={<CheckCircle className="w-6 h-6" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Bài tập chờ"
          value={stats.pendingAssignments}
          icon={<FileText className="w-6 h-6" />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      {/* Continue Learning Banner */}
      <div className="bg-linear-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Tiếp tục học tập</h3>
            {continueLearning ? (
              <>
                <p className="text-red-100 mt-1">
                  Bài {continueLearning.lessonOrder} – {continueLearning.lessonTitle}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm">
                      {MODE_LABELS[continueLearning.mode] ?? continueLearning.mode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <span className="text-sm">
                      {continueLearning.masteredCount}/{continueLearning.totalCount} từ
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-red-100 mt-1">Bắt đầu một bài học mới nào!</p>
            )}
          </div>
          <Link
            href={continueUrl}
            className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors shrink-0"
          >
            <Play className="w-5 h-5" />
            {continueLearning ? "Tiếp tục" : "Bắt đầu"}
          </Link>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Tiến độ tổng thể</span>
            <span>{stats.overallProgress}%</span>
          </div>
          <div className="h-2 bg-red-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <DataCard
          title="Lịch học sắp tới"
          action={
            <Link href="/portal/student/schedule" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              Xem lịch <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          {upcomingClasses.length > 0 ? (
            <div className="space-y-3">
              {upcomingClasses.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{schedule.className}</h4>
                    <p className="text-sm text-gray-500">{schedule.teacher}</p>
                    <p className="text-xs text-gray-400">
                      {formatScheduleDate(schedule.startTime)} • {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      {schedule.room ? ` • ${schedule.room}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              title="Không có lớp học sắp tới"
            />
          )}
        </DataCard>

        {/* Pending Assignments */}
        <DataCard
          title="Bài tập cần hoàn thành"
          action={
            <Link href="/portal/student/assignments" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          {pendingAssignments.length > 0 ? (
            <div className="space-y-3">
              {pendingAssignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/portal/student/assignments/${assignment.id}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    getDuePriority(assignment.dueDate) === "high" ? "bg-red-100" :
                    getDuePriority(assignment.dueDate) === "medium" ? "bg-yellow-100" : "bg-blue-100"
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      getDuePriority(assignment.dueDate) === "high" ? "text-red-600" :
                      getDuePriority(assignment.dueDate) === "medium" ? "text-yellow-600" : "text-blue-600"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{assignment.title}</h4>
                    <p className="text-sm text-gray-500">{assignment.className}</p>
                    <p className="text-xs text-orange-600 font-medium">{formatDueDate(assignment.dueDate)}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle className="w-8 h-8" />}
              title="Không có bài tập nào"
              description="Bạn đã hoàn thành tất cả bài tập!"
            />
          )}
        </DataCard>
      </div>

      {/* Vocabulary and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vocabulary */}
        <DataCard
          title="Từ vựng gần đây"
          action={
            <Link href="/portal/student/vocabulary" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              Ôn tập <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          {recentVocabulary.length > 0 ? (
          <div className="space-y-3">
            {recentVocabulary.map((vocab, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-red-600">{vocab.word.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{vocab.word}</span>
                    <span className="text-sm text-gray-500">{vocab.pinyin}</span>
                  </div>
                  <p className="text-sm text-gray-500">{vocab.meaning}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusLabel(vocab.status).className}`}>
                  {getStatusLabel(vocab.status).label}
                </span>
              </div>
            ))}
          </div>
          ) : (
            <EmptyState
              icon={<Languages className="w-8 h-8" />}
              title="Chưa có từ vựng"
              description="Bắt đầu luyện tập để xem từ vựng gần đây"
            />
          )}
        </DataCard>

        {/* Learning Progress */}
        <DataCard
          title="Tiến độ học tập"
          action={
            <Link href="/portal/student/progress" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              Chi tiết <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          {learningProgress.length > 0 ? (
            <div className="space-y-4">
              {learningProgress.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.skill}</span>
                    <span className="text-sm text-gray-500">{item.progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.color}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Target className="w-8 h-8" />}
              title="Chưa có dữ liệu"
              description="Hoàn thành bài luyện tập để xem tiến độ"
            />
          )}

          {/* Weekly Goal */}
          {stats.wordsLearned > 0 && (
          <div className="mt-6 p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Tổng quan</p>
                <p className="text-sm text-gray-500">
                  {stats.wordsLearned} từ đã học • {stats.completedLessons} bài hoàn thành
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.overallProgress}%` }} />
            </div>
          </div>
          )}
        </DataCard>
      </div>
    </div>
  )
}
