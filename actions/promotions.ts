'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { api, ApiError } from '@/lib/api'

export type PromotionActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

// ─── Schemas ──────────────────────────────────────────────────────────────────

const CouponSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(100),
  value: z.coerce.number().min(0.01, 'El valor debe ser mayor a 0').max(100, 'El porcentaje no puede superar 100'),
  isGlobal: z.enum(['true', 'false']).transform((v) => v === 'true'),
  usageLimit: z.coerce.number().int().positive().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
})

const DiscountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  description: z.string().max(1000).optional(),
  value: z.coerce.number().min(0.01, 'El valor debe ser mayor a 0').max(100, 'El porcentaje no puede superar 100'),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
})

// ─── Coupons ──────────────────────────────────────────────────────────────────

export async function createCoupon(
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const result = CouponSchema.safeParse({
    code: (formData.get('code') as string)?.toUpperCase().trim(),
    value: formData.get('value'),
    isGlobal: formData.get('isGlobal'),
    usageLimit: formData.get('usageLimit') || undefined,
    startsAt: formData.get('startsAt') || undefined,
    endsAt: formData.get('endsAt') || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { code, value, isGlobal, usageLimit, startsAt, endsAt } = result.data

  let couponId: number
  try {
    const coupon = await api.post<{ id: number }>('/coupons', {
      code,
      value,
      isGlobal,
      usageLimit,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
    })
    couponId = coupon.id
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'El código ya está en uso' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el cupón' }
  }


  redirect(`/promotions/coupons/${couponId}`)
}

export async function deleteCoupon(id: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/coupons/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el cupón' }
  }

  redirect('/promotions/coupons')
}

export async function addCouponProductTarget(couponId: number, productId: number): Promise<PromotionActionState> {
  try {
    await api.post(`/coupons/${couponId}/targets/products`, { productId })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al asignar producto' }
  }

  return { status: 'success' }
}

export async function removeCouponProductTarget(couponId: number, productId: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/coupons/${couponId}/targets/products/${productId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al remover producto' }
  }

  return { status: 'success' }
}

export async function addCouponComboTarget(couponId: number, comboId: number): Promise<PromotionActionState> {
  try {
    await api.post(`/coupons/${couponId}/targets/combos`, { comboId })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al asignar combo' }
  }

  return { status: 'success' }
}

export async function removeCouponComboTarget(couponId: number, comboId: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/coupons/${couponId}/targets/combos/${comboId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al remover combo' }
  }

  return { status: 'success' }
}

// ─── Discounts ────────────────────────────────────────────────────────────────

export async function createDiscount(
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const result = DiscountSchema.safeParse({
    name: (formData.get('name') as string)?.trim(),
    description: (formData.get('description') as string)?.trim() || undefined,
    value: formData.get('value'),
    startsAt: formData.get('startsAt') || undefined,
    endsAt: formData.get('endsAt') || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { name, description, value, startsAt, endsAt } = result.data

  let discountId: number
  try {
    const discount = await api.post<{ id: number }>('/discounts', {
      name,
      description,
      value,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
    })
    discountId = discount.id
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear el descuento' }
  }


  redirect(`/promotions/discounts/${discountId}`)
}

export async function updateDiscount(
  id: number,
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  const result = DiscountSchema.safeParse({
    name: (formData.get('name') as string)?.trim(),
    description: (formData.get('description') as string)?.trim() || undefined,
    value: formData.get('value'),
    startsAt: formData.get('startsAt') || undefined,
    endsAt: formData.get('endsAt') || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { name, description, value, startsAt, endsAt } = result.data

  try {
    await api.patch(`/discounts/${id}`, {
      name,
      description,
      value,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
    })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el descuento' }
  }


  return { status: 'success' }
}

export async function deleteDiscount(id: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/discounts/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el descuento' }
  }

  redirect('/promotions/discounts')
}

export async function addDiscountProductTarget(discountId: number, productId: number): Promise<PromotionActionState> {
  try {
    await api.post(`/discounts/${discountId}/targets/products`, { productId })
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'Este producto ya tiene un descuento asignado. Eliminá el descuento anterior primero.' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al asignar producto' }
  }

  return { status: 'success' }
}

export async function removeDiscountProductTarget(discountId: number, productId: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/discounts/${discountId}/targets/products/${productId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al remover producto' }
  }

  return { status: 'success' }
}

export async function addDiscountComboTarget(discountId: number, comboId: number): Promise<PromotionActionState> {
  try {
    await api.post(`/discounts/${discountId}/targets/combos`, { comboId })
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'Este combo ya tiene un descuento asignado. Eliminá el descuento anterior primero.' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al asignar combo' }
  }

  return { status: 'success' }
}

export async function removeDiscountComboTarget(discountId: number, comboId: number): Promise<PromotionActionState> {
  try {
    await api.delete(`/discounts/${discountId}/targets/combos/${comboId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al remover combo' }
  }

  return { status: 'success' }
}
