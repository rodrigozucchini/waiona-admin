import { apiRequest } from '@/core/lib/api'
import type {
  CriticalStockResponseDto,
  OrdersAnalyticsResponseDto,
  TopProductResponseDto,
} from '@/core/types'

export function getOrdersAnalytics() {
  return apiRequest<OrdersAnalyticsResponseDto>('/analytics/orders')
}

export function getTopProducts() {
  return apiRequest<TopProductResponseDto[]>('/analytics/products/top')
}

export function getCriticalStock() {
  return apiRequest<CriticalStockResponseDto[]>('/analytics/stock/critical')
}
