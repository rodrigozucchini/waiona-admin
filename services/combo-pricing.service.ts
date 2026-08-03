import { apiRequest, ApiError } from '@/core/lib/api'
import type { ComboPricingResponseDto } from '@/core/types'

export async function getComboPricing(comboId: number) {
  try {
    return await apiRequest<ComboPricingResponseDto>(`/combo-pricing/combo/${comboId}`)
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return null
    throw error
  }
}
