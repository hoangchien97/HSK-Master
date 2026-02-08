/** Generic API response */
export interface IApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/** Paginated list response from API */
export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
}

/** Base pagination params – every list screen extends this */
export interface IPaginationParams {
  page: number;
  pageSize: number;
}

/** Table query params (legacy compat + sort support) */
export interface ITableQuery extends IPaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
