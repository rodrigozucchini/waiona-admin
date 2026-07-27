import type { CouponStatus } from '@/core/enums'

// `status` viene calculado dinámicamente por el backend — no reimplementar
// la lógica de fechas/usageLimit del lado del cliente.
export interface CouponResponseDto {
  id: number
  code: string
  status: CouponStatus
  value: number
  isGlobal: boolean
  usageLimit: number | null
  usageCount: number
  startsAt: string | null
  endsAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCouponDto {
  code: string
  value: number
  isGlobal: boolean
  usageLimit?: number
  startsAt?: string
  endsAt?: string
}

export type UpdateCouponDto = Partial<CreateCouponDto>

export interface CouponProductTargetResponseDto {
  id: number
  couponId: number
  productId: number
  createdAt: string
  updatedAt: string
}

export interface CouponComboTargetResponseDto {
  id: number
  couponId: number
  comboId: number
  createdAt: string
  updatedAt: string
}

// 409 si ya está asignado, o si el cupón es isGlobal: true (no aplica targets).
export interface CreateCouponProductTargetDto {
  productId: number
}

export interface CreateCouponComboTargetDto {
  comboId: number
}

// userId no se envía — se infiere del JWT en el backend.
export interface CreateCouponUsageDto {
  code: string
  orderId: number
}

export interface CouponUsageResponseDto {
  id: number
  couponId: number
  orderId: number
  userId: number
  appliedAt: string
  createdAt: string
  updatedAt: string
}
