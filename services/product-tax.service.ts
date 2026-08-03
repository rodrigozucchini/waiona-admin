import { apiRequest } from '@/core/lib/api'
import type { PaginatedResponse, ProductTaxResponseDto } from '@/core/types'

export async function getProductTaxes(productId: number) {
  const { data } = await apiRequest<PaginatedResponse<ProductTaxResponseDto>>(
    `/products/${productId}/taxes`,
    { query: { limit: 100 } },
  )
  return data
}
