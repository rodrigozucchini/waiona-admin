'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateComboPricingDto, UpdateComboPricingDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createComboPricing(data: CreateComboPricingDto) {
  try {
    await apiRequest('/combo-pricing', { method: 'POST', body: data })
    revalidatePath('/combos')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateComboPricing(id: number, data: UpdateComboPricingDto) {
  try {
    await apiRequest(`/combo-pricing/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/combos')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteComboPricing(id: number) {
  try {
    await apiRequest(`/combo-pricing/${id}`, { method: 'DELETE' })
    revalidatePath('/combos')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
