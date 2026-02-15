"use client"

import { Button } from "@heroui/react"
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

        if (showResult) {
          if (option.key === correctKey) {
            variant = "flat"
            color = "success"
          } else if (option.key === selectedKey) {
            variant = "flat"
            color = "danger"
          }
        }

        return (
          <Button
            key={option.key}
            variant={variant}
            color={color}
            className={`justify-start text-left h-auto py-3 px-4 ${largeFont ? "text-xl" : "text-sm"}`}
            onPress={() => onSelect(option.key)}
            isDisabled={showResult}
            startContent={
              showResult && option.key === correctKey ? (
                <CheckCircle className="w-5 h-5 text-success shrink-0" />
              ) : showResult && option.key === selectedKey ? (
                <XCircle className="w-5 h-5 text-danger shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-default-300 shrink-0" />
              )
            }
          >
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}
