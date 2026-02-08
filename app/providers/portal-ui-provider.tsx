"use client"

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { setGlobalLoader } from "@/app/lib/http/loaderBridge"

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
  const [count, setCount] = useState(0)
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({})

  const startLoading = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  const stopLoading = useCallback(() => {
    setCount((c) => Math.max(0, c - 1))
  }, [])

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
