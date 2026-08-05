'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function addCouponProductTarget(couponId: number, productId: number) {
  try {
    await apiRequest(`/coupons/${couponId}/targets/products`, {
      method: 'POST',
      body: { productId },
    })
    revalidatePath('/coupons')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function removeCouponProductTarget(couponId: number, productId: number) {
  try {
    await apiRequest(`/coupons/${couponId}/targets/products/${productId}`, {
      method: 'DELETE',
    })
    revalidatePath('/coupons')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function addCouponComboTarget(couponId: number, comboId: number) {
  try {
    await apiRequest(`/coupons/${couponId}/targets/combos`, {
      method: 'POST',
      body: { comboId },
    })
    revalidatePath('/coupons')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function removeCouponComboTarget(couponId: number, comboId: number) {
  try {
    await apiRequest(`/coupons/${couponId}/targets/combos/${comboId}`, {
      method: 'DELETE',
    })
    revalidatePath('/coupons')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
