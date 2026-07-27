export interface DiscountResponseDto {
  id: number
  name: string
  description: string | null
  value: number
  createdAt: string
  updatedAt: string
}

export interface CreateDiscountDto {
  name: string
  description?: string
  value: number
}

export type UpdateDiscountDto = Partial<CreateDiscountDto>

export interface DiscountProductTargetResponseDto {
  id: number
  discountId: number
  productId: number
  createdAt: string
  updatedAt: string
}

export interface DiscountComboTargetResponseDto {
  id: number
  discountId: number
  comboId: number
  createdAt: string
  updatedAt: string
}

// 409 si el producto/combo ya tiene un descuento activo asignado (1:1).
export interface CreateDiscountProductTargetDto {
  productId: number
}

export interface CreateDiscountComboTargetDto {
  comboId: number
}
