import { apiRequest } from '@/core/lib/api'
import type { ProductResponseDto, PaginatedResponse, PaginationQuery } from '@/core/types'

export function getProducts(query: PaginationQuery = {}) {
  return apiRequest<PaginatedResponse<ProductResponseDto>>('/products', {
    query: { ...query },
  })
}

export function getProduct(id: number) {
  return apiRequest<ProductResponseDto>(`/products/${id}`)
}
