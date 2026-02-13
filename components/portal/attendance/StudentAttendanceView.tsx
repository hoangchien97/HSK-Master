"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Users } from "lucide-react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import {
  fetchStudentAttendanceClasses,
  fetchAttendanceMatrix,
  type AttendanceMatrixData,
} from "@/actions/attendance.actions"
import { usePortalUI } from "@/providers/portal-ui-provider"
import AttendanceHeader from "./AttendanceHeader"
import AttendanceTable from "./AttendanceTable"

dayjs.locale("vi")

/* ───────────────── Types ───────────────── */

type AttendanceStatus = "PRESENT" | "ABSENT" | "UNMARKED"

interface ClassOption {
  id: string
  className: string
  classCode: string
  level: string | null
  _count: { enrollments: number }
}

/* ───────────────── Component ───────────────── */

export default function StudentAttendanceView() {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"))
  const [matrixData, setMatrixData] = useState<AttendanceMatrixData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { startLoading, stopLoading } = usePortalUI()

  useEffect(() => {
    loadClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedClassId && currentMonth) {
      loadMatrix()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, currentMonth])

  const loadClasses = async () => {
    try {
      startLoading()
      const result = await fetchStudentAttendanceClasses()
      if (result.success && result.classes) {
        setClasses(result.classes)
        if (result.classes.length > 0) {
          setSelectedClassId(result.classes[0].id)
        }
      } else {
        toast.error(result.error || "Không thể tải danh sách lớp")
      }
    } catch {
      toast.error("Có lỗi xảy ra")
    } finally {
      stopLoading()
    }
  }

  const loadMatrix = async () => {
    if (!selectedClassId || !currentMonth) return
    try {
      startLoading()
      const result = await fetchAttendanceMatrix(selectedClassId, currentMonth)
      if (result.success && result.data) {
        setMatrixData(result.data)
      } else {
        toast.error(result.error || "Không thể tải dữ liệu điểm danh")
      }
    } catch {
      toast.error("Có lỗi xảy ra")
    } finally {
      stopLoading()
    }
  }

  /* ───── Derived data ───── */

  const today = dayjs().format("YYYY-MM-DD")

  const scheduleDates = useMemo(() => {
    if (!matrixData) return []
    const dateSet = new Set(matrixData.schedules.map((s) => s.date))
    return Array.from(dateSet).sort()
  }, [matrixData])

  const filteredStudents = useMemo(() => {
    if (!matrixData) return []
    if (!searchQuery.trim()) return matrixData.students
    const q = searchQuery.toLowerCase()
    return matrixData.students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    )
  }, [matrixData, searchQuery])

  /* ───── Read-only cell helpers (no pending changes) ───── */

  const getCellStatus = useCallback(
    (studentId: string, date: string): AttendanceStatus => {
      const saved = matrixData?.attendanceMap?.[studentId]?.[date]
      if (saved) return saved.status as AttendanceStatus
      return "UNMARKED"
    },
    [matrixData]
  )

  const getCellNote = useCallback(
    (studentId: string, date: string): string => {
      const saved = matrixData?.attendanceMap?.[studentId]?.[date]
      return saved?.notes || ""
    },
    [matrixData]
  )

  const isCellPending = useCallback(
    (_studentId: string, _date: string): boolean => false,
    []
  )

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId)
  }, [])

  /* No-op handlers for read-only mode */
  const noop = useCallback(() => {}, [])
  const noopStatus = useCallback((_s: string, _d: string, _st: AttendanceStatus) => {}, [])
  const noopNote = useCallback((_s: string, _d: string, _n: string) => {}, [])
  const noopText = useCallback((_t: string) => {}, [])

  /* ───── Render ───── */

  if (classes.length === 0 && !matrixData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Users className="w-16 h-16 text-default-300" />
        <p className="text-lg font-semibold text-default-500">Chưa tham gia lớp học nào</p>
        <p className="text-sm text-default-400">Liên hệ giáo viên để được thêm vào lớp học</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header: Filters (no online/pending indicators) */}
      <AttendanceHeader
        classes={classes}
        selectedClassId={selectedClassId}
        onClassChange={handleClassChange}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOnline={true}
        pendingCount={0}
      />

      {/* Matrix Table — read-only */}
      {matrixData ? (
        <AttendanceTable
          matrixData={matrixData}
          scheduleDates={scheduleDates}
          filteredStudents={filteredStudents}
          today={today}
          pendingChanges={new Map()}
          getCellStatus={getCellStatus}
          getCellNote={getCellNote}
          isCellPending={isCellPending}
          notePopover={null}
          noteText=""
          onStatusChange={noopStatus}
          onToggleAll={noop}
          onNotePopoverOpen={noopNote}
          onNotePopoverClose={noop}
          onNoteTextChange={noopText}
          onNoteSave={noopNote}
          onSave={noop}
          isSaving={false}
          totalStudents={matrixData.students.length}
          readOnly
        />
      ) : null}
    </div>
  )
}
