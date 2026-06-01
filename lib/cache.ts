import { cache } from 'react'
import { api } from './api'
import type { PaginatedResponse, Category, StockLocation, TaxType, Margin } from '@/types'

// React cache() deduplicates calls within a single request and works
// correctly with cookies(). Cross-request caching via unstable_cache/use cache
// is incompatible with per-request auth tokens.

export const getCategories = cache(async () => {
  const result = await api.get<PaginatedResponse<Category>>('/categories?limit=100')
  return result.data
})

export const getStockLocations = cache(async () => {
  const result = await api.get<PaginatedResponse<StockLocation>>('/stock-locations?limit=100')
  return result.data
})

export const getTaxTypes = cache(async () => {
  const result = await api.get<PaginatedResponse<TaxType>>('/tax-types?limit=100')
  return result.data
})

export const getMargins = cache(async () => {
  const result = await api.get<PaginatedResponse<Margin>>('/margins?limit=100')
  return result.data
})
