import { apiRequest } from '@/core/lib/api'
import type {
  DiscountComboTargetResponseDto,
  DiscountProductTargetResponseDto,
  PaginatedResponse,
} from '@/core/types'

export async function getDiscountProductTargets(discountId: number) {
  const { data } = await apiRequest<PaginatedResponse<DiscountProductTargetResponseDto>>(
    `/discounts/${discountId}/targets/products`,
    { query: { limit: 100 } },
  )
  return data
}

export async function getDiscountComboTargets(discountId: number) {
  const { data } = await apiRequest<PaginatedResponse<DiscountComboTargetResponseDto>>(
    `/discounts/${discountId}/targets/combos`,
    { query: { limit: 100 } },
  )
  return data
}
