"use client"

import { useMemo } from "react"
import {
  Card,
  CardBody,
  Avatar,
  Tooltip,
  Chip,
} from "@heroui/react"
import { Calendar, CheckCheck } from "lucide-react"
import dayjs from "dayjs"
import AttendanceCell from "./AttendanceCell"
import AttendanceFooter from "./AttendanceFooter"
import type { AttendanceMatrixData } from "@/app/actions/attendance.actions"

/* ───────────────── Types ───────────────── */

type AttendanceStatus = "PRESENT" | "ABSENT" | "UNMARKED"

const WEEKDAY_LABELS: Record<number, string> = {
  0: "CN",
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
}

interface StudentData {
  id: string
  name: string
  fullName: string | null
  image: string | null
  email: string
}

interface AttendanceTableProps {
  matrixData: AttendanceMatrixData
  scheduleDates: string[]
  filteredStudents: StudentData[]
  today: string
  pendingChanges: Map<string, { studentId: string; date: string; status: AttendanceStatus; notes?: string }>
  getCellStatus: (studentId: string, date: string) => AttendanceStatus
  getCellNote: (studentId: string, date: string) => string
  isCellPending: (studentId: string, date: string) => boolean
  notePopover: { studentId: string; date: string } | null
  noteText: string
  onStatusChange: (studentId: string, date: string, status: AttendanceStatus) => void
  onToggleAll: (date: string) => void
  onNotePopoverOpen: (studentId: string, date: string, note: string) => void
  onNotePopoverClose: () => void
  onNoteTextChange: (text: string) => void
  onNoteSave: (studentId: string, date: string, note: string) => void
  onSave: () => void
  isSaving: boolean
  totalStudents: number
}

/* ───────────────── Component ───────────────── */

export default function AttendanceTable({
  matrixData,
  scheduleDates,
  filteredStudents,
  today,
  pendingChanges,
  getCellStatus,
  getCellNote,
  isCellPending,
  notePopover,
  noteText,
  onStatusChange,
  onToggleAll,
  onNotePopoverOpen,
  onNotePopoverClose,
  onNoteTextChange,
  onNoteSave,
  onSave,
  isSaving,
  totalStudents,
}: AttendanceTableProps) {
  // Summary counts for today
  const todaySummary = useMemo(() => {
    if (!matrixData || !scheduleDates.includes(today)) return null

    let present = 0
    let absent = 0
    let unmarked = 0

    matrixData.students.forEach((s) => {
      const status = getCellStatus(s.id, today)
      if (status === "PRESENT") present++
      else if (status === "ABSENT") absent++
      else unmarked++
    })

    return { present, absent, unmarked, total: matrixData.students.length }
  }, [matrixData, scheduleDates, today, getCellStatus])

  // Per-column summary (present/absent/unmarked counts for each date)
  const columnSummaries = useMemo(() => {
    if (!matrixData) return {} as Record<string, { present: number; absent: number; unmarked: number }>
    const result: Record<string, { present: number; absent: number; unmarked: number }> = {}
    for (const date of scheduleDates) {
      let present = 0
      let absent = 0
      let unmarked = 0
      matrixData.students.forEach((s) => {
        const status = getCellStatus(s.id, date)
        if (status === "PRESENT") present++
        else if (status === "ABSENT") absent++
        else unmarked++
      })
      result[date] = { present, absent, unmarked }
    }
    return result
  }, [matrixData, scheduleDates, getCellStatus])

  // Overall summary across all past/today dates
  const overallSummary = useMemo(() => {
    let totalPresent = 0
    let totalAbsent = 0
    let totalUnmarked = 0
    for (const date of scheduleDates) {
      if (date > today) continue // skip future dates
      const col = columnSummaries[date]
      if (col) {
        totalPresent += col.present
        totalAbsent += col.absent
        totalUnmarked += col.unmarked
      }
    }
    return { totalPresent, totalAbsent, totalUnmarked }
  }, [columnSummaries, scheduleDates, today])

  if (scheduleDates.length === 0) {
    return (
      <Card shadow="sm" className="flex-1">
        <CardBody>
          <div className="flex flex-col items-center py-12 gap-3">
            <Calendar className="w-12 h-12 text-default-300" />
            <p className="text-default-500 font-medium">Không có buổi học nào trong tháng này</p>
            <p className="text-sm text-default-400">
              Hãy tạo lịch học cho lớp trước khi điểm danh
            </p>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card shadow="sm" className="flex-1 overflow-hidden flex flex-col min-h-0">
      {/* Student count + Today summary bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-sm text-default-500">
            Hiển thị <strong>{filteredStudents.length}</strong> / {totalStudents} học viên
          </span>
        </div>
        {todaySummary && (
          <div className="flex items-center gap-4">
            <Chip
              size="sm"
              variant="flat"
              color="success"
              startContent={<span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />}
            >
              Có mặt: {todaySummary.present}
            </Chip>
            <Chip
              size="sm"
              variant="flat"
              color="danger"
              startContent={<span className="w-2 h-2 rounded-full bg-red-500 ml-1" />}
            >
              Vắng: {todaySummary.absent}
            </Chip>
            {todaySummary.unmarked > 0 && (
              <Chip
                size="sm"
                variant="flat"
                startContent={<span className="w-2 h-2 rounded-full bg-gray-300 ml-1" />}
              >
                Chưa điểm danh: {todaySummary.unmarked}
              </Chip>
            )}
          </div>
        )}
      </div>

      {/* Scrollable table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead className="sticky top-0 z-30">
            <tr className="bg-gray-50 border-b border-gray-200">
              {/* Sticky columns: STT + Name */}
              <th className="sticky left-0 z-40 bg-gray-50 px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-12">
                STT
              </th>
              <th className="sticky left-12 z-40 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-50">
                HỌC VIÊN
              </th>

              {/* Date columns */}
              {scheduleDates.map((date) => {
                const d = dayjs(date)
                const isToday = date === today
                const isFuture = date > today
                const isPast = date < today

                return (
                  <th
                    key={date}
                    className={`px-2 py-2 text-center border-r border-gray-100 ${
                      isToday
                        ? "bg-blue-50 border-b-2 border-b-blue-400 min-w-18"
                        : isFuture
                          ? "bg-gray-50 opacity-50 min-w-15"
                          : "bg-gray-50 min-w-15"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-xs font-bold ${isToday ? "text-blue-600" : isPast ? "text-gray-400" : "text-gray-300"}`}>
                        {d.format("DD/MM")}
                      </span>
                      <span className={`text-[10px] ${isToday ? "text-blue-500" : isPast ? "text-gray-400" : "text-gray-300"}`}>
                        {WEEKDAY_LABELS[d.day()]}
                      </span>
                      {/* Toggle all button (only for today) */}
                      {isToday && (
                        <Tooltip content="Chọn / bỏ chọn tất cả" placement="top">
                          <button
                            type="button"
                            onClick={() => onToggleAll(date)}
                            className="mt-0.5 p-0.5 rounded hover:bg-blue-100 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {filteredStudents.map((student, idx) => (
              <tr
                key={student.id}
                className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                {/* STT */}
                <td className="sticky left-0 z-10 bg-inherit px-3 py-2.5 text-sm text-gray-500 border-r border-gray-200 text-center font-medium">
                  {String(idx + 1).padStart(2, "0")}
                </td>

                {/* Student info */}
                <td className="sticky left-12 z-10 bg-inherit px-4 py-2.5 border-r border-gray-200">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={student.image || undefined}
                      name={(student.fullName || student.name).substring(0, 2).toUpperCase()}
                      size="sm"
                      className="shrink-0"
                      classNames={{
                        base: "bg-gradient-to-br from-blue-400 to-blue-600",
                        name: "text-white text-[10px] font-bold",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {student.fullName || student.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        MSHV: {student.name.toUpperCase().slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Attendance cells */}
                {scheduleDates.map((date) => {
                  const isToday = date === today
                  const isFuture = date > today

                  return (
                    <AttendanceCell
                      key={date}
                      studentId={student.id}
                      date={date}
                      status={getCellStatus(student.id, date)}
                      isPending={isCellPending(student.id, date)}
                      isToday={isToday}
                      isFuture={isFuture}
                      note={getCellNote(student.id, date)}
                      notePopover={notePopover}
                      noteText={noteText}
                      onStatusChange={onStatusChange}
                      onNotePopoverOpen={onNotePopoverOpen}
                      onNotePopoverClose={onNotePopoverClose}
                      onNoteTextChange={onNoteTextChange}
                      onNoteSave={onNoteSave}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>

          {/* Footer row: per-column totals */}
          <tfoot className="sticky bottom-0 z-20">
            <tr className="bg-gray-100 border-t-2 border-gray-300">
              <td className="sticky left-0 z-30 bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 border-r border-gray-200 text-center" colSpan={1}>
                TỔNG
              </td>
              <td className="sticky left-12 z-30 bg-gray-100 px-4 py-2 border-r border-gray-200">
                <span className="text-xs font-semibold text-gray-500">{filteredStudents.length} HV</span>
              </td>
              {scheduleDates.map((date) => {
                const col = columnSummaries[date]
                const isFuture = date > today
                if (!col || isFuture) {
                  return (
                    <td key={date} className="px-2 py-2 text-center border-r border-gray-100 bg-gray-100 opacity-40">
                      <span className="text-gray-300 text-[10px]">—</span>
                    </td>
                  )
                }
                return (
                  <td key={date} className="px-1 py-1.5 text-center border-r border-gray-100 bg-gray-100">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-bold text-emerald-600">{col.present}</span>
                      <span className="text-[10px] font-bold text-red-500">{col.absent}</span>
                    </div>
                  </td>
                )
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <AttendanceFooter
        pendingCount={pendingChanges.size}
        isSaving={isSaving}
        onSave={onSave}
        overallSummary={overallSummary}
      />
    </Card>
  )
}
