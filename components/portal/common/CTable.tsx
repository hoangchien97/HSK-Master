"use client"

import { useMemo, useCallback } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react"
import { EmptyState } from "./EmptyState"
import { PAGINATION } from "@/constants/portal/pagination"
import type { SortDescriptor, Selection } from "@heroui/react"

// ─── Column definition ───────────────────────────────────────────────
export interface CTableColumn<T = Record<string, unknown>> {
  /** Unique key that maps to a field in the row data */
  key: string
  /** Display label for the column header */
  label: string
  /** Allow sorting on this column */
  sortable?: boolean
  /** Custom render function for the cell */
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  /** Column width (CSS value) */
  width?: number | string
  /** Min width for scroll support */
  minWidth?: number
  /** Text alignment */
  align?: "start" | "center" | "end"
  /** Extra className for header <th> */
  headerClassName?: string
  /** Extra className for <td> */
  cellClassName?: string
}

// ─── Props ───────────────────────────────────────────────────────────
export interface CTableProps<T extends Record<string, unknown>> {
  /** Column definitions */
  columns: CTableColumn<T>[]
  /** Row data array */
  data: T[]
  /** Unique key field in each row (default: "id") */
  rowKey?: string

  /* ── Pagination ── */
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  isShowPagination?: boolean
  pageSizeOptions?: number[]

  /* ── Sorting ── */
  sortDescriptor?: SortDescriptor
  onSortChange?: (descriptor: SortDescriptor) => void

  /* ── Selection ── */
  selectionMode?: "none" | "single" | "multiple"
  selectedKeys?: Selection
  onSelectionChange?: (keys: Selection) => void

  /* ── Slots ── */
  /** Toolbar node: search filters etc — shown above total row */
  toolbar?: React.ReactNode
  /** Total label on the left */
  totalLabel?: string
  /** Actions node on the right (same row as total) */
  actions?: React.ReactNode

  /* ── Empty state ── */
  emptyContent?: {
    icon?: React.ReactNode
    title?: string
    description?: string
  }

  /* ── Layout ── */
  /** Table layout algorithm: "auto" sizes columns by content, "fixed" respects explicit widths (enables horizontal scroll). Defaults to "fixed" */
  layout?: "auto" | "fixed"
  /** When true, the header stays visible while scrolling vertically */
  isHeaderSticky?: boolean

  /* ── Styling ── */
  className?: string
  isStriped?: boolean
  isHoverable?: boolean
  ariaLabel?: string

  /* ── Loading (Option A — Guideline) ── */
  /**
   * When true: dim table + show small indicator.
   * Data rows are KEPT — never cleared.
   * Follows Stripe/Linear "refreshing" pattern.
   */
  isFetching?: boolean
  /** When true: show loading spinner (first load, no data yet) */
  isLoading?: boolean
}

// ─── Component ───────────────────────────────────────────────────────
export function CTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = "id",
  // pagination
  page = PAGINATION.INITIAL_PAGE,
  pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
  total = 0,
  onPageChange,
  onPageSizeChange,
  isShowPagination = true,
  pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS as unknown as number[],
  // sort
  sortDescriptor,
  onSortChange,
  // selection
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
  // slots
  toolbar,
  totalLabel,
  actions,
  // empty
  emptyContent,
  // layout
  layout = "fixed",
  isHeaderSticky = true,
  // styling
  className,
  isStriped = true,
  isHoverable = true,
  ariaLabel = "Data table",
  // loading
  isFetching = false,
  isLoading = false,
}: CTableProps<T>) {
  /* ─── Derived ─── */
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  )

  const handlePageChange = useCallback(
    (p: number) => onPageChange?.(p),
    [onPageChange],
  )

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = Number(e.target.value)
      onPageSizeChange?.(newSize)
    },
    [onPageSizeChange],
  )

  /* Is this the first load? (no data yet + loading) */
  const isFirstLoad = isLoading && data.length === 0

  /* ─── Table classNames ─── */
  const tableClassNames = useMemo(
    () => ({
      base: "",
      wrapper: ["shadow-none", "overflow-x-auto", "-webkit-overflow-scrolling-touch"],
      table: "min-w-[700px]",
      tr: isHoverable
        ? ["hover:bg-default-100", "transition-colors", "cursor-pointer"]
        : [],
      td: [
        "first:group-data-[first=true]/tr:before:rounded-none",
        "last:group-data-[first=true]/tr:before:rounded-none",
        "group-data-[middle=true]/tr:before:rounded-none",
        "first:group-data-[last=true]/tr:before:rounded-none",
        "last:group-data-[last=true]/tr:before:rounded-none",
      ],
    }),
    [isHoverable],
  )

  /* ─── Bottom: Pagination (center) + Page size (right) ─── */
  const bottomContent = useMemo(() => {
    if (!isShowPagination || total === 0) return null

    return (
      <div className="shrink-0 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-2 py-2 sm:relative">
        {totalPages > 1 && (
          <Pagination
            isCompact
            showControls
            color="primary"
            page={page}
            total={totalPages}
            onChange={handlePageChange}
            size="sm"
            isDisabled={isFetching}
          />
        )}
        <div className="sm:absolute sm:right-2 flex items-center gap-2">
          <Select
            size="sm"
            selectedKeys={[String(pageSize)]}
            onChange={handlePageSizeChange}
            className="w-20"
            aria-label="Số dòng mỗi trang"
            isDisabled={isFetching}
          >
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} textValue={String(size)}>
                {size}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    )
  }, [isShowPagination, total, totalPages, page, pageSize, pageSizeOptions, handlePageChange, handlePageSizeChange, isFetching])

  /* ── Shared pill spinner — consistent look for both first load and refetch ── */
  const pillSpinner = (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-default-200">
        <Spinner size="sm" color="primary" classNames={{ wrapper: "w-4 h-4" }} />
        <span className="text-xs text-default-500 font-medium">Đang tải...</span>
      </div>
    </div>
  )

  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
      {/*
       * Single dim container wrapping toolbar + total + table together.
       * When isFetching: the whole block dims as one unit (not toolbar separately).
       * Spinner is overlaid in the CENTER of the table area.
       */}
      <div className={`relative transition-opacity duration-200 flex flex-col gap-3 ${
        isFetching && !isFirstLoad ? "opacity-60 pointer-events-none" : ""
      }`}>

        {/* Refetch pill — shown above the dimmed table when data already exists */}
        {isFetching && !isFirstLoad && pillSpinner}

        {/* ── Toolbar (search / filters) ── */}
        {toolbar && (
          <div className="shrink-0">
            {toolbar}
          </div>
        )}

        {/* ── Total (left) + Actions (right) ── */}
        {(total > 0 || totalLabel || actions) && (
          <div className="shrink-0 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-default-400">
              {totalLabel ?? `Tổng ${total}`}
            </span>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}

        {/* ── Table — horizontal scroll on mobile ── */}
        <div
          className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 min-h-[200px]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <Table
            isHeaderSticky={isHeaderSticky}
            aria-label={ariaLabel}
            layout={layout}
            sortDescriptor={sortDescriptor}
            onSortChange={onSortChange}
            selectionMode={selectionMode}
            selectedKeys={selectedKeys}
            onSelectionChange={onSelectionChange}
            classNames={tableClassNames}
            isStriped={isStriped}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  allowsSorting={column.sortable}
                  width={column.width as number | undefined}
                  align={column.align}
                  className={column.headerClassName}
                  minWidth={column.minWidth}
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={data}
              isLoading={isFetching || isFirstLoad}
              loadingContent={pillSpinner}
              emptyContent={
                <EmptyState
                  title={emptyContent?.title || "Không có dữ liệu"}
                  description={emptyContent?.description || "Chưa có dữ liệu để hiển thị"}
                  icon={emptyContent?.icon}
                />
              }
            >
              {(item) => (
                <TableRow key={String(item[rowKey])}>
                  {(columnKey) => {
                    const col = columns.find((c) => c.key === String(columnKey))
                    const value = item[String(columnKey)]
                    const index = data.indexOf(item)
                    return (
                      <TableCell className={col?.cellClassName}>
                        {col?.render
                          ? col.render(value, item, index)
                          : (value as React.ReactNode) ?? "—"}
                      </TableCell>
                    )
                  }}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Pagination (outside dim zone — always interactive) ── */}
      {bottomContent}
    </div>
  )
}
