"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Avatar,
  AvatarGroup,
  Chip,
  Spinner,
  Divider,
} from "@heroui/react"
import {
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  Clock,
  MapPin,
  Video,
} from "lucide-react"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { toast } from "react-toastify"
import { CDrawer } from "@/components/portal/common"
import { CLASS_STATUS_COLOR_MAP, CLASS_STATUS_LABEL_MAP } from "@/constants/portal"
import type { IClass } from "@/interfaces/portal"
import api from "@/lib/http/client"

dayjs.locale("vi")

interface ScheduleItem {
  id: string
  title: string
  startTime: string
  endTime: string
  location?: string
  meetingLink?: string
  status: string
}

interface ClassDetailDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  classData: IClass | null
}

export default function ClassDetailDrawer({
  isOpen,
  onOpenChange,
  classData,
}: ClassDetailDrawerProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false)

  const loadSchedules = useCallback(async () => {
    if (!classData?.id) return
    try {
      setIsLoadingSchedules(true)
      const { data } = await api.get<ScheduleItem[]>(
        `/portal/schedules?classId=${classData.id}`,
        { meta: { loading: false } }
      )
      setSchedules(data || [])
    } catch {
      // Silently fail — schedules are supplementary info
      setSchedules([])
    } finally {
      setIsLoadingSchedules(false)
    }
  }, [classData?.id])

  useEffect(() => {
    if (isOpen && classData) {
      loadSchedules()
    } else {
      setSchedules([])
    }
  }, [isOpen, classData, loadSchedules])

  if (!classData) return null

  const upcomingSchedules = schedules
    .filter((s) => new Date(s.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5)

  return (
    <CDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="right"
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate">
              {classData.className}
            </h3>
            <p className="text-sm text-gray-500">{classData.classCode}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status & Level */}
        <div className="flex items-center gap-2 flex-wrap">
          <Chip
            size="sm"
            color={CLASS_STATUS_COLOR_MAP[classData.status] || "default"}
            variant="flat"
          >
            {CLASS_STATUS_LABEL_MAP[classData.status] || classData.status}
          </Chip>
          {classData.level && (
            <Chip size="sm" color="primary" variant="flat">
              {classData.level.replace("HSK", "HSK ")}
            </Chip>
          )}
        </div>

        {/* Description */}
        {classData.description && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Mô tả</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {classData.description}
            </p>
          </div>
        )}

        {/* Teacher Info */}
        {classData.teacher && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Giáo viên
            </h4>
            <div className="flex items-center gap-3">
              <Avatar
                src={classData.teacher.image || undefined}
                name={classData.teacher.name?.charAt(0)}
                size="md"
                classNames={{
                  base: "bg-gradient-to-br from-red-400 to-red-600",
                  name: "text-white font-bold",
                }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {classData.teacher.name}
                </p>
                <p className="text-xs text-gray-500">{classData.teacher.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Thời gian
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 w-24">Ngày bắt đầu:</span>
              <span className="font-medium">
                {dayjs(classData.startDate).format("DD/MM/YYYY")}
              </span>
            </div>
            {classData.endDate && (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-24">Ngày kết thúc:</span>
                <span className="font-medium">
                  {dayjs(classData.endDate).format("DD/MM/YYYY")}
                </span>
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* Students */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Học viên ({classData._count?.enrollments || classData.enrollments?.length || 0})
          </h4>
          {classData.enrollments && classData.enrollments.length > 0 ? (
            <div className="space-y-2">
              {classData.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id || enrollment.studentId}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar
                    src={enrollment.student?.image || undefined}
                    name={enrollment.student?.name?.charAt(0)}
                    size="sm"
                    classNames={{
                      base: "bg-gradient-to-br from-blue-400 to-blue-600",
                      name: "text-white text-[10px] font-bold",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {enrollment.student?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {enrollment.student?.email}
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={enrollment.status === "ENROLLED" ? "success" : "default"}
                  >
                    {enrollment.status === "ENROLLED" ? "Đang học" : enrollment.status}
                  </Chip>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Chưa có học viên</p>
          )}
        </div>

        <Divider />

        {/* Upcoming Schedules */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Lịch học sắp tới
          </h4>
          {isLoadingSchedules ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : upcomingSchedules.length > 0 ? (
            <div className="space-y-3">
              {upcomingSchedules.map((schedule) => {
                const start = dayjs(schedule.startTime)
                const end = dayjs(schedule.endTime)
                return (
                  <div
                    key={schedule.id}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1.5"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {schedule.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {start.format("DD/MM/YYYY")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {start.format("HH:mm")} - {end.format("HH:mm")}
                      </span>
                      {schedule.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {schedule.location}
                        </span>
                      )}
                    </div>
                    {schedule.meetingLink && (
                      <a
                        href={schedule.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <Video className="w-3 h-3" />
                        Tham gia online
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Không có lịch học sắp tới</p>
          )}
        </div>
      </div>
    </CDrawer>
  )
}
