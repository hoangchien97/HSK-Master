"use client"

import { Calendar, Plus, Search } from "lucide-react"
import { Button, Input } from "@heroui/react"
import { useState } from "react"

interface CalendarHeaderProps {
  onCreateEvent?: () => void
  onSearch?: (query: string) => void
  onViewChange?: (view: "day" | "week" | "month") => void
  currentView?: "day" | "week" | "month"
  isReadOnly?: boolean
}

export default function CalendarHeader({
  onCreateEvent,
  onSearch,
  onViewChange,
  currentView = "week",
  isReadOnly = false,
}: CalendarHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isReadOnly ? "Lịch học của tôi" : "Lịch giảng dạy"}
            </h1>
            <p className="text-sm text-gray-500">
              {isReadOnly
                ? "Xem lịch học và thông tin lớp học"
                : "Quản lý lịch dạy và lớp học"}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm lớp học..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 w-64"
            />
          </div>

          {/* View Switcher */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange?.("day")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === "day"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => onViewChange?.("week")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => onViewChange?.("month")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === "month"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Tháng
            </button>
          </div>

          {/* Create Button (Teacher only) */}
          {!isReadOnly && (
            <Button
              onClick={onCreateEvent}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
            >
              <Plus className="w-4 h-4" />
              Thêm lịch học
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
