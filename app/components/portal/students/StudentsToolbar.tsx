"use client"

import { Input, Select, SelectItem } from "@heroui/react"
import { Search } from "lucide-react"
import { HSK_LEVELS } from "@/app/constants/portal"

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
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        isClearable
        placeholder="Tìm kiếm học viên..."
        startContent={<Search className="w-4 h-4 text-default-400" />}
        value={search}
        onValueChange={onSearchChange}
        onClear={() => onSearchChange("")}
        className="w-full sm:max-w-xs"
        size="sm"
      />
      <Select
        placeholder="Tất cả trình độ"
        size="sm"
        selectedKeys={[levelFilter]}
        onSelectionChange={(keys) => {
          const val = Array.from(keys)[0] as string
          onLevelChange(val || "ALL")
        }}
        className="w-full sm:w-44"
      >
        {HSK_LEVELS.map((l) => (
          <SelectItem key={l.key}>{l.label}</SelectItem>
        ))}
      </Select>
      {classes.length > 0 && (
        <Select
          placeholder="Tất cả lớp"
          size="sm"
          selectedKeys={[classFilter]}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string
            onClassChange(val || "ALL")
          }}
          className="w-full sm:w-52"
        >
          {[{ id: "ALL", className: "Tất cả lớp", classCode: "" }, ...classes].map(
            (c) => (
              <SelectItem key={c.id}>
                {c.id === "ALL" ? c.className : `${c.className} (${c.classCode})`}
              </SelectItem>
            ),
          )}
        </Select>
      )}
    </div>
  )
}
