"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardBody } from "@heroui/react"
import { PenLine, GraduationCap } from "lucide-react"
import { toast } from "react-toastify"
import { fetchCoursesForPractice } from "@/actions/practice.actions"
import { usePortalUI } from "@/providers/portal-ui-provider"
import PracticeCourseAccordion from "./PracticeCourseAccordion"

interface LessonItem {
  id: string
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
}

export default function PracticeListView() {
  const { startLoading, stopLoading } = usePortalUI()
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [progressMap, setProgressMap] = useState<Record<string, ProgressItem>>({})

  const loadData = useCallback(async () => {
    startLoading()
    const result = await fetchCoursesForPractice()
    if (result.success && result.data) {
      setCourses(result.data.courses as unknown as CourseItem[])
      setProgressMap(result.data.progressMap as unknown as Record<string, ProgressItem>)
    } else {
      toast.error(result.error || "Không thể tải dữ liệu")
    }
    stopLoading()
  }, [startLoading, stopLoading])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            <GraduationCap className="w-12 h-12 mx-auto text-default-300 mb-3" />
            <p className="text-default-600 font-medium">Chưa có khóa học nào</p>
            <p className="text-sm text-default-400 mt-1">
              Bạn cần được đăng ký vào lớp HSK để bắt đầu luyện tập.
              Liên hệ giáo viên để được hỗ trợ.
            </p>
          </CardBody>
        </Card>
      ) : (
        <PracticeCourseAccordion courses={courses} progressMap={progressMap} />
      )}
    </div>
  )
}
