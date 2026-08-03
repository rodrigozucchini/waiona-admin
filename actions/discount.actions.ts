'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateDiscountDto, UpdateDiscountDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createDiscount(data: CreateDiscountDto) {
  try {
    await apiRequest('/discounts', { method: 'POST', body: data })
    revalidatePath('/discounts')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateDiscount(id: number, data: UpdateDiscountDto) {
  try {
    await apiRequest(`/discounts/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/discounts')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteDiscount(id: number) {
  try {
    await apiRequest(`/discounts/${id}`, { method: 'DELETE' })
    revalidatePath('/discounts')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
