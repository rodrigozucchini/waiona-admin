import type { OrderStatus, DeliveryType } from '@/core/enums'

// productId y comboId son mutuamente excluyentes: cada item es producto O combo.
export interface CreateOrderItemDto {
  productId?: number
  comboId?: number
  quantity: number
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[]
  deliveryType: DeliveryType
  // Requerido si deliveryType === 'delivery'.
  address?: string
  couponCode?: string
  notes?: string
}

// Cada item trae o bien productId/productName, o bien comboId/comboName — el otro par siempre es null.
export interface OrderItemResponseDto {
  id: number
  productId: number | null
  productName: string | null
  comboId: number | null
  comboName: string | null
  quantity: number
  unitPrice: number
  salePrice: number
  finalPrice: number
}

export interface OrderResponseDto {
  id: number
  createdAt: string
  updatedAt: string
  userId: number
  status: OrderStatus
  deliveryType: DeliveryType
  address: string | null
  notes: string | null
  subtotal: number
  couponDiscount: number | null
  couponCode: string | null
  total: number
  items: OrderItemResponseDto[]
}

export interface UpdateOrderStatusDto {
  status: OrderStatus
}
