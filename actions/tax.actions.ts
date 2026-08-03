'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateTaxDto, UpdateTaxDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createTax(data: CreateTaxDto) {
  try {
    await apiRequest('/taxes', { method: 'POST', body: data })
    revalidatePath('/taxes')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateTax(id: number, data: UpdateTaxDto) {
  try {
    await apiRequest(`/taxes/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/taxes')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteTax(id: number) {
  try {
    await apiRequest(`/taxes/${id}`, { method: 'DELETE' })
    revalidatePath('/taxes')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
