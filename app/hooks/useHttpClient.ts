"use client"

import { useCallback, useRef } from "react"
import { useLoading } from "@/app/providers"
import { toast } from "react-toastify"

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  /** If true, the global loading spinner will NOT show (default: false) */
  silent?: boolean
}

interface HttpResponse<T = unknown> {
  data: T
  ok: boolean
  status: number
}

/**
 * Custom hook that returns an http client wired to the global LoadingContext.
 *
 * Usage:
 * ```ts
 * const http = useHttpClient()
 * const { data } = await http.get<User[]>("/api/portal/users")
 * await http.post("/api/portal/users", { name: "John" })
 * ```
 */
export function useHttpClient() {
  const { startLoading, stopLoading } = useLoading()
  const abortControllers = useRef<Set<AbortController>>(new Set())

  const request = useCallback(
    async <T = unknown>(
      url: string,
      options: RequestOptions = {},
    ): Promise<HttpResponse<T>> => {
      const { silent = false, body, ...fetchOptions } = options

      const controller = new AbortController()
      abortControllers.current.add(controller)

      if (!silent) startLoading()

      try {
        const headers: HeadersInit = {
          ...((fetchOptions.headers as Record<string, string>) || {}),
        }

        // Auto-set Content-Type for JSON bodies
        if (body !== undefined && !(body instanceof FormData)) {
          headers["Content-Type"] = "application/json"
        }

        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          body:
            body instanceof FormData
              ? body
              : body !== undefined
                ? JSON.stringify(body)
                : undefined,
          signal: controller.signal,
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          const message =
            (data as { message?: string })?.message ||
            `Request failed with status ${response.status}`
          toast.error(message)
        }

        return { data: data as T, ok: response.ok, status: response.status }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          // Request was cancelled – don't show error
          return { data: null as T, ok: false, status: 0 }
        }
        toast.error("Có lỗi xảy ra khi kết nối đến server")
        return { data: null as T, ok: false, status: 0 }
      } finally {
        abortControllers.current.delete(controller)
        if (!silent) stopLoading()
      }
    },
    [startLoading, stopLoading],
  )

  const get = useCallback(
    <T = unknown>(url: string, options?: RequestOptions) =>
      request<T>(url, { ...options, method: "GET" }),
    [request],
  )

  const post = useCallback(
    <T = unknown>(url: string, body?: unknown, options?: RequestOptions) =>
      request<T>(url, { ...options, method: "POST", body }),
    [request],
  )

  const put = useCallback(
    <T = unknown>(url: string, body?: unknown, options?: RequestOptions) =>
      request<T>(url, { ...options, method: "PUT", body }),
    [request],
  )

  const patch = useCallback(
    <T = unknown>(url: string, body?: unknown, options?: RequestOptions) =>
      request<T>(url, { ...options, method: "PATCH", body }),
    [request],
  )

  const del = useCallback(
    <T = unknown>(url: string, options?: RequestOptions) =>
      request<T>(url, { ...options, method: "DELETE" }),
    [request],
  )

  /** Cancel all in-flight requests */
  const cancelAll = useCallback(() => {
    abortControllers.current.forEach((c) => c.abort())
    abortControllers.current.clear()
  }, [])

  return { get, post, put, patch, del, request, cancelAll }
}
