import { unstable_cache } from 'next/cache'
import { api } from './api'
import type { PaginatedResponse, Category, StockLocation, TaxType, Margin } from '@/types'

export const getCategories = unstable_cache(
  async () => {
    const result = await api.get<PaginatedResponse<Category>>('/categories?limit=100')
    return result.data
  },
  ['categories'],
  { tags: ['categories'] }
)

export const getStockLocations = unstable_cache(
  async () => {
    const result = await api.get<PaginatedResponse<StockLocation>>('/stock-locations?limit=100')
    return result.data
  },
  ['stock-locations'],
  { tags: ['stock'] }
)

export const getTaxTypes = unstable_cache(
  async () => {
    const result = await api.get<PaginatedResponse<TaxType>>('/tax-types?limit=100')
    return result.data
  },
  ['tax-types'],
  { tags: ['taxes'] }
)

export const getMargins = unstable_cache(
  async () => {
    const result = await api.get<PaginatedResponse<Margin>>('/margins?limit=100')
    return result.data
  },
  ['margins'],
  { tags: ['pricing'] }
)
