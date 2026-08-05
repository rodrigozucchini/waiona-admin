import { apiRequest } from '@/core/lib/api'
import type {
  PaginatedResponse,
  PaginationQuery,
  StockItemResponseDto,
  StockItemWithMovementsResponseDto,
} from '@/core/types'

export function getStockItems(query: PaginationQuery = {}) {
  return apiRequest<PaginatedResponse<StockItemResponseDto>>('/stock-items', {
    query: { ...query },
  })
}

export function getStockItem(id: number) {
  return apiRequest<StockItemWithMovementsResponseDto>(`/stock-items/${id}`)
}
