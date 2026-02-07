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
  Spinner,
  Input,
} from "@heroui/react"
import { Search } from "lucide-react"
import { EmptyState } from "./EmptyState"
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
  /** Column width */
  width?: number
  /** Text alignment */
  align?: "start" | "center" | "end"
}

// ─── Props ───────────────────────────────────────────────────────────
export interface CTableProps<T extends Record<string, unknown>> {
  /** Column definitions */
  columns: CTableColumn<T>[]
  /** Row data array */
  data: T[]
  /** Unique key field in each row (default: "id") */
  rowKey?: string
  /** Loading state */
  isLoading?: boolean
  /** Pagination config – omit to disable pagination */
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  /** Sort descriptor (controlled) */
  sortDescriptor?: SortDescriptor
  /** Sort change handler */
  onSortChange?: (descriptor: SortDescriptor) => void
  /** Show search bar above table */
  searchable?: boolean
  /** Search value (controlled) */
  searchValue?: string
  /** Search change handler */
  onSearchChange?: (value: string) => void
  /** Search placeholder */
  searchPlaceholder?: string
  /** Empty state config */
  emptyContent?: {
    icon?: React.ReactNode
    title?: string
    description?: string
  }
  /** Selection mode */
  selectionMode?: "none" | "single" | "multiple"
  /** Selected keys (controlled) */
  selectedKeys?: Selection
  /** Selection change handler */
  onSelectionChange?: (keys: Selection) => void
  /** Extra toolbar rendered above the table */
  toolbar?: React.ReactNode
  /** Additional className for the wrapper */
  className?: string
  /** Aria label for accessibility */
  ariaLabel?: string
}

// ─── Component ───────────────────────────────────────────────────────
export function CTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey = "id",
  isLoading = false,
  pagination,
  sortDescriptor,
  onSortChange,
  searchable = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  emptyContent,
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
  toolbar,
  className,
  ariaLabel = "Data table",
}: CTableProps<T>) {

  const totalPages = useMemo(() => {
    if (!pagination) return 1
    return Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
  }, [pagination])

  const handlePageChange = useCallback(
    (page: number) => {
      pagination?.onPageChange(page)
    },
    [pagination],
  )

  // Bottom content: pagination
  const bottomContent = useMemo(() => {
    if (!pagination) return null
    return (
      <div className="flex justify-between items-center px-2 py-2">
        <span className="text-sm text-gray-500">
          Tổng: {pagination.total} kết quả
        </span>
        <Pagination
          showControls
          color="danger"
          page={pagination.page}
          total={totalPages}
          onChange={handlePageChange}
        />
      </div>
    )
  }, [pagination, totalPages, handlePageChange])

  // Top content: search + toolbar
  const topContent = useMemo(() => {
    if (!searchable && !toolbar) return null
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          {searchable && (
            <Input
              isClearable
              className="w-full sm:max-w-[44%]"
              placeholder={searchPlaceholder}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              value={searchValue}
              onClear={() => onSearchChange?.("")}
              onValueChange={onSearchChange}
              variant="bordered"
              size="sm"
            />
          )}
          {toolbar && <div className="flex gap-3">{toolbar}</div>}
        </div>
      </div>
    )
  }, [searchable, toolbar, searchPlaceholder, searchValue, onSearchChange])

  return (
    <Table
      aria-label={ariaLabel}
      topContent={topContent}
      topContentPlacement="outside"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      selectionMode={selectionMode}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      className={className}
      classNames={{
        wrapper: "shadow-none border border-gray-200 rounded-xl",
        th: "bg-gray-50 text-gray-700 font-semibold text-xs uppercase",
      }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            allowsSorting={column.sortable}
            width={column.width}
            align={column.align}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={data}
        isLoading={isLoading}
        loadingContent={<Spinner color="danger" label="Đang tải..." />}
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
                <TableCell>
                  {col?.render ? col.render(value, item, index) : (value as React.ReactNode) ?? "—"}
                </TableCell>
              )
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
