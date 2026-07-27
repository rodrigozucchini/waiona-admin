import type { OrderStatus } from '@/core/enums'

// totalRevenue/revenueToday/revenueThisMonth excluyen órdenes CANCELLED.
export interface OrdersAnalyticsResponseDto {
  total: number
  byStatus: Record<OrderStatus, number>
  totalRevenue: number
  revenueToday: number
  revenueThisMonth: number
}

// Solo cuenta órdenes en estado DELIVERED.
export interface TopProductResponseDto {
  productId: number
  name: string
  sku: string
  totalSold: number
}

export interface CriticalStockResponseDto {
  id: number
  productId: number
  productName: string
  sku: string
  locationId: number
  locationName: string
  quantityCurrent: number
  quantityReserved: number
  quantityAvailable: number
  stockCritical: number
  stockMin: number
}
