"use client"

import { useCallback, useMemo, useRef, useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PAGINATION } from "@/app/constants/portal/pagination"

/**
 * Generic hook that syncs table filter/pagination state with URL search params.
 *
 * @param defaults  Key-value pairs for default param values.
 *                  Keys with value "" or matching the built-in defaults are omitted from the URL.
 *
 * @example
 * const { params, setParam, setParams } = useTableParams({
 *   search: "",
 *   level: "ALL",
 *   page: "1",
 *   pageSize: "10",
 * })
 */
export function useTableParams<T extends Record<string, string>>(defaults: T) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isInitialMount = useRef(true)

  // Build current params from URL, falling back to defaults
  const params = useMemo(() => {
    const result = { ...defaults }
    for (const key of Object.keys(defaults)) {
      const urlVal = searchParams.get(key)
      if (urlVal !== null) {
        ;(result as Record<string, string>)[key] = urlVal
      }
    }
    return result
  }, [searchParams, defaults])

  // Setter for a single param
  const setParam = useCallback(
    (key: keyof T, value: string) => {
      const newParams = new URLSearchParams(searchParams.toString())

      // If the value matches the default, remove it from URL to keep URL clean
      if (value === defaults[key] || value === "") {
        newParams.delete(key as string)
      } else {
        newParams.set(key as string, value)
      }

      // Reset page to 1 when a non-page filter changes
      if (key !== "page") {
        newParams.delete("page")
      }

      const qs = newParams.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false })
    },
    [searchParams, router, pathname, defaults],
  )

  // Setter for multiple params at once
  const setParams = useCallback(
    (updates: Partial<T>) => {
      const newParams = new URLSearchParams(searchParams.toString())

      let pageReset = false
      for (const [key, value] of Object.entries(updates)) {
        if (value === defaults[key as keyof T] || value === "") {
          newParams.delete(key)
        } else {
          newParams.set(key, value as string)
        }
        if (key !== "page") pageReset = true
      }

      if (pageReset && !("page" in updates)) {
        newParams.delete("page")
      }

      const qs = newParams.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false })
    },
    [searchParams, router, pathname, defaults],
  )

  return { params, setParam, setParams }
}

/**
 * Debounce hook that returns a debounced value.
 */
export function useDebouncedValue(value: string, delay = 350): string {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
