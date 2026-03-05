"use client"

import { useCallback, useMemo, useRef, useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PAGINATION } from "@/constants/portal/pagination"
import type { SortDescriptor } from "@heroui/react"

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

/**
 * Sync debounced search value to URL — skips initial mount to prevent
 * double API calls.
 *
 * Problem: raw `useEffect([debouncedSearch])` fires on mount → triggers
 * `updateUrl` → causes `router.replace` → re-renders → `loadData` fires
 * a SECOND time. This hook skips mount and only syncs on actual user input.
 *
 * @example
 * useSyncSearchToUrl(debouncedSearch, updateUrl)
 */
export function useSyncSearchToUrl(
  debouncedSearch: string,
  updateUrl: (updates: Record<string, string>) => void,
) {
  const isMount = useRef(true)

  useEffect(() => {
    if (isMount.current) {
      isMount.current = false
      return
    }
    updateUrl({ search: debouncedSearch })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])
}

/**
 * Reusable hook for table sorting synced with URL params.
 *
 * Reads `sortBy` and `sortOrder` from the URL.
 * Returns a `SortDescriptor` compatible with HeroUI's Table and
 * a handler that updates the URL when the user clicks a sortable column.
 *
 * @param updateUrl  Function that merges partial params into the URL
 * @param searchParams  Current URLSearchParams instance
 *
 * @example
 * const { sortDescriptor, onSortChange } = useTableSort(updateUrl, searchParams)
 * <CTable sortDescriptor={sortDescriptor} onSortChange={onSortChange} ... />
 */
export function useTableSort(
  updateUrl: (updates: Record<string, string>) => void,
  searchParams: URLSearchParams,
) {
  const sortDescriptor: SortDescriptor = useMemo(() => {
    const column = searchParams.get("sortBy") || ""
    const direction = searchParams.get("sortOrder") === "descending" ? "descending" : "ascending"
    if (!column) return {}
    return { column, direction }
  }, [searchParams])

  const onSortChange = useCallback(
    (descriptor: SortDescriptor) => {
      const column = descriptor.column ? String(descriptor.column) : ""
      const direction = descriptor.direction || "ascending"
      updateUrl({
        sortBy: column,
        sortOrder: direction,
        page: "1", // reset to first page on sort change
      })
    },
    [updateUrl],
  )

  return { sortDescriptor, onSortChange }
}
