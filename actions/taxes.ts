'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { api, ApiError } from '@/lib/api'
import type { TaxType, Tax } from '@/types'

export type TaxActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }

// ─── Tax Types ────────────────────────────────────────────────────────────────

export async function createTaxType(
  _prev: TaxActionState,
  formData: FormData
): Promise<TaxActionState> {
  const code = (formData.get('code') as string).trim().toUpperCase()
  const name = (formData.get('name') as string).trim()

  if (!code) return { status: 'error', message: 'El código es requerido' }
  if (!name) return { status: 'error', message: 'El nombre es requerido' }

  try {
    await api.post<TaxType>('/tax-types', { code, name })
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 409) return { status: 'error', message: 'Ya existe un tipo de impuesto con ese código' }
      return { status: 'error', message: err.message }
    }
    return { status: 'error', message: 'Error al crear el tipo de impuesto' }
  }

  revalidatePath('/taxes')
  return { status: 'success' }
}

export async function deleteTaxType(id: number): Promise<TaxActionState> {
  try {
    await api.delete(`/tax-types/${id}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el tipo de impuesto' }
  }

  revalidatePath('/taxes')
  redirect('/taxes')
}

// ─── Taxes ────────────────────────────────────────────────────────────────────

export async function createTax(
  taxTypeId: number,
  _prev: TaxActionState,
  formData: FormData
): Promise<TaxActionState> {
  const value = Number(formData.get('value'))
  const currency = formData.get('currency') as string
  const isGlobal = formData.get('isGlobal') === 'true'

  if (isNaN(value) || value <= 0) return { status: 'error', message: 'El valor debe ser mayor a 0' }
  if (!currency) return { status: 'error', message: 'La moneda es requerida' }

  try {
    await api.post<Tax>(`/tax-types/${taxTypeId}/taxes`, {
      value,
      isPercentage: true,
      currency,
      isGlobal,
    })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al crear el impuesto' }
  }

  revalidatePath(`/taxes/${taxTypeId}`)
  return { status: 'success' }
}

export async function deleteTax(taxTypeId: number, taxId: number): Promise<TaxActionState> {
  try {
    await api.delete(`/tax-types/${taxTypeId}/taxes/${taxId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al eliminar el impuesto' }
  }

  revalidatePath(`/taxes/${taxTypeId}`)
  return { status: 'success' }
}

// ─── Product / Combo Tax Assignment ──────────────────────────────────────────

export async function assignTaxToProduct(productId: number, taxId: number): Promise<TaxActionState> {
  try {
    await api.post(`/products/${productId}/taxes`, { taxId })
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al asignar el impuesto' }
  }

  revalidatePath(`/taxes`)
  return { status: 'success' }
}

export async function removeTaxFromProduct(productId: number, assignmentId: number): Promise<TaxActionState> {
  try {
    await api.delete(`/products/${productId}/taxes/${assignmentId}`)
  } catch (err) {
    if (err instanceof ApiError) return { status: 'error', message: err.message }
    return { status: 'error', message: 'Error al quitar el impuesto' }
  }

  revalidatePath(`/taxes`)
  return { status: 'success' }
}
