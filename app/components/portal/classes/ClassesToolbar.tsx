"use client"

import { Input, Select, SelectItem } from "@heroui/react"
import { Search } from "lucide-react"
import { CLASS_STATUS_OPTIONS } from "@/app/constants/portal"

interface ClassesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
}

export default function ClassesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: ClassesToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        isClearable
        className="w-full sm:max-w-xs"
        placeholder="Tìm kiếm lớp học..."
        startContent={<Search className="w-4 h-4 text-default-400" />}
        value={search}
        onValueChange={onSearchChange}
        onClear={() => onSearchChange("")}
        size="sm"
      />
      <Select
        placeholder="Trạng thái"
        size="sm"
        selectedKeys={[statusFilter]}
        onSelectionChange={(keys) => {
          const val = Array.from(keys)[0] as string
          onStatusChange(val || "ALL")
        }}
        className="w-full sm:w-40"
      >
        {CLASS_STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.key}>{opt.label}</SelectItem>
        ))}
      </Select>
    </div>
  )
}
