"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button, Avatar, Badge, Select, type SelectOption } from "@/components/ui"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui"
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Download,
  Save,
  Clock,
  AlertCircle,
} from "lucide-react"
import { toast } from "react-toastify"
import api from "@/lib/http/client"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { MSG_ATTENDANCE, MSG } from "@/constants/portal/messages"
import { PAGINATION } from "@/constants/portal/pagination"

dayjs.locale("vi")

/* ──────────────────────── types ──────────────────────── */

interface StudentData {
  id: string
  name: string
  image?: string | null
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

interface AttendanceRecord {
  id: string
  date: Date
  status: string
  student: { id: string; name: string }
  class: { className: string }
}

type AttendanceStatus = "present" | "absent" | "late" | "excused"

interface AttendanceViewProps {
  classes: ClassData[]
  recentAttendances: AttendanceRecord[]
}

/* ──────────────────── status config ──────────────────── */

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: "success" | "danger" | "warning" | "primary" }
> = {
  present: { label: "Có mặt", color: "success" },
  absent: { label: "Vắng", color: "danger" },
  late: { label: "Muộn", color: "warning" },
  excused: { label: "Có phép", color: "primary" },
}

const HISTORY_STATUS: Record<string, { label: string; color: "success" | "danger" | "warning" | "primary" }> = {
  PRESENT: { label: "Có mặt", color: "success" },
  ABSENT: { label: "Vắng", color: "danger" },
  LATE: { label: "Muộn", color: "warning" },
  EXCUSED: { label: "Có phép", color: "primary" },
}

/* ──────────────────── component ──────────────────────── */

export default function AttendanceView({
  classes,
  recentAttendances,
}: AttendanceViewProps) {
  const router = useRouter()
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "")
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const historyRowsPerPage = PAGINATION.DEFAULT_PAGE_SIZE

  /* derived data */
  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  )

  const students = useMemo(
    () =>
      selectedClass?.enrollments.map((e) => ({
        id: e.student.id,
        name: e.student.name,
        image: e.student.image,
      })) ?? [],
    [selectedClass],
  )

  /* auto-initialize attendance map */
  useMemo(() => {
    if (students.length > 0 && Object.keys(attendance).length === 0) {
      const initial: Record<string, AttendanceStatus> = {}
      students.forEach((s) => { initial[s.id] = "present" })
      setAttendance(initial)
    }
  }, [students]) // eslint-disable-line react-hooks/exhaustive-deps

  /* summary counts */
  const summary = useMemo(() => {
    const vals = Object.values(attendance)
    return {
      present: vals.filter((s) => s === "present").length || students.length,
      absent: vals.filter((s) => s === "absent").length,
      late: vals.filter((s) => s === "late").length,
      excused: vals.filter((s) => s === "excused").length,
    }
  }, [attendance, students.length])

  /* handlers */
  const handleStatusChange = useCallback(
    (studentId: string, status: AttendanceStatus) => {
      setAttendance((prev) => ({ ...prev, [studentId]: status }))
    },
    [],
  )

  const handleClassChange = useCallback(
    (value: string) => {
      setSelectedClassId(value)
      setAttendance({})
    },
    [],
  )

  const handleSubmit = async () => {
    if (!selectedClassId || !selectedDate) return

    setLoading(true)
    try {
      const attendanceData = students.map((student) => ({
        studentId: student.id,
        status: attendance[student.id] || "present",
      }))

      await api.post("/portal/attendance", {
        classId: selectedClassId,
        date: selectedDate,
        attendance: attendanceData,
      }, { meta: { loading: false } })

      toast.success(MSG_ATTENDANCE.SAVED)
      router.refresh()
    } catch {
      toast.error(MSG.ERROR_GENERIC)
    } finally {
      setLoading(false)
    }
  }

  /* history pagination */
  const historyPages = Math.ceil(recentAttendances.length / historyRowsPerPage)
  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * historyRowsPerPage
    return recentAttendances.slice(start, start + historyRowsPerPage)
  }, [recentAttendances, historyPage])

  const classOptions: SelectOption[] = classes.map((c) => ({
    value: c.id,
    label: `${c.className} (${c.classCode})`,
  }))

  /* ──────────────────── render ──────────────────────── */

  if (classes.length === 0) {
    return (
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Users className="w-16 h-16 text-gray-400" />
        <p className="text-lg font-semibold text-(--color-muted)">Chưa có lớp học nào</p>
        <p className="text-sm text-gray-400">Tạo lớp học để bắt đầu điểm danh</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Điểm danh</h1>
          <p className="text-(--color-muted) text-sm mt-1">
            Điểm danh học viên theo buổi học
          </p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Download className="w-4 h-4" />}
        >
          Xuất báo cáo
        </Button>
      </div>

      {/* ─── Filters ─── */}
      <div className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            label="Lớp học"
            value={selectedClassId}
            onChange={(val) => { if (val) handleClassChange(val) }}
            options={classOptions}
            className="flex-1"
          />

          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-(--color-ink) mb-1">Ngày điểm danh</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 w-full rounded-sm border border-(--color-smoke) bg-white px-3 py-2 text-sm text-(--color-ink) focus:outline-none focus:ring-1 focus:ring-(--color-vermillion) focus:border-(--color-vermillion)"
            />
          </div>
        </div>
      </div>

      {/* ─── Summary ─── */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            { key: "present" as const, icon: CheckCircle, label: "Có mặt" },
            { key: "absent" as const, icon: XCircle, label: "Vắng" },
            { key: "late" as const, icon: Clock, label: "Muộn" },
            { key: "excused" as const, icon: AlertCircle, label: "Có phép" },
          ] as const).map(({ key, icon: Icon, label }) => (
            <div key={key} className="rounded-xl border border-(--color-smoke) bg-white p-4 shadow-sm flex flex-row items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  key === "present"
                    ? "bg-green-100 text-green-600"
                    : key === "absent"
                      ? "bg-red-100 text-red-600"
                      : key === "late"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-(--color-vermillion)/10 text-(--color-vermillion)"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary[key]}</p>
                <p className="text-xs text-(--color-muted)">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Attendance Table ─── */}
      <div className="rounded-xl border border-(--color-smoke) bg-white shadow-sm">
        <div className="pb-4 border-b border-(--color-smoke) p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">Danh sách học viên</h3>
            <p className="text-sm text-(--color-muted)">
              {selectedClass?.className} –{" "}
              {dayjs(selectedDate).format("dddd, DD/MM/YYYY")}
            </p>
          </div>
          <Button
            variant="primary"
            isLoading={loading}
            isDisabled={students.length === 0}
            leftIcon={!loading ? <Save className="w-4 h-4" /> : undefined}
            onClick={handleSubmit}
          >
            {loading ? "Đang lưu..." : "Lưu điểm danh"}
          </Button>
        </div>

        <hr className="border-t border-(--color-smoke)" />

        {students.length === 0 ? (
          <div className="py-4 p-5">
            <div className="flex flex-col items-center py-8 gap-2">
              <Users className="w-12 h-12 text-gray-400" />
              <p className="text-(--color-muted)">Lớp học chưa có học viên</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-(--color-paper)">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Học viên</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-smoke)">
                {students.map((student, idx) => {
                  const currentStatus = attendance[student.id] || "present"
                  return (
                    <tr key={student.id} className="hover:bg-(--color-paper) transition-colors">
                      <td className="px-4 py-3 text-(--color-ink) w-14">{idx + 1}</td>
                      <td className="px-4 py-3 text-(--color-ink)">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={student.image || undefined}
                            name={student.name}
                            size="sm"
                          />
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-(--color-ink)">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(
                            (status) => (
                              <Button
                                key={status}
                                variant={currentStatus === status ? STATUS_CONFIG[status].color as "primary" | "secondary" | "ghost" | "danger" : "secondary"}
                                onClick={() => handleStatusChange(student.id, status)}
                                size="sm"
                                className="min-w-fit text-xs sm:text-sm"
                              >
                                {STATUS_CONFIG[status].label}
                              </Button>
                            ),
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Recent History ─── */}
      <div className="rounded-xl border border-(--color-smoke) bg-white shadow-sm">
        <div className="pb-4 border-b border-(--color-smoke) p-5">
          <h3 className="text-lg font-semibold">Lịch sử điểm danh gần đây</h3>
        </div>
        <hr className="border-t border-(--color-smoke)" />

        {recentAttendances.length === 0 ? (
          <div className="py-4 p-5">
            <div className="flex flex-col items-center py-8 gap-2">
              <Calendar className="w-12 h-12 text-gray-400" />
              <p className="text-(--color-muted)">Chưa có lịch sử điểm danh</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-(--color-paper)">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Lớp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Học viên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-smoke)">
                  {paginatedHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-(--color-paper) transition-colors">
                      <td className="px-4 py-3 text-(--color-ink)">
                        {dayjs(record.date).format("DD/MM/YYYY")}
                      </td>
                      <td className="px-4 py-3 text-(--color-ink)">{record.class.className}</td>
                      <td className="px-4 py-3 text-(--color-ink)">{record.student.name}</td>
                      <td className="px-4 py-3 text-(--color-ink)">
                        <Badge
                          size="sm"
                          variant={HISTORY_STATUS[record.status]?.color ?? "default"}
                        >
                          {HISTORY_STATUS[record.status]?.label ?? record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {historyPages > 1 && (
              <div className="flex items-center justify-center p-4 gap-2">
                {Array.from({ length: historyPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setHistoryPage(p)}
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                      p === historyPage
                        ? "bg-(--color-vermillion) text-white"
                        : "hover:bg-(--color-paper) text-(--color-ink) border border-(--color-smoke)"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
