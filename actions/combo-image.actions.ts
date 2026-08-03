'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, apiUpload, ApiError } from '@/core/lib/api'
import type { UpdateImageDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function uploadComboImage(formData: FormData) {
  try {
    await apiUpload('/combo-images/upload', formData)
    revalidatePath('/combos')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateComboImage(id: number, data: UpdateImageDto) {
  try {
    await apiRequest(`/combo-images/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/combos')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteComboImage(id: number) {
  try {
    await apiRequest(`/combo-images/${id}`, { method: 'DELETE' })
    revalidatePath('/combos')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
