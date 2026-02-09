"use client"

import Link from "next/link"
import {
  Calendar,
  FileText,
  Languages,
  Trophy,
  Clock,
  ArrowRight,
  Flame,
  Target,
  CheckCircle,
  Play,
} from "lucide-react"
import { Card, CardHeader, CardBody, Chip } from "@heroui/react"
import { PageHeader } from "@/components/portal/common/PageHeader"
import { StatCard } from "@/components/portal/common/StatCard"
import { DataCard } from "@/components/portal/common/DataCard"
import { EmptyState } from "@/components/portal/common/EmptyState"

interface StudentDashboardProps {
  studentName?: string
  stats?: {
    wordsLearned: number
    streakDays: number
    completedLessons: number
    pendingAssignments: number
    overallProgress: number
  }
}

export default function StudentDashboard({ studentName, stats }: StudentDashboardProps) {
  // Demo stats - replace with actual data
  const dashboardStats = stats || {
    wordsLearned: 156,
    streakDays: 7,
    completedLessons: 12,
    pendingAssignments: 2,
    overallProgress: 35,
  }

  const upcomingClasses = [
    {
      id: 1,
      className: "HSK 1 - Lớp Sáng",
      teacher: "Thầy Nguyễn Văn An",
      time: "08:00 - 10:00",
      date: "Hôm nay",
      room: "Phòng A1",
    },
    {
      id: 2,
      className: "HSK 1 - Lớp Sáng",
      teacher: "Thầy Nguyễn Văn An",
      time: "08:00 - 10:00",
      date: "Ngày mai",
      room: "Phòng A1",
    },
  ]

  const pendingAssignments = [
    {
      id: 1,
      title: "Bài tập từ vựng HSK 1 - Tuần 4",
      className: "HSK 1",
      dueDate: "Còn 2 ngày",
      priority: "medium",
    },
    {
      id: 2,
      title: "Bài kiểm tra ngữ pháp",
      className: "HSK 1",
      dueDate: "Còn 5 ngày",
      priority: "low",
    },
  ]

  const recentVocabulary = [
    { word: "你好", pinyin: "nǐ hǎo", meaning: "Xin chào", status: "mastered" },
    { word: "谢谢", pinyin: "xiè xiè", meaning: "Cảm ơn", status: "mastered" },
    { word: "学习", pinyin: "xué xí", meaning: "Học tập", status: "learning" },
    { word: "汉语", pinyin: "hàn yǔ", meaning: "Tiếng Trung", status: "new" },
  ]

  const learningProgress = [
    { skill: "Từ vựng", progress: 45, color: "bg-blue-500" },
    { skill: "Ngữ pháp", progress: 32, color: "bg-green-500" },
    { skill: "Nghe", progress: 28, color: "bg-purple-500" },
    { skill: "Nói", progress: 20, color: "bg-orange-500" },
  ]

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
          value={dashboardStats.wordsLearned}
          icon={<Languages className="w-6 h-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Streak"
          value={`${dashboardStats.streakDays} ngày`}
          icon={<Flame className="w-6 h-6" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Bài học hoàn thành"
          value={dashboardStats.completedLessons}
          icon={<CheckCircle className="w-6 h-6" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Bài tập chờ"
          value={dashboardStats.pendingAssignments}
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
            <p className="text-red-100 mt-1">Bạn đang ở bài học 13 - Từ vựng về gia đình</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span className="text-sm">Mục tiêu hôm nay: 10 từ mới</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">15 phút học</span>
              </div>
            </div>
          </div>
          <Link
            href="/portal/student/learn"
            className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors shrink-0"
          >
            <Play className="w-5 h-5" />
            Học ngay
          </Link>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Tiến độ tổng thể</span>
            <span>{dashboardStats.overallProgress}%</span>
          </div>
          <div className="h-2 bg-red-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${dashboardStats.overallProgress}%` }}
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
                    <p className="text-xs text-gray-400">{schedule.date} • {schedule.time}</p>
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
                    assignment.priority === "high" ? "bg-red-100" :
                    assignment.priority === "medium" ? "bg-yellow-100" : "bg-blue-100"
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      assignment.priority === "high" ? "text-red-600" :
                      assignment.priority === "medium" ? "text-yellow-600" : "text-blue-600"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{assignment.title}</h4>
                    <p className="text-sm text-gray-500">{assignment.className}</p>
                    <p className="text-xs text-orange-600 font-medium">{assignment.dueDate}</p>
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
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  vocab.status === "mastered" ? "bg-green-100 text-green-700" :
                  vocab.status === "learning" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {vocab.status === "mastered" ? "Đã thuộc" :
                   vocab.status === "learning" ? "Đang học" : "Mới"}
                </span>
              </div>
            ))}
          </div>
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

          {/* Weekly Goal */}
          <div className="mt-6 p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Mục tiêu tuần này</p>
                <p className="text-sm text-gray-500">Hoàn thành 50 từ mới (32/50)</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "64%" }} />
            </div>
          </div>
        </DataCard>
      </div>
    </div>
  )
}
