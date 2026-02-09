"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4 md:gap-6", gridCols[columns], className)}>
      {children}
    </div>
  )
}
