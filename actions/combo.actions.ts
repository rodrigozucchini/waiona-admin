'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateComboDto, UpdateComboDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createCombo(data: CreateComboDto) {
  try {
    await apiRequest('/combos', { method: 'POST', body: data })
    revalidatePath('/combos')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateCombo(id: number, data: UpdateComboDto) {
  try {
    await apiRequest(`/combos/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/combos')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteCombo(id: number) {
  try {
    await apiRequest(`/combos/${id}`, { method: 'DELETE' })
    revalidatePath('/combos')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
