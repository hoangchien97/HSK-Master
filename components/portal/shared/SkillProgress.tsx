"use client"

import { cn } from "@/lib/utils"
import { ProgressBar } from "./ProgressBar"

interface SkillProgressProps {
  skill: string
  level: string
  progress: number
  icon?: React.ReactNode
  color?: "red" | "blue" | "green" | "orange" | "purple"
  className?: string
}

export function SkillProgress({
  skill,
  level,
  progress,
  icon,
  color = "red",
  className,
}: SkillProgressProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-100 p-4", className)}>
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
            {icon}
          </div>
        )}
        <div>
          <h4 className="font-medium text-gray-900">{skill}</h4>
          <p className="text-sm text-gray-500">{level}</p>
        </div>
      </div>
      <ProgressBar value={progress} color={color} size="md" showLabel />
    </div>
  )
}
