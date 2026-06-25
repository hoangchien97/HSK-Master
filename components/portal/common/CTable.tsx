"use client"

import { useMemo, useCallback } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/data/Table"
import { EmptyState } from "./EmptyState"
import { CSpinner } from "./CSpinner"
import { PAGINATION } from "@/constants/portal/pagination"

// ─── Types (structurally compatible with @heroui/react — consumers need not change) ─
export type SortDescriptor = {
  column: string | number
  direction: "ascending" | "descending"
}
export type Selection = "all" | Set<string | number>

// ─── Column definition ────────────────────────────────────────────────────────────
export interface CTableColumn<T = Record<string, unknown>> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  width?: number | string
  minWidth?: number
  align?: "start" | "center" | "end"
  headerClassName?: string
  cellClassName?: string
}

// ─── Props ────────────────────────────────────────────────────────────────────────
export interface CTableProps<T extends Record<string, unknown>> {
  columns: CTableColumn<T>[]
  data: T[]
  rowKey?: string
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  isShowPagination?: boolean
  pageSizeOptions?: number[]
  sortDescriptor?: SortDescriptor
  onSortChange?: (descriptor: SortDescriptor) => void
  selectionMode?: "none" | "single" | "multiple"
  selectedKeys?: Selection
  onSelectionChange?: (keys: Selection) => void
  toolbar?: React.ReactNode
  totalLabel?: string
  actions?: React.ReactNode
  emptyContent?: { icon?: React.ReactNode; title?: string; description?: string }
  layout?: "auto" | "fixed"
  isHeaderSticky?: boolean
  className?: string
  isStriped?: boolean
  isHoverable?: boolean
  ariaLabel?: string
  isLoading?: boolean
}

// ─── Sort indicator ───────────────────────────────────────────────────────────────
function SortIndicator({ direction }: { direction?: "ascending" | "descending" }) {
  if (!direction) return <ChevronsUpDown size={13} className="opacity-30 shrink-0" />
  if (direction === "ascending") return <ChevronUp size={13} className="text-[var(--color-vermillion)] shrink-0" />
  return <ChevronDown size={13} className="text-[var(--color-vermillion)] shrink-0" />
}

// ─── Callback-based pagination ────────────────────────────────────────────────────
function TablePagination({
  page,
  totalPages,
  isLoading,
  onPageChange,
}: {
  page: number
  totalPages: number
  isLoading: boolean
  onPageChange: (p: number) => void
}) {
  const maxVisible = 5
  const half = Math.floor(maxVisible / 2)
  let start = Math.max(1, page - half)
  const end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const btnBase =
    "inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors border border-[var(--color-smoke)]"

  return (
    <nav aria-label="Phân trang" className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || isLoading}
        aria-label="Trang trước"
        className={cn(btnBase, "hover:bg-[var(--color-paper)] disabled:opacity-40 disabled:cursor-not-allowed")}
      >
        <ChevronLeft size={14} />
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => onPageChange(1)} className={cn(btnBase, "hover:bg-[var(--color-paper)]")}>1</button>
          {start > 2 && <span className="px-1 text-xs text-[var(--color-muted)]">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          disabled={isLoading}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            btnBase,
            p === page
              ? "bg-[var(--color-vermillion)] text-white border-[var(--color-vermillion)]"
              : "hover:bg-[var(--color-paper)] text-[var(--color-ink)]",
          )}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-xs text-[var(--color-muted)]">…</span>}
          <button type="button" onClick={() => onPageChange(totalPages)} className={cn(btnBase, "hover:bg-[var(--color-paper)]")}>{totalPages}</button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || isLoading}
        aria-label="Trang tiếp"
        className={cn(btnBase, "hover:bg-[var(--color-paper)] disabled:opacity-40 disabled:cursor-not-allowed")}
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  )
}

// ─── Alignment helper ─────────────────────────────────────────────────────────────
function alignClass(align?: "start" | "center" | "end") {
  if (align === "center") return "text-center"
  if (align === "end") return "text-right"
  return ""
}

// ─── Component ────────────────────────────────────────────────────────────────────
export function CTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = "id",
  page = PAGINATION.INITIAL_PAGE,
  pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  total = 0,
  onPageChange,
  onPageSizeChange,
  isShowPagination = true,
  pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS as unknown as number[],
  sortDescriptor,
  onSortChange,
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
  toolbar,
  totalLabel,
  actions,
  emptyContent,
  layout = "fixed",
  isHeaderSticky = true,
  className,
  isStriped = true,
  isHoverable = true,
  ariaLabel = "Data table",
  isLoading = false,
}: CTableProps<T>) {
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])
  const hasSelection = selectionMode !== "none"
  const totalColspan = columns.length + (hasSelection ? 1 : 0)

  /* ── Sort ── */
  const handleSort = useCallback(
    (columnKey: string) => {
      if (!onSortChange) return
      const newDirection: "ascending" | "descending" =
        sortDescriptor?.column === columnKey && sortDescriptor?.direction === "ascending"
          ? "descending"
          : "ascending"
      onSortChange({ column: columnKey, direction: newDirection })
    },
    [sortDescriptor, onSortChange],
  )

  /* ── Selection ── */
  const isRowSelected = useCallback(
    (key: string | number) => {
      if (!selectedKeys) return false
      if (selectedKeys === "all") return true
      return (selectedKeys as Set<string | number>).has(key)
    },
    [selectedKeys],
  )

  const isAllSelected = useMemo(() => {
    if (!selectedKeys || data.length === 0) return false
    if (selectedKeys === "all") return true
    const sel = selectedKeys as Set<string | number>
    return data.every((item) => sel.has(item[rowKey] as string | number))
  }, [selectedKeys, data, rowKey])

  const toggleRow = useCallback(
    (key: string | number) => {
      if (!onSelectionChange) return
      if (selectionMode === "single") {
        onSelectionChange(new Set<string | number>([key]))
        return
      }
      const current =
        selectedKeys === "all"
          ? new Set(data.map((item) => item[rowKey] as string | number))
          : new Set(selectedKeys as Set<string | number>)
      if (current.has(key)) current.delete(key)
      else current.add(key)
      onSelectionChange(current)
    },
    [selectedKeys, onSelectionChange, selectionMode, data, rowKey],
  )

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return
    if (isAllSelected) {
      onSelectionChange(new Set<string | number>())
    } else {
      onSelectionChange(new Set(data.map((item) => item[rowKey] as string | number)))
    }
  }, [isAllSelected, onSelectionChange, data, rowKey])

  /* ── Page size ── */
  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onPageSizeChange?.(Number(e.target.value)),
    [onPageSizeChange],
  )

  const hasTotalRow = total > 0 || totalLabel || actions
  const showPagination = isShowPagination && total > 0 && !!onPageChange

  return (
    <div className={cn("relative flex flex-col md:flex-1 md:min-h-0", className)}>

      {/* Top content */}
      {(toolbar || hasTotalRow) && (
        <div className="flex flex-col gap-3 mb-3">
          {toolbar}
          {hasTotalRow && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm text-[var(--color-muted)]">
                {totalLabel ?? `Tổng ${total}`}
              </span>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
        </div>
      )}

      {/* Scroll wrapper */}
      <div className="overflow-x-auto md:flex-1 md:min-h-0 md:overflow-y-auto">
        <table
          aria-label={ariaLabel}
          className={cn(
            "w-full text-sm border-collapse min-w-[640px]",
            layout === "fixed" ? "table-fixed" : "table-auto",
          )}
        >
          <TableHeader className={cn(isHeaderSticky && "sticky top-0 z-10")}>
            <tr>
              {hasSelection && (
                <TableHead className="w-10 text-center">
                  {selectionMode === "multiple" && (
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleAll}
                      aria-label="Chọn tất cả"
                      className="rounded border-[var(--color-smoke)] accent-[var(--color-vermillion)]"
                    />
                  )}
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  style={{ width: col.width, minWidth: col.minWidth }}
                  className={cn(
                    alignClass(col.align),
                    col.sortable && "cursor-pointer hover:bg-[var(--color-smoke)]/60 select-none",
                    col.headerClassName,
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIndicator
                        direction={sortDescriptor?.column === col.key ? sortDescriptor.direction : undefined}
                      />
                    )}
                  </span>
                </TableHead>
              ))}
            </tr>
          </TableHeader>

          <TableBody>
            {isLoading && data.length === 0 ? (
              <tr>
                <td colSpan={totalColspan} className="py-24 text-center">
                  <CSpinner message="Đang tải..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={totalColspan}>
                  <EmptyState
                    title={emptyContent?.title ?? "Không có dữ liệu"}
                    description={emptyContent?.description ?? "Chưa có dữ liệu để hiển thị"}
                    icon={emptyContent?.icon}
                  />
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const rowKeyValue = item[rowKey] as string | number
                const selected = hasSelection && isRowSelected(rowKeyValue)
                return (
                  <tr
                    key={String(rowKeyValue)}
                    onClick={hasSelection ? () => toggleRow(rowKeyValue) : undefined}
                    className={cn(
                      "border-b border-[var(--color-smoke)] transition-colors",
                      isHoverable && "hover:bg-[var(--color-paper)] cursor-pointer",
                      isStriped && "even:bg-[var(--color-paper)]",
                      selected && "bg-[var(--color-vermillion)]/5 hover:bg-[var(--color-vermillion)]/10",
                    )}
                  >
                    {hasSelection && (
                      <TableCell className="w-10 text-center">
                        <input
                          type={selectionMode === "single" ? "radio" : "checkbox"}
                          checked={selected}
                          onChange={() => toggleRow(rowKeyValue)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Chọn dòng ${index + 1}`}
                          className="rounded border-[var(--color-smoke)] accent-[var(--color-vermillion)]"
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn(alignClass(col.align), col.cellClassName)}
                      >
                        {col.render
                          ? col.render(item[col.key], item, index)
                          : (item[col.key] as React.ReactNode) ?? "—"}
                      </TableCell>
                    ))}
                  </tr>
                )
              })
            )}
          </TableBody>
        </table>
      </div>

      {/* Overlay spinner when refreshing existing data */}
      {isLoading && data.length > 0 && (
        <CSpinner variant="overlay" message="Đang tải..." />
      )}

      {/* Bottom: pagination + page size */}
      {showPagination && (
        <div className="flex items-center justify-center sm:justify-between gap-2 py-3 mt-1 flex-shrink-0">
          <div className="hidden sm:block w-28" />

          {totalPages > 1 ? (
            <TablePagination
              page={page}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={onPageChange!}
            />
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-[var(--color-muted)]">Dòng/trang</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={isLoading}
              aria-label="Số dòng mỗi trang"
              className={cn(
                "w-20 h-8 px-2 text-sm rounded-md cursor-pointer",
                "border border-[var(--color-smoke)] bg-[var(--color-surface)] text-[var(--color-ink)]",
                "focus:outline-none focus:ring-1 focus:ring-[var(--color-vermillion)] focus:border-[var(--color-vermillion)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
