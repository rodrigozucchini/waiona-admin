import { apiRequest } from '@/core/lib/api'
import type { CouponResponseDto, PaginatedResponse, PaginationQuery } from '@/core/types'

export function getCoupons(query: PaginationQuery = {}) {
  return apiRequest<PaginatedResponse<CouponResponseDto>>('/coupons', {
    query: { ...query },
  })
}

export function getCoupon(id: number) {
  return apiRequest<CouponResponseDto>(`/coupons/${id}`)
}
