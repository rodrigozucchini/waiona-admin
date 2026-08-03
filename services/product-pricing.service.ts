import { apiRequest, ApiError } from '@/core/lib/api'
import type { ProductPricingResponseDto } from '@/core/types'

export async function getProductPricing(productId: number) {
  try {
    return await apiRequest<ProductPricingResponseDto>(`/product-pricing/product/${productId}`)
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return null
    throw error
  }
}
