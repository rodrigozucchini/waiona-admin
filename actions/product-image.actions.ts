'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, apiUpload, ApiError } from '@/core/lib/api'
import type { UpdateImageDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function uploadProductImage(formData: FormData) {
  try {
    await apiUpload('/product-images/upload', formData)
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateProductImage(id: number, data: UpdateImageDto) {
  try {
    await apiRequest(`/product-images/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteProductImage(id: number) {
  try {
    await apiRequest(`/product-images/${id}`, { method: 'DELETE' })
    revalidatePath('/products')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
