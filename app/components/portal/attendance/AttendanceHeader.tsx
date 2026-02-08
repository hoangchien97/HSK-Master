"use client"

import {
  Input,
  Select,
  SelectItem,
  Chip,
  DatePicker,
} from "@heroui/react"
import { Search, Wifi, WifiOff } from "lucide-react"
import { CalendarDate } from "@internationalized/date"

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
  currentMonth: string // "YYYY-MM"
  onMonthChange: (month: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isOnline: boolean
  pendingCount: number
}

/* ───────────────── Component ───────────────── */

export default function AttendanceHeader({
  classes,
  selectedClassId,
  onClassChange,
  currentMonth,
  onMonthChange,
  searchQuery,
  onSearchChange,
  isOnline,
  pendingCount,
}: AttendanceHeaderProps) {
  // Parse YYYY-MM to CalendarDate (first day of month)
  const [year, month] = currentMonth.split("-").map(Number)
  const calendarValue = new CalendarDate(year, month, 1)

  const handleDateChange = (value: CalendarDate | null) => {
    if (value) {
      const m = String(value.month).padStart(2, "0")
      onMonthChange(`${value.year}-${m}`)
    }
  }

  return (
    <div className="shrink-0 space-y-3 pb-3">
      {/* Row 1: Status indicators */}
      <div className="flex items-center justify-end gap-2">
        <Chip
          startContent={isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          color={isOnline ? "success" : "warning"}
          variant="flat"
          size="sm"
        >
          {isOnline ? "Online" : "Offline"}
        </Chip>
        {pendingCount > 0 && (
          <Chip color="warning" variant="flat" size="sm">
            Chưa lưu: {pendingCount}
          </Chip>
        )}
      </div>

      {/* Row 2: Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <Input
          label="Tên học viên"
          placeholder="Tìm tên học viên..."
          startContent={<Search className="w-4 h-4 text-default-400" />}
          value={searchQuery}
          onValueChange={onSearchChange}
          size="sm"
          className="w-56"
          isClearable
          onClear={() => onSearchChange("")}
          labelPlacement="outside"
        />

        {/* Class selector */}
        <Select
          label="Lớp học"
          labelPlacement="outside"
          selectedKeys={selectedClassId ? new Set([selectedClassId]) : new Set()}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string
            if (val) onClassChange(val)
          }}
          className="w-64"
          size="sm"
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

        {/* Month picker with HeroUI DatePicker (month granularity) */}
        <DatePicker
          label="Tháng"
          labelPlacement="outside"
          granularity="day"
          value={calendarValue}
          onChange={handleDateChange}
          size="sm"
          className="w-48"
          showMonthAndYearPickers
        />
      </div>
    </div>
  )
}
