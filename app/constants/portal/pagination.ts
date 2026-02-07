/**
 * Pagination constants for portal tables
 */

export const PAGINATION = {
  /** Default page size for tables */
  DEFAULT_PAGE_SIZE: 10,
  /** Available page size options */
  PAGE_SIZE_OPTIONS: [10, 15, 20, 50, 100],
  /** Initial page number */
  INITIAL_PAGE: 1,
} as const

export type PaginationConfig = typeof PAGINATION
