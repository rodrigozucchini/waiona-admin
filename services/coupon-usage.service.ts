import { apiRequest } from '@/core/lib/api'
import type { CouponUsageResponseDto, PaginatedResponse } from '@/core/types'

export async function getCouponUsage(couponId: number) {
  const { data } = await apiRequest<PaginatedResponse<CouponUsageResponseDto>>(
    `/coupon-usage/coupon/${couponId}`,
    { query: { limit: 100 } },
  )
  return data
}
