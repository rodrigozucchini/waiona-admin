'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'
import type { CreateCouponDto, UpdateCouponDto } from '@/core/types'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function createCoupon(data: CreateCouponDto) {
  try {
    await apiRequest('/coupons', { method: 'POST', body: data })
    revalidatePath('/coupons')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function updateCoupon(id: number, data: UpdateCouponDto) {
  try {
    await apiRequest(`/coupons/${id}`, { method: 'PATCH', body: data })
    revalidatePath('/coupons')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function deleteCoupon(id: number) {
  try {
    await apiRequest(`/coupons/${id}`, { method: 'DELETE' })
    revalidatePath('/coupons')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
