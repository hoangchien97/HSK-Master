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
import { CSpinner } from "@/components/portal/common"
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
  const [matrixData, setMatrixData] = useState<AttendanceMatrixData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPageLoading, setIsPageLoading] = useState(false)

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      loadMatrix()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId])

  const loadClasses = async () => {
    try {
      setIsPageLoading(true)
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
      setIsPageLoading(false)
    }
  }

  const loadMatrix = async () => {
    if (!selectedClassId) return
    try {
      setIsPageLoading(true)
      const result = await fetchAttendanceMatrix(selectedClassId)
      if (result.success && result.data) {
        setMatrixData(result.data)
      } else {
        toast.error(result.error || "Không thể tải dữ liệu điểm danh")
      }
    } catch {
      toast.error("Có lỗi xảy ra")
    } finally {
      setIsPageLoading(false)
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

  const isCellPending = useCallback((): boolean => false, [])

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId)
  }, [])

  /* No-op handlers for read-only mode */
  const noop = useCallback(() => {}, [])
  const noopStatus = useCallback(() => {}, [])
  const noopNote = useCallback(() => {}, [])
  const noopText = useCallback(() => {}, [])

  /* ───── Render ───── */

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-4">
      {/* Header: Class selector + search — always visible */}
      <AttendanceHeader
        classes={classes}
        selectedClassId={selectedClassId}
        onClassChange={handleClassChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingCount={0}
        scheduleDates={scheduleDates}
        matrixData={matrixData}
      />

      {/* Matrix content area — loading overlay sits inside this zone */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {isPageLoading && (
          <CSpinner variant="overlay" />
        )}

        {/* Matrix Table — read-only */}
        {matrixData && scheduleDates.length > 0 ? (
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
        ) : !isPageLoading ? (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-100 gap-4">
            <Users className="w-16 h-16 text-default-300" />
            <p className="text-sm text-default-400">
              {classes.length === 0 ? "Tạo lớp học để bắt đầu điểm danh" : "Chọn lớp học để xem điểm danh"}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
