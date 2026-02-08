"use client"

import { Button } from "@heroui/react"
import { Save, Check, X } from "lucide-react"

/* ───────────────── Types ───────────────── */

interface AttendanceFooterProps {
  pendingCount: number
  isSaving: boolean
  onSave: () => void
}

/* ───────────────── Component ───────────────── */

export default function AttendanceFooter({
  pendingCount,
  isSaving,
  onSave,
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
