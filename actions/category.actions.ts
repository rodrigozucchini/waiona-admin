'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateCategoryDto, UpdateCategoryDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createCategory(data: CreateCategoryDto) {
  try {
    await apiRequest('/categories', { method: 'POST', body: data })
    revalidatePath('/categories')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateCategory(id: number, data: UpdateCategoryDto) {
  try {
    await apiRequest(`/categories/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/categories')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteCategory(id: number) {
  try {
    await apiRequest(`/categories/${id}`, { method: 'DELETE' })
    revalidatePath('/categories')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
