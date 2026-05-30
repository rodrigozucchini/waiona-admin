import { unstable_cache } from 'next/cache'
import { api } from './api'
import type { PaginatedResponse, Category, StockLocation, TaxType, Margin } from '@/types'

export const getCategories = unstable_cache(
  () => api.get<Category[]>('/categories/tree'),
  ['categories-tree'],
  { tags: ['categories'] }
)

export const getStockLocations = unstable_cache(
  () => api.get<PaginatedResponse<StockLocation>>('/stock-locations?limit=100'),
  ['stock-locations'],
  { tags: ['stock'] }
)

export const getTaxTypes = unstable_cache(
  () => api.get<PaginatedResponse<TaxType>>('/tax-types?limit=100'),
  ['tax-types'],
  { tags: ['taxes'] }
)

export const getMargins = unstable_cache(
  () => api.get<PaginatedResponse<Margin>>('/margins?limit=100'),
  ['margins'],
  { tags: ['pricing'] }
)
