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

  /* ── Styling ── */
  className?: string
  isStriped?: boolean
  ariaLabel?: string
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
  // styling
  className,
  isStriped = true,
  ariaLabel = "Data table",
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

  /* ─── Table classNames ─── */
  const tableClassNames = useMemo(
    () => ({
      base: "h-full",
      wrapper: ["h-full", "shadow-none"],
      // th: ["bg-default-100", "text-default-500", "border-b", "border-divider"],
      td: [
        "first:group-data-[first=true]/tr:before:rounded-none",
        "last:group-data-[first=true]/tr:before:rounded-none",
        "group-data-[middle=true]/tr:before:rounded-none",
        "first:group-data-[last=true]/tr:before:rounded-none",
        "last:group-data-[last=true]/tr:before:rounded-none",
      ],
    }),
    [],
  )

  /* ─── Bottom: Pagination (center) + Page size (right) ─── */
  const bottomContent = useMemo(() => {
    if (!isShowPagination || total === 0) return null

    return (
      <div className="shrink-0 flex items-center justify-center gap-4 px-2 py-2 relative">
        {totalPages > 1 && (
          <Pagination
            isCompact
            showControls
            color="primary"
            page={page}
            total={totalPages}
            onChange={handlePageChange}
          />
        )}
        <div className="absolute right-2 flex items-center gap-2">
          <Select
            size="sm"
            selectedKeys={[String(pageSize)]}
            onChange={handlePageSizeChange}
            className="w-20"
            aria-label="Số dòng mỗi trang"
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
  }, [isShowPagination, total, totalPages, page, pageSize, pageSizeOptions, handlePageChange, handlePageSizeChange])

  return (
    <div className={`h-full flex flex-col gap-3 ${className ?? ""}`}>
      {/* ── Toolbar (search / filters) ── */}
      {toolbar && <div className="shrink-0">{toolbar}</div>}

      {/* ── Total (left) + Actions (right) ── */}
      {(total > 0 || totalLabel || actions) && (
        <div className="shrink-0 flex items-center justify-between">
          <span className="text-sm text-default-400">
            {totalLabel ?? `Tổng ${total}`}
          </span>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* ── Table (flex-1, header sticky, body scrolls) ── */}
      <div className="flex-1 min-h-0">
        <Table
          isHeaderSticky
          aria-label={ariaLabel}
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

      {/* ── Pagination (fixed at bottom) ── */}
      {bottomContent}
    </div>
  )
}
