"use client"

import { Button, Chip } from "@heroui/react"
import { Save, Check, X } from "lucide-react"

/* ───────────────── Types ───────────────── */

interface AttendanceSummary {
  present: number
  absent: number
  unmarked: number
  total: number
}

interface AttendanceFooterProps {
  pendingCount: number
  isSaving: boolean
  onSave: () => void
  /** Per-column (date) summary – keyed by date string */
  dateSummaries?: Record<string, AttendanceSummary>
  /** Overall summary across all dates */
  overallSummary?: {
    totalPresent: number
    totalAbsent: number
    totalUnmarked: number
  }
}

/* ───────────────── Component ───────────────── */

export default function AttendanceFooter({
  pendingCount,
  isSaving,
  onSave,
  overallSummary,
}: AttendanceFooterProps) {
  return (
    <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[2.5]" />
          </div>
          <span>CÓ MẶT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full border-2 border-red-500 bg-red-50 flex items-center justify-center">
            <X className="w-2.5 h-2.5 text-red-600 stroke-[2.5]" />
          </div>
          <span>VẮNG</span>
        </div>

        {/* Overall summary chips */}
        {overallSummary && (
          <div className="flex items-center gap-2 ml-4 border-l border-gray-300 pl-4">
            <Chip size="sm" variant="flat" color="success">
              Tổng có mặt: {overallSummary.totalPresent}
            </Chip>
            <Chip size="sm" variant="flat" color="danger">
              Tổng vắng: {overallSummary.totalAbsent}
            </Chip>
            {overallSummary.totalUnmarked > 0 && (
              <Chip size="sm" variant="flat">
                Chưa điểm danh: {overallSummary.totalUnmarked}
              </Chip>
            )}
          </div>
        )}
      </div>

      <Button
        color="primary"
        startContent={!isSaving && <Save className="w-4 h-4" />}
        isLoading={isSaving}
        isDisabled={pendingCount === 0}
        onPress={onSave}
      >
        Điểm danh
      </Button>
    </div>
  )
}
