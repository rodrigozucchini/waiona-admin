import { apiRequest } from '@/core/lib/api'
import type {
  CouponComboTargetResponseDto,
  CouponProductTargetResponseDto,
  PaginatedResponse,
} from '@/core/types'

export async function getCouponProductTargets(couponId: number) {
  const { data } = await apiRequest<PaginatedResponse<CouponProductTargetResponseDto>>(
    `/coupons/${couponId}/targets/products`,
    { query: { limit: 100 } },
  )
  return data
}

export async function getCouponComboTargets(couponId: number) {
  const { data } = await apiRequest<PaginatedResponse<CouponComboTargetResponseDto>>(
    `/coupons/${couponId}/targets/combos`,
    { query: { limit: 100 } },
  )
  return data
}
