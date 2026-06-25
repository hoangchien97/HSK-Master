"use client"

import { cn } from "@/lib/utils"

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
    <div className={cn("bg-[var(--color-surface)] rounded-xl border border-[var(--color-smoke)]", className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-smoke)]">
        <h3 className="font-semibold text-[var(--color-ink)]">{title}</h3>
        {action}
      </div>
      <div className={cn("p-6", contentClassName)}>{children}</div>
    </div>
  )
}
