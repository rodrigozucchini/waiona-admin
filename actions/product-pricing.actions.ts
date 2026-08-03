'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateProductPricingDto, UpdateProductPricingDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createProductPricing(data: CreateProductPricingDto) {
  try {
    await apiRequest('/product-pricing', { method: 'POST', body: data })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateProductPricing(id: number, data: UpdateProductPricingDto) {
  try {
    await apiRequest(`/product-pricing/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteProductPricing(id: number) {
  try {
    await apiRequest(`/product-pricing/${id}`, { method: 'DELETE' })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
