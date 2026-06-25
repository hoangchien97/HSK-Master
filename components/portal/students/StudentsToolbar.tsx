"use client"

import { Select, type SelectOption } from "@/components/ui"
import { Search, X } from "lucide-react"
import { HSK_LEVELS } from "@/constants/portal"

interface ClassOption {
  id: string
  className: string
  classCode: string
}

interface StudentsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  levelFilter: string
  onLevelChange: (value: string) => void
  classFilter: string
  onClassChange: (value: string) => void
  classes: ClassOption[]
}

export default function StudentsToolbar({
  search,
  onSearchChange,
  levelFilter,
  onLevelChange,
  classFilter,
  onClassChange,
  classes,
}: StudentsToolbarProps) {
  const levelOptions: SelectOption[] = HSK_LEVELS.map((l) => ({
    value: l.key,
    label: l.label,
  }))

  const classOptions: SelectOption[] = [
    { value: "ALL", label: "Tất cả lớp" },
    ...classes.map((c) => ({
      value: c.id,
      label: `${c.className} (${c.classCode})`,
    })),
  ]

  return (
    <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm học viên..."
            className="h-9 w-full pl-9 pr-8 rounded-md border border-(--color-smoke) bg-white text-sm text-(--color-ink) placeholder:text-(--color-muted) focus:outline-none focus:ring-2 focus:ring-(--color-vermillion)"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-muted) hover:text-(--color-ink)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Select
          value={levelFilter}
          onChange={onLevelChange}
          options={levelOptions}
          placeholder="Tất cả trình độ"
          className="w-full sm:w-44"
        />
        {classes.length > 0 && (
          <Select
            value={classFilter}
            onChange={onClassChange}
            options={classOptions}
            placeholder="Tất cả lớp"
            className="w-full sm:w-52"
          />
        )}
      </div>
    </div>
  )
}
