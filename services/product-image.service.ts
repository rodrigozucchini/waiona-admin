import { apiRequest } from '@/core/lib/api'
import type { ProductImageResponseDto } from '@/core/types'

export function getProductImages(productId: number) {
  return apiRequest<ProductImageResponseDto[]>(`/product-images/product/${productId}`)
}
