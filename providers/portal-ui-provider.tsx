"use client"

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import { setGlobalLoader } from "@/lib/http/loaderBridge"

/* ------------------------------------------------------------------ */
/*  Context shape                                                     */
/* ------------------------------------------------------------------ */

interface PortalUIContextValue {
  /** `true` when at least one loading operation is active */
  isLoading: boolean
  /** Increment the loading counter (optionally keyed) */
  startLoading: (key?: string) => void
  /** Decrement the loading counter */
  stopLoading: (key?: string) => void
  /** Dynamic breadcrumb labels for current page (e.g. classId → class name) */
  dynamicLabels: Record<string, string>
  /** Set a dynamic breadcrumb label for a URL segment */
  setDynamicLabel: (segment: string, label: string) => void
  /** Clear all dynamic labels (called on navigation) */
  clearDynamicLabels: () => void
}

const PortalUIContext = createContext<PortalUIContextValue | undefined>(undefined)

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */

export function PortalUIProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [count, setCount] = useState(0)
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({})
  const prevPathRef = useRef(pathname)

  const startLoading = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  const stopLoading = useCallback(() => {
    setCount((c) => Math.max(0, c - 1))
  }, [])

  /* ──────────────────────────────────────────────────────────────────
   * CENTRALIZED FIX: Reset loading on route change.
   *
   * Problem: When user navigates away, the old page's server action
   * await may never settle (Next.js discards the response on route
   * change). This means `finally { stopLoading() }` never fires,
   * leaving the loading counter permanently > 0.
   *
   * Fix: Whenever pathname changes, reset the counter to 0.
   * The new page's own loadData will call startLoading → 1 again.
   * This is the ONE centralized place that handles loading for
   * ALL pages — no per-page fixes needed.
   * ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      // Reset any stuck loading from the previous page
      setCount(0)
    }
  }, [pathname])

  const setDynamicLabel = useCallback((segment: string, label: string) => {
    setDynamicLabels((prev) => ({ ...prev, [segment]: label }))
  }, [])

  const clearDynamicLabels = useCallback(() => {
    setDynamicLabels({})
  }, [])

  // Bridge: let the axios interceptors call our React state setters
  useEffect(() => {
    setGlobalLoader(startLoading, stopLoading)
  }, [startLoading, stopLoading])

  return (
    <PortalUIContext.Provider
      value={{
        isLoading: count > 0,
        startLoading,
        stopLoading,
        dynamicLabels,
        setDynamicLabel,
        clearDynamicLabels,
      }}
    >
      {children}
    </PortalUIContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export function usePortalUI(): PortalUIContextValue {
  const ctx = useContext(PortalUIContext)
  if (!ctx) {
    throw new Error("usePortalUI must be used within a PortalUIProvider")
  }
  return ctx
}
