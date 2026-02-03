"use client"

import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"

interface AssignmentItemProps {
  id: string
  title: string
  className_?: string
  dueDate?: Date
  status: "pending" | "submitted" | "graded" | "late" | "overdue"
  score?: number
  maxScore?: number
  type?: string
  href?: string
}

export function AssignmentItem({
  id,
  title,
  className_,
  dueDate,
  status,
  score,
  maxScore = 100,
  type,
  href,
}: AssignmentItemProps) {
  const statusConfig = {
    pending: { text: "Chờ nộp", bg: "bg-yellow-100 text-yellow-700" },
    submitted: { text: "Đã nộp", bg: "bg-blue-100 text-blue-700" },
    graded: { text: "Đã chấm", bg: "bg-green-100 text-green-700" },
    late: { text: "Nộp muộn", bg: "bg-orange-100 text-orange-700" },
    overdue: { text: "Quá hạn", bg: "bg-red-100 text-red-700" },
  }

  const content = (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 truncate">{title}</h4>
          {type && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {type}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
          {className_ && <span>{className_}</span>}
          {dueDate && (
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {format(dueDate, "dd/MM/yyyy HH:mm", { locale: vi })}
            </span>
          )}
          {status === "graded" && score !== undefined && (
            <span className="font-medium text-green-600">
              {score}/{maxScore} điểm
            </span>
          )}
        </div>
      </div>
      <span
        className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-3",
          statusConfig[status].bg
        )}
      >
        {statusConfig[status].text}
      </span>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

interface AssignmentListProps {
  items: Array<{
    id: string
    title: string
    className_?: string
    dueDate?: Date
    status: "pending" | "submitted" | "graded" | "late" | "overdue"
    score?: number
    maxScore?: number
    type?: string
  }>
  baseHref?: string
  emptyMessage?: string
  className?: string
}

export function AssignmentList({
  items,
  baseHref,
  emptyMessage = "Không có bài tập nào",
  className,
}: AssignmentListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <AssignmentItem
          key={item.id}
          {...item}
          href={baseHref ? `${baseHref}/${item.id}` : undefined}
        />
      ))}
    </div>
  )
}
