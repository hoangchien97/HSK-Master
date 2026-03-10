"use client"

import { useEffect, useCallback, useRef } from "react"

/**
 * Keyboard shortcut map: key string → handler function.
 * Key strings follow KeyboardEvent.key (case-insensitive matching).
 * Special keys: "Space", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
 */
export type KeyMap = Record<string, () => void>

interface Options {
  /** Whether the keyboard shortcuts are enabled. Default true. */
  enabled?: boolean
}

/**
 * Custom hook for practice tab keyboard shortcuts.
 *
 * Automatically disabled when the user is focused on an input, textarea,
 * or contenteditable element (to avoid conflicts with chatbot, search, etc.).
 *
 * Usage:
 * ```tsx
 * usePracticeKeyboard({
 *   " ": () => handleFlip(),         // Space to flip
 *   "ArrowLeft": () => handleHard(), // ← for HARD
 *   "1": () => handleSelect(0),     // Number keys for quiz
 * }, { enabled: !isFinished })
 * ```
 */
export function usePracticeKeyboard(keyMap: KeyMap, options: Options = {}) {
  const { enabled = true } = options
  const keyMapRef = useRef(keyMap)

  // Keep ref in sync to avoid re-attaching listener on every render
  useEffect(() => {
    keyMapRef.current = keyMap
  }, [keyMap])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Skip when user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest("[role='dialog']") || // chatbot modals
        target.closest("[data-chatbot]") // chatbot container
      ) {
        return
      }

      const handler = keyMapRef.current[e.key]
      if (handler) {
        e.preventDefault()
        handler()
      }
    },
    [enabled],
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown, enabled])
}

/**
 * Small hint text component for keyboard shortcuts.
 * Hidden on mobile (≤425px), visible on desktop (≥1280px).
 */
export function KeyHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="hidden xl:inline text-[10px] text-default-400 ml-1">
      {children}
    </span>
  )
}
