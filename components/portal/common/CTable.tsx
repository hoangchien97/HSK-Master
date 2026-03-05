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
} from "@heroui/react"
import { cn } from "@/lib/utils"
import { EmptyState } from "./EmptyState"
import { CSpinner } from "./CSpinner"
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

  /* ─── Table classNames (HeroUI table slots) ─── */
  const tableClassNames = useMemo(
    () => ({
      base: "md:flex-1 md:min-h-0",
      wrapper: cn(
        "shadow-none p-0 overflow-x-auto",
        // At md (768px+): wrapper fills its parent and scrolls internally
        // so position:sticky on thead resolves correctly
        "md:flex-1 md:min-h-0 md:max-h-none md:overflow-y-auto",
      ),
      table: "min-w-[640px]",
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

  /* ─── topContent: toolbar + total/actions row ─── */
  const topContent = useMemo(() => {
    const hasToolbar = !!toolbar
    const hasTotalRow = total > 0 || totalLabel || actions

    if (!hasToolbar && !hasTotalRow) return null

    return (
      <div className="flex flex-col gap-3">
        {toolbar}
        {hasTotalRow && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-default-400">
              {totalLabel ?? `Tổng ${total}`}
            </span>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
      </div>
    )
  }, [toolbar, total, totalLabel, actions])

  /* ─── bottomContent: Pagination (center) + Page size (right) ─── */
  const bottomContent = useMemo(() => {
    if (!isShowPagination || total === 0) return null

    return (
      <div className="flex items-center justify-center sm:justify-between gap-2 py-2">
        {/* Spacer on sm+ so pagination centers */}
        <div className="hidden sm:block w-20" />

        {totalPages > 1 ? (
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
        ) : <div />}

        <div className="flex items-center gap-2">
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

  return (
    <div
      className={cn(
        // Mobile: normal flow. Tablet+ (md/768px): fill remaining height
        "relative flex flex-col md:flex-1 md:min-h-0",
        // Dim when refetching (not first load)
        isFetching && !isFirstLoad && "opacity-60 pointer-events-none",
        className,
      )}
    >
      {/* Refetch pill — floating above content when data already exists */}
      {isFetching && !isFirstLoad && <CSpinner variant="pill" color="primary" />}

      {/* First-load overlay — centered in the entire CTable area */}
      {isFirstLoad && <CSpinner variant="overlay" message="Đang tải..." />}

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
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
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
          isLoading={false}
          emptyContent={
            isFirstLoad ? (
              <div className="h-32" />
            ) : (
              <EmptyState
                title={emptyContent?.title || "Không có dữ liệu"}
                description={emptyContent?.description || "Chưa có dữ liệu để hiển thị"}
                icon={emptyContent?.icon}
              />
            )
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
  )
}
