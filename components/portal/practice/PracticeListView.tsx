"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardBody } from "@heroui/react"
import { PenLine, GraduationCap, BookOpen, Trophy, Clock } from "lucide-react"
import { toast } from "react-toastify"
import { fetchCoursesForPractice } from "@/actions/practice.actions"
import { usePortalUI } from "@/providers/portal-ui-provider"
import PracticeCourseAccordion from "./PracticeCourseAccordion"

interface LessonItem {
  id: string
  slug?: string | null
  title: string
  titleChinese: string | null
  order: number
  _count: { vocabularies: number }
}

interface CourseItem {
  id: string
  title: string
  slug: string
  level: string | null
  lessonCount: number
  vocabularyCount: number
  hskLevel: { level: number; badge: string; badgeColor: string; accentColor: string } | null
  lessons: LessonItem[]
}

interface ProgressItem {
  lessonId: string
  masteryPercent: number
  learnedCount: number
  masteredCount: number
  totalTimeSec?: number
}

export default function PracticeListView() {
  const { startLoading, stopLoading } = usePortalUI()
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, ProgressItem>>({})
  const didLoad = useRef(false)

  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true

    let cancelled = false
    startLoading()
    fetchCoursesForPractice().then((result) => {
      if (cancelled) return
      if (result.success && result.data) {
        setCourses(result.data.courses as unknown as CourseItem[])
        setProgressMap(result.data.progressMap as unknown as Record<string, ProgressItem>)
      } else {
        toast.error(result.error || "Không thể tải dữ liệu")
      }
      stopLoading()
    })
    return () => { cancelled = true }
  }, [startLoading, stopLoading])

  // Compute overall stats
  const stats = useMemo(() => {
    const allLessonIds = courses.flatMap((c) => c.lessons.map((l) => l.id))
    const totalLessons = allLessonIds.length
    const lessonsStarted = allLessonIds.filter((id) => progressMap[id]?.learnedCount > 0).length
    const lessonsMastered = allLessonIds.filter((id) => (progressMap[id]?.masteryPercent ?? 0) >= 80).length
    const totalTimeSec = Object.values(progressMap).reduce((sum, p) => sum + (p.totalTimeSec ?? 0), 0)
    const avgMastery = totalLessons > 0
      ? allLessonIds.reduce((sum, id) => sum + (progressMap[id]?.masteryPercent ?? 0), 0) / totalLessons
      : 0
    return { totalLessons, lessonsStarted, lessonsMastered, totalTimeSec, avgMastery }
  }, [courses, progressMap])

  const formatTime = (sec: number) => {
    if (sec < 60) return `${sec}s`
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min} phút`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}p` : `${h} giờ`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <PenLine className="w-6 h-6 text-primary" />
          Luyện tập
        </h1>
        <p className="text-default-500 text-sm mt-1">
          Chọn bài học để luyện tập từ vựng, flashcard, quiz và hơn thế nữa
        </p>
      </div>

      {/* Courses */}
      {courses.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-default-400" />
            </div>
            <p className="text-default-700 font-semibold text-lg">Chưa có khóa học nào</p>
            <p className="text-sm text-default-400 mt-2 max-w-md mx-auto">
              Bạn cần được đăng ký vào lớp HSK để bắt đầu luyện tập.
              Liên hệ giáo viên để được hỗ trợ.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Overview Stats */}
          {stats.lessonsStarted > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card shadow="sm">
                <CardBody className="p-3 text-center">
                  <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-default-800">{stats.lessonsStarted}/{stats.totalLessons}</p>
                  <p className="text-[11px] text-default-400">Bài đã học</p>
                </CardBody>
              </Card>
              <Card shadow="sm">
                <CardBody className="p-3 text-center">
                  <Trophy className="w-5 h-5 text-warning mx-auto mb-1" />
                  <p className="text-lg font-bold text-default-800">{stats.lessonsMastered}</p>
                  <p className="text-[11px] text-default-400">Bài thành thạo</p>
                </CardBody>
              </Card>
              <Card shadow="sm">
                <CardBody className="p-3 text-center">
                  <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
                  <p className="text-lg font-bold text-default-800">{formatTime(stats.totalTimeSec)}</p>
                  <p className="text-[11px] text-default-400">Thời gian học</p>
                </CardBody>
              </Card>
              <Card shadow="sm">
                <CardBody className="p-3 text-center">
                  <div className="relative w-10 h-10 mx-auto mb-1">
                    <svg viewBox="0 0 36 36" className="w-10 h-10">
                      <path
                        className="text-default-200"
                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="text-success"
                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${stats.avgMastery}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {Math.round(stats.avgMastery)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-default-400">Tiến độ chung</p>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Course Accordion */}
          <PracticeCourseAccordion courses={courses} progressMap={progressMap} />
        </>
      )}
    </div>
  )
}
