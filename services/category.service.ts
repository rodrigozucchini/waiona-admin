import { apiRequest } from '@/core/lib/api'
import type { CategoryResponseDto, PaginatedResponse, PaginationQuery } from '@/core/types'

export function getCategories(query: PaginationQuery = {}) {
  return apiRequest<PaginatedResponse<CategoryResponseDto>>('/categories', {
    query: { ...query },
  })
}

export function getCategory(id: number) {
  return apiRequest<CategoryResponseDto>(`/categories/${id}`)
}
