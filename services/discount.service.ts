import { apiRequest } from '@/core/lib/api'
import type { DiscountResponseDto, PaginatedResponse, PaginationQuery } from '@/core/types'

export function getDiscounts(query: PaginationQuery = {}) {
  return apiRequest<PaginatedResponse<DiscountResponseDto>>('/discounts', {
    query: { ...query },
  })
}

export function getDiscount(id: number) {
  return apiRequest<DiscountResponseDto>(`/discounts/${id}`)
}
