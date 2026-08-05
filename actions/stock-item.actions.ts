'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type {
  AddStockDto,
  CreateStockItemDto,
  CreateStockWriteOffDto,
  UpdateStockThresholdsDto,
} from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createStockItem(data: CreateStockItemDto) {
  try {
    await apiRequest('/stock-items', { method: 'POST', body: data })
    revalidatePath('/stock')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function addStock(data: AddStockDto) {
  try {
    await apiRequest('/stock-items/add-stock', { method: 'POST', body: data })
    revalidatePath('/stock')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function writeOffStock(data: CreateStockWriteOffDto) {
  try {
    await apiRequest('/stock-items/write-off', { method: 'POST', body: data })
    revalidatePath('/stock')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateStockThresholds(id: number, data: UpdateStockThresholdsDto) {
  try {
    await apiRequest(`/stock-items/${id}/thresholds`, { method: 'PATCH', body: data })
    revalidatePath('/stock')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
