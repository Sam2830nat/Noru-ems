export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  meta: PaginationMeta | Record<string, unknown> | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
