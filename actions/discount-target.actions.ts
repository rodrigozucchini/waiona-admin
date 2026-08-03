'use server'

import { revalidatePath } from 'next/cache'
import { apiRequest, ApiError } from '@/core/lib/api'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Error de conexión con el servidor'
}

export async function addDiscountProductTarget(discountId: number, productId: number) {
  try {
    await apiRequest(`/discounts/${discountId}/targets/products`, {
      method: 'POST',
      body: { productId },
    })
    revalidatePath('/discounts')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function removeDiscountProductTarget(discountId: number, productId: number) {
  try {
    await apiRequest(`/discounts/${discountId}/targets/products/${productId}`, {
      method: 'DELETE',
    })
    revalidatePath('/discounts')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function addDiscountComboTarget(discountId: number, comboId: number) {
  try {
    await apiRequest(`/discounts/${discountId}/targets/combos`, {
      method: 'POST',
      body: { comboId },
    })
    revalidatePath('/discounts')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}

export async function removeDiscountComboTarget(discountId: number, comboId: number) {
  try {
    await apiRequest(`/discounts/${discountId}/targets/combos/${comboId}`, {
      method: 'DELETE',
    })
    revalidatePath('/discounts')
    return { success: true as const }
  } catch (error) {
    return { success: false as const, message: errorMessage(error) }
  }
}
