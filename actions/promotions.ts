'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { api, ApiError } from '@/lib/api'

export type PromotionActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

// ─── Coupons ──────────────────────────────────────────────────────────────────

export async function createCoupon(
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const code = (formData.get('code') as string).toUpperCase().trim()
  const value = Number(formData.get('value'))
  const isPercentage = formData.get('isPercentage') === 'true'
  const isGlobal = formData.get('isGlobal') === 'true'
  const usageLimitRaw = formData.get('usageLimit') as string
  const startsAtRaw = formData.get('startsAt') as string
  const endsAtRaw = formData.get('endsAt') as string

  if (!code) return { status: 'error', message: 'El código es requerido' }
  if (!value || value <= 0) return { status: 'error', message: 'El valor debe ser mayor a 0' }
  if (isPercentage && value > 100) return { status: 'error', message: 'El porcentaje no puede superar 100' }

  try {
    const coupon = await api.post<{ id: number }>('/coupons', {
      code,
      value,
      isPercentage,
      isGlobal,
      currency: isPercentage ? null : 'ARS',
      usageLimit: usageLimitRaw ? Number(usageLimitRaw) : null,
      startsAt: startsAtRaw ? new Date(startsAtRaw).toISOString() : null,
      endsAt: endsAtRaw ? new Date(endsAtRaw).toISOString() : null,
    })
    revalidatePath('/promotions/coupons')
    redirect(`/promotions/coupons/${coupon.id}`)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'El código ya está en uso' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el cupón' }
  }
}

export async function deleteCoupon(id: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/coupons/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el cupón' }
  }
  revalidatePath('/promotions/coupons')
  redirect('/promotions/coupons')
}

export async function addCouponProductTarget(couponId: number, productId: number): Promise<PromotionActionState> {
  try {
    await api.post(`/coupons/${couponId}/targets/products`, { productId })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al asignar producto' }
  }
  revalidatePath(`/promotions/coupons/${couponId}`)
  return { status: 'success' }
}

export async function removeCouponProductTarget(couponId: number, productId: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/coupons/${couponId}/targets/products/${productId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al remover producto' }
  }
  revalidatePath(`/promotions/coupons/${couponId}`)
  return { status: 'success' }
}

export async function addCouponComboTarget(couponId: number, comboId: number): Promise<PromotionActionState> {
  try {
    await api.post(`/coupons/${couponId}/targets/combos`, { comboId })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al asignar combo' }
  }
  revalidatePath(`/promotions/coupons/${couponId}`)
  return { status: 'success' }
}

export async function removeCouponComboTarget(couponId: number, comboId: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/coupons/${couponId}/targets/combos/${comboId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al remover combo' }
  }
  revalidatePath(`/promotions/coupons/${couponId}`)
  return { status: 'success' }
}

// ─── Discounts ────────────────────────────────────────────────────────────────

export async function createDiscount(
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const name = (formData.get('name') as string).trim()
  const description = formData.get('description') as string
  const value = Number(formData.get('value'))
  const isPercentage = formData.get('isPercentage') === 'true'
  const startsAtRaw = formData.get('startsAt') as string
  const endsAtRaw = formData.get('endsAt') as string

  if (!name) return { status: 'error', message: 'El nombre es requerido' }
  if (!value || value <= 0) return { status: 'error', message: 'El valor debe ser mayor a 0' }
  if (isPercentage && value > 100) return { status: 'error', message: 'El porcentaje no puede superar 100' }

  try {
    const discount = await api.post<{ id: number }>('/discounts', {
      name,
      description: description || undefined,
      value,
      isPercentage,
      startsAt: startsAtRaw ? new Date(startsAtRaw).toISOString() : null,
      endsAt: endsAtRaw ? new Date(endsAtRaw).toISOString() : null,
    })
    revalidatePath('/promotions/discounts')
    redirect(`/promotions/discounts/${discount.id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear el descuento' }
  }
}

export async function updateDiscount(
  id: number,
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const name = (formData.get('name') as string).trim()
  const description = formData.get('description') as string
  const value = Number(formData.get('value'))
  const isPercentage = formData.get('isPercentage') === 'true'
  const startsAtRaw = formData.get('startsAt') as string
  const endsAtRaw = formData.get('endsAt') as string

  try {
    await api.patch(`/discounts/${id}`, {
      name,
      description: description || undefined,
      value,
      isPercentage,
      startsAt: startsAtRaw ? new Date(startsAtRaw).toISOString() : null,
      endsAt: endsAtRaw ? new Date(endsAtRaw).toISOString() : null,
    })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el descuento' }
  }
  revalidatePath(`/promotions/discounts/${id}`)
  revalidatePath('/promotions/discounts')
  return { status: 'success' }
}

export async function deleteDiscount(id: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/discounts/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el descuento' }
  }
  revalidatePath('/promotions/discounts')
  redirect('/promotions/discounts')
}

export async function addDiscountProductTarget(discountId: number, productId: number): Promise<PromotionActionState> {
  try {
    await api.post(`/discounts/${discountId}/targets/products`, { productId })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al asignar producto' }
  }
  revalidatePath(`/promotions/discounts/${discountId}`)
  return { status: 'success' }
}

export async function removeDiscountProductTarget(discountId: number, productId: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/discounts/${discountId}/targets/products/${productId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al remover producto' }
  }
  revalidatePath(`/promotions/discounts/${discountId}`)
  return { status: 'success' }
}

export async function addDiscountComboTarget(discountId: number, comboId: number): Promise<PromotionActionState> {
  try {
    await api.post(`/discounts/${discountId}/targets/combos`, { comboId })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al asignar combo' }
  }
  revalidatePath(`/promotions/discounts/${discountId}`)
  return { status: 'success' }
}

export async function removeDiscountComboTarget(discountId: number, comboId: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/discounts/${discountId}/targets/combos/${comboId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al remover combo' }
  }
  revalidatePath(`/promotions/discounts/${discountId}`)
  return { status: 'success' }
}
