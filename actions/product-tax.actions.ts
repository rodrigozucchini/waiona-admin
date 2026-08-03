'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateProductTaxDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function assignProductTax(productId: number, data: CreateProductTaxDto) {
  try {
    await apiRequest(`/products/${productId}/taxes`, { method: 'POST', body: data })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function removeProductTax(productId: number, id: number) {
  try {
    await apiRequest(`/products/${productId}/taxes/${id}`, { method: 'DELETE' })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
