import { apiRequest } from '@/core/lib/api'
import type { ComboResponseDto, PaginatedResponse, PaginationQuery } from '@/core/types'

export function getCombos(query: PaginationQuery = {}) {
  return apiRequest<PaginatedResponse<ComboResponseDto>>('/combos', {
    query: { ...query },
  })
}

export function getCombo(id: number) {
  return apiRequest<ComboResponseDto>(`/combos/${id}`)
}
