'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { api, ApiError } from '@/lib/api'
import type { Margin, ProductPricing, ComboPricing } from '@/types'

export type PricingActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

// ─── Schemas ──────────────────────────────────────────────────────────────────

const MarginSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  value: z.coerce
    .number()
    .min(0.01, 'El porcentaje debe ser mayor a 0')
    .max(1000, 'El porcentaje no puede superar 1000')
    .refine((v) => Number(v.toFixed(2)) === v, 'Máximo 2 decimales'),
})

const ProductPricingSchema = z.object({
  productId: z.coerce.number().int().positive('El producto es requerido'),
  currency: z.string().min(1, 'La moneda es requerida'),
  unitPrice: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  marginId: z.coerce.number().int().positive().optional(),
})

const UpdatePricingSchema = z.object({
  unitPrice: z.coerce.number().min(0, 'Precio inválido'),
  marginId: z.coerce.number().int().positive().nullable().optional(),
})

const ComboPricingSchema = z.object({
  comboId: z.coerce.number().int().positive('El combo es requerido'),
  currency: z.string().min(1, 'La moneda es requerida'),
  unitPrice: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
  marginId: z.coerce.number().int().positive().optional(),
})

// ─── Margins ──────────────────────────────────────────────────────────────────

export async function createMargin(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const result = MarginSchema.safeParse({
    name: (formData.get('name') as string)?.trim().toUpperCase(),
    value: formData.get('value'),
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.post<Margin>('/margins', result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear el margen' }
  }

  revalidateTag('pricing', 'default')
  return { status: 'success' }
}

export async function updateMargin(
  id: number,
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const result = MarginSchema.safeParse({
    name: (formData.get('name') as string)?.trim().toUpperCase(),
    value: formData.get('value'),
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.patch<Margin>(`/margins/${id}`, result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el margen' }
  }

  revalidateTag('pricing', 'default')
  return { status: 'success' }
}

export async function deleteMargin(id: number): Promise<PricingActionState> {
  try {
    await api.delete(`/margins/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el margen' }
  }

  revalidateTag('pricing', 'default')
  return { status: 'success' }
}

// ─── Product Pricing ──────────────────────────────────────────────────────────

export async function createProductPricing(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const marginIdRaw = formData.get('marginId') as string

  const result = ProductPricingSchema.safeParse({
    productId: formData.get('productId'),
    currency: formData.get('currency'),
    unitPrice: formData.get('unitPrice'),
    marginId: marginIdRaw || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.post<ProductPricing>('/product-pricing', result.data)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'Ya existe un precio para ese producto y moneda' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el precio' }
  }

  revalidateTag('pricing', 'default')
  return { status: 'success' }
}

export async function updateProductPricing(
  id: number,
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const marginIdRaw = formData.get('marginId') as string

  const result = UpdatePricingSchema.safeParse({
    unitPrice: formData.get('unitPrice'),
    marginId: marginIdRaw ? Number(marginIdRaw) : null,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.patch<ProductPricing>(`/product-pricing/${id}`, result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el precio' }
  }

  revalidateTag('pricing', 'default')
  return { status: 'success' }
}

export async function deleteProductPricing(id: number): Promise<PricingActionState> {
  try {
    await api.delete(`/product-pricing/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el precio' }
  }

  revalidateTag('pricing', 'default')
  return { status: 'success' }
}

// ─── Combo Pricing ────────────────────────────────────────────────────────────

export async function createComboPricing(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const marginIdRaw = formData.get('marginId') as string

  const result = ComboPricingSchema.safeParse({
    comboId: formData.get('comboId'),
    currency: formData.get('currency'),
    unitPrice: formData.get('unitPrice'),
    marginId: marginIdRaw || undefined,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.post<ComboPricing>('/combo-pricing', result.data)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'Ya existe un precio para ese combo y moneda' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el precio' }
  }

  revalidateTag('pricing', 'default')
  return { status: 'success' }
}

export async function updateComboPricing(
  id: number,
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const marginIdRaw = formData.get('marginId') as string

  const result = UpdatePricingSchema.safeParse({
    unitPrice: formData.get('unitPrice'),
    marginId: marginIdRaw ? Number(marginIdRaw) : null,
  })

  if (!result.success) {
    return { status: 'error', message: result.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  try {
    await api.patch<ComboPricing>(`/combo-pricing/${id}`, result.data)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el precio' }
  }

  revalidateTag('pricing', 'default')
  return { status: 'success' }
}

export async function deleteComboPricing(id: number): Promise<PricingActionState> {
  try {
    await api.delete(`/combo-pricing/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el precio' }
  }

  revalidateTag('pricing', 'default')
  return { status: 'success' }
}
