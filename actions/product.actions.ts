'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateProductDto, UpdateProductDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createProduct(data: CreateProductDto) {
  try {
    await apiRequest('/products', { method: 'POST', body: data })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateProduct(id: number, data: UpdateProductDto) {
  try {
    await apiRequest(`/products/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteProduct(id: number) {
  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE' })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
