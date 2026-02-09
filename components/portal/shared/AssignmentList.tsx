"use client"

import { cn } from "@/lib/utils"
import { AssignmentItem } from "./AssignmentItem"

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
