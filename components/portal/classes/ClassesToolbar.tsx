"use client"

import { Select, type SelectOption } from "@/components/ui"
import { Search, X } from "lucide-react"
import { CLASS_STATUS_OPTIONS } from "@/constants/portal"

interface ClassesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
}

const STATUS_SELECT_OPTIONS: SelectOption[] = CLASS_STATUS_OPTIONS.map((opt) => ({
  value: opt.key,
  label: opt.label,
}))

export default function ClassesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: ClassesToolbarProps) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm lớp học..."
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
        <div className="w-full sm:w-40">
          <Select
            options={STATUS_SELECT_OPTIONS}
            value={statusFilter}
            onChange={(val) => onStatusChange(val || "ALL")}
            placeholder="Trạng thái"
          />
        </div>
      </div>
    </div>
  )
}
