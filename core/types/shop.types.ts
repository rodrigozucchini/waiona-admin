import type { ShopItemType, StockStatus } from '@/core/enums'
import type { PaginationQuery } from './common.types'

export interface SearchShopDto extends PaginationQuery {
  search?: string
  categoryId?: number
  type?: ShopItemType
  minPrice?: number
  maxPrice?: number
}

export interface ShopItemDto {
  id: number
  name: string
  type: ShopItemType
  originalPrice: number
  finalPrice: number
  discountAmount: number
  hasDiscount: boolean
  inStock: boolean
  quantityAvailable: number
  category: string
  image: string | null
}

export interface ShopPaginatedResponseDto {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  data: ShopItemDto[]
}

export interface ComboItemShopDto {
  productId: number
  productName: string
  quantity: number
}

export interface ShopDetailResponseDto {
  id: number
  name: string
  description: string
  type: ShopItemType
  originalPrice: number
  finalPrice: number
  discountAmount: number
  priceAfterDiscount: number
  taxes: number
  hasDiscount: boolean
  inStock: boolean
  quantityAvailable: number
  stockStatus: StockStatus
  category: string
  images: string[]
  // Poblado solo cuando type === 'combo'
  items: ComboItemShopDto[] | null
}
