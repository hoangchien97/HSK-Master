"use client"

import { cn } from "@/app/lib/utils"

interface DataCardProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  contentClassName?: string
}

export function DataCard({
  title,
  children,
  action,
  className,
  contentClassName,
}: DataCardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200", className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className={cn("p-6", contentClassName)}>{children}</div>
    </div>
  )
}
