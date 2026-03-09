"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Users, CalendarDays } from "lucide-react"
import { toast } from "react-toastify"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import {
  fetchTeacherClasses,
  fetchAttendanceMatrix,
  saveAttendance,
  type AttendanceMatrixData,
} from "@/actions/attendance.actions"
import { CSpinner } from "@/components/portal/common"
import AttendanceHeader from "./AttendanceHeader"
import AttendanceTable from "./AttendanceTable"

dayjs.locale("vi")

/* ───────────────── Types ───────────────── */

type AttendanceStatus = "PRESENT" | "ABSENT" | "UNMARKED"

interface PendingChange {
  studentId: string
  date: string
  status: AttendanceStatus
  notes?: string
}

interface ClassOption {
  id: string
  className: string
  classCode: string
  level: string | null
  _count: { enrollments: number }
}

/* ───────────────── Component ───────────────── */

export default function AttendanceMatrixView() {
  // State
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [matrixData, setMatrixData] = useState<AttendanceMatrixData | null>(null)
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map())
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [notePopover, setNotePopover] = useState<{ studentId: string; date: string } | null>(null)
  const [noteText, setNoteText] = useState("")
  const [isPageLoading, setIsPageLoading] = useState(false)

  useEffect(() => {
    loadClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load matrix data when class changes
  useEffect(() => {
    if (selectedClassId) {
      loadMatrix()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId])

  const loadClasses = async () => {
    try {
      setIsPageLoading(true)
      const result = await fetchTeacherClasses()
      if (result.success && result.classes) {
        setClasses(result.classes)
        if (result.classes.length > 0 && !selectedClassId) {
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
        setPendingChanges(new Map())
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

  // Schedule dates (days with classes)
  const scheduleDates = useMemo(() => {
    if (!matrixData) return []
    const dateSet = new Set(matrixData.schedules.map((s) => s.date))
    return Array.from(dateSet).sort()
  }, [matrixData])

  // Filter students by search
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

  // Get cell key
  const getCellKey = (studentId: string, date: string) => `${studentId}__${date}`

  // Get current status for a cell (pending > saved > UNMARKED)
  const getCellStatus = useCallback(
    (studentId: string, date: string): AttendanceStatus => {
      const key = getCellKey(studentId, date)
      const pending = pendingChanges.get(key)
      if (pending) return pending.status

      const saved = matrixData?.attendanceMap?.[studentId]?.[date]
      if (saved) return saved.status as AttendanceStatus

      return "UNMARKED"
    },
    [pendingChanges, matrixData]
  )

  // Get note for a cell
  const getCellNote = useCallback(
    (studentId: string, date: string): string => {
      const key = getCellKey(studentId, date)
      const pending = pendingChanges.get(key)
      if (pending?.notes !== undefined) return pending.notes || ""

      const saved = matrixData?.attendanceMap?.[studentId]?.[date]
      return saved?.notes || ""
    },
    [pendingChanges, matrixData]
  )

  // Check if cell is pending
  const isCellPending = useCallback(
    (studentId: string, date: string): boolean => {
      return pendingChanges.has(getCellKey(studentId, date))
    },
    [pendingChanges]
  )

  /* ───── Handlers ───── */

  // Direct status change (for today's 2-option UI)
  const handleStatusChange = useCallback(
    (studentId: string, date: string, newStatus: AttendanceStatus) => {
      if (date !== today) return

      const key = getCellKey(studentId, date)
      const newPending = new Map(pendingChanges)

      const currentStatus = getCellStatus(studentId, date)
      const savedStatus = matrixData?.attendanceMap?.[studentId]?.[date]?.status as AttendanceStatus | undefined
      const savedNotes = matrixData?.attendanceMap?.[studentId]?.[date]?.notes || ""
      const pendingNote = newPending.get(key)?.notes

      // Toggle: if clicking the same status, set to UNMARKED
      const targetStatus = currentStatus === newStatus ? "UNMARKED" : newStatus

      // If target matches saved state, remove from pending
      if (targetStatus === (savedStatus || "UNMARKED") && (pendingNote === undefined || pendingNote === savedNotes)) {
        newPending.delete(key)
      } else {
        newPending.set(key, {
          studentId,
          date,
          status: targetStatus,
          notes: pendingNote,
        })
      }

      setPendingChanges(newPending)
    },
    [pendingChanges, getCellStatus, matrixData, today]
  )

  // Toggle all: if all are PRESENT → set all to UNMARKED, otherwise set all to PRESENT
  const handleToggleAll = useCallback(
    (date: string) => {
      if (date !== today) return
      if (!matrixData) return

      const newPending = new Map(pendingChanges)

      const allPresent = matrixData.students.every((student) => {
        const status = getCellStatus(student.id, date)
        return status === "PRESENT"
      })

      matrixData.students.forEach((student) => {
        const key = getCellKey(student.id, date)
        const savedStatus = matrixData.attendanceMap?.[student.id]?.[date]?.status
        const targetStatus: AttendanceStatus = allPresent ? "UNMARKED" : "PRESENT"

        if (savedStatus === targetStatus || (!savedStatus && targetStatus === "UNMARKED")) {
          newPending.delete(key)
        } else {
          newPending.set(key, {
            studentId: student.id,
            date,
            status: targetStatus,
            notes: newPending.get(key)?.notes,
          })
        }
      })

      setPendingChanges(newPending)
    },
    [pendingChanges, matrixData, today, getCellStatus]
  )

  // Note handlers
  const handleNotePopoverOpen = useCallback(
    (studentId: string, date: string, note: string) => {
      setNotePopover({ studentId, date })
      setNoteText(note)
    },
    []
  )

  const handleNotePopoverClose = useCallback(() => {
    setNotePopover(null)
  }, [])

  const handleNoteTextChange = useCallback((text: string) => {
    setNoteText(text)
  }, [])

  const handleSaveNote = useCallback(
    (studentId: string, date: string, note: string) => {
      const key = getCellKey(studentId, date)
      const newPending = new Map(pendingChanges)
      const currentStatus = getCellStatus(studentId, date)

      newPending.set(key, {
        studentId,
        date,
        status: currentStatus,
        notes: note,
      })

      setPendingChanges(newPending)
      setNotePopover(null)
      setNoteText("")
    },
    [pendingChanges, getCellStatus]
  )

  // Save all pending changes — optimistic UI update, no page reload
  const handleSave = async () => {
    if (pendingChanges.size === 0) {
      toast.info("Không có thay đổi cần lưu")
      return
    }

    setIsSaving(true)
    try {
      const records = Array.from(pendingChanges.values())
        .filter((p) => p.status !== "UNMARKED")
        .map((p) => ({
          studentId: p.studentId,
          date: p.date,
          status: p.status,
          notes: p.notes,
        }))

      if (records.length === 0) {
        toast.info("Không có dữ liệu điểm danh cần lưu")
        setPendingChanges(new Map())
        setIsSaving(false)
        return
      }

      const result = await saveAttendance(selectedClassId, records)

      if (result.success) {
        toast.success(`Đã lưu điểm danh (${result.count} bản ghi)`)

        // Optimistic update: merge pending changes into matrixData.attendanceMap
        if (matrixData) {
          const newAttendanceMap = { ...matrixData.attendanceMap }

          Array.from(pendingChanges.values()).forEach((change) => {
            if (!newAttendanceMap[change.studentId]) {
              newAttendanceMap[change.studentId] = {}
            }

            if (change.status === "UNMARKED") {
              // Remove the record for UNMARKED
              delete newAttendanceMap[change.studentId][change.date]
            } else {
              newAttendanceMap[change.studentId] = {
                ...newAttendanceMap[change.studentId],
                [change.date]: {
                  id: newAttendanceMap[change.studentId]?.[change.date]?.id || "temp",
                  status: change.status,
                  notes: change.notes || null,
                },
              }
            }
          })

          setMatrixData({
            ...matrixData,
            attendanceMap: newAttendanceMap,
          })
        }

        // Clear pending changes
        setPendingChanges(new Map())
      } else {
        toast.error(result.error || "Lưu điểm danh thất bại")
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu")
    } finally {
      setIsSaving(false)
    }
  }

  // Class change handler
  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId)
    setPendingChanges(new Map())
  }, [])

  /* ───── Main render ───── */

  return (
    <div className="md:flex-1 md:min-h-0 flex flex-col gap-4">
      {/* Header: Class selector + search — always visible */}
      <AttendanceHeader
        classes={classes}
        selectedClassId={selectedClassId}
        onClassChange={handleClassChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingCount={pendingChanges.size}
        scheduleDates={scheduleDates}
        matrixData={matrixData}
      />

      {/* Matrix content area — loading overlay sits inside this zone */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        {isPageLoading && (
          <CSpinner variant="overlay" />
        )}

        {matrixData && scheduleDates.length > 0 ? (
          <AttendanceTable
            matrixData={matrixData}
            scheduleDates={scheduleDates}
            filteredStudents={filteredStudents}
            today={today}
            pendingChanges={pendingChanges}
            getCellStatus={getCellStatus}
            getCellNote={getCellNote}
            isCellPending={isCellPending}
            notePopover={notePopover}
            noteText={noteText}
            onStatusChange={handleStatusChange}
            onToggleAll={handleToggleAll}
            onNotePopoverOpen={handleNotePopoverOpen}
            onNotePopoverClose={handleNotePopoverClose}
            onNoteTextChange={handleNoteTextChange}
            onNoteSave={handleSaveNote}
            onSave={handleSave}
            isSaving={isSaving}
            totalStudents={matrixData.students.length}
          />
        ) : matrixData && scheduleDates.length === 0 ? (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[400px] gap-4">
            <CalendarDays className="w-16 h-16 text-default-300" />
            <p className="text-lg font-semibold text-default-500">
              Chưa có buổi học nào
            </p>
            <p className="text-sm text-default-400">
              Hãy tạo lịch học cho lớp trước khi điểm danh
            </p>
          </div>
        ) : !isPageLoading ? (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Users className="w-16 h-16 text-default-300" />
            <p className="text-lg font-semibold text-default-500">
              {classes.length === 0 ? "Chưa có lớp học nào" : "Chưa có dữ liệu điểm danh"}
            </p>
            <p className="text-sm text-default-400">
              {classes.length === 0 ? "Tạo lớp học để bắt đầu điểm danh" : "Chọn lớp học để xem điểm danh"}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
