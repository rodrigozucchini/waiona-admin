'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { Margin, ProductPricing, ComboPricing } from '@/types'

export type PricingActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

// ─── Margins ──────────────────────────────────────────────────────────────────

export async function createMargin(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const name = (formData.get('name') as string).trim().toUpperCase()
  const rawValue = formData.get('value') as string
  const value = parseFloat(rawValue)

  if (name.length < 3) return { status: 'error', message: 'El nombre debe tener al menos 3 caracteres' }
  if (name.length > 100) return { status: 'error', message: 'El nombre no puede superar 100 caracteres' }
  if (isNaN(value) || value < 0.01) return { status: 'error', message: 'El porcentaje debe ser mayor a 0' }
  if (value > 1000) return { status: 'error', message: 'El porcentaje no puede superar 1000' }
  if (!/^\d+(\.\d{1,2})?$/.test(rawValue)) return { status: 'error', message: 'Máximo 2 decimales' }

  try {
    await api.post<Margin>('/margins', { name, value })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear el margen' }
  }

  revalidatePath('/pricing/margins')
  return { status: 'success' }
}

export async function updateMargin(
  id: number,
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const name = (formData.get('name') as string).trim().toUpperCase()
  const rawValue = formData.get('value') as string
  const value = parseFloat(rawValue)

  if (name.length < 3) return { status: 'error', message: 'El nombre debe tener al menos 3 caracteres' }
  if (name.length > 100) return { status: 'error', message: 'El nombre no puede superar 100 caracteres' }
  if (isNaN(value) || value < 0.01) return { status: 'error', message: 'El porcentaje debe ser mayor a 0' }
  if (value > 1000) return { status: 'error', message: 'El porcentaje no puede superar 1000' }
  if (!/^\d+(\.\d{1,2})?$/.test(rawValue)) return { status: 'error', message: 'Máximo 2 decimales' }

  try {
    await api.patch<Margin>(`/margins/${id}`, { name, value })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el margen' }
  }

  revalidatePath('/pricing/margins')
  return { status: 'success' }
}

export async function deleteMargin(id: number): Promise<PricingActionState> {
  try {
    await api.delete(`/margins/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el margen' }
  }

  revalidatePath('/pricing/margins')
  return { status: 'success' }
}

// ─── Product Pricing ──────────────────────────────────────────────────────────

export async function createProductPricing(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const productId = Number(formData.get('productId'))
  const currency = formData.get('currency') as string
  const unitPrice = Number(formData.get('unitPrice'))
  const marginIdRaw = formData.get('marginId') as string
  const marginId = marginIdRaw ? Number(marginIdRaw) : null

  if (!productId) return { status: 'error', message: 'El producto es requerido' }
  if (!currency) return { status: 'error', message: 'La moneda es requerida' }
  if (isNaN(unitPrice) || unitPrice < 0) return { status: 'error', message: 'El precio debe ser mayor o igual a 0' }

  try {
    await api.post<ProductPricing>('/product-pricing', { productId, currency, unitPrice, marginId })
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'Ya existe un precio para ese producto y moneda' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el precio' }
  }

  revalidatePath('/pricing/products')
  return { status: 'success' }
}

export async function updateProductPricing(
  id: number,
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const unitPrice = Number(formData.get('unitPrice'))
  const marginIdRaw = formData.get('marginId') as string
  const marginId = marginIdRaw ? Number(marginIdRaw) : null

  if (isNaN(unitPrice) || unitPrice < 0) return { status: 'error', message: 'Precio inválido' }

  try {
    await api.patch<ProductPricing>(`/product-pricing/${id}`, { unitPrice, marginId })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el precio' }
  }

  revalidatePath('/pricing/products')
  return { status: 'success' }
}

export async function deleteProductPricing(id: number): Promise<PricingActionState> {
  try {
    await api.delete(`/product-pricing/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el precio' }
  }

  revalidatePath('/pricing/products')
  return { status: 'success' }
}

// ─── Combo Pricing ────────────────────────────────────────────────────────────

export async function createComboPricing(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const comboId = Number(formData.get('comboId'))
  const currency = formData.get('currency') as string
  const unitPrice = Number(formData.get('unitPrice'))
  const marginIdRaw = formData.get('marginId') as string
  const marginId = marginIdRaw ? Number(marginIdRaw) : null

  if (!comboId) return { status: 'error', message: 'El combo es requerido' }
  if (!currency) return { status: 'error', message: 'La moneda es requerida' }
  if (isNaN(unitPrice) || unitPrice < 0) return { status: 'error', message: 'El precio debe ser mayor o igual a 0' }

  try {
    await api.post<ComboPricing>('/combo-pricing', { comboId, currency, unitPrice, marginId })
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'Ya existe un precio para ese combo y moneda' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el precio' }
  }

  revalidatePath('/pricing/combos')
  return { status: 'success' }
}

export async function updateComboPricing(
  id: number,
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  const unitPrice = Number(formData.get('unitPrice'))
  const marginIdRaw = formData.get('marginId') as string
  const marginId = marginIdRaw ? Number(marginIdRaw) : null

  if (isNaN(unitPrice) || unitPrice < 0) return { status: 'error', message: 'Precio inválido' }

  try {
    await api.patch<ComboPricing>(`/combo-pricing/${id}`, { unitPrice, marginId })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al actualizar el precio' }
  }

  revalidatePath('/pricing/combos')
  return { status: 'success' }
}

export async function deleteComboPricing(id: number): Promise<PricingActionState> {
  try {
    await api.delete(`/combo-pricing/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el precio' }
  }

  revalidatePath('/pricing/combos')
  return { status: 'success' }
}
