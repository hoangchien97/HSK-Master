"use client"

import { useState, useCallback } from "react"
import { Select, type SelectOption } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Button } from "@/components/ui"
import { Tooltip } from "@/components/ui"
import { Search, FileSpreadsheet, Loader2, X } from "lucide-react"
import { toast } from "react-toastify"
import type { AttendanceMatrixData } from "@/actions/attendance.actions"

/* ───────────────── Types ───────────────── */

interface ClassOption {
  id: string
  className: string
  classCode: string
  level: string | null
  _count: { enrollments: number }
}

interface AttendanceHeaderProps {
  classes: ClassOption[]
  selectedClassId: string
  onClassChange: (classId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  pendingCount: number
  scheduleDates: string[]
  matrixData: AttendanceMatrixData | null
}

/* ───────────────── Component ───────────────── */

export default function AttendanceHeader({
  classes,
  selectedClassId,
  onClassChange,
  searchQuery,
  onSearchChange,
  pendingCount,
  scheduleDates,
  matrixData,
}: AttendanceHeaderProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const canExport = !!selectedClassId && scheduleDates.length > 0 && !!matrixData

  const handleExport = useCallback(async () => {
    if (!canExport || !matrixData) return

    setIsExporting(true)
    setExportProgress(10)

    try {
      // Collect sessionIds from matrixData schedules that match visible dates
      const dateSet = new Set(scheduleDates)
      const sessionIds = matrixData.schedules
        .filter((s) => dateSet.has(s.date))
        .map((s) => s.id)

      if (sessionIds.length === 0) {
        toast.warning("Không có buổi học nào để export")
        return
      }

      setExportProgress(30)

      const res = await fetch("/api/portal/attendance/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          sessionIds,
          timezone: "Asia/Ho_Chi_Minh",
        }),
      })

      setExportProgress(70)

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export thất bại" }))
        throw new Error(err.error || "Export thất bại")
      }

      setExportProgress(90)

      // Extract filename from Content-Disposition header
      const disposition = res.headers.get("Content-Disposition")
      let filename = "diem_danh.xlsx"
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]*)/)
        if (match?.[1]) filename = decodeURIComponent(match[1])
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportProgress(100)
      toast.success("Export thành công!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi khi export")
    } finally {
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 500)
    }
  }, [canExport, matrixData, scheduleDates, selectedClassId])

  const classOptions: SelectOption[] = classes.map((c) => ({
    value: c.id,
    label: `${c.className} (${c.classCode}) — ${c._count.enrollments} HV`,
  }))

  return (
    <div className="shrink-0 flex flex-col gap-3">
      {/* Filter bar */}
      <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Class selector */}
          <Select
            value={selectedClassId}
            onChange={(val) => { if (val) onClassChange(val) }}
            options={classOptions}
            placeholder="Chọn lớp học"
            className="w-full sm:w-64"
          />

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm tên học viên..."
              className="h-9 w-full pl-9 pr-8 rounded-md border border-(--color-smoke) bg-white text-sm text-(--color-ink) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-vermillion)"
            />
            {searchQuery && (
              <button type="button" onClick={() => onSearchChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-ink)">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pending count indicator */}
          {pendingCount > 0 && (
            <Badge variant="warning" size="sm" className="shrink-0">
              Chưa lưu: {pendingCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions row: Export button — sits between filter and table */}
      {canExport && (
        <div className="flex items-center justify-end">
          <Tooltip
            content="Export điểm danh ra Excel"
            placement="bottom"
          >
            <Button
              size="sm"
              variant="secondary"
              isDisabled={isExporting}
              onClick={handleExport}
              leftIcon={
                isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )
              }
            >
              {isExporting ? `${exportProgress}%` : "Export"}
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
