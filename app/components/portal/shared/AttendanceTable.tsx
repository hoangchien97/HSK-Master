"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Check, X, ChevronDown, ChevronUp } from "lucide-react"

interface Student {
  id: string
  name: string
  image?: string | null
}

interface AttendanceRecord {
  studentId: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
}

interface AttendanceTableProps {
  students: Student[]
  attendance: AttendanceRecord[]
  onAttendanceChange?: (studentId: string, status: AttendanceRecord["status"]) => void
  readonly?: boolean
  className?: string
}

export function AttendanceTable({
  students,
  attendance,
  onAttendanceChange,
  readonly = false,
  className,
}: AttendanceTableProps) {
  const getStudentAttendance = (studentId: string) => {
    return attendance.find((a) => a.studentId === studentId)?.status || "present"
  }

  const statusConfig = {
    present: { text: "Có mặt", bg: "bg-green-100 text-green-700", icon: Check },
    absent: { text: "Vắng", bg: "bg-red-100 text-red-700", icon: X },
    late: { text: "Muộn", bg: "bg-yellow-100 text-yellow-700", icon: ChevronDown },
    excused: { text: "Có phép", bg: "bg-blue-100 text-blue-700", icon: ChevronUp },
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Học viên</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map((student) => {
            const status = getStudentAttendance(student.id)
            const StatusIcon = statusConfig[status].icon

            return (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {student.image ? (
                        <img
                          src={student.image}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {student.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{student.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {readonly ? (
                    <div className="flex justify-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                          statusConfig[status].bg
                        )}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[status].text}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(
                        (statusKey) => {
                          const config = statusConfig[statusKey]
                          const isActive = status === statusKey

                          return (
                            <button
                              key={statusKey}
                              onClick={() => onAttendanceChange?.(student.id, statusKey)}
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                                isActive
                                  ? config.bg
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              )}
                            >
                              {config.text}
                            </button>
                          )
                        }
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface AttendanceSummaryProps {
  present: number
  absent: number
  late: number
  excused: number
  className?: string
}

export function AttendanceSummary({
  present,
  absent,
  late,
  excused,
  className,
}: AttendanceSummaryProps) {
  const total = present + absent + late + excused
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-5 gap-4", className)}>
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-700">{present}</div>
        <div className="text-sm text-green-600">Có mặt</div>
      </div>
      <div className="bg-red-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-red-700">{absent}</div>
        <div className="text-sm text-red-600">Vắng</div>
      </div>
      <div className="bg-yellow-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-yellow-700">{late}</div>
        <div className="text-sm text-yellow-600">Muộn</div>
      </div>
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-700">{excused}</div>
        <div className="text-sm text-blue-600">Có phép</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-gray-700">{attendanceRate}%</div>
        <div className="text-sm text-gray-600">Tỷ lệ</div>
      </div>
    </div>
  )
}
