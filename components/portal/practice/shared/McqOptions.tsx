"use client"

import { CheckCircle, XCircle } from "lucide-react"

interface Option {
  key: string
  label: string
}

interface Props {
  options: Option[]
  correctKey: string
  selectedKey: string | null
  showResult: boolean
  onSelect: (key: string) => void
  /** For hanzi display use larger font */
  largeFont?: boolean
}

export default function McqOptions({
  options,
  correctKey,
  selectedKey,
  showResult,
  onSelect,
  largeFont,
}: Props) {
  return (
    <div className="grid gap-2">
      {options.map((option) => {
        let variant: "bordered" | "flat" = "bordered"
        let color: "default" | "success" | "danger" = "default"
        let hoverClass = "hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:border-primary-300"

        if (showResult) {
          hoverClass = ""
          if (option.key === correctKey) {
            variant = "flat"
            color = "success"
          } else if (option.key === selectedKey) {
            variant = "flat"
            color = "danger"
          }
        }

        return (
          <button
            key={option.key}
            type="button"
            disabled={showResult}
            onClick={() => {
              if (!showResult) onSelect(option.key)
            }}
            className={`flex items-center gap-3 w-full text-left h-auto py-3 px-4 rounded-lg border transition-all ${
              largeFont ? "text-xl" : "text-sm"
            } ${
              showResult && option.key === correctKey
                ? "border-success-300 bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-300"
                : showResult && option.key === selectedKey
                  ? "border-danger-300 bg-danger-50 dark:bg-danger-950/20 text-danger-700 dark:text-danger-300"
                  : showResult
                    ? "border-default-200 opacity-60"
                    : `border-default-200 cursor-pointer ${hoverClass} active:scale-[0.98]`
            }`}
          >
            {showResult && option.key === correctKey ? (
              <CheckCircle className="w-5 h-5 text-success shrink-0" />
            ) : showResult && option.key === selectedKey ? (
              <XCircle className="w-5 h-5 text-danger shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-default-300 shrink-0" />
            )}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
