import { apiRequest } from '@/core/lib/api'
import type { PaginatedResponse, PaginationQuery, StockLocationResponseDto } from '@/core/types'

export function getStockLocations(query: PaginationQuery = {}) {
  return apiRequest<PaginatedResponse<StockLocationResponseDto>>('/stock-locations', {
    query: { ...query },
  })
}

export function getStockLocation(id: number) {
  return apiRequest<StockLocationResponseDto>(`/stock-locations/${id}`)
}
