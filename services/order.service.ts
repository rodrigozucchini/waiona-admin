import { apiRequest } from '@/core/lib/api'
import type { OrderResponseDto, PaginatedResponse, PaginationQuery } from '@/core/types'

export function getOrders(query: PaginationQuery = {}) {
  return apiRequest<PaginatedResponse<OrderResponseDto>>('/orders', {
    query: { ...query },
  })
}

export function getOrder(id: number) {
  return apiRequest<OrderResponseDto>(`/orders/${id}`)
}
