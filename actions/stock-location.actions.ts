'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateStockLocationDto, UpdateStockLocationDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createStockLocation(data: CreateStockLocationDto) {
  try {
    await apiRequest('/stock-locations', { method: 'POST', body: data })
    revalidatePath('/stock/locations')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateStockLocation(id: number, data: UpdateStockLocationDto) {
  try {
    await apiRequest(`/stock-locations/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/stock/locations')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteStockLocation(id: number) {
  try {
    await apiRequest(`/stock-locations/${id}`, { method: 'DELETE' })
    revalidatePath('/stock/locations')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
