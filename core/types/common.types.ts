export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}

export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface ApiErrorResponse {
  statusCode: number
  error: string
  message: string | string[]
  timestamp: string
  path: string
}
