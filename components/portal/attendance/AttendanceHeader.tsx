"use client"

import { useState, useCallback } from "react"
import {
  Input,
  Select,
  SelectItem,
  Chip,
  Button,
  Tooltip,
} from "@heroui/react"
import { Search, FileSpreadsheet, Loader2 } from "lucide-react"
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

  return (
    <div className="shrink-0 rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-1 min-w-0">
          {/* Class selector */}
          <Select
            placeholder="Chọn lớp học"
            size="sm"
            selectedKeys={selectedClassId ? new Set([selectedClassId]) : new Set()}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string
              if (val) onClassChange(val)
            }}
            className="w-full sm:w-64"
          >
            {classes.map((c) => (
              <SelectItem key={c.id} textValue={`${c.className} (${c.classCode})`}>
                <div className="flex justify-between items-center">
                  <span>{c.className} ({c.classCode})</span>
                  <Chip size="sm" variant="flat">{c._count.enrollments} HV</Chip>
                </div>
              </SelectItem>
            ))}
          </Select>

          {/* Search */}
          <Input
            isClearable
            className="w-full sm:max-w-xs"
            placeholder="Tìm tên học viên..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={searchQuery}
            onValueChange={onSearchChange}
            onClear={() => onSearchChange("")}
            size="sm"
          />

          {/* Pending count indicator */}
          {pendingCount > 0 && (
            <Chip color="warning" variant="flat" size="sm" className="shrink-0">
              Chưa lưu: {pendingCount}
            </Chip>
          )}
        </div>

        {/* Right: Export button */}
        <div className="shrink-0">
          <Tooltip
            content={!canExport ? "Chọn lớp học để export" : "Export điểm danh ra Excel"}
            placement="bottom"
          >
            <div>
              <Button
                size="sm"
                variant="flat"
                color="success"
                isDisabled={!canExport || isExporting}
                onPress={handleExport}
                startContent={
                  isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )
                }
              >
                {isExporting ? `${exportProgress}%` : "Export"}
              </Button>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
