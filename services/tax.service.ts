import { apiRequest } from '@/core/lib/api'
import type { PaginatedResponse, PaginationQuery, TaxResponseDto } from '@/core/types'

export function getTaxes(query: PaginationQuery = {}) {
  return apiRequest<PaginatedResponse<TaxResponseDto>>('/taxes', {
    query: { ...query },
  })
}

export function getTax(id: number) {
  return apiRequest<TaxResponseDto>(`/taxes/${id}`)
}
